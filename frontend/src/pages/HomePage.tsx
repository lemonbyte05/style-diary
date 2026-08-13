import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "@/api";
import type { HomeData } from "@/types";
import { formatFolioDate } from "@/utils";
import { TornDivider } from "@/components/ui/TornDivider";
import { FolioText } from "@/components/ui/FolioText";
import { GarmentPlate, pickShape } from "@/components/ui/GarmentPlate";
import { ArchivePlate } from "@/components/ui/ArchivePlate";
import { StampSeal } from "@/components/ui/StampSeal";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { haptic } from "@/haptics";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export default function HomePage() {
  const [data, setData] = useState<HomeData | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const diaryRef = useRef<HTMLDivElement>(null);
  const outfitRef = useRef<HTMLDivElement>(null);
  const inspirationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.home().then(setData).catch(() => setData(null));
  }, []);

  useEffect(() => {
    const target = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (!target) return;
    const map: Record<string, React.RefObject<HTMLDivElement>> = {
      diary: diaryRef,
      outfit: outfitRef,
      inspiration: inspirationRef,
    };
    const el = map[target]?.current;
    if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    window.history.replaceState({}, "");
  }, [location.state]);

  if (!data) return <HomeSkeleton />;

  const { masthead, mood, today_outfit, style_keywords, recent_collections, ai_recommendation } = data;

  return (
    <div className="relative mx-auto max-w-md px-7 pb-40 pt-9">
      <ThemeToggle className="absolute right-6 top-3 z-10" />
      <Masthead vol={masthead.vol} />

      <TodayDiary mood={mood} today={masthead.date} containerRef={diaryRef} />

      <TodayOutfit outfit={today_outfit} containerRef={outfitRef} onOpen={(id) => navigate(`/item/${id}`)} />

      <StyleLine keywords={style_keywords} />

      <RecentArchive
        items={recent_collections}
        onViewAll={() => navigate("/wardrobe")}
        onOpen={(id) => navigate(`/item/${id}`)}
      />

      <TodayEdit recommendation={ai_recommendation} containerRef={inspirationRef} />

      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-20 text-center"
      >
        <div className="editorial-rule mx-auto mb-6 w-2/3" />
        <p className="font-serif text-lg text-ink-faint/70">MY STYLE DIARY</p>
        <FolioText className="mt-1.5">VOL.{masthead.vol} · 一本只属于你的时尚册</FolioText>
      </motion.footer>
    </div>
  );
}

/* ---------- 刊头：杂志开篇 ---------- */
function Masthead({ vol }: { vol: number }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="relative"
    >
      <div className="flex items-baseline justify-between">
        <FolioText>✦ PERSONAL FASHION ARCHIVE</FolioText>
        <FolioText>VOL.{vol}</FolioText>
      </div>
      <h1 className="mt-5 font-serif text-[52px] leading-[1.05] text-ink">我的衣橱</h1>
      <div className="mt-3 flex items-baseline justify-between">
        <FolioText>AUGUST · ARCHIVE NO.{vol}</FolioText>
        <span className="font-hand text-sm text-ink-faint">只属于我的时尚册</span>
      </div>
      <TornDivider label="OPENING" />
    </motion.header>
  );
}

/* ---------- 今日手记：无卡片的手写批注 ---------- */
function TodayDiary({
  mood,
  today,
  containerRef,
}: {
  mood: HomeData["mood"];
  today: string;
  containerRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <motion.section
      ref={containerRef}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: EASE }}
      className="scroll-mt-24 py-6"
    >
      <div className="flex items-baseline gap-3">
        <FolioText>TODAY · {formatFolioDate(today)}</FolioText>
        <span className="h-px flex-1 bg-edge/70" />
        <span className="font-hand text-xs text-ink-faint">{mood.emoji}</span>
      </div>
      <p className="mt-3 font-hand text-xl leading-relaxed text-ink">
        {mood.word}，{mood.note}。
      </p>
    </motion.section>
  );
}

