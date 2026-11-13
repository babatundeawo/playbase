import { formatNaira, LADDER } from '../game/ladder.ts';
import { Icon } from './Icon.tsx';

export function MoneyLadder({ level }: { level: number }) {
  return (
    <div className="card ladder">
      <h2 className="ladder__title">Prize ladder</h2>
      <ol aria-label="Prize ladder, top prize first" style={{ display: 'flex', flexDirection: 'column-reverse', gap: 4 }}>
        {LADDER.map((r) => {
          const cls = r.level === level ? 'rung rung--now' : r.level < level ? 'rung rung--done' : 'rung';
          return (
            <li key={r.level} className={`${cls}${r.haven ? ' rung--haven' : ''}`} aria-current={r.level === level ? 'step' : undefined}>
              <span>{r.level}</span>
              <b>{formatNaira(r.amount)}</b>
              {r.haven ? (
                <>
                  <Icon name="gem" size={16} />
                  <span className="sr-only">safe haven</span>
                </>
              ) : (
                <span />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
