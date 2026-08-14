import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, ChevronDown } from "lucide-react";
import type { ItemPayload } from "@/api";
import { api } from "@/api";
import { removeBackground } from "@/imageProcess";
import { CATEGORIES, SEASONS } from "@/types";
import { FolioText } from "@/components/ui/FolioText";
import { ClothingImage } from "@/components/ui/ClothingImage";
import { StampSeal } from "@/components/ui/StampSeal";
import { haptic } from "@/haptics";

const SWATCHES = ["#F3E9F2", "#F1E3C8", "#DDD0E8", "#CFDCE8", "#F2CFC0", "#E8D9C4", "#C9D4DE", "#CBD6C4", "#E5DCCB", "#F4EDE0"];

export function ItemForm({
  initial,
  onSubmit,
  submitLabel = "SAVE TO ARCHIVE",
}: {
  initial?: ItemPayload & { image_url?: string | null };
  onSubmit: (payload: ItemPayload) => Promise<void>;
  submitLabel?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? "上衣");
  const [color, setColor] = useState(initial?.color_hex ?? SWATCHES[0]);
  const [season, setSeason] = useState(initial?.season ?? "");
  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [material, setMaterial] = useState(initial?.material ?? "");
  const [purchasedAt, setPurchasedAt] = useState(initial?.purchased_at ?? "");
  const [price, setPrice] = useState(initial?.price ?? "");
  const [tags, setTags] = useState(initial?.tags.join(", ") ?? "");
  const [story, setStory] = useState(initial?.story ?? "");
  const [love, setLove] = useState(initial?.love_level ?? 3);
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.image_url ?? null);
  const [imageType, setImageType] = useState<"cutout" | "photo">(initial?.image_type ?? "photo");
  const [moreOpen, setMoreOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const pickImage = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const { url, image_type } = await api.itemUpload(file);
      const processed = await removeBackground(url, image_type);
      setImageUrl(processed.url);
      setImageType(processed.image_type);
    } catch {
      /* 忽略上传失败 */
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (saving || uploading) return;
    haptic.stamp();
    setSaving(true);
    try {
      await onSubmit({
        name: name.trim() || "未命名单品",
        category,
        color_hex: color,
        season,
        brand,
        material,
        purchased_at: purchasedAt,
        price,
        tags: tags.split(/[,，\s]+/).map((t) => t.trim()).filter(Boolean),
        story: story.trim(),
        love_level: love,
        image_url: imageUrl,
        image_type: imageType,
      });
    } catch {
      setSaving(false);
    }
  };

  return (
    <>
      {/* 第一步：图片（视觉焦点，无图时为大上传区） */}
      <section className="pt-7">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => pickImage(e.target.files?.[0])}
        />
        {imageUrl ? (
          <button
            onClick={() => fileRef.current?.click()}
            className="relative block w-full overflow-hidden bg-paper-soft shadow-plate transition-opacity hover:opacity-95"
            style={{ borderRadius: 3, aspectRatio: "4/5" }}
          >
            <ClothingImage
              item={{ name: name || "新收藏", category, color_hex: color, image_url: imageUrl, image_type: imageType }}
              className="h-full w-full"
            />
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 border border-ink/70 bg-paper/80 px-3 py-1 text-folio tracking-[0.18em] text-ink backdrop-blur-sm">
              {uploading ? "处理中…" : "更换照片"}
            </span>
          </button>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2.5 border-2 border-dashed border-edge/80 bg-paper-soft/50 transition-colors hover:border-rose"
            style={{ borderRadius: 4, aspectRatio: "4/5" }}
          >
            <Camera size={30} strokeWidth={1.1} className="text-ink-faint" />
            <span className="font-serif text-h2 text-ink">
              {uploading ? "上传中…" : "拍下或选择一件衣服"}
            </span>
            <span className="font-hand text-caption text-ink-faint">平铺或悬挂拍摄，尽量完整拍到衣服。</span>
          </button>
        )}
      </section>

      {/* 第二步：名称（可留空，自动命名） */}
      <section className="pt-7">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="给它起个名字（可留空，自动命名）"
          className="w-full border-b border-edge bg-transparent pb-2 font-serif text-title text-ink outline-none placeholder:text-ink-faint/50"
        />
      </section>

      {/* 第三步：类别（快速选择） */}
      <section className="pt-6">
        <FolioText>类别</FolioText>
        <div className="mt-3 flex flex-wrap items-center">
          {CATEGORIES.map((c, i) => (
            <button key={c} onClick={() => setCategory(c)} className="flex items-center">
              {i > 0 && <span className="mx-2 text-edge">·</span>}
              <span
                className={`text-caption transition-colors ${
                  category === c ? "border-b border-ink text-ink" : "text-ink-faint hover:text-ink-soft"
                }`}
              >
                {c}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 更多信息（默认折叠） */}
      <section className="pt-7">
        <button
          onClick={() => {
            haptic.tap();
            setMoreOpen((v) => !v);
          }}
          className="flex w-full items-baseline gap-3"
        >
          <FolioText>更多信息</FolioText>
          <span className="h-px flex-1 bg-edge/60" />
          <ChevronDown
            size={14}
            strokeWidth={1.4}
            className={`text-ink-faint transition-transform ${moreOpen ? "rotate-180" : ""}`}
          />
        </button>
        {moreOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="pt-5"
          >
            {/* 主色 */}
            <div className="flex flex-wrap gap-2.5">
              {SWATCHES.map((s) => (
                <button
                  key={s}
                  onClick={() => setColor(s)}
                  aria-label={s}
                  className="h-7 w-7 rounded-full transition-transform"
                  style={{
                    background: s,
                    outline: color === s ? "2px solid rgb(var(--c-rose-deep))" : "1px solid rgb(var(--c-edge))",
                    transform: color === s ? "scale(1.15)" : undefined,
                  }}
                />
              ))}
            </div>

            {/* 季节 */}
            <div className="mt-6 flex flex-wrap items-center">
              <FolioText>季节</FolioText>
              <span className="mx-2 text-edge">·</span>
              {SEASONS.map((s, i) => (
                <button key={s} onClick={() => setSeason(s)} className="flex items-center">
                  {i > 0 && <span className="mx-2 text-edge">·</span>}
                  <span
                    className={`text-caption transition-colors ${
                      season === s ? "border-b border-ink text-ink" : "text-ink-faint hover:text-ink-soft"
                    }`}
                  >
                    {s}
                  </span>
                </button>
              ))}
            </div>

            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="品牌（可选）"
              className="mt-6 w-full border-b border-edge bg-transparent pb-2 font-hand text-caption text-ink-soft outline-none placeholder:text-ink-faint/50"
            />
            <input
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              placeholder="材质（可选）"
              className="mt-5 w-full border-b border-edge bg-transparent pb-2 font-hand text-caption text-ink-soft outline-none placeholder:text-ink-faint/50"
            />
            <input
              value={purchasedAt}
              onChange={(e) => setPurchasedAt(e.target.value)}
              placeholder="购买时间（可选，例如 2025 年秋）"
              className="mt-5 w-full border-b border-edge bg-transparent pb-2 font-hand text-caption text-ink-soft outline-none placeholder:text-ink-faint/50"
            />
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="价格（可选，例如 299）"
              inputMode="decimal"
              className="mt-5 w-full border-b border-edge bg-transparent pb-2 font-hand text-caption text-ink-soft outline-none placeholder:text-ink-faint/50"
            />
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="标签，用逗号分隔：甜系, 约会, 白色"
              className="mt-5 w-full border-b border-edge bg-transparent pb-2 font-hand text-caption text-ink-soft outline-none placeholder:text-ink-faint/50"
            />
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="写一句关于它的故事（可选）"
              rows={2}
              className="mt-5 w-full resize-none border-b border-edge bg-transparent pb-2 font-hand text-caption text-ink-soft outline-none placeholder:text-ink-faint/50"
            />

            {/* 喜欢程度 */}
            <div className="mt-6 flex items-center gap-3">
              <FolioText>喜欢程度</FolioText>
              <div className="flex gap-1.5 text-lg">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setLove(i + 1)}
                    className={`transition-colors ${i < love ? "text-rose" : "text-edge"}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </section>

      {/* 保存 */}
      <div className="mt-9">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={save}
          disabled={saving || uploading}
          className="relative w-full"
        >
          <span className="border-b border-ink pb-1 text-folio tracking-[0.22em] text-ink transition-colors hover:text-rose-deep">
            {saving ? "保存中…" : submitLabel}
          </span>
          <StampSeal show={saving} label="已入册" />
        </motion.button>
      </div>
    </>
  );
}
