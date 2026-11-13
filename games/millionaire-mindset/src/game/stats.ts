import type { GameResult } from './engine.ts';

export interface Stats {
  played: number;
  wins: number;
  /** Highest prize ever taken home. */
  best: number;
  /** Highest question level ever reached. */
  bestLevel: number;
}

export const EMPTY_STATS: Stats = { played: 0, wins: 0, best: 0, bestLevel: 0 };

export function applyResult(stats: Stats, result: GameResult): Stats {
  return {
    played: stats.played + 1,
    wins: stats.wins + (result.outcome === 'win' ? 1 : 0),
    best: Math.max(stats.best, result.prize),
    bestLevel: Math.max(stats.bestLevel, result.outcome === 'win' ? 15 : result.level),
  };
}

export function parseStats(raw: string | null): Stats {
  if (!raw) return EMPTY_STATS;
  try {
    const v = JSON.parse(raw) as Partial<Stats>;
    const n = (x: unknown) => (typeof x === 'number' && Number.isFinite(x) && x >= 0 ? Math.floor(x) : 0);
    return { played: n(v.played), wins: n(v.wins), best: n(v.best), bestLevel: n(v.bestLevel) };
  } catch {
    return EMPTY_STATS;
  }
}