/* ---------- 今日穿搭：服装版画叠加，无框编辑构图 ---------- */
function TodayOutfit({
  outfit,
  containerRef,
  onOpen,
}: {
  outfit: HomeData["today_outfit"];
  containerRef: React.RefObject<HTMLDivElement>;
  onOpen: (id: number) => void;
}) {
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
  const plateY = useTransform(scrollYProgress, [0, 1], [18, -18]);
  const textY = useTransform(scrollYProgress, [0, 1], [8, -8]);

  if (!outfit) {
    return (
      <section ref={containerRef} className="relative h-[420px] scroll-mt-24">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <span className="font-serif text-3xl text-ink-faint/50">—</span>
          <p className="font-hand text-lg text-ink-soft">衣橱还空着，等你的第一件收藏</p>
          <FolioText>FIRST COLLECTION</FolioText>
        </div>
      </section>
    );
  }

  const [main, second] = outfit.items;
  const tint = main?.color_hex ?? "#F3E9F2";

  return (
    <motion.section
      ref={containerRef}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: EASE }}
      className="relative scroll-mt-24 py-4"
    >
      {/* 画布：柔和色晕，非圆角框 */}
      <div
        className="relative overflow-hidden"
        style={{
          minHeight: 500,
          background: `radial-gradient(120% 85% at 50% 28%, ${tint}44, transparent 72%), linear-gradient(180deg, rgb(var(--c-paper-deep)) 0%, rgb(var(--c-paper)) 100%)`,
        }}
      >
        <span
          className="pointer-events-none absolute inset-y-4 right-2 text-folio tracking-[0.3em] text-ink/25"
          style={{ writingMode: "vertical-rl" }}
        >
          LOOK 01 · {formatFolioDate(outfit.date)}
        </span>

        {/* 服装版画叠加 */}
        <motion.div style={{ y: plateY }} className="relative px-6 pb-24 pt-8">
          <motion.button
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
            onClick={() => main && onOpen(main.id)}
            className="relative block w-[60%] -rotate-2"
          >
            <div className="washi-tape" aria-hidden />
            <div className="bg-paper-soft px-4 pb-4 pt-4 shadow-plate" style={{ borderRadius: 2 }}>
              {main && <GarmentPlate colorHex={main.color_hex} name={main.name} shape={pickShape(main)} className="aspect-[4/5] w-full" />}
            </div>
            {main && (
              <p className="mt-2 pl-1 font-hand text-[13px] text-ink-soft">{main.name}</p>
            )}
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
            onClick={() => second && onOpen(second.id)}
            className="absolute right-3 top-[52%] block w-[42%] rotate-[1.5deg]"
          >
            <div className="bg-paper-soft px-3 pb-3 pt-3 shadow-plate" style={{ borderRadius: 2 }}>
              {second && <GarmentPlate colorHex={second.color_hex} name={second.name} shape={pickShape(second)} className="aspect-[4/5] w-full" />}
            </div>
          </motion.button>
        </motion.div>

        {/* 标题悬浮于版画之上 */}
        <motion.div style={{ y: textY }} className="relative px-6 pb-7 pt-2">
          <div className="flex items-baseline gap-2 text-folio text-ink-soft">
            <span>{outfit.weather}</span>
            <span>·</span>
            <span>{outfit.occasion}</span>
            <span className="ml-auto font-hand text-xs text-ink-faint">{formatFolioDate(outfit.date)}</span>
          </div>
          <h2 className="mt-2 font-serif text-[34px] leading-[1.15] text-ink">「{outfit.title}」</h2>
          <p className="mt-2 font-hand text-caption text-ink-soft">{outfit.note}</p>
        </motion.div>
      </div>
    </motion.section>
  );
}

/* ---------- 本周风格：一行编辑体文字 ---------- */
function StyleLine({ keywords }: { keywords: string[] }) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="py-8"
    >
      <div className="flex items-baseline gap-3">
        <FolioText>本周风格</FolioText>
        <span className="h-px flex-1 bg-edge/70" />
      </div>
      <p className="mt-3 font-serif text-h2 leading-relaxed text-ink">
        {keywords.join(" · ")}
      </p>
    </motion.section>
  );
}

