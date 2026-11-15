export const card =
  "flex flex-col gap-6 rounded-[28px] border border-line bg-card px-5 py-6 shadow-[0_24px_50px_-32px_rgba(0,0,0,0.65)] sm:px-7 sm:py-7";

export const primaryButton =
  "inline-flex h-12 cursor-pointer items-center justify-center rounded-full bg-ribbon px-6 text-sm font-semibold text-[#fffdf9] transition hover:bg-ribbon-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ribbon disabled:cursor-not-allowed disabled:bg-[#e7dfd4] disabled:text-[#8a7b70] disabled:opacity-100";

export const secondaryButton =
  "inline-flex h-12 cursor-pointer items-center justify-center rounded-full border border-line bg-card px-6 text-sm font-semibold text-ink transition hover:border-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-40";

export function fieldClass(invalid: boolean): string {
  const base =
    "h-12 w-full min-w-0 rounded-2xl border-2 px-4 text-base outline-none disabled:cursor-not-allowed disabled:opacity-60";

  if (invalid) {
    return `${base} border-red-600 bg-red-50 text-red-700 placeholder:text-red-300 focus-visible:ring-2 focus-visible:ring-red-600`;
  }

  return `${base} border-line bg-paper text-ink placeholder:text-muted/70 focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/30`;
}
