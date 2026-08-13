import { useState } from "react";
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
 * - 优先渲染去背景透明 PNG（item.image_url / src）
 * - 真实图片默认 object-cover：填满整框、裁掉四周透明边距/留白，让衣服尽量大
 * - 图片加载失败自动回退到服装版画占位，未来替换真实图后布局无需修改
 */
export function ClothingImage({
  item,
  src,
  className = "",
  interactive = false,
  fit = "cover",
}: {
  item: Pick<Item, "name" | "category" | "color_hex" | "image_url">;
  src?: string | null;
  className?: string;
  interactive?: boolean;
  fit?: "cover" | "contain";
}) {
  const [broken, setBroken] = useState(false);
  const shape = pickShape(item);
  const hasCustomAspect = /aspect-\[/.test(className);
  const aspect = hasCustomAspect ? "" : ASPECTS[shape];
  const url = src ?? item.image_url;

  if (url && !broken) {
    return (
      <div className={`relative overflow-hidden ${aspect} ${className}`}>
        <img
          src={url}
          alt={item.name}
          loading="lazy"
          onError={() => setBroken(true)}
          className={`absolute inset-0 h-full w-full ${
            fit === "cover" ? "object-cover" : "object-contain"
          }`}
          style={
            fit === "contain"
              ? { filter: "drop-shadow(0 14px 20px rgba(48, 40, 33, 0.16))" }
              : undefined
          }
        />
        {/* 柔和内影，让照片与纸面融为一体 */}
        <span
          className="pointer-events-none absolute inset-0"
          style={{ boxShadow: "inset 0 0 44px rgba(48, 40, 33, 0.07)" }}
        />
      </div>
    );
  }

  return (
    <GarmentPlate colorHex={item.color_hex} name={item.name} shape={shape} interactive={interactive} className={`${aspect} ${className}`} />
  );
}
