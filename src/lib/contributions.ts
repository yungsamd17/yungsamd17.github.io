export interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

export interface ContributionsData {
  /** 7-day columns, oldest first. `null` pads a partial first/last week. */
  weeks: (ContributionDay | null)[][];
  total: number;
  months: { label: string; col: number }[];
  from: string;
  to: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Build-time GitHub contribution calendar. Uses the public jogruber mirror of
 * GitHub's contribution graph so no token is needed. Any failure returns null
 * and the section is simply left out of the page.
 */
export async function fetchContributions(handle: string): Promise<ContributionsData | null> {
  try {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${handle}?y=last`, {
      signal: AbortSignal.timeout(8000),
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;

    const payload = (await res.json()) as {
      contributions?: ContributionDay[];
    };
    const days = payload.contributions;
    if (!Array.isArray(days) || days.length === 0) return null;

    const valid = days
      .filter((d) => typeof d?.date === 'string' && typeof d.count === 'number')
      .map((d) => ({ date: d.date, count: d.count, level: Math.max(0, Math.min(4, d.level ?? 0)) }));
    if (valid.length === 0) return null;

    // Pad the start so the grid always begins on a Sunday, and the end so the
    // final column has seven cells.
    const lead = new Date(`${valid[0].date}T00:00:00Z`).getUTCDay();
    const cells: (ContributionDay | null)[] = [...Array(lead).fill(null), ...valid];
    while (cells.length % 7 !== 0) cells.push(null);

    const weeks: (ContributionDay | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

    const months: { label: string; col: number }[] = [];
    // Label a month only where it actually begins in that week (GitHub-style),
    // so a partial first month does not get a stray label at column 0.
    weeks.forEach((week, col) => {
      const firstOfMonth = week.find((d) => d !== null && d.date.endsWith('-01'));
      if (!firstOfMonth) return;
      const month = new Date(`${firstOfMonth.date}T00:00:00Z`).getUTCMonth();
      months.push({ label: MONTHS[month], col });
    });

    return {
      weeks,
      total: valid.reduce((sum, d) => sum + d.count, 0),
      months,
      from: valid[0].date,
      to: valid[valid.length - 1].date,
    };
  } catch {
    return null;
  }
}
