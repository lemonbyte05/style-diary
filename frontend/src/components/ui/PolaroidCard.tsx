import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Item } from "@/types";
import { FolioText } from "@/components/ui/FolioText";
import { SpecimenImage } from "@/components/ui/SpecimenImage";

/**
 * 拍立得卡：白边 16pt + 轻微旋转 + 手写题字
 * 顶部可选和纸胶带
 */
export function PolaroidCard({
  item,
  rotate = -1.5,
  delay = 0,
  index,
}: {
  item: Item;
  rotate?: number;
  delay?: number;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotate: rotate * 1.2 }}
      whileInView={{ opacity: 1, y: 0, rotate }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ rotate: 0, scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
      className="relative"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <div className="washi-tape" aria-hidden />
      <Link
        to={`/item/${item.id}`}
        className="block rounded-lg bg-paper-soft p-3 pb-4 shadow-polaroid transition-shadow duration-300 hover:shadow-2"
      >
        <SpecimenImage
          colorHex={item.color_hex}
          emoji={item.emoji}
          name={item.name}
          className="aspect-[3/4] w-full rounded-md"
        />
        <div className="mt-3 text-center">
          <p className="truncate font-hand text-sm text-ink">{item.name}</p>
          <FolioText className="mt-0.5 block">
            {String(index + 1).padStart(2, "0")} · {item.category}
          </FolioText>
        </div>
      </Link>
    </motion.div>
  );
}
