export const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const numberFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

export function formatCurrencyInr(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) {
    return "₹0";
  }
  return inrFormatter.format(value);
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) {
    return "0";
  }
  return numberFormatter.format(value);
}

export function parseNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  // Remove common formatting characters like commas
  const normalized = trimmed.replace(/,/g, "");
  const parsed = Number(normalized);

  if (Number.isNaN(parsed)) {
    return null;
  }

  return parsed;
}

