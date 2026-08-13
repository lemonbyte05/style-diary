import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Sparkles, PenLine } from "lucide-react";
import { api } from "@/api";
import type { Item } from "@/types";
import { TornDivider } from "@/components/ui/TornDivider";
import { FolioText } from "@/components/ui/FolioText";
import { KeywordChip } from "@/components/ui/KeywordChip";
import { SpecimenImage } from "@/components/ui/SpecimenImage";
import { StampSeal } from "@/components/ui/StampSeal";

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const [stamped, setStamped] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.item(id!).then((res) => setItem(res.item));
  }, [id]);

  if (!item) return <DetailSkeleton />;

  const [year, month] = item.created_at.split("-").slice(0, 2);
  const fullName = `${year}年${Number(month)}月`;

  return (
    <div className="mx-auto max-w-md px-6 pb-32 pt-6">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-5 flex items-center justify-between"
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-folio text-ink-faint transition-colors hover:text-ink"
        >
          <ArrowLeft size={15} strokeWidth={1.6} /> 收藏册
        </button>
        <FolioText>NO.{String(item.id).padStart(2, "0")}</FolioText>
      </motion.header>

      {/* 标本立绘 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative mb-6"
      >
        <SpecimenImage
          colorHex={item.color_hex}
          emoji={item.emoji}
          name={item.name}
          large
          className="aspect-[4/5] w-full rounded-lg"
        />
        <span className="absolute left-3 top-3 rounded-full bg-paper-soft/90 px-3 py-1 text-folio text-ink-soft shadow-1 backdrop-blur-sm">
          {item.category}
        </span>
      </motion.div>

      {/* 藏品卡 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="relative rounded-lg bg-paper-soft p-5 shadow-1"
      >
        <div className="washi-tape" aria-hidden />
        <h1 className="font-serif text-title text-ink">「{item.name}」</h1>
        <div className="mt-1.5 flex items-center justify-between">
          <FolioText>VOL.{String(item.id).padStart(2, "0")} · {fullName}入册</FolioText>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.06, type: "spring", stiffness: 400, damping: 18 }}
                className={i < item.love_level ? "text-rose" : "text-edge"}
              >
                ★
              </motion.span>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {item.tags.map((tag, i) => (
            <KeywordChip key={tag} label={tag} delay={i * 0.04} />
          ))}
        </div>

        <div className="relative mt-4">
          <TornDivider label="它的故事" />
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mt-2 font-hand text-body leading-relaxed text-ink-soft"
          >
            {item.story}
          </motion.p>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-dashed border-edge pt-3">
          <FolioText>搭配过 {item.worn_count ?? 0} 次</FolioText>
          <button className="flex items-center gap-1 text-folio text-rose transition-colors hover:text-rose-deep">
            <Sparkles size={13} strokeWidth={1.6} /> 回顾穿搭
          </button>
        </div>
      </motion.div>

      {/* 底部操作 */}
      <div className="mt-6 flex gap-3">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            setStamped(true);
            setTimeout(() => setStamped(false), 1600);
          }}
          className="relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-full bg-rose py-3 text-body text-paper-soft shadow-2 transition-transform hover:scale-[1.01]"
        >
          <Sparkles size={16} strokeWidth={1.6} /> 加入今日穿搭
          <StampSeal show={stamped} label="已放入" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 rounded-full border border-edge bg-paper-soft px-6 py-3 text-body text-ink-soft shadow-1 transition-colors hover:border-rose hover:text-rose"
        >
          <PenLine size={16} strokeWidth={1.6} /> 编辑
        </motion.button>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-md px-6 pb-32 pt-6">
      <div className="mb-5 h-4 w-20 animate-pulse rounded bg-edge" />
      <div className="mb-6 aspect-[4/5] w-full animate-pulse rounded-lg bg-paper-deep" />
      <div className="h-7 w-2/3 animate-pulse rounded bg-edge/80" />
      <div className="mt-4 h-6 w-1/2 animate-pulse rounded bg-edge" />
    </div>
  );
}
