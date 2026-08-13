import { motion } from "framer-motion";

/**
 * 章页卡分隔：撕线 + 衬线章题 + 手写体小注（杂志章节元素）
 * 与底色无关，可安全用于纸面或纸面卡片之上
 */
export function TornDivider({
  label,
  note,
}: {
  label?: string;
  note?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6 }}
      className="my-5"
    >
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 border-t border-dashed border-edge" />
        {label && (
          <span className="whitespace-nowrap font-serif text-folio tracking-[0.2em] text-ink-faint">
            {label}
          </span>
        )}
        <span className="h-px flex-1 border-t border-dashed border-edge" />
      </div>
      {note && (
        <p className="mt-1.5 text-center font-hand text-caption text-ink-faint/80">
          {note}
        </p>
      )}
    </motion.div>
  );
}
