/**
 * 植物线描（极轻的 scrapbook 点缀，仅做角落装饰）
 */
export function LeafSpray({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 60" className={className} fill="none" aria-hidden>
      <path d="M6 54 C30 42 46 36 60 32" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
      <path d="M18 44 C26 32 34 26 46 22" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
      <ellipse cx="46" cy="22" rx="7" ry="3.4" transform="rotate(-36 46 22)" stroke="currentColor" strokeWidth="0.7" opacity="0.45" />
      <path d="M38 36 C46 30 54 28 62 28" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
      <circle cx="62" cy="28" r="2" stroke="currentColor" strokeWidth="0.6" opacity="0.45" />
      <path d="M60 32 C66 30 70 30 74 31" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}
