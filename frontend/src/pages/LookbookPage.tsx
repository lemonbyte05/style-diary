import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { api } from "@/api";
import type { Look, Wear } from "@/types";
import { monthEn, formatDiaryDate, WEATHER_ICON } from "@/utils";
import { FolioText } from "@/components/ui/FolioText";
import { LookEntry } from "@/components/ui/LookEntry";
import { ClothingImage } from "@/components/ui/ClothingImage";
import { haptic } from "@/haptics";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export default function LookbookPage() {
  const navigate = useNavigate();
  const [looks, setLooks] = useState<Look[]>([]);
  const [wears, setWears] = useState<Wear[]>([]);
  const [managing, setManaging] = useState(false);

  const load = () => {
    api.looks().then((r) => setLooks(r.looks)).catch(() => setLooks([]));
    api.wears().then((r) => setWears(r.wears)).catch(() => setWears([]));
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

  const removeWear = async (id: number) => {
    try {
      await api.wearDelete(id);
      setWears((ws) => ws.filter((w) => w.id !== id));
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
          <FolioText>MY LOOKS · 我创造的</FolioText>
          <div className="flex items-baseline gap-4">
            <button
              onClick={() => navigate("/combine")}
              className="text-folio tracking-[0.14em] text-rose-deep transition-colors hover:text-ink"
            >
              ＋ 新搭配
            </button>
            <button
              onClick={() => setManaging((m) => !m)}
              className={`text-folio transition-colors ${managing ? "text-rose-deep" : "text-ink-faint hover:text-ink"}`}
            >
              {managing ? "完成" : "整理"}
            </button>
          </div>
        </div>
        <h1 className="mt-4 font-serif text-display leading-[1.02] text-ink">搭配</h1>
        <p className="mt-2 font-serif text-caption text-ink-soft">我搭过的 Look</p>
        <p className="mt-4 text-folio text-ink-faint">{looks.length} LOOKS</p>
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
              {list.map((o, idx) => (
                <motion.div
                  key={o.id}
                  initial={{ opacity: 0, x: -14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.45, delay: Math.min(idx * 0.06, 0.3), ease: EASE }}
                >
                  <LookEntry look={o} manage={managing} onDelete={() => remove(o.id)} />
                </motion.div>
              ))}
            </section>
          );
        })
      )}

      {/* 穿搭日记 */}
      <WearLog wears={wears} manage={managing} onDelete={removeWear} />
    </div>
  );
}

/* ---------- 穿搭日记：Wear Log 时间线 ---------- */
function WearLog({
  wears,
  manage,
  onDelete,
}: {
  wears: Wear[];
  manage: boolean;
  onDelete: (id: number) => void;
}) {
  const sorted = useMemo(
    () => [...wears].sort((a, b) => b.date.localeCompare(a.date)),
    [wears]
  );

  return (
    <section className="pt-14">
      <div className="flex items-baseline justify-between">
        <FolioText>WEAR LOG · 穿搭日记</FolioText>
        <span className="font-hand text-xs text-ink-faint">穿过 {sorted.length} 次</span>
      </div>
      <div className="editorial-rule mt-3 w-full" />

      {sorted.length === 0 ? (
        <p className="py-10 text-center font-hand text-caption text-ink-faint">
          还没有记录。保存搭配时勾选「今天穿了这套」，就会记在这里。
        </p>
      ) : (
        sorted.map((w) => (
          <WearEntry key={w.id} wear={w} manage={manage} onDelete={() => onDelete(w.id)} />
        ))
      )}
    </section>
  );
}

function WearEntry({
  wear,
  manage,
  onDelete,
}: {
  wear: Wear;
  manage: boolean;
  onDelete: () => void;
}) {
  const navigate = useNavigate();
  const icon = WEATHER_ICON[wear.weather] ?? "✦";

  return (
    <div className="border-b border-edge/50 py-5 last:border-0">
      <div className="flex items-baseline justify-between">
        <FolioText>{formatDiaryDate(wear.date)}</FolioText>
        {manage ? (
          <button
            onClick={onDelete}
            className="flex items-center gap-1 text-folio text-terra transition-colors hover:text-ink"
          >
            ✕ 删除
          </button>
        ) : (
          <span className="font-hand text-sm text-ink-soft">{icon}</span>
        )}
      </div>
      <div className="mt-3 flex items-center gap-4">
        <div className="flex shrink-0 items-start">
          {wear.items.slice(0, 3).map((item, i) => (
            <button
              key={item.id}
              onClick={() => {
                haptic.tap();
                navigate(`/item/${item.id}`);
              }}
              className={i === 0 ? "-rotate-2" : i === 1 ? "-ml-5 mt-2 rotate-1" : "-ml-4 mt-5 rotate-3"}
            >
              <div className="bg-paper-soft p-1 shadow-1" style={{ borderRadius: 2 }}>
                <ClothingImage item={item} className="h-14 w-11" />
              </div>
            </button>
          ))}
        </div>
        <div className="min-w-0">
          <p className="font-hand text-caption leading-snug text-ink-soft">
            {wear.note || "今天穿了这一套。"}
          </p>
        </div>
      </div>
    </div>
  );
}
