import { useEffect, useState } from 'react';
import { Climb } from '../components/Climb.tsx';
import { Icon } from '../components/Icon.tsx';
import { InstallCard } from '../components/PwaUi.tsx';
import { SettingsDialog } from '../components/SettingsDialog.tsx';
import { ThemeToggle } from '../components/ThemeToggle.tsx';
import { HAVENS, formatNaira, TOP_PRIZE } from '../game/ladder.ts';
import { unlockAudio } from '../hooks/useSound.ts';
import { navigate } from '../lib/router.ts';
import { countVisit } from '../lib/pwa.ts';
import { useSettings } from '../lib/settings.ts';

const STEPS = [
  { icon: 'zap', title: '15 questions', text: 'Climb from easy to very hard. Every correct answer raises the stakes.' },
  { icon: 'phone', title: '3 lifelines', text: '50:50, Phone a friend and Ask the audience. Each can be used once per game.' },
  {
    icon: 'shield',
    title: '2 safe havens',
    text: `Answer question ${HAVENS[0].level} to lock in ${formatNaira(HAVENS[0].amount)}, and question ${HAVENS[1].level} to lock in ${formatNaira(HAVENS[1].amount)}.`,
  },
] as const;

export default function Home() {
  const [settings, setSettings] = useState(false);
  const [visits, setVisits] = useState(0);
  const { stats, aiEnabled } = useSettings();
  useEffect(() => setVisits(countVisit()), []);
  useEffect(() => {
    document.title = 'Millionaire Mindset: a 15-question trivia climb to ₦1,000,000';
  }, []);

  return (
    <div className="home">
      <div className="container">
        <header className="topbar">
          <a className="brand" href="#/" aria-label="Millionaire Mindset, home">
            <img src="./favicon-32.png" width="36" height="36" alt="" />
            <span>Millionaire Mindset</span>
          </a>
          <div className="topbar__actions">
            <ThemeToggle />
            <button type="button" className="btn btn--quiet" onClick={() => setSettings(true)} aria-label="Settings">
              <Icon name="sliders" />
            </button>
          </div>
        </header>

        <section className="hero" aria-labelledby="hero-title">
          <span className="chip rise" style={{ '--d': 0 } as React.CSSProperties}>
            <Icon name="gem" size={16} /> Free trivia · play money only
          </span>
          <h1 id="hero-title" className="hero__title rise" style={{ '--d': 1 } as React.CSSProperties}>
            Millionaire
            <span>Mindset</span>
          </h1>
          <p className="hero__lede rise" style={{ '--d': 2 } as React.CSSProperties}>
            Fifteen questions stand between you and <strong>{formatNaira(TOP_PRIZE)}</strong>. Use your lifelines wisely and lock in your safe havens.
          </p>
          <div className="hero__cta rise" style={{ '--d': 3 } as React.CSSProperties}>
            <a
              className="btn btn--gold btn--xl"
              href="#/game"
              onClick={(e) => {
                e.preventDefault();
                unlockAudio();
                navigate('/game');
              }}
            >
              Play now
            </a>
            <p className="hero__note">{aiEnabled ? 'AI questions are on.' : 'No account. No download. Works offline once loaded.'}</p>
          </div>
          <div className="rise" style={{ '--d': 4, display: 'contents' } as React.CSSProperties}>
            <Climb />
          </div>
          {stats.played > 0 && (
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
          )}
        </section>

        <section className="how" aria-label="How to play">
          <h2>How to play</h2>
          {STEPS.map((s) => (
            <article key={s.title} className="card how__item">
              <Icon name={s.icon} size={26} />
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </article>
          ))}
        </section>

        <InstallCard visits={visits} />

        <footer className="footer">
          <p>Play money only. There are no real prizes. Your settings and record stay on this device. There are no accounts and no tracking.</p>
          <p>
            <a href="https://github.com/babatundeawo/Millionaire-Mindset" target="_blank" rel="noopener noreferrer">
              Source on GitHub
            </a>
          </p>
        </footer>
      </div>
      <SettingsDialog open={settings} onClose={() => setSettings(false)} />
    </div>
  );
}
