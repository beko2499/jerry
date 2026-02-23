/**
 * Format a price with full precision for small values.
 * - Values >= 0.01 → 2 decimal places (e.g. 1.50, 0.69)
 * - Values < 0.01 → show all significant digits (e.g. 0.0016, 0.00032)
 */
export function formatPrice(value: number | undefined | null): string {
    if (value == null || isNaN(value)) return '0.00';
    if (value === 0) return '0.00';

    const abs = Math.abs(value);

    if (abs >= 0.01) {
        return value.toFixed(2);
    }

    // For small values, show up to 6 decimal places, trimming trailing zeros
    const str = value.toFixed(6).replace(/0+$/, '');
    // Make sure we have at least 2 decimal places
    const parts = str.split('.');
    if (!parts[1] || parts[1].length < 2) {
        return value.toFixed(2);
    }
    return str;
}

/**
 * Format price with $ prefix
 */
export function $price(value: number | undefined | null): string {
    return `$${formatPrice(value)}`;
}
