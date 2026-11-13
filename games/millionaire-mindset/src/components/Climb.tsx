import { formatNaira, HAVENS, LADDER, TOP_PRIZE } from '../game/ladder.ts';

/** Home-page signature: the fifteen steps of the ladder, with a wave of light climbing them. */
export function Climb() {
  const label = `Prize ladder from ${formatNaira(LADDER[0].amount)} to ${formatNaira(TOP_PRIZE)}, with safe havens at ${HAVENS.map((h) => formatNaira(h.amount)).join(' and ')}.`;
  return (
    <>
      <div className="climb" role="img" aria-label={label}>
        {LADDER.map((r) => (
          <i key={r.level} className={r.haven ? 'is-haven' : r.level === 15 ? 'is-top' : ''} style={{ '--n': r.level } as React.CSSProperties} />
        ))}
      </div>
      <p className="climb-labels" aria-hidden="true">
        <span>{formatNaira(LADDER[0].amount)}</span>
        <span>
          <b>◆</b> {formatNaira(HAVENS[0].amount)}
        </span>
        <span>
          <b>◆</b> {formatNaira(HAVENS[1].amount)}
        </span>
        <span>{formatNaira(TOP_PRIZE)}</span>
      </p>
    </>
  );
}
