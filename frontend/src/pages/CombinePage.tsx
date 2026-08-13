import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "@/api";
import type { Item } from "@/types";
import { FolioText } from "@/components/ui/FolioText";
import { ClothingImage } from "@/components/ui/ClothingImage";
import { StampSeal } from "@/components/ui/StampSeal";
import { LeafSpray } from "@/components/ui/LeafSpray";
import { haptic } from "@/haptics";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export default function CombinePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const pre = (location.state as { selectedIds?: number[] } | null)?.selectedIds ?? [];
    api.items().then((r) => {
      setItems(r.items);
      setSelected(pre.filter((id) => r.items.some((i) => i.id === id)));
    });
  }, [location.state]);

  const selectedItems = useMemo(
    () => items.filter((i) => selected.includes(i.id)),
    [items, selected]
  );

  const toggle = (id: number) => {
    haptic.tap();
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const save = async () => {
    if (saved || selectedItems.length === 0) return;
    haptic.stamp();
    try {
      await api.lookCreate({ title: title.trim() || "未命名的搭配", note: note.trim(), item_ids: selected });
      setSaved(true);
      setTimeout(() => navigate("/lookbook"), 700);
    } catch {
      /* 保持原状 */
    }
  };

  return (
    <div className="mx-auto max-w-md px-7 pb-44 pt-9">
      <LeafSpray className="pointer-events-none absolute right-2 top-2 h-10 w-20 text-ink-faint/30" />

      <motion.header
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <div className="flex items-baseline justify-between">
          <FolioText>✦ COMBINE</FolioText>
          <FolioText>VOL.04</FolioText>
        </div>
        <h1 className="mt-4 font-serif text-display leading-[1.02] text-ink">组合</h1>
        <p className="mt-2 font-serif text-caption text-ink-soft">手动搭配一套，属于自己的 Look</p>
      </motion.header>

      <div className="editorial-rule mt-6 w-full" />

      {/* 实时拼贴预览 */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
        className="pt-7"
      >
        <FolioText>PREVIEW</FolioText>
        {selectedItems.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2">
            <span className="font-serif text-2xl text-ink-faint/40">—</span>
            <p className="font-hand text-sm text-ink-faint">从下面挑几件，先看看拼起来的样子</p>
          </div>
        ) : (
          <div className="relative mt-4 flex items-center justify-center" style={{ minHeight: 340 }}>
            {selectedItems.map((item, i) => {
              const n = selectedItems.length;
              const offset = (i - (n - 1) / 2) * 40;
              const left = `calc(50% - 88px + ${offset}px)`;
              const rot = (i - (n - 1) / 2) * 2.4;
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: i * 0.07, ease: EASE }}
                  onClick={() => navigate(`/item/${item.id}`)}
                  className="absolute top-4"
                  style={{ left, rotate: rot, zIndex: i }}
                >
                  <div className="bg-paper-soft p-2 shadow-plate" style={{ borderRadius: 2 }}>
                    <ClothingImage item={item} className="h-48 w-40" />
                  </div>
                  <p className="mt-1 max-w-[160px] truncate text-center font-hand text-[11px] text-ink-soft">{item.name}</p>
                </motion.button>
              );
            })}
          </div>
        )}
        <p className="mt-1 text-right text-folio text-ink-faint">{selectedItems.length} PIECES</p>
      </motion.section>

      {/* 挑选单品 */}
      <section className="pt-8">
        <FolioText>挑选单品</FolioText>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {items.map((item) => {
            const on = selected.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggle(item.id)}
                className="group"
              >
                <div
                  className={`bg-paper-soft p-1.5 transition-all duration-200 ${on ? "shadow-2" : "shadow-1 opacity-70 group-hover:opacity-100"}`}
                  style={{
                    borderRadius: 2,
                    outline: on ? "1px solid rgb(var(--c-rose-deep))" : "none",
                  }}
                >
                  <ClothingImage item={item} className="aspect-square w-full" />
                </div>
                <p className={`mt-1 truncate text-center text-[11px] ${on ? "text-rose-deep" : "text-ink-faint"}`}>
                  {item.name}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 命名与保存 */}
      <section className="pt-8">
        <div className="flex items-baseline gap-3">
          <FolioText>给这套取个名字</FolioText>
          <span className="h-px flex-1 bg-edge/60" />
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例如：奶油色的星期三"
          className="mt-3 w-full border-b border-edge bg-transparent pb-2 font-serif text-title text-ink outline-none placeholder:text-ink-faint/50"
        />
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="一句想说的话（可留空）"
          className="mt-3 w-full border-b border-edge bg-transparent pb-2 font-hand text-caption text-ink-soft outline-none placeholder:text-ink-faint/50"
        />

        <div className="mt-8 flex items-center justify-between">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={save}
            disabled={selectedItems.length === 0}
            className="relative disabled:opacity-40"
          >
            <span className="border-b border-ink pb-1 text-folio tracking-[0.22em] text-ink transition-colors hover:text-rose-deep">
              SAVE THIS LOOK
            </span>
            <StampSeal show={saved} label="已入册" />
          </motion.button>
          <button
            onClick={() => navigate("/wardrobe")}
            className="text-folio text-ink-faint transition-colors hover:text-ink"
          >
            去衣橱挑 →
          </button>
        </div>
      </section>
    </div>
  );
}
