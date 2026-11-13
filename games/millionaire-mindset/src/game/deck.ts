import { BANK, type BankRow } from '../data/questions.ts';
import { LETTERS, type Difficulty, type Letter, type Question, type Rng } from './types.ts';

export const PLAN: readonly { difficulty: Difficulty; count: number }[] = [
  { difficulty: 'easy', count: 5 },
  { difficulty: 'medium', count: 5 },
  { difficulty: 'hard', count: 4 },
  { difficulty: 'very-hard', count: 1 },
];

const CODE: Record<BankRow[0], Difficulty> = { e: 'easy', m: 'medium', h: 'hard', v: 'very-hard' };

export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Shuffle the answers and hand out fresh letters, so the right letter is random. */
export function makeQuestion(
  id: number,
  text: string,
  correct: string,
  wrong: readonly string[],
  difficulty: Difficulty,
  rng: Rng = Math.random,
): Question {
  const texts = shuffle([correct, ...wrong], rng);
  const options = texts.map((t, i) => ({ letter: LETTERS[i] as Letter, text: t }));
  const right = options.find((o) => o.text === correct)!;
  return { id, text, options, correct: right.letter, difficulty };
}

/** Draw a fresh 15-question game from the built-in bank. */
export function buildDeck(rng: Rng = Math.random, bank: readonly BankRow[] = BANK): Question[] {
  const seen = new Set<string>();
  const deck: Question[] = [];
  for (const { difficulty, count } of PLAN) {
    const pool = shuffle(
      bank.filter((r) => CODE[r[0]] === difficulty),
      rng,
    );
    let taken = 0;
    for (const [, text, correct, wrong] of pool) {
      if (taken === count) break;
      const key = text.trim().toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      deck.push(makeQuestion(deck.length + 1, text, correct, wrong, difficulty, rng));
      taken++;
    }
    if (taken < count) throw new Error(`Question bank has too few ${difficulty} questions.`);
  }
  return deck;
}
