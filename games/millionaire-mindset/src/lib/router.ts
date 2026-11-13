import { useSyncExternalStore } from 'react';

// Hash routing (#/game, #/result): GitHub Pages cannot rewrite URLs, so a hash
// route survives refresh and works under any repository sub-path.
export interface Route {
  path: string;
  query: URLSearchParams;
}

let cache: { raw: string; route: Route } | null = null;

function read(): Route {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  if (cache?.raw === raw) return cache.route;
  const [p, q = ''] = raw.split('?');
  const path = '/' + p.replace(/^\/+/, '').replace(/\/+$/, '');
  const route = { path, query: new URLSearchParams(q) };
  cache = { raw, route };
  return route;
}

const subscribe = (cb: () => void) => {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
};

export const useRoute = (): Route => useSyncExternalStore(subscribe, read, () => ({ path: '/', query: new URLSearchParams() }));

export function navigate(path: string, replace = false): void {
  const hash = '#' + path;
  if (replace) window.history.replaceState(null, '', hash);
  else window.location.hash = hash;
  window.dispatchEvent(new HashChangeEvent('hashchange'));
  window.scrollTo(0, 0);
}
