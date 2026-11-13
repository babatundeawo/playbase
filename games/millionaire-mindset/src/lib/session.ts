import type { GameResult } from '../game/engine.ts';
import { readStore, writeStore } from './storage.ts';

const KEY = 'mm_result';

/** Hand the finished game to the result page. Lives for the browser tab only. */
export function saveResult(result: GameResult | null): void {
  writeStore(KEY, result ? JSON.stringify(result) : null, 'session');
}

export function loadResult(): GameResult | null {
  const raw = readStore(KEY, 'session');
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as GameResult;
    const okOutcome = v.outcome === 'win' || v.outcome === 'loss' || v.outcome === 'walkaway';
    if (!okOutcome || typeof v.prize !== 'number' || typeof v.level !== 'number') return null;
    return v;
  } catch {
    return null;
  }
}
