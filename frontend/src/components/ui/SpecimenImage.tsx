import { motion } from "framer-motion";

/**
 * 单品标本图：去背景"立绘"感
 * 在 paper-deep 凹槽托底 + 暖调渐变色晕 + 纸纹，模拟收藏标本
 */
export function SpecimenImage({
  colorHex,
  emoji,
  name,
  className = "",
  large = false,
}: {
  colorHex: string;
  emoji: string;
  name: string;
  className?: string;
  large?: boolean;
}) {
  return (
    <motion.div
      initial={large ? { scale: 0.96, opacity: 0.6 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`relative flex items-center justify-center overflow-hidden bg-paper-deep ${className}`}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 90% at 50% 40%, ${colorHex} 0%, rgba(246,241,232,0) 72%)`,
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background: "linear-gradient(to top, rgba(51,44,37,0.06), transparent)",
        }}
      />
      <motion.span
        whileHover={large ? { scale: 1.04 } : undefined}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative text-6xl drop-shadow-sm"
        role="img"
        aria-label={name}
      >
        {emoji}
      </motion.span>
    </motion.div>
  );
}
