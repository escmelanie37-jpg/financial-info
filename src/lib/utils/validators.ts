export function isValidSymbol(symbol: string): boolean {
  return /^[A-Z]{1,5}$/.test(symbol);
}

export function isValidQuantity(quantity: number): boolean {
  return Number.isFinite(quantity) && quantity > 0;
}

export function isValidPrice(price: number): boolean {
  return Number.isFinite(price) && price > 0;
}

export function isValidDate(date: unknown): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}

export function isValidTimestamp(ts: number): boolean {
  return Number.isFinite(ts) && ts > 0 && ts < Date.now() + 86400000;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPortfolioName(name: string): boolean {
  return typeof name === "string" && name.trim().length >= 1 && name.trim().length <= 100;
}

export function isValidWatchlistName(name: string): boolean {
  return typeof name === "string" && name.trim().length >= 1 && name.trim().length <= 50;
}

export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
