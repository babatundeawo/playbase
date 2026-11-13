export interface Rung {
  level: number;
  amount: number;
  haven: boolean;
}

/** The prize ladder. Havens at questions 5 and 10 lock in that amount once answered correctly. */
export const LADDER: readonly Rung[] = [
  { level: 1, amount: 100, haven: false },
  { level: 2, amount: 200, haven: false },
  { level: 3, amount: 300, haven: false },
  { level: 4, amount: 500, haven: false },
  { level: 5, amount: 1_000, haven: true },
  { level: 6, amount: 2_000, haven: false },
  { level: 7, amount: 4_000, haven: false },
  { level: 8, amount: 8_000, haven: false },
  { level: 9, amount: 16_000, haven: false },
  { level: 10, amount: 32_000, haven: true },
  { level: 11, amount: 64_000, haven: false },
  { level: 12, amount: 125_000, haven: false },
  { level: 13, amount: 250_000, haven: false },
  { level: 14, amount: 500_000, haven: false },
  { level: 15, amount: 1_000_000, haven: false },
];

export const TOP_PRIZE = LADDER[LADDER.length - 1].amount;
export const HAVENS = LADDER.filter((r) => r.haven);

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`;
}

/** Amount for the question the player is currently on (1-based level). */
export function prizeAt(level: number): number {
  return LADDER[level - 1]?.amount ?? 0;
}

/**
 * Prize kept when the player answers `level` wrongly: the last safe haven
 * that was already answered correctly (strictly below the current level).
 */
export function guaranteedPrize(level: number): number {
  for (let i = LADDER.length - 1; i >= 0; i--) {
    if (LADDER[i].haven && LADDER[i].level < level) return LADDER[i].amount;
  }
  return 0;
}

/** Prize kept when the player walks away while facing `level`: everything won so far. */
export function walkAwayPrize(level: number): number {
  return level > 1 ? prizeAt(level - 1) : 0;
}
