import assert from 'node:assert/strict';
import { test } from 'node:test';
import { applyResult, EMPTY_STATS, parseStats } from '../src/game/stats.ts';
import { buildPrompt, extractJson, GroqError, normalizeQuestions, resolveModel } from '../src/lib/groq.ts';

const mk = (n: number, difficulty: string) => ({
  question: `Question ${n}?`,
  options: [
    { letter: 'A', text: `a${n}` },
    { letter: 'B', text: `b${n}` },
    { letter: 'C', text: `c${n}` },
    { letter: 'D', text: `d${n}` },
  ],
  correctLetter: 'B',
  difficulty,
});
const good = () => ({
  questions: [
    ...[1, 2, 3, 4, 5].map((n) => mk(n, 'easy')),
    ...[6, 7, 8, 9, 10].map((n) => mk(n, 'medium')),
    ...[11, 12, 13, 14].map((n) => mk(n, 'hard')),
    mk(15, 'very-hard'),
  ],
});

test('ai: a valid reply becomes a shuffled 15 question deck', () => {
  const deck = normalizeQuestions(good());
  assert.equal(deck.length, 15);
  assert.equal(deck[0].difficulty, 'easy');
  assert.equal(deck[14].difficulty, 'very-hard');
  for (const q of deck) {
    const right = q.options.find((o) => o.letter === q.correct)!;
    assert.match(right.text, /^b\d+$/);
  }
});

test('ai: reorders by difficulty and rejects bad shapes', () => {
  const g = good();
  g.questions.reverse();
  assert.equal(normalizeQuestions(g)[0].difficulty, 'easy');
  assert.throws(() => normalizeQuestions({}), GroqError);
  assert.throws(() => normalizeQuestions({ questions: good().questions.slice(0, 14) }), GroqError);
  const dup = good();
  dup.questions[1].question = dup.questions[0].question;
  assert.throws(() => normalizeQuestions(dup), GroqError);
  const badLetter = good();
  badLetter.questions[0].correctLetter = 'E';
  assert.throws(() => normalizeQuestions(badLetter), GroqError);
  const sameAnswers = good();
  sameAnswers.questions[0].options[0].text = 'b1';
  assert.throws(() => normalizeQuestions(sameAnswers), GroqError);
});

test('ai: extractJson tolerates fences and chatter', () => {
  assert.deepEqual(extractJson('{"a":1}'), { a: 1 });
  assert.deepEqual(extractJson('```json\n{"a":1}\n```'), { a: 1 });
  assert.deepEqual(extractJson('Sure! Here you go: {"a":1} Enjoy'), { a: 1 });
  assert.throws(() => extractJson('nope'), GroqError);
});

test('ai: retired models map to live ones', () => {
  assert.equal(resolveModel(''), 'openai/gpt-oss-120b');
  assert.equal(resolveModel('llama-3.3-70b-versatile'), 'openai/gpt-oss-120b');
  assert.equal(resolveModel('llama-3.1-8b-instant'), 'openai/gpt-oss-20b');
  assert.equal(resolveModel('openai/gpt-oss-20b'), 'openai/gpt-oss-20b');
});

test('ai: the prompt carries the topic, trimmed', () => {
  assert.match(buildPrompt('  Nigerian history  '), /Nigerian history/);
  assert.match(buildPrompt(''), /broad mix/);
});

test('stats: wins, best prize and level accumulate', () => {
  let s = EMPTY_STATS;
  s = applyResult(s, { outcome: 'loss', prize: 1000, level: 7, correctLetter: 'A', correctText: 'x' });
  s = applyResult(s, { outcome: 'walkaway', prize: 16000, level: 10, correctLetter: 'A', correctText: 'x' });
  s = applyResult(s, { outcome: 'win', prize: 1_000_000, level: 15, correctLetter: 'A', correctText: 'x' });
  assert.deepEqual(s, { played: 3, wins: 1, best: 1_000_000, bestLevel: 15 });
});

test('stats: corrupt storage falls back to empty', () => {
  assert.deepEqual(parseStats('{oops'), EMPTY_STATS);
  assert.deepEqual(parseStats(null), EMPTY_STATS);
  assert.deepEqual(parseStats('{"played":-4,"wins":"x","best":12.7}'), { played: 0, wins: 0, best: 12, bestLevel: 0 });
});
