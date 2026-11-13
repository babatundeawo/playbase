// QuizMaster leaderboard periods: the date windows and the board names.
// Every window is measured in the player's own time zone (the device's local time),
// so "this month" starts at midnight on the 1st wherever the player is.

export const PERIODS = ["weekly", "monthly", "yearly", "lifetime"];

export const PERIOD_LABELS = {
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
  lifetime: "Lifetime"
};

const pad = (number) => String(number).padStart(2, "0");

/**
 * Returns { start, end } for the period that contains `now`.
 * start is included and end is excluded. Lifetime has no limits, so both are null.
 * The Date constructor with separate year, month and day values uses local time
 * and rolls over for us (day 0 is the last day of the month before, and so on).
 */
export function getPeriodRange(period, now = new Date()) {
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();

  if (period === "weekly") {
    // A week runs from Sunday (getDay() is 0) to Saturday.
    const sunday = day - now.getDay();
    return {
      start: new Date(year, month, sunday),
      end: new Date(year, month, sunday + 7)
    };
  }
  if (period === "monthly") {
    return { start: new Date(year, month, 1), end: new Date(year, month + 1, 1) };
  }
  if (period === "yearly") {
    return { start: new Date(year, 0, 1), end: new Date(year + 1, 0, 1) };
  }
  return { start: null, end: null };
}

/**
 * The name of the board a game belongs to, such as "weekly-2026-10-25"
 * (the date is the Sunday that starts the week), "monthly-2026-10",
 * "yearly-2026" or "lifetime". The patterns must match firestore.rules.
 */
export function getBoardId(period, now = new Date()) {
  const { start } = getPeriodRange(period, now);
  if (period === "weekly") {
    return `weekly-${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
  }
  if (period === "monthly") {
    return `monthly-${start.getFullYear()}-${pad(start.getMonth() + 1)}`;
  }
  if (period === "yearly") {
    return `yearly-${start.getFullYear()}`;
  }
  return "lifetime";
}

/** The four board names for right now, in the order of PERIODS. */
export function getAllBoardIds(now = new Date()) {
  return PERIODS.map((period) => getBoardId(period, now));
}

/** A short, readable description of a period, such as "October 2026". */
export function describePeriod(period, now = new Date(), locale) {
  const { start, end } = getPeriodRange(period, now);
  if (period === "lifetime") {
    return "Every game ever played";
  }

  const format = (date, options) => new Intl.DateTimeFormat(locale, options).format(date);
  if (period === "yearly") {
    return `${format(start, { year: "numeric" })} (your time zone)`;
  }
  if (period === "monthly") {
    return `${format(start, { month: "long", year: "numeric" })} (your time zone)`;
  }

  // The end is the start of next Sunday, so the last day shown is the day before it.
  const saturday = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 1);
  const first = format(start, { weekday: "short", day: "numeric", month: "short" });
  const last = format(saturday, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  });
  return `${first} to ${last} (your time zone)`;
}
