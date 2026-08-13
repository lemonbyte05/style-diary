import { GarmentPlate, pickShape, type GarmentShape } from "@/components/ui/GarmentPlate";
import type { Item } from "@/types";

/** 各品类自适应视觉比例（真实 PNG 时按此容器 contain，保留原比例不裁切） */
const ASPECTS: Record<GarmentShape, string> = {
  top: "aspect-[5/6]",
  dress: "aspect-[3/4]",
  skirt: "aspect-[4/5]",
  jacket: "aspect-[3/4]",
  bag: "aspect-[1/1]",
};

/**
 * 服装图：Garment First 的核心组件
 *
 * - 优先使用去背景透明 PNG（item.image_url / src），object-contain 保留原比例、不裁切
 * - 透明 PNG 自带自然阴影（drop-shadow 跟随服装 alpha 轮廓）
 * - 无 PNG 时回退到服装版画占位，未来替换真实图后布局无需修改
 */
export function ClothingImage({
  item,
  src,
  className = "",
  interactive = false,
}: {
  item: Pick<Item, "name" | "category" | "color_hex" | "image_url">;
  src?: string | null;
  className?: string;
  interactive?: boolean;
}) {
  const shape = pickShape(item);
  const hasCustomAspect = /aspect-\[/.test(className);
  const aspect = hasCustomAspect ? "" : ASPECTS[shape];
  const url = src ?? item.image_url;

  if (url) {
    return (
      <div className={`relative ${aspect} ${className}`}>
        <img
          src={url}
          alt={item.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-contain"
          style={{ filter: "drop-shadow(0 16px 22px rgba(48, 40, 33, 0.18))" }}
        />
      </div>
    );
  }

  return (
    <GarmentPlate colorHex={item.color_hex} name={item.name} shape={shape} interactive={interactive} className={`${aspect} ${className}`} />
  );
}
