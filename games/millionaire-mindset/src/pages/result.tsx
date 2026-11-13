import { useEffect, useMemo, useState } from 'react';
import { Icon, type IconName } from '../components/Icon.tsx';
import type { GameResult } from '../game/engine.ts';
import { formatNaira, LADDER, TOP_PRIZE } from '../game/ladder.ts';
import { unlockAudio } from '../hooks/useSound.ts';
import { navigate, useRoute } from '../lib/router.ts';
import { loadResult } from '../lib/session.ts';
import { useSettings } from '../lib/settings.ts';

const CONFETTI = ['#f2c75c', '#e0ad3a', '#4cc38a', '#6aa5f7', '#fff0b8'];

/** Older links looked like #/result?outcome=win&prize=1000. Accept them, but only with real values. */
function fromQuery(q: URLSearchParams): GameResult | null {
  const o = q.get('outcome');
  if (!q.has('outcome') && !q.has('prize')) return null;
  const outcome = o === 'win' || o === 'walkaway' ? o : 'loss';
  const p = parseInt(q.get('prize') || '0', 10);
  const prize = outcome === 'win' ? TOP_PRIZE : LADDER.some((r) => r.amount === p) ? p : 0;
  const c = q.get('correct') || '';
  return { outcome, prize, level: outcome === 'win' ? 15 : 1, correctLetter: /^[A-D]$/.test(c) ? (c as 'A') : 'A', correctText: '' };
}

const COPY: Record<GameResult['outcome'], { kicker: string; title: string; icon: IconName }> = {
  win: { kicker: 'Congratulations', title: 'You are a millionaire!', icon: 'trophy' },
  walkaway: { kicker: 'Well played', title: 'You walked away with', icon: 'exit' },
  loss: { kicker: 'Not quite', title: 'You take home', icon: 'x' },
};

export default function Result() {
  const route = useRoute();
  const { stats } = useSettings();
  const result = useMemo(() => loadResult() ?? fromQuery(route.query), [route.query]);
  const [copied, setCopied] = useState(false);
  const pieces = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        x: (i * 97) % 100,
        w: 6 + ((i * 7) % 7),
        c: CONFETTI[i % CONFETTI.length],
        dur: 3.2 + ((i * 13) % 20) / 10,
        delay: ((i * 29) % 14) / 10,
        dx: ((i % 7) - 3) * 28,
        rot: (i % 2 ? 1 : -1) * (300 + ((i * 37) % 300)),
      })),
    [],
  );

  useEffect(() => {
    if (!result) navigate('/', true);
    document.title = 'Result | Millionaire Mindset';
  }, [result]);
  if (!result) return null;

  const copy = COPY[result.outcome];
  const share = async () => {
    const text =
      result.outcome === 'win' ? `I won ${formatNaira(TOP_PRIZE)} on Millionaire Mindset! Can you?` : `I took home ${formatNaira(result.prize)} on Millionaire Mindset. Can you beat it?`;
    const url = window.location.href.split('#')[0];
    try {
      if (navigator.share) await navigator.share({ title: 'Millionaire Mindset', text, url });
      else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setCopied(true);
      }
    } catch {
      /* cancelled */
    }
  };

  return (
    <div className="result" data-outcome={result.outcome}>
      {result.outcome === 'win' && (
        <div className="confetti" aria-hidden="true">
          {pieces.map((p, i) => (
            <i key={i} style={{ '--x': p.x, '--w': `${p.w}px`, '--c': p.c, '--dur': `${p.dur}s`, '--delay': `${p.delay}s`, '--dx': `${p.dx}px`, '--rot': `${p.rot}deg` } as React.CSSProperties} />
          ))}
        </div>
      )}
      <div className="result__inner">
        <span className="result__badge">
          <Icon name={copy.icon} size={48} />
        </span>
        <p className="result__kicker">{copy.kicker}</p>
        <h1>{copy.title}</h1>
        {result.outcome !== 'win' && <p className="result__prize">{formatNaira(result.prize)}</p>}
        {result.outcome === 'win' && <p className="result__prize">{formatNaira(TOP_PRIZE)}</p>}
        {result.outcome === 'loss' && result.correctText && (
          <p className="result__detail">
            The correct answer was{' '}
            <b>
              {result.correctLetter}: {result.correctText}
            </b>
            .
          </p>
        )}
        {result.outcome !== 'win' && <p className="result__detail">You reached question {result.level} of 15.</p>}
        <p className="record" aria-label="Your record">
          <span>
            Games <b>{stats.played}</b>
          </span>
          <span>
            Wins <b>{stats.wins}</b>
          </span>
          <span>
            Best prize <b>{formatNaira(stats.best)}</b>
          </span>
        </p>
        <div className="result__actions">
          <a
            className="btn btn--gold btn--xl"
            href="#/game"
            onClick={(e) => {
              e.preventDefault();
              unlockAudio();
              navigate('/game');
            }}
          >
            Play again
          </a>
          <button type="button" className="btn btn--ghost btn--xl" onClick={() => void share()}>
            <Icon name="share" size={20} /> Share
          </button>
        </div>
        <p className="sr-only" role="status">{copied ? 'Copied to clipboard' : ''}</p>
        {copied && <p className="field__hint">Copied. Paste it anywhere to share.</p>}
        <a href="#/">Back to home</a>
      </div>
    </div>
  );
}
