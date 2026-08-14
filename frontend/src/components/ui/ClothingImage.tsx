import { useState } from "react";
import { GarmentPlate, pickShape, type GarmentShape } from "@/components/ui/GarmentPlate";
import type { Item } from "@/types";

/** 各品类自适应视觉比例（真实图片按此容器 contain，保留原比例不裁切） */
const ASPECTS: Record<GarmentShape, string> = {
  top: "aspect-[5/6]",
  dress: "aspect-[3/4]",
  skirt: "aspect-[4/5]",
  jacket: "aspect-[3/4]",
  bag: "aspect-[1/1]",
  pants: "aspect-[3/4]",
  shoes: "aspect-[1/1]",
};

/**
 * 服装图：Garment First 的核心组件
 *
 * - 优先渲染真实图片（item.image_url / src）
 * - 默认 object-contain：服装的袖口/裙摆/领口/外轮廓不能被裁掉，一律保留原比例
 *   （未来若支持普通生活照片，可对 photo 显式传 fit="cover"）
 * - 图片加载失败自动回退到服装版画占位
 */
export function ClothingImage({
  item,
  src,
  className = "",
  interactive = false,
  fit,
}: {
  item: Pick<Item, "name" | "category" | "color_hex" | "image_url" | "image_type">;
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
  const mode: "cover" | "contain" = fit ?? "contain";

  if (url && !broken) {
    return (
      <div className={`relative overflow-hidden ${aspect} ${className}`}>
        <img
          src={url}
          alt={item.name}
          loading="lazy"
          onError={() => setBroken(true)}
          className={`absolute inset-0 h-full w-full ${
            mode === "cover" ? "object-cover" : "object-contain"
          }`}
          style={
            mode === "contain"
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
