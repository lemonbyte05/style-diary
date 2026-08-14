import type { Item } from "@/types";

/**
 * 图片处理层：为未来自动抠图预留的入口。
 *
 * 当前阶段保持原图直传（upload → 展示），不阻塞录入流程。
 * 未来接入抠图能力时，只需在这里实现：
 *   removeBackground(url) → 返回去背景后的透明 PNG 地址 + image_type="cutout"
 * 调用方（ItemForm）无需改动。
 */
export interface ProcessedImage {
  url: string;
  image_type: "cutout" | "photo";
}

/** 去掉背景 → 透明 PNG。当前为 no-op 占位，原样返回。 */
export async function removeBackground(
  imageUrl: string,
  image_type: Item["image_type"]
): Promise<ProcessedImage> {
  return { url: imageUrl, image_type: image_type ?? "photo" };
}
