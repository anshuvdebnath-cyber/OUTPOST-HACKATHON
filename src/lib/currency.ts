const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

/** Formats a number as Indian Rupees, e.g. 150000 → "₹1,50,000". */
export function formatINR(amount: number): string {
  return inrFormatter.format(amount);
}

/** Compact rupee format for tight spaces, e.g. 150000 → "₹1.5L", 2500000 → "₹25L". */
export function formatINRCompact(amount: number): string {
  if (amount >= 10_000_000) return `₹${trim(amount / 10_000_000)}Cr`;
  if (amount >= 100_000) return `₹${trim(amount / 100_000)}L`;
  if (amount >= 1_000) return `₹${trim(amount / 1_000)}K`;
  return `₹${amount}`;
}

function trim(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, '');
}

