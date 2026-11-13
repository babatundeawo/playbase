import { lazy, Suspense } from 'react';
import { NetworkBadge, UpdateToast } from './components/PwaUi.tsx';
import Home from './pages/home.tsx';
import NotFound from './pages/not-found.tsx';
import { useRoute } from './lib/router.ts';
import { useTheme } from './lib/theme.ts';

// The game screen and its question bank load only when a player starts.
const Game = lazy(() => import('./pages/game.tsx'));
const Result = lazy(() => import('./pages/result.tsx'));

function Loading() {
  return (
    <div className="loading" role="status">
      <div className="spinner" aria-hidden="true" />
      <p>Loading…</p>
    </div>
  );
}

export default function App() {
  useTheme();
  const { path } = useRoute();
  const page =
    path === '/' ? (
      <Home />
    ) : path === '/game' ? (
      <Game />
    ) : path === '/result' ? (
      <Result />
    ) : (
      <NotFound />
    );
  return (
    <>
      <a className="skip-link" href="#main" onClick={(e) => (e.preventDefault(), document.getElementById('main')?.focus())}>
        Skip to content
      </a>
      <NetworkBadge />
      <main id="main" tabIndex={-1}>
        <Suspense fallback={<Loading />}>{page}</Suspense>
      </main>
      <UpdateToast />
    </>
  );
}
