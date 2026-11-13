// Safe wrappers around localStorage / sessionStorage. Both can throw (private
// windows, blocked site data), so every access is guarded and falls back to memory.

const memory = new Map<string, string>();

function area(kind: 'local' | 'session'): Storage | null {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function readStore(key: string, kind: 'local' | 'session' = 'local'): string | null {
  try {
    const v = area(kind)?.getItem(key);
    if (v !== undefined && v !== null) return v;
  } catch {
    /* fall through to memory */
  }
  return memory.get(`${kind}:${key}`) ?? null;
}

export function writeStore(key: string, value: string | null, kind: 'local' | 'session' = 'local'): void {
  try {
    const a = area(kind);
    if (a) {
      if (value === null) a.removeItem(key);
      else a.setItem(key, value);
      memory.delete(`${kind}:${key}`);
      return;
    }
  } catch {
    /* fall through to memory */
  }
  if (value === null) memory.delete(`${kind}:${key}`);
  else memory.set(`${kind}:${key}`, value);
}
