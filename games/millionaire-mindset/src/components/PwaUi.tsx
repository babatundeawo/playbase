import { useEffect, useState } from 'react';
import { applyUpdate, dismissInstall, installDismissed, promptInstall, usePwa } from '../lib/pwa.ts';
import { useSettings } from '../lib/settings.ts';
import { Icon } from './Icon.tsx';
import { Modal } from './Modal.tsx';

export function UpdateToast() {
  const { updateReady } = usePwa();
  const [hidden, setHidden] = useState(false);
  if (!updateReady || hidden) return null;
  return (
    <div className="toast-zone">
      <div className="toast" role="status">
        <p>
          <strong>A new version is ready.</strong> Finish your game, then refresh.
        </p>
        <button type="button" className="btn btn--gold" onClick={applyUpdate}>
          Refresh
        </button>
        <button type="button" className="btn btn--quiet" onClick={() => setHidden(true)} aria-label="Dismiss">
          <Icon name="x" size={18} />
        </button>
      </div>
    </div>
  );
}

export function NetworkBadge() {
  const { online } = usePwa();
  if (online) return null;
  return (
    <div className="netbadge" role="status">
      <Icon name="wifioff" size={16} /> Offline. Built-in questions still work.
    </div>
  );
}

/** Shown on Home once the player has either finished a game or come back a second time. */
export function InstallCard({ visits }: { visits: number }) {
  const { canInstall, installed, isIos } = usePwa();
  const { stats } = useSettings();
  const [gone, setGone] = useState(() => installDismissed());
  const [help, setHelp] = useState(false);
  useEffect(() => setGone(installDismissed()), []);

  const eligible = (canInstall || isIos) && !installed && !gone && (stats.played > 0 || visits >= 2);
  if (!eligible) return null;
  return (
    <>
      <section className="card install" aria-label="Install the app">
        <span className="install__text">
          <strong>Play it like an app</strong>
          <small>Add Millionaire Mindset to your home screen. It also works offline.</small>
        </span>
        <span className="install__actions">
          {canInstall ? (
            <button type="button" className="btn btn--gold" onClick={() => void promptInstall()}>
              <Icon name="download" size={18} /> Install
            </button>
          ) : (
            <button type="button" className="btn btn--gold" onClick={() => setHelp(true)}>
              How to install
            </button>
          )}
          <button
            type="button"
            className="btn btn--quiet"
            onClick={() => {
              dismissInstall();
              setGone(true);
            }}
          >
            Not now
          </button>
        </span>
      </section>
      <Modal open={help} onClose={() => setHelp(false)} title="Add to Home Screen" titleId="ios-title" center>
        <ol className="steps">
          <li>
            <span>
              Tap the <strong>Share</strong> button <Icon name="share" size={18} /> at the bottom (or top) of Safari.
            </span>
          </li>
          <li>
            <span>
              Scroll down and tap <strong>Add to Home Screen</strong> <Icon name="plus" size={18} />.
            </span>
          </li>
          <li>
            <span>
              Tap <strong>Add</strong>. Open the new icon to play full screen.
            </span>
          </li>
        </ol>
        <button type="button" className="btn btn--gold" onClick={() => setHelp(false)} data-autofocus>
          Got it
        </button>
      </Modal>
    </>
  );
}
