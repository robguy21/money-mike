/**
 * Mike's voice. The verdict tiers drive both the copy and the colour state of
 * the hero (via the `tier` key, which matches the `[data-tier]` styling in
 * scss/custom/app/routes/components/_dashboard.scss).
 */
export const VERDICT_TIERS = [
    {tier: 'great', min: 1500, title: "You're doing a great job!", grade: 'Nailed it'},
    {tier: 'good', min: 1000, title: "You've got some — use it carefully.", grade: 'Solid'},
    {tier: 'careful', min: 200, title: "Whoops. Emergencies only.", grade: 'Shaky'},
    {tier: 'tight', min: 50, title: "Hold up, tiger. Don't spend.", grade: 'Close one'},
];

export const BROKE = {tier: 'broke', title: "You fucking donkey. Don't spend.", grade: 'Disaster'};
export const ZERO = {tier: 'zero', title: "Perfectly balanced…", grade: 'Exact'};

/**
 * Returns the verdict for a given actual balance. Mirrors the original
 * threshold logic: exact zero is its own state, otherwise the first tier the
 * balance clears, falling through to broke.
 */
export function verdictFor(balance) {
    if (balance === 0) return ZERO;
    for (const tier of VERDICT_TIERS) {
        if (balance > tier.min) return tier;
    }
    return BROKE;
}

/**
 * Formats a number as Rand with space-grouped thousands, e.g. -1234 → "-R1 234".
 * Amounts in this app are whole Rand, so no decimals.
 */
export function formatRand(value) {
    const rounded = Math.round(value || 0);
    const sign = rounded < 0 ? '-' : '';
    const grouped = Math.abs(rounded)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `${sign}R${grouped}`;
}

/**
 * Short human timestamp for the "last updated" stamp, e.g. "5 Jul, 14:30".
 * Returns null when there's nothing to show.
 */
export function formatStamp(isoString) {
    if (!isoString) return null;
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat('en-ZA', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}
