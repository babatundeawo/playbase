import { useSyncExternalStore } from 'react';
import { applyResult, EMPTY_STATS, parseStats, type Stats } from '../game/stats.ts';
import type { GameResult } from '../game/engine.ts';
import { readStore, writeStore } from './storage.ts';

export type ThemePref = 'system' | 'light' | 'dark';

export interface Settings {
  theme: ThemePref;
  sfx: boolean;
  music: boolean;
  haptics: boolean;
  /** Ask "Final answer?" before locking in. */
  confirm: boolean;
  aiEnabled: boolean;
  aiKey: string;
  aiModel: string;
  aiTopic: string;
  stats: Stats;
}

// The four AI keys keep their original names so existing players keep their settings.
const KEY = {
  theme: 'mm_theme',
  sfx: 'mm_sfx',
  music: 'mm_music',
  haptics: 'mm_haptics',
  confirm: 'mm_confirm',
  aiEnabled: 'mm_use_ai_questions',
  aiKey: 'mm_groq_api_key',
  aiModel: 'mm_groq_model',
  aiTopic: 'mm_groq_topic',
  stats: 'mm_stats',
} as const;

const flag = (key: string, fallback: boolean) => {
  const v = readStore(key);
  return v === null ? fallback : v === '1' || v === 'true';
};

function load(): Settings {
  const theme = readStore(KEY.theme);
  return {
    theme: theme === 'light' || theme === 'dark' ? theme : 'system',
    sfx: flag(KEY.sfx, true),
    music: flag(KEY.music, true),
    haptics: flag(KEY.haptics, true),
    confirm: flag(KEY.confirm, true),
    aiEnabled: flag(KEY.aiEnabled, false),
    aiKey: readStore(KEY.aiKey) ?? '',
    aiModel: readStore(KEY.aiModel) ?? '',
    aiTopic: readStore(KEY.aiTopic) ?? '',
    stats: parseStats(readStore(KEY.stats)),
  };
}

let current: Settings = load();
const listeners = new Set<() => void>();

export const getSettings = (): Settings => current;

export function updateSettings(patch: Partial<Settings>): void {
  current = { ...current, ...patch };
  const b = (v: boolean) => (v ? '1' : '0');
  if ('theme' in patch) writeStore(KEY.theme, current.theme === 'system' ? null : current.theme);
  if ('sfx' in patch) writeStore(KEY.sfx, b(current.sfx));
  if ('music' in patch) writeStore(KEY.music, b(current.music));
  if ('haptics' in patch) writeStore(KEY.haptics, b(current.haptics));
  if ('confirm' in patch) writeStore(KEY.confirm, b(current.confirm));
  if ('aiEnabled' in patch) writeStore(KEY.aiEnabled, String(current.aiEnabled));
  if ('aiKey' in patch) writeStore(KEY.aiKey, current.aiKey || null);
  if ('aiModel' in patch) writeStore(KEY.aiModel, current.aiModel || null);
  if ('aiTopic' in patch) writeStore(KEY.aiTopic, current.aiTopic || null);
  if ('stats' in patch) writeStore(KEY.stats, JSON.stringify(current.stats));
  listeners.forEach((l) => l());
}

export function recordResult(result: GameResult): void {
  updateSettings({ stats: applyResult(current.stats, result) });
}

export function resetStats(): void {
  updateSettings({ stats: EMPTY_STATS });
}

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

export function useSettings(): Settings {
  return useSyncExternalStore(subscribe, getSettings, getSettings);
}
