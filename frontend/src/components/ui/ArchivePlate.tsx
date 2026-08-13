import { motion } from "framer-motion";
import type { Item } from "@/types";
import { FolioText } from "@/components/ui/FolioText";
import { GarmentPlate, pickShape } from "@/components/ui/GarmentPlate";
import { haptic } from "@/haptics";
import { formatInkDate } from "@/utils";

/**
 * 档案收藏件（Polaroid 版）：白边相纸 + 轻微旋转 + 手写编号
 * 顶部可选和纸胶带 / 日期印章
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
      initial={{ opacity: 0, y: 26 }}
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
        className={`relative block bg-paper-soft p-2.5 pb-3 shadow-plate transition-shadow duration-300 hover:shadow-3 ${
          tall ? "aspect-[4/5]" : "aspect-square"
        }`}
        style={{ borderRadius: 3 }}
      >
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-6"
          style={{
            background: "linear-gradient(to bottom, rgba(255,255,255,0.5), transparent)",
            borderTopLeftRadius: 3,
            borderTopRightRadius: 3,
          }}
        />
        <div className="h-[calc(100%-2.2rem)] w-full">
          <GarmentPlate colorHex={item.color_hex} name={item.name} shape={pickShape(item)} className="h-full w-full" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="max-w-[65%] truncate text-left font-hand text-[13px] leading-tight text-ink">
            {item.name}
          </span>
          <FolioText>{String(index + 1).padStart(2, "0")}</FolioText>
        </div>
        <span className="absolute bottom-1.5 right-2.5 text-folio text-ink-faint/70">
          {formatInkDate(item.created_at).month}
        </span>
      </button>
    </motion.div>
  );
}
