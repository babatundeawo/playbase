import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BANK } from '../src/data/questions.ts';
import { buildDeck, makeQuestion, PLAN } from '../src/game/deck.ts';
import { currentLevel, initGame, reduce } from '../src/game/engine.ts';
import { guaranteedPrize, LADDER, prizeAt, walkAwayPrize } from '../src/game/ladder.ts';
import { audiencePoll, friendHint, pickFiftyFifty } from '../src/game/lifelines.ts';
import type { Letter, Rng } from '../src/game/types.ts';

/** Small deterministic generator (mulberry32). */
function seeded(seed: number): Rng {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

test('question bank rows are well formed and unique', () => {
  const seen = new Set<string>();
  for (const [d, q, correct, wrong] of BANK) {
    assert.ok(['e', 'm', 'h', 'v'].includes(d), q);
    assert.equal(wrong.length, 3, q);
    assert.equal(new Set([correct, ...wrong].map((x) => x.toLowerCase())).size, 4, `duplicate answers: ${q}`);
    assert.ok(!/\bboth [a-d]\b|\ball of the above\b|\bnone of the above\b/i.test([correct, ...wrong].join(' ')), `answer refers to other answers: ${q}`);
    const key = q.toLowerCase();
    assert.ok(!seen.has(key), `duplicate question: ${q}`);
    seen.add(key);
  }
  for (const [code, need] of [['e', 5], ['m', 5], ['h', 4], ['v', 1]] as const) {
    assert.ok(BANK.filter((r) => r[0] === code).length >= need * 4, `tier ${code} is too thin`);
  }
});

test('ladder: havens, guaranteed and walk-away prizes', () => {
  assert.equal(LADDER.length, 15);
  assert.equal(prizeAt(15), 1_000_000);
  // Losing on a haven question does not pay that haven.
  assert.equal(guaranteedPrize(5), 0);
  assert.equal(guaranteedPrize(6), 1_000);
  assert.equal(guaranteedPrize(10), 1_000);
  assert.equal(guaranteedPrize(11), 32_000);
  assert.equal(guaranteedPrize(15), 32_000);
  // Walking away keeps everything already won.
  assert.equal(walkAwayPrize(1), 0);
  assert.equal(walkAwayPrize(2), 100);
  assert.equal(walkAwayPrize(8), 4_000);
  assert.equal(walkAwayPrize(15), 500_000);
});

test('deck: 5/5/4/1 by difficulty, shuffled letters, no repeats', () => {
  for (let seed = 1; seed <= 200; seed++) {
    const deck = buildDeck(seeded(seed));
    assert.equal(deck.length, 15);
    let i = 0;
    for (const { difficulty, count } of PLAN) for (let k = 0; k < count; k++) assert.equal(deck[i++].difficulty, difficulty);
    assert.equal(new Set(deck.map((q) => q.text)).size, 15);
    for (const q of deck) {
      assert.deepEqual(q.options.map((o) => o.letter), ['A', 'B', 'C', 'D']);
      assert.equal(q.options.filter((o) => o.letter === q.correct).length, 1);
    }
  }
});

test('deck: the correct letter is spread across A-D', () => {
  const rng = seeded(7);
  const tally: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
  for (let n = 0; n < 400; n++) for (const q of buildDeck(rng)) tally[q.correct]++;
  const total = 400 * 15;
  for (const l of Object.keys(tally)) assert.ok(Math.abs(tally[l] / total - 0.25) < 0.03, `${l} ${tally[l] / total}`);
});

test('fifty-fifty keeps the right answer and one wrong answer', () => {
  const rng = seeded(3);
  for (let n = 0; n < 200; n++) {
    const q = makeQuestion(1, 'q', 'right', ['x', 'y', 'z'], 'easy', rng);
    const gone = pickFiftyFifty(q, rng);
    assert.equal(gone.length, 2);
    assert.ok(!gone.includes(q.correct));
  }
});

test('friend only suggests answers that are still on the board', () => {
  const rng = seeded(11);
  for (let n = 0; n < 300; n++) {
    const q = makeQuestion(1, 'q', 'right', ['x', 'y', 'z'], 'hard', rng);
    const gone = pickFiftyFifty(q, rng);
    const hint = friendHint(q, 1 + (n % 15), gone, rng);
    assert.ok(!gone.includes(hint.letter));
  }
});

test('friend accuracy follows difficulty', () => {
  const rng = seeded(5);
  const q = makeQuestion(1, 'q', 'right', ['x', 'y', 'z'], 'easy', rng);
  const rate = (level: number) => {
    let hit = 0;
    for (let n = 0; n < 4000; n++) if (friendHint(q, level, [], rng).letter === q.correct) hit++;
    return hit / 4000;
  };
  assert.ok(rate(2) > 0.9);
  assert.ok(rate(15) < 0.7 && rate(15) > 0.5);
});

test('audience poll totals 100 and ignores removed answers', () => {
  const rng = seeded(21);
  for (let n = 0; n < 500; n++) {
    const q = makeQuestion(1, 'q', 'right', ['x', 'y', 'z'], 'easy', rng);
    const gone: Letter[] = n % 2 ? pickFiftyFifty(q, rng) : [];
    const votes = audiencePoll(q, 1 + (n % 15), gone, rng);
    assert.equal(votes.length, 4);
    assert.equal(votes.reduce((a, v) => a + v.percent, 0), 100);
    for (const v of votes) {
      assert.ok(v.percent >= 0 && v.percent <= 100);
      if (gone.includes(v.letter)) assert.equal(v.percent, 0);
    }
  }
});

test('audience favours the right answer on easy questions', () => {
  const rng = seeded(9);
  let top = 0;
  for (let n = 0; n < 500; n++) {
    const q = makeQuestion(1, 'q', 'right', ['x', 'y', 'z'], 'easy', rng);
    const votes = audiencePoll(q, 2, [], rng);
    const best = votes.reduce((a, b) => (b.percent > a.percent ? b : a));
    if (best.letter === q.correct) top++;
  }
  assert.equal(top, 500);
});

function play(answers: ('right' | 'wrong')[], confirm = true) {
  let s = initGame(buildDeck(seeded(42)));
  for (const a of answers) {
    const q = s.deck[s.index];
    const letter = a === 'right' ? q.correct : q.options.find((o) => o.letter !== q.correct)!.letter;
    s = reduce(s, { type: 'select', letter, confirm });
    if (confirm) s = reduce(s, { type: 'lock' });
    s = reduce(s, { type: 'reveal' });
    s = reduce(s, { type: 'advance' });
    if (s.phase === 'finished') break;
  }
  return s;
}

test('engine: a perfect run wins the top prize', () => {
  const s = play(Array(15).fill('right'));
  assert.equal(s.phase, 'finished');
  assert.equal(s.result?.outcome, 'win');
  assert.equal(s.result?.prize, 1_000_000);
});

test('engine: a wrong answer pays the last haven', () => {
  assert.equal(play(['wrong']).result?.prize, 0);
  assert.equal(play([...Array(5).fill('right'), 'wrong']).result?.prize, 1_000);
  assert.equal(play([...Array(10).fill('right'), 'wrong']).result?.prize, 32_000);
  const s = play([...Array(4).fill('right'), 'wrong']);
  assert.equal(s.result?.prize, 0);
  assert.equal(s.result?.level, 5);
  assert.equal(s.result?.correctLetter, s.deck[4].correct);
});

test('engine: walking away keeps the amount already won', () => {
  let s = play(Array(7).fill('right'));
  assert.equal(currentLevel(s), 8);
  s = reduce(s, { type: 'walkaway' });
  assert.equal(s.result?.outcome, 'walkaway');
  assert.equal(s.result?.prize, 4_000);
});

test('engine: answers lock only after confirmation when confirm is on', () => {
  let s = initGame(buildDeck(seeded(1)));
  const q = s.deck[0];
  s = reduce(s, { type: 'select', letter: 'A', confirm: true });
  assert.equal(s.phase, 'selected');
  s = reduce(s, { type: 'select', letter: 'B', confirm: true });
  assert.equal(s.selected, 'B');
  assert.equal(reduce(s, { type: 'reveal' }), s, 'cannot reveal before locking');
  s = reduce(s, { type: 'lock' });
  assert.equal(s.phase, 'locked');
  assert.equal(reduce(s, { type: 'select', letter: 'C', confirm: true }), s, 'locked answers cannot change');
  s = reduce(s, { type: 'reveal' });
  assert.equal(s.verdict, 'B' === q.correct ? 'correct' : 'wrong');
});

test('engine: confirm off locks on the first tap', () => {
  let s = initGame(buildDeck(seeded(1)));
  s = reduce(s, { type: 'select', letter: 'A', confirm: false });
  assert.equal(s.phase, 'locked');
});

test('engine: lifelines are single-use and fifty-fifty clears a removed pick', () => {
  let s = initGame(buildDeck(seeded(2)));
  const q = s.deck[0];
  const wrong = q.options.filter((o) => o.letter !== q.correct).map((o) => o.letter);
  s = reduce(s, { type: 'select', letter: wrong[0], confirm: true });
  s = reduce(s, { type: 'fifty', eliminated: [wrong[0], wrong[1]] });
  assert.equal(s.selected, null);
  assert.equal(s.phase, 'answering');
  assert.deepEqual(s.eliminated, [wrong[0], wrong[1]]);
  const again = reduce(s, { type: 'fifty', eliminated: [wrong[2], wrong[1]] });
  assert.deepEqual(again.eliminated, [wrong[0], wrong[1]], 'second use ignored');
  assert.equal(reduce(reduce(s, { type: 'phone' }), { type: 'phone' }).used.phone, true);
  assert.equal(reduce(s, { type: 'select', letter: wrong[0], confirm: true }), s, 'removed answers cannot be picked');
  const next = reduce(reduce(reduce(reduce(s, { type: 'select', letter: q.correct, confirm: true }), { type: 'lock' }), { type: 'reveal' }), { type: 'advance' });
  assert.equal(next.index, 1);
  assert.deepEqual(next.eliminated, []);
  assert.equal(next.used.fifty, true, 'used lifelines stay used');
});
