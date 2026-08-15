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
import { haptic } from "@/haptics";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;
const BOARD_HEIGHT = 400;

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
  x: number; // 画布中心位置（百分比）
  y: number;
  w: number; // 版画基准尺寸 px
  h: number;
  rot: number;
  z: number;
}

/** 按服装角色自动排版：外套左后 / 连衣裙居中主视觉 / 上衣上 / 下装下 / 包右下 / 鞋左下 / 配饰右上 */
const SLOT: Record<Role, Slot> = {
  outer: { x: 18, y: 28, w: 128, h: 164, rot: -4, z: 1 },
  dress: { x: 50, y: 16, w: 150, h: 200, rot: -1.2, z: 3 },
  top: { x: 44, y: 2, w: 112, h: 138, rot: 1.8, z: 2 },
  bottom: { x: 48, y: 42, w: 126, h: 130, rot: -1.6, z: 2 },
  bag: { x: 80, y: 60, w: 96, h: 96, rot: 3.2, z: 2 },
  shoes: { x: 14, y: 62, w: 84, h: 84, rot: 2.2, z: 1 },
  accessory: { x: 86, y: 30, w: 78, h: 78, rot: -2.4, z: 1 },
};

const SINGLE: Slot = { x: 50, y: 12, w: 168, h: 214, rot: -1.2, z: 2 };

function roleOf(item: Item): Role {
  return ROLE_OF_SHAPE[pickShape(item)] ?? "accessory";
}

export default function CombinePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [note, setNote] = useState("");
  const [wornToday, setWornToday] = useState(false);
  const [weather, setWeather] = useState("sun");
  const [saved, setSaved] = useState(false);
  const [ref, setRef] = useState<{ id: number; url: string } | null>(null);
  const [refOpen, setRefOpen] = useState(true);

  useEffect(() => {
    const st = (location.state as { selectedIds?: number[]; inspirationId?: number; referenceUrl?: string } | null) ?? null;
    const pre = st?.selectedIds ?? [];
    if (st?.inspirationId && st.referenceUrl) {
      setRef({ id: st.inspirationId, url: st.referenceUrl });
    } else {
      setRef(null);
    }
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
        const slot = selectedItems.length === 1 ? SINGLE : SLOT[role];
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
      await api.lookCreate({
        title: "",
        note: note.trim(),
        item_ids: selected,
        inspiration_id: ref?.id ?? null,
      });
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
      <motion.header
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <div className="flex items-baseline justify-between">
          <FolioText>STYLING DESK</FolioText>
          <FolioText>{selectedItems.length} PIECES</FolioText>
        </div>
        <h1 className="mt-4 font-serif text-display leading-[1.02] text-ink">组合</h1>
        <p className="mt-2 font-serif text-caption text-ink-soft">在桌面上摆出你的 Look</p>
      </motion.header>

      <div className="editorial-rule mt-6 w-full" />

      {/* 参考灵感：小型 sticky 条，可折叠，滚动时仍可瞥一眼 */}
      {ref && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="sticky top-0 z-30 -mx-7 mt-6 border-b border-edge/50 bg-paper/95 px-7 pb-2 pt-2 backdrop-blur-sm"
        >
          <button
            onClick={() => setRefOpen((v) => !v)}
            className="flex w-full items-center gap-3"
          >
            <img
              src={ref.url}
              alt="reference look"
              className="h-11 w-9 shrink-0 border border-edge/50 bg-paper-soft object-cover"
              style={{ borderRadius: 2 }}
            />
            <span className="min-w-0 flex-1 text-left">
              <FolioText>REFERENCE LOOK</FolioText>
              <span className="block truncate font-hand text-[11px] text-ink-faint">灵感参考 · 一边看一边挑</span>
            </span>
            <span className="shrink-0 font-hand text-xs text-ink-faint">{refOpen ? "收起 ▲" : "展开 ▼"}</span>
          </button>
          {refOpen && (
            <div className="mt-2 flex justify-center border border-edge/40 bg-paper-deep/30 p-2" style={{ borderRadius: 2 }}>
              <img
                src={ref.url}
                alt="reference look"
                className="max-h-64 w-auto max-w-full border border-edge/30 bg-paper-soft"
                style={{ borderRadius: 2 }}
              />
            </div>
          )}
        </motion.div>
      )}

      {/* 自动排版穿搭板 */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
        className="pt-7"
      >
        <div className="flex items-baseline justify-between">
          <FolioText>STYLE BOARD</FolioText>
          <span className="font-hand text-xs text-ink-faint">按角色摆开：外套/上衣/下装/裙/包/鞋</span>
        </div>

        <div className="relative mt-3 overflow-hidden" style={{ height: BOARD_HEIGHT, borderRadius: 4, boxShadow: "0 18px 44px -18px rgba(48, 40, 33, 0.18)" }}>
          <div className="pointer-events-none absolute inset-0 rotate-[-0.6deg] border border-edge/80 bg-paper-deep/40" />
          {selectedItems.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <span className="font-serif text-2xl text-ink-faint/40">—</span>
              <p className="font-hand text-sm text-ink-faint">从下面挑几件，自动帮你摆好</p>
            </div>
          ) : (
            placement.map((p, i) => {
              const { item, slot } = p;
              const n = roleCounts[p.role];
              const t = n > 1 ? placement.filter((q) => q.role === p.role).map((q) => q.item.id).indexOf(item.id) - (n - 1) / 2 : 0;
              const dx = t * 16;
              const dy = Math.abs(t) * 10;
              const drot = t * 2.6;
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
                    rotate: `${slot.rot + drot}deg`,
                    zIndex: slot.z,
                  }}
                >
                  <div className="h-full w-full bg-paper-soft p-2 shadow-plate" style={{ borderRadius: 2 }}>
                    <ClothingImage item={item} className="h-full w-full" />
                  </div>
                  <p className="mt-1 max-w-[170px] truncate text-center font-hand text-[11px] text-ink-soft">{item.name}</p>
                </motion.button>
              );
            })
          )}
        </div>
      </motion.section>

      {/* 挑选单品 */}
      <section className="pt-8">
        <FolioText>挑选单品</FolioText>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {items.map((item) => {
            const on = selected.includes(item.id);
            return (
              <button key={item.id} onClick={() => toggle(item.id)} className="group">
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

      {/* 保存（命名可选，自动 LOOK N） */}
      <section className="pt-8">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="一句想说的话（可留空）"
          className="w-full border-b border-edge bg-transparent pb-2 font-hand text-caption text-ink-soft outline-none placeholder:text-ink-faint/50"
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
