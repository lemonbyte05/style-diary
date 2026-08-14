import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { api } from "@/api";
import type { HomeData, TodayEdit } from "@/types";
import { TornDivider } from "@/components/ui/TornDivider";
import { FolioText } from "@/components/ui/FolioText";
import { ArchivePlate, type PlateVariant } from "@/components/ui/ArchivePlate";
import { ClothingImage } from "@/components/ui/ClothingImage";
import { LeafSpray } from "@/components/ui/LeafSpray";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

/** 首页档案墙的变体循环：同页混用不同版式 */
const HOME_WALL: PlateVariant[] = ["polaroid", "editorial", "archive", "minimal", "polaroid", "editorial"];

export default function HomePage() {
  const [data, setData] = useState<HomeData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.home().then(setData).catch(() => setData(null));
  }, []);

  if (!data) return <HomeSkeleton />;

  const { masthead, total_items, recent_collections, today_edit } = data;

  return (
    <div className="mx-auto max-w-md px-7 pb-40 pt-9">
      <Masthead vol={masthead.vol} total={total_items} />

      {today_edit && (
        <TodayEdit edit={today_edit} onOpen={(id) => navigate(`/item/${id}`)} />
      )}

      {/* 搭配入口 */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: EASE }}
        className="pt-8"
      >
        <div className="flex items-baseline gap-3">
          <FolioText>我的搭配</FolioText>
          <span className="h-px flex-1 bg-edge/70" />
        </div>
        <button
          onClick={() => navigate("/combine")}
          className="group mt-3 flex w-full items-baseline justify-between"
        >
          <span className="font-serif text-h2 text-ink transition-colors group-hover:text-rose-deep">
            去搭配一套 →
          </span>
          <span className="font-hand text-xs text-ink-faint">挑几件，拼在一起试试</span>
        </button>
      </motion.section>

      <RecentArchive
        items={recent_collections}
        onViewAll={() => navigate("/wardrobe")}
        onOpen={(id) => navigate(`/item/${id}`)}
        onAdd={() => navigate("/add")}
      />

      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-20"
      >
        <div className="editorial-rule w-full" />
        <div className="mt-6 text-center">
          <p className="font-serif text-lg text-ink-faint/70">MY STYLE DIARY</p>
          <FolioText className="mt-1.5">VOL.{masthead.vol} · 一本只属于你的时尚册</FolioText>
        </div>
      </motion.footer>
    </div>
  );
}

/* ---------- 刊头：杂志开篇 ---------- */
function Masthead({ vol, total }: { vol: number; total: number }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="relative"
    >
      <LeafSpray className="pointer-events-none absolute -left-2 top-1 h-10 w-20 text-ink-faint/30" />
      <div className="flex items-baseline justify-between">
        <FolioText>✦ PERSONAL FASHION ARCHIVE</FolioText>
        <span className="flex items-center gap-4">
          <ThemeToggle />
          <FolioText>VOL.{vol}</FolioText>
        </span>
      </div>
      <h1 className="mt-5 font-serif text-display leading-[1.05] text-ink">我的衣橱</h1>
      <div className="mt-3 flex items-baseline justify-between">
        <FolioText>已收藏 {total} 件</FolioText>
        <span className="font-hand text-sm text-ink-faint">都是你自己的收藏</span>
      </div>
      <TornDivider label="ARCHIVE" />
    </motion.header>
  );
}