/* ---------- 最近收藏：错落档案墙 ---------- */
function RecentArchive({
  items,
  onViewAll,
  onOpen,
}: {
  items: HomeData["recent_collections"];
  onViewAll: () => void;
  onOpen: (id: number) => void;
}) {
  return (
    <section className="pt-6">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="flex items-baseline justify-between"
      >
        <FolioText>RECENT ARCHIVE</FolioText>
        <button onClick={onViewAll} className="text-folio text-ink-faint transition-colors hover:text-rose">
          查看全部 →
        </button>
      </motion.div>
      <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-6">
        {items.slice(0, 6).map((item, i) => (
          <div key={item.id} className={i % 2 === 1 ? "mt-9" : ""}>
            <ArchivePlate
              item={item}
              index={i}
              rotate={i % 2 === 0 ? -1.6 : 1.3}
              tall={i % 2 === 0}
              tape={i === 0 || i === 4}
              onOpen={onOpen}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- TODAY'S EDIT（AI 在幕后） ---------- */
function TodayEdit({
  recommendation,
  containerRef,
}: {
  recommendation: HomeData["ai_recommendation"];
  containerRef: React.RefObject<HTMLDivElement>;
}) {
  const [rec, setRec] = useState(recommendation);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const regenerate = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const next = await api.aiRecommend();
      setTimeout(() => setRec(next), 420);
    } finally {
      setTimeout(() => setLoading(false), 700);
    }
  };

  const [main, second] = rec.combo;

  return (
    <motion.section
      ref={containerRef}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: EASE }}
      className="scroll-mt-24 pt-10"
    >
      <div className="flex items-baseline justify-between">
        <FolioText>TODAY'S EDIT</FolioText>
        <button onClick={regenerate} className="text-folio text-ink-faint transition-colors hover:text-ink">
          {loading ? "翻纸中…" : "换个方向"}
        </button>
      </div>
      <div className="editorial-rule mt-3 w-1/2" />

      {loading ? (
        <div className="py-10">
          <p className="font-hand text-caption text-ink-faint">正在翻纸，寻找另一种可能…</p>
        </div>
      ) : (
        <div className="mt-5">
          <p className="max-w-[85%] font-serif text-h2 leading-relaxed text-ink">
            「{rec.reason}」
          </p>
          <p className="mt-1.5 text-folio text-ink-faint">{rec.context}</p>

          {/* 版画叠加 */}
          <div className="relative mt-6 h-[320px]">
            <button onClick={() => main && console.log(main.id)} className="absolute left-0 top-0 w-[52%] -rotate-2">
              <div className="bg-paper-soft px-3 pb-3 pt-3 shadow-plate" style={{ borderRadius: 2 }}>
                {main && <GarmentPlate colorHex={main.color_hex} name={main.name} shape={pickShape(main)} className="aspect-[4/5] w-full" />}
              </div>
              {main && <p className="mt-2 pl-1 font-hand text-xs text-ink-soft">{main.name}</p>}
            </button>
            <button onClick={() => second && console.log(second.id)} className="absolute right-0 top-16 w-[40%] rotate-[1.5deg]">
              <div className="bg-paper-soft px-2.5 pb-2.5 pt-2.5 shadow-plate" style={{ borderRadius: 2 }}>
                {second && <GarmentPlate colorHex={second.color_hex} name={second.name} shape={pickShape(second)} className="aspect-[4/5] w-full" />}
              </div>
            </button>
            <span className="absolute bottom-0 right-1 font-hand text-[13px] text-ink-faint">curated, not random</span>
          </div>

          <button
            onClick={() => {
              haptic.stamp();
              setSaved(true);
              setTimeout(() => setSaved(false), 1600);
            }}
            className="group relative mt-8 inline-flex items-center gap-2"
          >
            <span className="border-b border-ink pb-1 text-folio tracking-[0.22em] text-ink transition-colors group-hover:text-rose-deep">
              SAVE THIS LOOK
            </span>
            <StampSeal show={saved} />
          </button>
        </div>
      )}
    </motion.section>
  );
}

/* ---------- 加载骨架：纸面占位 ---------- */
function HomeSkeleton() {
  return (
    <div className="mx-auto max-w-md px-7 pb-40 pt-9">
      <div className="h-3 w-44 animate-pulse bg-edge/70" />
      <div className="mt-5 h-12 w-2/3 animate-pulse bg-edge/60" />
      <div className="mt-8 h-16 animate-pulse bg-edge/50" />
      <div className="mt-6 h-[500px] animate-pulse bg-paper-deep" />
    </div>
  );
}
