import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api } from "@/api";
import type { Item } from "@/types";
import { formatInkDate } from "@/utils";
import { haptic } from "@/haptics";
import { FolioText } from "@/components/ui/FolioText";
import { ClothingImage } from "@/components/ui/ClothingImage";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.item(id!).then((res) => setItem(res.item));
  }, [id]);

  if (!item) return <DetailSkeleton />;

  const fullName = `${item.created_at.split("-").slice(0, 2).join("年")}月`;
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
        <FolioText>NO.{String(item.id).padStart(2, "0")}</FolioText>
      </motion.header>

      {/* 服装版画：主角，无框悬浮 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="relative mx-auto mt-4 w-[82%] -rotate-1"
      >
        <div className="washi-tape" aria-hidden />
        <div className="bg-paper-soft px-5 pb-6 pt-5 shadow-plate" style={{ borderRadius: 2 }}>
          <ClothingImage item={item} interactive className="aspect-[3/4] w-full" />
        </div>
        {/* 手写编号 */}
        <span className="absolute -left-6 top-6 font-hand text-2xl text-ink-faint/70">
          {String(item.id).padStart(2, "0")}
        </span>
        {/* 竖排卷标 */}
        <span
          className="absolute -right-5 top-0 text-folio tracking-[0.3em] text-ink/30"
          style={{ writingMode: "vertical-rl" }}
        >
          ARCHIVE · {inkDate.year}
        </span>
        {/* 日期印章 */}
        <span className="absolute bottom-16 -right-6 -rotate-6 text-folio text-rose-deep/80">
          {inkDate.month}入册
        </span>
      </motion.div>

      {/* 文字层 */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
        className="relative mt-10"
      >
        <h1 className="font-serif text-title leading-tight text-ink">{item.name}</h1>
        <div className="mt-2 flex items-baseline justify-between">
          <FolioText>
            VOL.{String(item.id).padStart(2, "0")} · {fullName}入册
          </FolioText>
          <div className="flex gap-1 text-[11px]">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className={i < item.love_level ? "text-rose" : "text-edge"}
              >
                ★
              </motion.span>
            ))}
          </div>
        </div>

        {/* 标签：细线文字 */}
        <p className="mt-5 text-caption leading-relaxed text-ink-soft">
          {item.tags.join(" · ")}
        </p>

        <div className="my-7 flex items-center gap-3">
          <FolioText>它的故事</FolioText>
          <span className="h-px flex-1 bg-edge/70" />
        </div>

        <p className="drop-cap max-w-[92%] text-body leading-relaxed text-ink-soft">
          {item.story}
        </p>
        <p className="mt-3 text-right font-hand text-caption text-rose-deep/70">
          —— 今天又想起穿它的那天
        </p>

        <div className="mt-8 flex items-baseline justify-between border-t border-edge/60 pt-4">
          <FolioText>搭配过 {item.worn_count ?? 0} 次</FolioText>
          <FolioText>REVIEW</FolioText>
        </div>
      </motion.div>

      {/* 操作：编辑式按钮 */}
      <div className="mt-8 flex items-center gap-4">
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
        <button className="text-folio tracking-[0.22em] text-ink-faint transition-colors hover:text-ink">
          编辑
        </button>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-md px-7 pb-40 pt-6">
      <div className="mb-5 h-4 w-20 animate-pulse bg-edge/60" />
      <div className="mx-auto mt-4 aspect-[4/5] w-[82%] animate-pulse bg-paper-deep" />
      <div className="mt-10 h-8 w-2/3 animate-pulse bg-edge/60" />
      <div className="mt-6 h-5 w-1/2 animate-pulse bg-edge/50" />
      <div className="mt-10 h-4 w-full animate-pulse bg-edge/50" />
    </div>
  );
}
