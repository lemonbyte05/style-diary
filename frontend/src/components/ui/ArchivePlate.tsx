import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Item } from "@/types";
import { FolioText } from "@/components/ui/FolioText";
import { ClothingImage } from "@/components/ui/ClothingImage";
import { haptic } from "@/haptics";

/**
 * 档案收藏件：以衣服图片为绝对主角。
 *
 * - 有真实图片时，卡片长宽比自动跟随图片真实比例（不裁切、无留白）
 * - 无图片时按 tall/square 回退到版画占位
 * - 统一纸框相纸卡：图片 + 名字 + 小型编号，装饰尽量轻
 */
export type PlateVariant = "polaroid" | "archive" | "editorial" | "minimal";

/** 读取图片真实宽高比（用于卡片自适配），加载失败回退 null */
function useImageAspect(url?: string | null): number | null {
  const [aspect, setAspect] = useState<number | null>(null);
  useEffect(() => {
    if (!url) {
      setAspect(null);
      return;
    }
    let alive = true;
    const im = new Image();
    im.onload = () => {
      if (alive && im.naturalWidth && im.naturalHeight) {
        setAspect(im.naturalWidth / im.naturalHeight);
      }
    };
    im.src = url;
    return () => {
      alive = false;
    };
  }, [url]);
  return aspect;
}

export function ArchivePlate({
  item,
  index,
  rotate = -1.5,
  delay = 0,
  tape = false,
  tall = true,
  onOpen,
  selectable = false,
  selected = false,
  onSelect,
  highlight = false,
}: {
  item: Item;
  index: number;
  rotate?: number;
  delay?: number;
  tape?: boolean;
  tall?: boolean;
  onOpen?: (id: number) => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: number) => void;
  highlight?: boolean;
}) {
  const imgAspect = useImageAspect(item.image_url);
  const fallback = tall ? 4 / 5 : 1;
  const photoAspect = imgAspect ?? fallback;
  const showTape = tape && !selectable;
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
        className="relative block w-full bg-paper-soft p-2 pb-2 transition-all duration-200"
        style={{
          borderRadius: 3,
          boxShadow: highlight ? "0 0 0 3px rgb(var(--c-rose))" : "var(--sh-plate)",
          outline: selected ? "1px solid rgb(var(--c-rose-deep))" : "none",
          opacity: selectable && !selected ? 0.72 : 1,
          transform: selected ? "scale(1.02)" : undefined,
        }}
      >
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: String(photoAspect) }}>
          <ClothingImage item={item} className="absolute inset-0 h-full w-full" />
        </div>
        <div className={`mt-2 flex items-baseline gap-2 ${item.name ? "justify-between" : "justify-end"}`}>
          {item.name && (
            <span className="min-w-0 flex-1 truncate text-left font-serif text-[13px] leading-tight text-ink">
              {item.name}
            </span>
          )}
          <FolioText>{label}</FolioText>
        </div>
      </button>
    </motion.div>
  );
}
