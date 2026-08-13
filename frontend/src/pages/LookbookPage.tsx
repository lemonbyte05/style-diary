import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/api";
import type { Look } from "@/types";
import { monthEn } from "@/utils";
import { FolioText } from "@/components/ui/FolioText";
import { LookEntry } from "@/components/ui/LookEntry";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export default function LookbookPage() {
  const [looks, setLooks] = useState<Look[]>([]);
  const [managing, setManaging] = useState(false);

  const load = () => {
    api.looks().then((r) => setLooks(r.looks)).catch(() => setLooks([]));
  };
  useEffect(load, []);

  const remove = async (id: number) => {
    try {
      await api.lookDelete(id);
      setLooks((ls) => ls.filter((l) => l.id !== id));
    } catch {
      /* 保持原状 */
    }
  };

  const groups = useMemo(() => {
    const map = new Map<string, Look[]>();
    for (const o of looks) {
      const key = o.created_at.slice(0, 7);
      map.set(key, [...(map.get(key) ?? []), o]);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [looks]);

  return (
    <div className="mx-auto max-w-md px-7 pb-40 pt-9">
      <motion.header
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <div className="flex items-baseline justify-between">
          <FolioText>✦ PERSONAL FASHION ARCHIVE</FolioText>
          <button
            onClick={() => setManaging((m) => !m)}
            className={`text-folio transition-colors ${managing ? "text-rose-deep" : "text-ink-faint hover:text-ink"}`}
          >
            {managing ? "完成" : "整理"}
          </button>
        </div>
        <h1 className="mt-4 font-serif text-display leading-[1.02] text-ink">LOOKBOOK</h1>
        <p className="mt-2 font-serif text-caption text-ink-soft">我的搭配</p>
        <p className="mt-4 text-folio text-ink-faint">{looks.length} LOOKS</p>
        <p className="mt-2 font-hand text-sm text-ink-soft">都是你自己搭出来的。</p>
      </motion.header>

      <div className="editorial-rule mt-7 w-full" />

      {groups.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-center">
          <span className="font-serif text-3xl text-ink-faint/40">—</span>
          <p className="mt-4 font-hand text-lg text-ink-soft">搭配册还是空白的。</p>
          <FolioText className="mt-2">TAP + TO START A LOOK</FolioText>
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
                <LookEntry key={o.id} look={o} manage={managing} onDelete={() => remove(o.id)} />
              ))}
            </section>
          );
        })
      )}
    </div>
  );
}
