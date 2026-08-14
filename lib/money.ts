// Money is stored as integer kobo everywhere; naira appears only at the UI
// boundary (plan.md §7).

export function nairaToKobo(naira: number): number {
  if (!Number.isFinite(naira) || naira < 0) {
    throw new Error("Amount must be a non-negative finite number");
  }
  return Math.round(naira * 100);
}

export function koboToNaira(kobo: number): number {
  if (!Number.isInteger(kobo) || kobo < 0) {
    throw new Error("Kobo must be a non-negative integer");
  }
  return kobo / 100;
}

const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  currencyDisplay: "narrowSymbol",
  maximumFractionDigits: 0,
});

const nairaFormatterWithKobo = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  currencyDisplay: "narrowSymbol",
  minimumFractionDigits: 2,
});

export function formatKoboAsNaira(kobo: number): string {
  const naira = koboToNaira(kobo);
  return kobo % 100 === 0
    ? nairaFormatter.format(naira)
    : nairaFormatterWithKobo.format(naira);
}
