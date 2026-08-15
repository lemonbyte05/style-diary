import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api } from "@/api";
import type { Item } from "@/types";
import { formatDiaryDate, formatInkDate } from "@/utils";
import { haptic } from "@/haptics";
import { FolioText } from "@/components/ui/FolioText";
import { ClothingImage } from "@/components/ui/ClothingImage";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

const pad = (n: number) => String(n).padStart(2, "0");

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.item(id!).then((res) => setItem(res.item));
  }, [id]);

  if (!item) return <DetailSkeleton />;

  const inkDate = formatInkDate(item.created_at);

  return (
    <div className="relative mx-auto max-w-md px-7 pb-40 pt-6">
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
          <ArrowLeft size={14} strokeWidth={1.2} /> 收藏册
        </button>
        <FolioText>GARMENT NO.{pad(item.id)}</FolioText>
      </motion.header>

      {/* 服装图：主角，无框悬浮 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="relative mx-auto mt-4 w-[84%]"
      >
        <div className="relative -rotate-1">
          <div className="washi-tape" aria-hidden />
          <div className="bg-paper-soft px-5 pb-6 pt-5 shadow-plate" style={{ borderRadius: 2 }}>
            <ClothingImage item={item} interactive className="aspect-[3/4] w-full" />
          </div>
        </div>
        {/* 手写编号 */}
        <span className="absolute -left-6 top-6 font-hand text-2xl text-ink-faint/70">{pad(item.id)}</span>
        {/* 竖排卷标 */}
        <span
          className="absolute -right-5 top-0 text-folio tracking-[0.3em] text-ink/30"
          style={{ writingMode: "vertical-rl" }}
        >
          ARCHIVE · {inkDate.year}
        </span>
      </motion.div>

      {/* 文字层 */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
        className="relative mt-10"
      >
        {item.name && (
          <h1 className="font-serif text-title leading-tight text-ink">{item.name}</h1>
        )}
        <FolioText className={item.name ? "mt-1.5" : ""}>GARMENT NO.{pad(item.id)}</FolioText>

        {/* 档案信息：只显示有值的字段 */}
        <div className="mt-6 border-t border-edge/60">
          <InfoRow label="CATEGORY">
            <span className="text-caption font-serif text-ink-soft">{item.category}</span>
          </InfoRow>
          <InfoRow label="COLOR">
            <span className="flex items-center gap-2 text-caption text-ink-soft">
              <span
                className="h-3.5 w-3.5 rounded-full"
                style={{ background: item.color_hex, outline: "1px solid rgb(var(--c-edge))" }}
              />
              {item.color_hex}
            </span>
          </InfoRow>
          {item.season && <InfoRow label="SEASON" value={item.season} />}
          {item.brand && <InfoRow label="BRAND" value={item.brand} />}
          {item.material && <InfoRow label="MATERIAL" value={item.material} />}
          {item.purchased_at && <InfoRow label="PURCHASED" value={item.purchased_at} />}
          {item.price && <InfoRow label="PRICE" value={`¥ ${item.price}`} />}
          <InfoRow label="ADDED" value={formatDiaryDate(item.created_at)} />
        </div>

        {item.story && (
          <>
            <div className="my-7 flex items-center gap-3">
              <FolioText>它的故事</FolioText>
              <span className="h-px flex-1 bg-edge/70" />
            </div>
            <p className="drop-cap max-w-[92%] text-body leading-relaxed text-ink-soft">{item.story}</p>
          </>
        )}
      </motion.div>

      {/* 轻量操作 */}
      <div className="mt-9 flex items-center gap-4">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            haptic.tap();
            navigate("/combine", { state: { selectedIds: [item.id] } });
          }}
          className="relative flex-1 border-b border-ink pb-1.5 text-center text-folio tracking-[0.22em] text-ink transition-colors hover:text-rose-deep"
        >
          加入搭配
        </motion.button>
        <span className="text-edge">/</span>
        <button
          onClick={() => navigate(`/edit/${item.id}`)}
          className="text-folio tracking-[0.22em] text-ink-faint transition-colors hover:text-ink"
        >
          编辑 · EDIT
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value, children }: { label: string; value?: string; children?: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between border-b border-edge/40 py-3 last:border-0">
      <FolioText>{label}</FolioText>
      {children ?? <span className="text-caption font-serif text-ink-soft">{value}</span>}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-md px-7 pb-40 pt-6">
      <div className="mb-5 h-4 w-20 animate-pulse bg-edge/60" />
      <div className="mx-auto mt-4 aspect-[4/5] w-[84%] animate-pulse bg-paper-deep" />
      <div className="mt-10 h-8 w-2/3 animate-pulse bg-edge/60" />
      <div className="mt-6 h-4 w-full animate-pulse bg-edge/50" />
    </div>
  );
}
