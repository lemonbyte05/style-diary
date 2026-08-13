import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload } from "lucide-react";
import { api } from "@/api";
import { FolioText } from "@/components/ui/FolioText";
import { ClothingImage } from "@/components/ui/ClothingImage";
import { StampSeal } from "@/components/ui/StampSeal";
import { LeafSpray } from "@/components/ui/LeafSpray";
import { haptic } from "@/haptics";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

const CATEGORIES = ["上衣", "裙装", "外套", "配饰"];
const SWATCHES = ["#F3E9F2", "#F1E3C8", "#DDD0E8", "#CFDCE8", "#F2CFC0", "#E8D9C4", "#C9D4DE", "#CBD6C4", "#E5DCCB", "#F4EDE0"];

export default function AddItemPage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("上衣");
  const [color, setColor] = useState(SWATCHES[0]);
  const [tags, setTags] = useState("");
  const [story, setStory] = useState("");
  const [love, setLove] = useState(3);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const pickImage = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await api.itemUpload(file);
      setImageUrl(url);
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
      const { item } = await api.itemCreate({
        name: name.trim(),
        category,
        color_hex: color,
        tags: tags.split(/[,，\s]+/).map((t) => t.trim()).filter(Boolean),
        story: story.trim(),
        love_level: love,
        image_url: imageUrl,
      });
      navigate(`/item/${item.id}`);
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="relative mx-auto max-w-md px-7 pb-40 pt-6">
      <LeafSpray className="pointer-events-none absolute right-2 top-2 h-10 w-20 text-ink-faint/30" />

      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-2 flex items-baseline justify-between"
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-folio text-ink-faint transition-colors hover:text-ink"
        >
          <ArrowLeft size={14} strokeWidth={1.2} /> 返回
        </button>
        <FolioText>VOL.NEW</FolioText>
      </motion.header>

      <h1 className="mt-4 font-serif text-display leading-[1.02] text-ink">入册</h1>
      <p className="mt-2 font-serif text-caption text-ink-soft">把一件新衣服，收进你的收藏册</p>

      <div className="editorial-rule mt-6 w-full" />

      {/* 图片 */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.05, ease: EASE }}
        className="pt-7"
      >
        <div className="relative mx-auto w-[70%]">
          <div className="bg-paper-soft px-4 pb-4 pt-4 shadow-plate" style={{ borderRadius: 2 }}>
            <ClothingImage
              item={{ name: name || "新收藏", category, color_hex: color, image_url: imageUrl }}
              className="aspect-[3/4] w-full"
            />
          </div>
          {imageUrl && (
            <span className="absolute -left-5 top-5 -rotate-6 text-folio text-rose-deep/75">新入册</span>
          )}
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
            {uploading ? "上传中…" : "选择服装图"}
          </button>
          <p className="mt-2 text-folio text-ink-faint">去背景透明 PNG 最佳 · 不选则用版画占位</p>
        </div>
      </motion.section>

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
      <div className="mt-9 flex items-center justify-between">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={save}
          disabled={!name.trim()}
          className="relative"
        >
          <span className={`border-b pb-1 text-folio tracking-[0.22em] transition-colors ${
            name.trim() ? "border-ink text-ink hover:text-rose-deep" : "border-edge text-ink-faint"
          }`}>
            SAVE TO ARCHIVE
          </span>
          <StampSeal show={saving} label="已入册" />
        </motion.button>
        <span className="font-hand text-xs text-ink-faint">入册后，就能拿去搭配了</span>
      </div>
    </div>
  );
}
