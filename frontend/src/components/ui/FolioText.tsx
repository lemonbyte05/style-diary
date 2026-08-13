/** 页脚小字（杂志 Folio 感：大写 + 字距） */
export function FolioText({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`font-sans uppercase tracking-[0.08em] text-ink-faint ${className}`}>
      {children}
    </span>
  );
}
