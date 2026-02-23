/**
 * Format a price with full meaningful precision.
 * - Always shows at least 2 decimal places
 * - Preserves extra decimals when they are non-zero (e.g. 9.9976, 0.0024)
 * - Trims trailing zeros beyond 2 decimal places
 * Examples: 10 → "10.00", 9.9976 → "9.9976", 0.0024 → "0.0024", 1.50 → "1.50"
 */
export function formatPrice(value: number | undefined | null): string {
    if (value == null || isNaN(value)) return '0.00';
    if (value === 0) return '0.00';

    // Format to 6 decimal places, then trim unnecessary trailing zeros
    const full = value.toFixed(6);
    const parts = full.split('.');
    let decimals = parts[1].replace(/0+$/, '');
    if (decimals.length < 2) decimals = decimals.padEnd(2, '0');
    return `${parts[0]}.${decimals}`;
}

/**
 * Format price with $ prefix
 */
export function $price(value: number | undefined | null): string {
    return `$${formatPrice(value)}`;
}
