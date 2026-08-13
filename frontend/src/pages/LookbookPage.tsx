import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/api";
import type { OutfitItem } from "@/types";
import { monthEn } from "@/utils";
import { FolioText } from "@/components/ui/FolioText";
import { LookEntry } from "@/components/ui/LookEntry";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export default function LookbookPage() {
  const [outfits, setOutfits] = useState<OutfitItem[]>([]);

  useEffect(() => {
    api.outfits().then((r) => setOutfits(r.outfits)).catch(() => setOutfits([]));
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, OutfitItem[]>();
    for (const o of outfits) {
      const key = o.date.slice(0, 7);
      map.set(key, [...(map.get(key) ?? []), o]);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [outfits]);

  return (
    <div className="mx-auto max-w-md px-7 pb-40 pt-9">
      <motion.header
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <div className="flex items-baseline justify-between">
          <FolioText>✦ PERSONAL FASHION ARCHIVE</FolioText>
          <FolioText>VOL.02</FolioText>
        </div>
        <h1 className="mt-4 font-serif text-display leading-[1.02] text-ink">LOOKBOOK</h1>
        <p className="mt-2 font-serif text-caption text-ink-soft">我的穿搭册</p>
        <p className="mt-4 text-folio text-ink-faint">{outfits.length} LOOKS · 2026</p>
        <p className="mt-2 font-hand text-sm text-ink-soft">每一页，都是一天的心情。</p>
      </motion.header>

      <div className="editorial-rule mt-7 w-full" />

      {groups.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-center">
          <span className="font-serif text-3xl text-ink-faint/40">—</span>
          <p className="mt-4 font-hand text-lg text-ink-soft">穿搭册还是空白的。</p>
          <FolioText className="mt-2">START YOUR FIRST LOOK</FolioText>
        </div>
      ) : (
        groups.map(([ym, list]) => {
          const m = monthEn(ym);
          return (
            <section key={ym}>
              <div className="flex items-baseline gap-3 pb-1 pt-9 first:pt-4">
                <span className="font-serif text-h2 text-ink">{m.name}</span>
                <FolioText>{m.year}</FolioText>
                <span className="h-px flex-1 bg-edge/60" />
                <FolioText>{list.length} LOOKS</FolioText>
              </div>
              {list.map((o) => (
                <LookEntry key={o.id} outfit={o} />
              ))}
            </section>
          );
        })
      )}
    </div>
  );
}
