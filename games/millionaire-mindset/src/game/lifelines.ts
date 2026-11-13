import type { Letter, Question, Rng } from './types.ts';

/** Pick two wrong answers to remove, leaving the right one and one wrong one. */
export function pickFiftyFifty(q: Question, rng: Rng = Math.random): Letter[] {
  const wrong = q.options.filter((o) => o.letter !== q.correct).map((o) => o.letter);
  const keep = Math.floor(rng() * wrong.length);
  return wrong.filter((_, i) => i !== keep);
}

/** How often the friend is right. Harder questions make friends less sure. */
export function friendAccuracy(level: number): number {
  if (level <= 5) return 0.95;
  if (level <= 10) return 0.85;
  if (level <= 14) return 0.7;
  return 0.6;
}

export interface FriendHint {
  letter: Letter;
  text: string;
  phrase: string;
}

/** The friend's tone depends on the level only, so it never reveals whether they are right. */
export function friendPhrase(level: number): string {
  if (level <= 5) return "I'm quite sure it's";
  if (level <= 10) return "I'd go with";
  return "I'm not certain, but I think it's";
}

export function friendHint(q: Question, level: number, eliminated: readonly Letter[], rng: Rng = Math.random): FriendHint {
  const pool = q.options.filter((o) => !eliminated.includes(o.letter));
  const right = pool.find((o) => o.letter === q.correct)!;
  const wrong = pool.filter((o) => o.letter !== q.correct);
  const pick = rng() < friendAccuracy(level) || wrong.length === 0 ? right : wrong[Math.floor(rng() * wrong.length)];
  return { letter: pick.letter, text: pick.text, phrase: friendPhrase(level) };
}

export interface Vote {
  letter: Letter;
  percent: number;
}

/** Share of the audience that picks the right answer, on average. */
export function audienceAccuracy(level: number): number {
  return Math.max(0.45, 0.88 - 0.03 * (level - 1));
}

/** Chance the crowd is misled and favours a wrong answer. */
export function audienceMislead(level: number): number {
  if (level <= 5) return 0;
  if (level <= 10) return 0.05;
  return 0.15;
}

export function audiencePoll(q: Question, level: number, eliminated: readonly Letter[], rng: Rng = Math.random): Vote[] {
  const live = q.options.filter((o) => !eliminated.includes(o.letter));
  const wrong = live.filter((o) => o.letter !== q.correct);
  const weights = new Map<Letter, number>();

  let rightShare = audienceAccuracy(level) + (rng() - 0.5) * 0.16;
  if (wrong.length > 0 && rng() < audienceMislead(level)) rightShare = 0.2 + rng() * 0.15;
  rightShare = Math.min(0.95, Math.max(0.15, rightShare));
  if (wrong.length === 0) rightShare = 1;

  weights.set(q.correct, rightShare);
  const raw = wrong.map(() => 0.2 + rng());
  const rawSum = raw.reduce((a, b) => a + b, 0);
  wrong.forEach((o, i) => weights.set(o.letter, ((1 - rightShare) * raw[i]) / rawSum));

  // Largest-remainder rounding so the bars always add up to exactly 100.
  const entries = live.map((o) => ({ letter: o.letter, exact: (weights.get(o.letter) ?? 0) * 100 }));
  const floors = entries.map((e) => Math.floor(e.exact));
  let left = 100 - floors.reduce((a, b) => a + b, 0);
  const order = entries
    .map((e, i) => ({ i, frac: e.exact - floors[i] }))
    .sort((a, b) => b.frac - a.frac);
  for (const { i } of order) {
    if (left <= 0) break;
    floors[i]++;
    left--;
  }
  const byLetter = new Map(entries.map((e, i) => [e.letter, floors[i]] as const));
  return q.options.map((o) => ({ letter: o.letter, percent: byLetter.get(o.letter) ?? 0 }));
}
