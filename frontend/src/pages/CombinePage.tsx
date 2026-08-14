import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "@/api";
import type { Item } from "@/types";
import { WEATHERS } from "@/utils";
import { FolioText } from "@/components/ui/FolioText";
import { ClothingImage } from "@/components/ui/ClothingImage";
import { pickShape, type GarmentShape } from "@/components/ui/GarmentPlate";
import { StampSeal } from "@/components/ui/StampSeal";
import { LeafSpray } from "@/components/ui/LeafSpray";
import { haptic } from "@/haptics";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

/** 服装角色 → 穿搭板上的位置（x/y 为容器百分比，w/h 为 px，z 控制前后叠压） */
type Role = "outer" | "dress" | "top" | "bottom" | "bag" | "shoes" | "accessory";

const ROLE_OF_SHAPE: Record<GarmentShape, Role> = {
  jacket: "outer",
  dress: "dress",
  skirt: "bottom",
  top: "top",
  bag: "bag",
  pants: "bottom",
  shoes: "shoes",
};

interface Slot {
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number;
  z: number;
}

const SLOTS: Record<Role, Slot> = {
  outer: { x: 18, y: 30, w: 128, h: 164, rot: -4, z: 1 },
  dress: { x: 50, y: 16, w: 150, h: 200, rot: -1.2, z: 3 },
  top: { x: 44, y: 4, w: 112, h: 138, rot: 1.8, z: 2 },
  bottom: { x: 48, y: 42, w: 126, h: 130, rot: -1.6, z: 2 },
  bag: { x: 80, y: 62, w: 96, h: 96, rot: 3.2, z: 2 },
  shoes: { x: 14, y: 62, w: 84, h: 84, rot: 2.2, z: 1 },
  accessory: { x: 86, y: 32, w: 78, h: 78, rot: -2.4, z: 1 },
};

const SINGLE_SLOT: Slot = { x: 50, y: 16, w: 168, h: 214, rot: -1.2, z: 2 };

function roleOf(item: Item): Role {
  return ROLE_OF_SHAPE[pickShape(item)] ?? "accessory";
}

export default function CombinePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [wornToday, setWornToday] = useState(false);
  const [weather, setWeather] = useState("sun");
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

  const placement = useMemo(
    () =>
      selectedItems.map((item) => {
        const role = roleOf(item);
        const slot = selectedItems.length === 1 ? SINGLE_SLOT : SLOTS[role];
        return { item, role, slot };
      }),
    [selectedItems]
  );

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of placement) counts[p.role] = (counts[p.role] ?? 0) + 1;
    return counts;
  }, [placement]);

  const toggle = (id: number) => {
    haptic.tap();
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const save = async () => {
    if (saved || selectedItems.length === 0) return;
    haptic.stamp();
    try {
      await api.lookCreate({ title: title.trim() || "未命名的搭配", note: note.trim(), item_ids: selected });
      if (wornToday) {
        await api.wearCreate({ item_ids: selected, weather, note: note.trim() });
      }
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
          <div className="relative mt-4" style={{ minHeight: 350 }}>
            <div
              className="pointer-events-none absolute inset-0 -m-2 rotate-[-0.6deg] border border-edge/80 bg-paper-deep/40"
              style={{ borderRadius: 4, boxShadow: "0 18px 44px -18px rgba(48, 40, 33, 0.18)" }}
            />
            {placement.map((p, i) => {
              const { item, slot } = p;
              const n = roleCounts[p.role];
              const t = n > 1 ? placement.filter((q) => q.role === p.role).map((q) => q.item.id).indexOf(item.id) - (n - 1) / 2 : 0;
              const dx = t * 14;
              const dy = Math.abs(t) * 8;
              const drot = t * 2.4;
              const left = `calc(${slot.x}% - ${slot.w / 2}px + ${dx}px)`;
              const top = `calc(${slot.y}% + ${dy}px)`;
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: i * 0.07, ease: EASE }}
                  onClick={() => navigate(`/item/${item.id}`)}
                  className="absolute"
                  style={{
                    left,
                    top,
                    width: slot.w,
                    height: slot.h,
                    rotate: slot.rot + drot,
                    zIndex: slot.z,
                  }}
                >
                  <div className="h-full w-full bg-paper-soft p-2 shadow-plate" style={{ borderRadius: 2 }}>
                    <ClothingImage item={item} className="h-full w-full" />
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

        <div className="mt-7 border-t border-edge/60 pt-5">
          <div className="flex items-baseline justify-between">
            <FolioText>WEAR LOG</FolioText>
            <span className="font-hand text-xs text-ink-faint">记下今天穿了这套</span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                haptic.tap();
                setWornToday((v) => !v);
              }}
              className={`border-b pb-0.5 text-folio tracking-[0.16em] transition-colors ${
                wornToday ? "border-rose-deep text-rose-deep" : "border-ink-faint text-ink-soft hover:text-ink"
              }`}
            >
              {wornToday ? "✓ 今天穿了这套" : "今天穿了这套？"}
            </button>
            {wornToday &&
              WEATHERS.map((w) => (
                <button
                  key={w.key}
                  onClick={() => {
                    haptic.tap();
                    setWeather(w.key);
                  }}
                  className={`px-2 py-1 text-caption transition-colors ${
                    weather === w.key ? "bg-paper-soft text-ink shadow-1" : "text-ink-faint hover:text-ink-soft"
                  }`}
                  style={{ borderRadius: 2 }}
                >
                  {w.icon} {w.label}
                </button>
              ))}
          </div>
        </div>

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
