import { motion } from "framer-motion";
import type { Item } from "@/types";
import { FolioText } from "@/components/ui/FolioText";
import { ClothingImage } from "@/components/ui/ClothingImage";
import { haptic } from "@/haptics";

/**
 * 档案收藏件（相纸感）：弱容器 + 轻旋转 + 手写编号
 * 强调"照片/藏品"而非"商品卡"
 */
export function ArchivePlate({
  item,
  index,
  rotate = -1.5,
  delay = 0,
  tape = false,
  tall = true,
  onOpen,
}: {
  item: Item;
  index: number;
  rotate?: number;
  delay?: number;
  tape?: boolean;
  tall?: boolean;
  onOpen?: (id: number) => void;
}) {
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
      {tape && <div className="washi-tape" aria-hidden />}
      <button
        onClick={() => {
          haptic.tap();
          onOpen?.(item.id);
        }}
        className={`relative block bg-paper-soft p-2 pb-2.5 transition-shadow duration-300 hover:shadow-2 ${
          tall ? "aspect-[4/5]" : "aspect-square"
        }`}
        style={{ borderRadius: 2 }}
      >
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-5"
          style={{
            background: "linear-gradient(to bottom, rgba(255,255,255,0.45), transparent)",
            borderTopLeftRadius: 2,
            borderTopRightRadius: 2,
          }}
        />
        <div className="h-[calc(100%-2rem)] w-full">
          <ClothingImage item={item} className="h-full w-full" />
        </div>
        <div className="mt-1.5 flex items-baseline justify-between">
          <span className="max-w-[70%] truncate text-left font-serif text-[13px] leading-tight text-ink">
            {item.name}
          </span>
          <FolioText>{String(index + 1).padStart(2, "0")}</FolioText>
        </div>
      </button>
    </motion.div>
  );
}
