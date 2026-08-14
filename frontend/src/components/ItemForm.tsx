import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import type { ItemPayload } from "@/api";
import { api } from "@/api";
import { FolioText } from "@/components/ui/FolioText";
import { ClothingImage } from "@/components/ui/ClothingImage";
import { StampSeal } from "@/components/ui/StampSeal";
import { haptic } from "@/haptics";

const CATEGORIES = ["上衣", "裙装", "外套", "配饰"];
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
  const [tags, setTags] = useState(initial?.tags.join(", ") ?? "");
  const [story, setStory] = useState(initial?.story ?? "");
  const [love, setLove] = useState(initial?.love_level ?? 3);
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.image_url ?? null);
  const [imageType, setImageType] = useState<"cutout" | "photo">(initial?.image_type ?? "photo");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const pickImage = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const { url, image_type } = await api.itemUpload(file);
      setImageUrl(url);
      setImageType(image_type);
    } catch {
      /* 忽略上传失败 */
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (saving || !name.trim()) return;
    haptic.stamp();
    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        category,
        color_hex: color,
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
      {/* 图片 */}
      <section className="pt-7">
        <div className="relative mx-auto w-[76%]">
          <div className="bg-paper-soft px-4 pb-4 pt-4 shadow-plate" style={{ borderRadius: 2 }}>
            <ClothingImage
              item={{ name: name || "新收藏", category, color_hex: color, image_url: imageUrl, image_type: imageType }}
              className="aspect-[3/4] w-full"
            />
          </div>
        </div>
        <div className="mt-4 text-center">
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => pickImage(e.target.files?.[0])}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 border-b border-ink pb-0.5 text-folio tracking-[0.18em] text-ink transition-colors hover:text-rose-deep"
          >
            <Upload size={13} strokeWidth={1.2} />
            {uploading ? "上传中…" : "更换服装图"}
          </button>
          <p className="mt-2 text-folio text-ink-faint">去背景透明 PNG 最佳 · 不选则用版画占位</p>
        </div>
      </section>

      {/* 品类 */}
      <section className="pt-8">
        <FolioText>品类</FolioText>
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

      {/* 颜色 */}
      <section className="pt-7">
        <FolioText>颜色</FolioText>
        <div className="mt-3 flex flex-wrap gap-2.5">
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
      </section>

      {/* 名称 / 标签 / 故事 */}
      <section className="pt-8">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="给它起个名字，例如：白色蕾丝初恋裙"
          className="w-full border-b border-edge bg-transparent pb-2 font-serif text-title text-ink outline-none placeholder:text-ink-faint/50"
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
          placeholder="写一句关于它的故事（可留空）"
          rows={2}
          className="mt-5 w-full resize-none border-b border-edge bg-transparent pb-2 font-hand text-caption text-ink-soft outline-none placeholder:text-ink-faint/50"
        />
      </section>

      {/* 喜欢程度 */}
      <section className="pt-7">
        <FolioText>喜欢程度</FolioText>
        <div className="mt-3 flex gap-1.5 text-lg">
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
      </section>

      {/* 保存 */}
      <div className="mt-9">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={save}
          disabled={!name.trim() || saving}
          className="relative"
        >
          <span className={`border-b pb-1 text-folio tracking-[0.22em] transition-colors ${
            name.trim() ? "border-ink text-ink hover:text-rose-deep" : "border-edge text-ink-faint"
          }`}>
            {saving ? "保存中…" : submitLabel}
          </span>
          <StampSeal show={saving} label="已保存" />
        </motion.button>
      </div>
    </>
  );
}
