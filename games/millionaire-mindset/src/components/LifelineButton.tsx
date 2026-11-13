import { Icon, type IconName } from './Icon.tsx';

const META = {
  fifty: { icon: 'half', label: '50:50', hint: 'Remove two wrong answers' },
  phone: { icon: 'phone', label: 'Phone a friend', hint: 'Ask a friend for advice' },
  audience: { icon: 'users', label: 'Ask the audience', hint: 'See how the audience votes' },
} as const satisfies Record<string, { icon: IconName; label: string; hint: string }>;

export type LifelineKind = keyof typeof META;

export function LifelineButton({ kind, used, disabled, onClick }: { kind: LifelineKind; used: boolean; disabled: boolean; onClick: () => void }) {
  const m = META[kind];
  return (
    <button type="button" className="lifeline" data-used={used} disabled={used || disabled} onClick={onClick} aria-label={used ? `${m.label} (already used)` : m.label} title={m.hint}>
      <Icon name={m.icon} size={20} />
      <span className="lifeline__label" aria-hidden="true">
        {m.label}
      </span>
    </button>
  );
}
