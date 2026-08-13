const MONTHS = [
  "一月", "二月", "三月", "四月", "五月", "六月",
  "七月", "八月", "九月", "十月", "十一月", "十二月",
];

const DAYS = [
  "一日", "二日", "三日", "四日", "五日", "六日", "七日", "八日", "九日", "十日",
  "十一日", "十二日", "十三日", "十四日", "十五日", "十六日", "十七日", "十八日",
  "十九日", "二十日", "二十一日", "二十二日", "二十三日", "二十四日", "二十五日",
  "二十六日", "二十七日", "二十八日", "二十九日", "三十日", "三十一日",
];

/** "2026-08-13" → "八月 · 十三日"（杂志日期题字） */
export function formatDiaryDate(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${MONTHS[(m ?? 1) - 1]} · ${DAYS[(d ?? 1) - 1]}`;
}

/** "2026-08-13" → { "二〇二六年", "五月" }（汉文入册日期） */
export function formatInkDate(iso: string): { year: string; month: string } {
  const [y, m] = iso.split("-").map(Number);
  const digits = "〇一二三四五六七八九";
  const year = String(y ?? 0)
    .split("")
    .map((ch) => digits[Number(ch)])
    .join("");
  return { year, month: MONTHS[(m ?? 1) - 1] };
}
