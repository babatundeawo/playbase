import { isDark } from '../lib/theme.ts';
import { updateSettings, useSettings } from '../lib/settings.ts';
import { Icon } from './Icon.tsx';

/** Flips between light and dark. The full System / Light / Dark choice lives in Settings. */
export function ThemeToggle() {
  const { theme } = useSettings();
  const dark = isDark(theme);
  return (
    <button type="button" className="btn btn--quiet" onClick={() => updateSettings({ theme: dark ? 'light' : 'dark' })} aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}>
      <Icon name={dark ? 'sun' : 'moon'} />
    </button>
  );
}
