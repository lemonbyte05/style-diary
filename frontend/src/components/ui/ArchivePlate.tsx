import { motion } from "framer-motion";
import type { Item } from "@/types";
import { FolioText } from "@/components/ui/FolioText";
import { ClothingImage } from "@/components/ui/ClothingImage";
import { haptic } from "@/haptics";

/**
 * 档案收藏件：以衣服图片为绝对主角，装饰尽量轻。
 *
 * - polaroid  相纸感：轻纸边 + 小型编号（默认）
 * - archive   同 polaroid（简化后合并）
 * - editorial 无纸框，纯图片 + 名字
 * - minimal   留白浮像：contain 悬浮 + 投影，无纸框
 */
export type PlateVariant = "polaroid" | "archive" | "editorial" | "minimal";

const ASPECT: Record<PlateVariant, (tall: boolean) => string> = {
  polaroid: (t) => (t ? "aspect-[4/5]" : "aspect-square"),
  archive: (t) => (t ? "aspect-[4/5]" : "aspect-square"),
  editorial: (t) => (t ? "aspect-[4/5]" : "aspect-square"),
  minimal: () => "aspect-[3/4]",
};

export function ArchivePlate({
  item,
  index,
  rotate = -1.5,
  delay = 0,
  tape = false,
  tall = true,
  variant = "polaroid",
  onOpen,
  selectable = false,
  selected = false,
  onSelect,
}: {
  item: Item;
  index: number;
  rotate?: number;
  delay?: number;
  tape?: boolean;
  tall?: boolean;
  variant?: PlateVariant;
  onOpen?: (id: number) => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: number) => void;
}) {
  const aspect = ASPECT[variant](tall);
  const showTape = tape && !selectable && variant === "polaroid";
  const label = String(index + 1).padStart(2, "0");

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -5, rotate: rotate * 0.4 }}
      whileTap={{ scale: 0.98 }}
      className="relative"
      style={{ rotate }}
    >
      {showTape && <div className="washi-tape" aria-hidden />}
      <button
        onClick={() => {
          haptic.tap();
          if (selectable) onSelect?.(item.id);
          else onOpen?.(item.id);
        }}
        className="relative block transition-all duration-200"
        style={{
          borderRadius: 2,
          outline: selected ? "1px solid rgb(var(--c-rose-deep))" : "none",
          opacity: selectable && !selected ? 0.72 : 1,
          transform: selected ? "scale(1.02)" : undefined,
        }}
      >
        {variant === "polaroid" && (
          <div className={`relative bg-paper-soft p-1.5 pb-2 ${aspect}`}>
            <div className="h-[calc(100%-1.75rem)] w-full">
              <ClothingImage item={item} className="h-full w-full" />
            </div>
            <div className="mt-1 flex items-baseline justify-between gap-2">
              <span className="min-w-0 flex-1 truncate text-left font-serif text-[13px] leading-tight text-ink">
                {item.name}
              </span>
              <FolioText>{label}</FolioText>
            </div>
          </div>
        )}

        {variant === "archive" && (
          <div className={`relative bg-paper-soft p-1.5 pb-2 ${aspect}`}>
            <div className="h-[calc(100%-1.75rem)] w-full">
              <ClothingImage item={item} className="h-full w-full" />
            </div>
            <div className="mt-1 flex items-baseline justify-between gap-2">
              <span className="min-w-0 flex-1 truncate text-left font-serif text-[13px] leading-tight text-ink">
                {item.name}
              </span>
              <FolioText>{label}</FolioText>
            </div>
          </div>
        )}

        {variant === "editorial" && (
          <div className={aspect}>
            <ClothingImage item={item} className="h-full w-full" />
            <p className="mt-1.5 truncate font-serif text-[13px] text-ink">{item.name}</p>
          </div>
        )}

        {variant === "minimal" && (
          <div className={aspect}>
            <ClothingImage item={item} className="h-full w-full" fit="contain" />
            <p className="mt-1 truncate text-center font-hand text-[11px] text-ink-faint">{item.name}</p>
          </div>
        )}
      </button>
    </motion.div>
  );
}
