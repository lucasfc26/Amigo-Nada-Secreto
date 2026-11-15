export function cleanName(name: string): string {
  return name.trim().replace(/\s+/g, " ").normalize("NFC");
}

export function normalizeName(name: string): string {
  return cleanName(name).toLocaleLowerCase("pt-BR");
}

export function findDuplicate(name: string, names: readonly string[]): string | null {
  const key = normalizeName(name);
  if (!key) return null;
  return names.find((existing) => normalizeName(existing) === key) ?? null;
}

export function canDraw(names: readonly string[]): boolean {
  if (names.length < 2) return false;
  const keys = names.map((name) => normalizeName(name));
  if (keys.some((key) => key === "")) return false;
  return new Set(keys).size === keys.length;
}
