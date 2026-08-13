import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { api } from "@/api";
import type { GrowthData } from "@/types";
import { monthEn } from "@/utils";
import { FolioText } from "@/components/ui/FolioText";
import { TornDivider } from "@/components/ui/TornDivider";
import { ArchivePlate } from "@/components/ui/ArchivePlate";
import { LookEntry } from "@/components/ui/LookEntry";
import { LeafSpray } from "@/components/ui/LeafSpray";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export default function MePage() {
  const [g, setG] = useState<GrowthData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.growth().then(setG).catch(() => setG(null));
  }, []);

  if (!g) return <MeSkeleton />;

  const years = Math.floor(g.age_days / 365);
  const months = Math.round((g.age_days % 365) / 30);

  return (
    <div className="relative mx-auto max-w-md px-7 pb-40 pt-9">
      <LeafSpray className="pointer-events-none absolute right-2 top-2 h-10 w-20 text-ink-faint/30" />

      <motion.header
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <div className="flex items-baseline justify-between">
          <FolioText>✦ PERSONAL FASHION ARCHIVE</FolioText>
          <FolioText>VOL.03</FolioText>
        </div>
        <h1 className="mt-4 font-serif text-display leading-[1.02] text-ink">MY ARCHIVE</h1>
        <p className="mt-2 font-serif text-caption text-ink-soft">成长档案</p>
      </motion.header>

      {/* 概览：杂志小结 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
        className="pt-8"
      >
        <p className="font-serif text-title leading-snug text-ink">
          收藏 {g.total_items} 件 · 穿搭 {g.worn_total} 次
        </p>
        <p className="mt-2 text-folio text-ink-faint">
          这本册子已陪伴你 {years > 0 ? `${years} 年 ${months} 个月` : `${months} 个月`}
        </p>
        <p className="mt-4 font-hand text-caption text-ink-soft">衣橱在长大，我也是。</p>
      </motion.div>

      {/* 本季最常穿 */}
      <section className="pt-10">
        <TornDivider label="本季最常穿" note="被想起最多次的几件" />
        <div className="mt-4 grid grid-cols-2 gap-5">
          {g.most_worn.slice(0, 4).map((item, i) => (
            <div key={item.id} className={i % 2 === 1 ? "mt-8" : ""}>
              <ArchivePlate item={item} index={i} rotate={i % 2 === 0 ? -1.6 : 1.3} tall={i % 2 === 0} tape={i === 0} onOpen={(id) => navigate(`/item/${id}`)} />
              <p className="mt-2 text-center text-folio text-ink-faint">穿 {item.worn ?? 0} 次</p>
            </div>
          ))}
        </div>
      </section>

      {/* 风格关键词 */}
      <section className="pt-8">
        <TornDivider label="风格关键词" />
        <p className="mt-4 font-serif text-h2 leading-relaxed text-ink">
          {g.style_keywords.map((k, i) => (
            <span key={k.label}>
              {i > 0 && <span className="mx-2 text-ink-faint/40">·</span>}
              {k.label}
              <span className="text-caption text-ink-faint"> ×{k.count}</span>
            </span>
          ))}
        </p>
      </section>

      {/* 月份记 */}
      <section className="pt-8">
        <TornDivider label="月份记" note="穿搭落在一年的哪些角落" />
        <div className="mt-5 flex flex-wrap items-end gap-x-5 gap-y-3">
          {g.monthly.map((m) => {
            const me = monthEn(m.month);
            const size = 7 + Math.min(m.count, 4) * 2;
            return (
              <div key={m.month} className="flex flex-col items-center gap-1.5">
                <span
                  className="rounded-full bg-rose-deep/60"
                  style={{ width: size, height: size, opacity: 0.4 + Math.min(m.count, 4) * 0.12 }}
                />
                <FolioText>{me.short}</FolioText>
              </div>
            );
          })}
        </div>
      </section>

      {/* 年度最爱的穿搭 */}
      <section className="pt-8">
        <TornDivider label="最爱的穿搭" note="舍不得忘掉的几页" />
        <div className="mt-2">
          {g.favorites.map((o) => (
            <LookEntry key={o.id} outfit={o} />
          ))}
        </div>
      </section>
    </div>
  );
}

function MeSkeleton() {
  return (
    <div className="mx-auto max-w-md px-7 pb-40 pt-9">
      <div className="h-3 w-44 animate-pulse bg-edge/60" />
      <div className="mt-5 h-12 w-2/3 animate-pulse bg-edge/60" />
      <div className="mt-8 h-16 animate-pulse bg-edge/50" />
      <div className="mt-6 h-40 animate-pulse bg-paper-deep" />
    </div>
  );
}
