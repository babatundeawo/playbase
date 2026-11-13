export type Letter = 'A' | 'B' | 'C' | 'D';
export const LETTERS: readonly Letter[] = ['A', 'B', 'C', 'D'];
export type Difficulty = 'easy' | 'medium' | 'hard' | 'very-hard';

export interface Option {
  letter: Letter;
  text: string;
}

export interface Question {
  id: number;
  text: string;
  options: Option[];
  correct: Letter;
  difficulty: Difficulty;
}

/** A function returning a number in [0, 1), like Math.random. Injected so tests are deterministic. */
export type Rng = () => number;
