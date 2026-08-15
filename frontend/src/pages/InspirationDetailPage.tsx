import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api } from "@/api";
import { INSPIRATION_TAGS, type Inspiration } from "@/types";
import { formatDiaryDate } from "@/utils";
import { haptic } from "@/haptics";
import { FolioText } from "@/components/ui/FolioText";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export default function InspirationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [insp, setInsp] = useState<Inspiration | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [savingTags, setSavingTags] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    api.inspirations().then((r) => {
      const found = r.inspirations.find((x) => x.id === Number(id));
      setInsp(found ?? null);
      setTags(found?.tags ?? []);
    });
  }, [id]);

  const toggleTag = async (t: string) => {
    if (!insp || savingTags) return;
    haptic.tap();
    const next = tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t];
    setTags(next);
    setSavingTags(true);
    try {
      const r = await api.inspirationUpdate(insp.id, { tags: next });
      setTags(r.inspiration.tags);
    } catch {
      /* 保持原状 */
    } finally {
      setSavingTags(false);
    }
  };

  const remove = async () => {
    if (!insp) return;
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 4000);
      return;
    }
    haptic.stamp();
    await api.inspirationDelete(insp.id);
    navigate("/inspiration");
  };

  if (!insp) {
    return (
      <div className="mx-auto max-w-md px-7 pb-40 pt-6">
        <div className="h-4 w-20 animate-pulse bg-edge/60" />
        <div className="mt-5 aspect-[4/5] w-full animate-pulse bg-paper-deep" />
      </div>
    );
  }

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
          <ArrowLeft size={14} strokeWidth={1.2} /> 灵感集
        </button>
        <FolioText>NO.{String(insp.id).padStart(2, "0")}</FolioText>
      </motion.header>

      {/* 大图 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="mt-3"
      >
        <img
          src={insp.image_url}
          alt="inspiration"
          className="w-full border border-edge/40 bg-paper-soft shadow-plate"
          style={{ borderRadius: 3 }}
        />
      </motion.div>

      {/* 标签（快速选择，可选） */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
        className="pt-7"
      >
        <div className="flex items-baseline justify-between">
          <FolioText>TAGS</FolioText>
          <span className="font-hand text-xs text-ink-faint">{savingTags ? "保存中…" : "选 1～3 个"}</span>
        </div>
        <div className="mt-3 flex flex-wrap items-center">
          {INSPIRATION_TAGS.map((t, i) => {
            const on = tags.includes(t);
            return (
              <button key={t} onClick={() => toggleTag(t)} className="flex items-center">
                {i > 0 && <span className="mx-2 text-edge">·</span>}
                <span
                  className={`text-caption transition-colors ${
                    on ? "border-b border-rose-deep text-rose-deep" : "text-ink-faint hover:text-ink-soft"
                  }`}
                >
                  {t}
                </span>
              </button>
            );
          })}
        </div>
      </motion.section>

      {/* 日期 */}
      <p className="mt-6 font-hand text-caption text-ink-faint">
        SAVED ON {formatDiaryDate(insp.created_at)}
      </p>

      {/* 操作 */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
        className="mt-10 border-t border-edge/60 pt-6"
      >
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            haptic.stamp();
            navigate("/combine", { state: { inspirationId: insp.id, referenceUrl: insp.image_url } });
          }}
          className="w-full border border-ink bg-paper-soft py-3.5 text-center text-folio tracking-[0.2em] text-ink transition-colors hover:text-rose-deep"
          style={{ borderRadius: 3 }}
        >
          用我的衣橱试试 →
        </motion.button>
        <button
          onClick={remove}
          className={`mt-6 text-folio tracking-[0.18em] transition-colors ${
            confirming ? "text-terra" : "text-ink-faint hover:text-terra"
          }`}
        >
          {confirming ? "再次点击确认删除" : "删除这张灵感"}
        </button>
      </motion.div>
    </div>
  );
}
