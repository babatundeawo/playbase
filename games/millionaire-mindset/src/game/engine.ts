import { guaranteedPrize, LADDER, walkAwayPrize } from './ladder.ts';
import type { Letter, Question } from './types.ts';

export type Phase = 'answering' | 'selected' | 'locked' | 'revealed' | 'finished';
export type Outcome = 'win' | 'loss' | 'walkaway';

export interface Lifelines {
  fifty: boolean;
  phone: boolean;
  audience: boolean;
}

export interface GameResult {
  outcome: Outcome;
  prize: number;
  /** The question level the player was on when the game ended (1 to 15). */
  level: number;
  correctLetter: Letter;
  correctText: string;
}

export interface GameState {
  deck: readonly Question[];
  index: number;
  phase: Phase;
  selected: Letter | null;
  eliminated: Letter[];
  used: Lifelines;
  verdict: 'correct' | 'wrong' | null;
  result: GameResult | null;
}

export type Action =
  | { type: 'select'; letter: Letter; confirm: boolean }
  | { type: 'lock' }
  | { type: 'reveal' }
  | { type: 'advance' }
  | { type: 'fifty'; eliminated: Letter[] }
  | { type: 'phone' }
  | { type: 'audience' }
  | { type: 'walkaway' };

export function initGame(deck: readonly Question[]): GameState {
  return {
    deck,
    index: 0,
    phase: 'answering',
    selected: null,
    eliminated: [],
    used: { fifty: false, phone: false, audience: false },
    verdict: null,
    result: null,
  };
}

export const currentQuestion = (s: GameState): Question => s.deck[s.index];
export const currentLevel = (s: GameState): number => s.index + 1;

const canAnswer = (s: GameState) => s.phase === 'answering' || s.phase === 'selected';

function finish(s: GameState, outcome: Outcome, prize: number): GameState {
  const q = currentQuestion(s);
  const correct = q.options.find((o) => o.letter === q.correct)!;
  return {
    ...s,
    phase: 'finished',
    result: { outcome, prize, level: currentLevel(s), correctLetter: correct.letter, correctText: correct.text },
  };
}

export function reduce(s: GameState, a: Action): GameState {
  switch (a.type) {
    case 'select': {
      if (!canAnswer(s) || s.eliminated.includes(a.letter)) return s;
      if (!currentQuestion(s).options.some((o) => o.letter === a.letter)) return s;
      return { ...s, selected: a.letter, phase: a.confirm ? 'selected' : 'locked' };
    }
    case 'lock':
      return s.phase === 'selected' && s.selected ? { ...s, phase: 'locked' } : s;
    case 'reveal': {
      if (s.phase !== 'locked' || !s.selected) return s;
      const verdict = s.selected === currentQuestion(s).correct ? 'correct' : 'wrong';
      return { ...s, phase: 'revealed', verdict };
    }
    case 'advance': {
      if (s.phase !== 'revealed') return s;
      if (s.verdict === 'wrong') return finish(s, 'loss', guaranteedPrize(currentLevel(s)));
      if (s.index === LADDER.length - 1) return finish(s, 'win', LADDER[LADDER.length - 1].amount);
      return { ...s, index: s.index + 1, phase: 'answering', selected: null, eliminated: [], verdict: null };
    }
    case 'fifty': {
      if (!canAnswer(s) || s.used.fifty) return s;
      // If the player had already picked an answer that is now removed, clear the pick.
      const lost = s.selected !== null && a.eliminated.includes(s.selected);
      return {
        ...s,
        used: { ...s.used, fifty: true },
        eliminated: a.eliminated,
        selected: lost ? null : s.selected,
        phase: lost ? 'answering' : s.phase,
      };
    }
    case 'phone':
      return canAnswer(s) && !s.used.phone ? { ...s, used: { ...s.used, phone: true } } : s;
    case 'audience':
      return canAnswer(s) && !s.used.audience ? { ...s, used: { ...s.used, audience: true } } : s;
    case 'walkaway':
      return canAnswer(s) ? finish(s, 'walkaway', walkAwayPrize(currentLevel(s))) : s;
  }
}
