import { motion } from "framer-motion";
import { haptic } from "@/haptics";

/** 关键词胶囊：点击时墨色从角落晕染填充（盖章感） */
export function KeywordChip({
  label,
  active = false,
  onClick,
  delay = 0,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  delay?: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
      whileTap={{ scale: 0.94 }}
      onClick={() => {
        haptic.tap();
        onClick?.();
      }}
      className={`relative overflow-hidden rounded-full px-4 py-1.5 text-caption transition-colors duration-300 ${
        active
          ? "bg-ink text-paper"
          : "bg-paper-soft text-ink-soft shadow-1 border border-edge/60"
      }`}
    >
      <span className="relative z-10">{label}</span>
      {!active && (
        <motion.span
          className="absolute inset-0 bg-ink"
          initial={false}
          animate={active ? { opacity: 1 } : { opacity: 0 }}
        />
      )}
    </motion.button>
  );
}