/* ---------- Today's Edit：开篇拼贴（主单品+配饰叠压+心情+文案） ---------- */
function TodayEdit({
  edit,
  onOpen,
}: {
  edit: TodayEdit;
  onOpen: (id: number) => void;
}) {
  const day = Number(edit.date.split("-")[2] ?? 0);
  const monthDay = `${edit.date.slice(5, 7).replace(/^0/, "")}月${edit.date.slice(8).replace(/^0/, "")}日`;

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: EASE }}
      className="pt-9"
    >
      <div className="flex items-baseline justify-between">
        <FolioText>✦ TODAY'S EDIT</FolioText>
        <span className="font-hand text-sm text-ink-faint">{monthDay}</span>
      </div>

      <div className="relative mt-4" style={{ height: 320 }}>
        {/* 版面底板 */}
        <div
          className="absolute inset-x-0 top-0 h-full rotate-[0.8deg] border border-edge/80 bg-paper-soft"
          style={{ borderRadius: 3, boxShadow: "var(--sh-plate)" }}
        />
        {/* 巨型日期水印 */}
        <span
          className="pointer-events-none absolute -right-1 top-0 select-none font-serif leading-none text-ink/[0.07]"
          style={{ fontSize: 150 }}
        >
          {day}
        </span>

        {/* 主单品 */}
        <button
          onClick={() => onOpen(edit.main.id)}
          className="absolute"
          style={{ left: "22%", top: "4%", width: 148, height: 192, rotate: "-2deg", zIndex: 2 }}
        >
          <div className="h-full w-full bg-paper-soft p-2 shadow-plate" style={{ borderRadius: 2 }}>
            <ClothingImage item={edit.main} className="h-full w-full" />
          </div>
        </button>

        {/* 配饰叠压右下 */}
        {edit.accessory && (
          <button
            onClick={() => edit.accessory && onOpen(edit.accessory.id)}
            className="absolute"
            style={{ left: "74%", top: "60%", width: 86, height: 86, rotate: "6deg", zIndex: 3 }}
          >
            <div className="h-full w-full bg-paper-soft p-1.5 shadow-plate" style={{ borderRadius: 2 }}>
              <ClothingImage item={edit.accessory} className="h-full w-full" />
            </div>
          </button>
        )}

        {/* 心情 + 一句文案 */}
        <div className="absolute bottom-3 left-5 right-16 z-10">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-hand text-xl text-rose-deep">
              {edit.mood.emoji} {edit.mood.word}
            </span>
            <span className="text-folio text-ink-faint">{edit.mood.note}</span>
          </div>
          <p className="mt-1.5 font-serif text-caption leading-relaxed text-ink-soft">
            {edit.caption}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <FolioText>DAILY EDIT</FolioText>
        <span className="font-hand text-xs text-ink-faint">每天换一套心情</span>
      </div>
    </motion.section>
  );
}

/* ---------- 最近收藏：错落档案墙 ---------- */
function RecentArchive({
  items,
  onViewAll,
  onOpen,
  onAdd,
}: {
  items: HomeData["recent_collections"];
  onViewAll: () => void;
  onOpen: (id: number) => void;
  onAdd: () => void;
}) {
  return (
    <section className="pt-8">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="flex items-baseline justify-between"
      >
        <FolioText>RECENT ARCHIVE</FolioText>
        {items.length > 0 && (
          <button onClick={onViewAll} className="text-folio text-ink-faint transition-colors hover:text-rose">
            查看全部 →
          </button>
        )}
      </motion.div>
      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-5 flex flex-col items-center gap-3 border border-dashed border-edge py-16 text-center"
          style={{ borderRadius: 2 }}
        >
          <span className="font-serif text-3xl text-ink-faint/50">＋</span>
          <p className="font-hand text-lg text-ink-soft">衣橱还空着，等你的第一件收藏</p>
          <button
            onClick={onAdd}
            className="border-b border-ink pb-0.5 text-folio tracking-[0.2em] text-ink transition-colors hover:text-rose-deep"
          >
            去入册一件 →
          </button>
        </motion.div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-6">
          {items.slice(0, 6).map((item, i) => (
            <div key={item.id} className={i % 2 === 1 ? "mt-9" : ""}>
              <ArchivePlate
                item={item}
                index={i}
                variant={HOME_WALL[i % HOME_WALL.length]}
                rotate={i % 2 === 0 ? -1.6 : 1.3}
                tall={i % 2 === 0}
                tape={i === 0 || i === 4}
                onOpen={onOpen}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ---------- 加载骨架：纸面占位 ---------- */
function HomeSkeleton() {
  return (
    <div className="mx-auto max-w-md px-7 pb-40 pt-9">
      <div className="h-3 w-44 animate-pulse bg-edge/70" />
      <div className="mt-5 h-12 w-2/3 animate-pulse bg-edge/60" />
      <div className="mt-8 h-16 animate-pulse bg-edge/50" />
      <div className="mt-6 h-64 animate-pulse bg-paper-deep" />
    </div>
  );
}
