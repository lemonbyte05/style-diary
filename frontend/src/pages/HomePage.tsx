import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronRight, Camera, Shuffle, BookmarkPlus } from "lucide-react";
import { api } from "@/api";
import type { HomeData } from "@/types";
import { formatDiaryDate } from "@/utils";
import { TornDivider } from "@/components/ui/TornDivider";
import { FolioText } from "@/components/ui/FolioText";
import { KeywordChip } from "@/components/ui/KeywordChip";
import { PolaroidCard } from "@/components/ui/PolaroidCard";
import { StampSeal } from "@/components/ui/StampSeal";
import { SpecimenImage } from "@/components/ui/SpecimenImage";

const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as const;

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
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    }
    window.history.replaceState({}, "");
  }, [location.state]);

  if (!data) return <HomeSkeleton />;

  const { masthead, mood, today_outfit, style_keywords, recent_collections, ai_recommendation } = data;

  return (
    <div className="mx-auto max-w-md px-6 pb-36 pt-8">
      <PageIntro />
      <SectionDiary mood={mood} containerRef={diaryRef} />
      <SectionOutfit outfit={today_outfit} containerRef={outfitRef} onNavigate={(id) => navigate(`/item/${id}`)} />
      <SectionKeywords keywords={style_keywords} />
      <SectionCollections items={recent_collections} onViewAll={() => navigate("/wardrobe")} onOpen={(id) => navigate(`/item/${id}`)} />
      <SectionAI recommendation={ai_recommendation} containerRef={inspirationRef} />

      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-14 text-center"
      >
        <p className="font-serif text-2xl text-ink-faint/60">My Style Diary</p>
        <FolioText className="mt-2">Vol.{masthead.vol} · 只属于我的时尚册</FolioText>
      </motion.footer>
    </div>
  );
}

/* ---------- 刊头 ---------- */
function PageIntro() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE_OUT }}
      className="mb-6 text-center"
    >
      <p className="font-folio tracking-[0.3em] text-ink-faint">MY STYLE DIARY</p>
      <h1 className="mt-2 font-serif text-hero text-ink">我的衣橱</h1>
      <FolioText className="mt-2 block">
        第 {new Date().getDate()} 天 · 收藏这件事
      </FolioText>
      <TornDivider label="TODAY" note="新的一天，新的自己" />
    </motion.header>
  );
}

/* ---------- 今日心情（索引卡） ---------- */
function SectionDiary({
  mood,
  containerRef,
}: {
  mood: HomeData["mood"];
  containerRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <motion.section
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: EASE_OUT }}
      className="mb-8"
    >
      <div className="flex items-center gap-3 rounded-lg bg-paper-soft p-4 shadow-1">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-wash text-2xl">
          {mood.emoji}
        </div>
        <div className="flex-1">
          <p className="font-hand text-lg text-ink">{mood.word}</p>
          <p className="text-caption text-ink-faint">{mood.note}</p>
        </div>
        <FolioText>心情·今日</FolioText>
      </div>
    </motion.section>
  );
}

/* ---------- 今日穿搭（Hero 封面卡） ---------- */
function SectionOutfit({
  outfit,
  containerRef,
  onNavigate,
}: {
  outfit: HomeData["today_outfit"];
  containerRef: React.RefObject<HTMLDivElement>;
  onNavigate: (id: number) => void;
}) {
  return (
    <motion.section
      ref={containerRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: EASE_OUT }}
      className="mb-8 scroll-mt-24"
    >
      {outfit ? (
        <div className="relative overflow-hidden rounded-xl bg-paper-soft shadow-hero">
          <div className="relative h-[460px] w-full">
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(160deg, ${outfit.items[0]?.color_hex ?? "#F3E9F2"} 0%, #E9B49B 42%, #C98A7A 74%, #B06F60 100%)`,
              }}
            />

            {/* 超大衬线日期（封面题字） */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="absolute left-4 top-3 font-serif text-4xl leading-none text-ink/40"
            >
              {formatDiaryDate(outfit.date)}
            </motion.p>

            {/* 右侧竖排 VOL 小字 */}
            <span
              className="absolute right-3 top-4 text-folio tracking-[0.3em] text-ink/30"
              style={{ writingMode: "vertical-rl" }}
            >
              MY STYLE DIARY
            </span>

            {/* 单品卡 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex gap-4">
                {outfit.items.slice(0, 2).map((item, i) => (
                  <motion.button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.25 + i * 0.16, ease: EASE_OUT }}
                    whileHover={{ y: -6, rotate: i === 0 ? -1.5 : 1.5 }}
                    className={`h-44 w-36 rounded-lg bg-paper-soft/95 p-2 shadow-2 ${
                      i === 0 ? "rotate-[-3deg]" : "rotate-[2.5deg] translate-y-3"
                    }`}
                  >
                    <SpecimenImage
                      colorHex={item.color_hex}
                      emoji={item.emoji}
                      name={item.name}
                      className="h-32 w-full rounded-md"
                    />
                    <p className="mt-1.5 truncate text-center font-hand text-xs text-ink">
                      {item.name}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* 底部压字 */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 via-ink/60 to-transparent p-5 pt-24">
              <div className="flex items-center gap-2 text-folio text-paper-soft/70">
                <span>{outfit.weather}</span>
                <span>·</span>
                <span>{outfit.occasion}</span>
              </div>
              <h2 className="mt-1.5 font-serif text-title leading-snug text-paper-soft">
                「{outfit.title}」
              </h2>
              <p className="mt-2 font-hand text-caption text-paper-soft/85">
                {outfit.note}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative flex h-[360px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-edge bg-paper-soft">
          <Camera size={32} strokeWidth={1.2} className="mb-3 text-ink-faint" />
          <p className="font-hand text-lg text-ink-soft">衣橱还空着，等你的第一件收藏</p>
          <FolioText className="mt-2">拍下今日穿搭</FolioText>
        </div>
      )}
    </motion.section>
  );
}

/* ---------- 风格关键词 ---------- */
function SectionKeywords({ keywords }: { keywords: string[] }) {
  return (
    <section className="mb-8">
      <TornDivider label="本周风格" note="今天的心情，都写在衣领上" />
      <div className="mt-4 flex flex-wrap gap-2">
        {keywords.map((kw, i) => (
          <KeywordChip key={kw} label={kw} delay={i * 0.06} />
        ))}
      </div>
    </section>
  );
}

/* ---------- 最近收藏（拍立得墙） ---------- */
function SectionCollections({
  items,
  onViewAll,
  onOpen,
}: {
  items: HomeData["recent_collections"];
  onViewAll: () => void;
  onOpen: (id: number) => void;
}) {
  return (
    <section className="mb-10">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mb-3 flex items-center justify-between"
      >
        <h3 className="font-serif text-h2 text-ink">最近收藏</h3>
        <button onClick={onViewAll} className="flex items-center gap-0.5 text-folio text-ink-faint transition-colors hover:text-rose">
          查看全部 <ChevronRight size={13} strokeWidth={1.6} />
        </button>
      </motion.div>
      <div className="-mx-6 overflow-x-auto px-6 pb-4" style={{ scrollbarWidth: "none" }}>
        <div className="flex gap-4">
          {items.map((item, i) => (
            <div key={item.id} className="w-[150px] shrink-0" onClick={() => onOpen(item.id)}>
              <PolaroidCard item={item} rotate={i % 2 === 0 ? -1.5 : 1.2} delay={i * 0.08} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- AI 今日灵感（票根卡） ---------- */
function SectionAI({
  recommendation,
  containerRef,
}: {
  recommendation: HomeData["ai_recommendation"];
  containerRef: React.RefObject<HTMLDivElement>;
}) {
  const [rec, setRec] = useState(recommendation);
  const [shaking, setShaking] = useState(false);
  const [saved, setSaved] = useState(false);

  const regenerate = async () => {
    if (shaking) return;
    setShaking(true);
    try {
      const next = await api.aiRecommend();
      setTimeout(() => setRec(next), 350);
    } finally {
      setTimeout(() => setShaking(false), 600);
    }
  };

  return (
    <motion.section
      ref={containerRef}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: EASE_OUT }}
      className="scroll-mt-24"
    >
      <TornDivider label="今日灵感" note="摇一摇，看看另一种可能" />
      <motion.div
        animate={shaking ? { rotate: [0, -2, 2, -2, 2, 0], x: [0, -4, 4, -4, 4, 0] } : {}}
        transition={{ duration: 0.5 }}
        className="relative mt-4 rounded-lg bg-paper-soft p-5 pb-6 shadow-1"
        style={{ border: "1px solid rgba(229,220,203,0.7)" }}
      >
        <div className="ticket-notch -left-2 top-1/2 -translate-y-1/2" />
        <div className="ticket-notch -right-2 top-1/2 -translate-y-1/2" />

        <div className="flex items-center justify-between">
          <FolioText>AI · 搭配灵感</FolioText>
          <button
            onClick={regenerate}
            className="flex items-center gap-1 text-folio text-rose transition-colors hover:text-rose-deep"
          >
            <Shuffle size={13} strokeWidth={1.6} /> 换一套
          </button>
        </div>

        <div className="mt-3 flex items-center gap-3">
          {rec.combo.map((item) => (
            <div key={item.id} className="relative">
              <div className="h-20 w-16 rounded-md bg-paper-deep p-1">
                <SpecimenImage colorHex={item.color_hex} emoji={item.emoji} name={item.name} className="h-full w-full rounded-sm" />
              </div>
              <p className="mt-1 max-w-[64px] truncate text-center text-folio text-ink-faint">{item.name}</p>
            </div>
          ))}
          <div className="ml-2 flex-1">
            <p className="font-serif text-h2 text-ink">「{rec.reason}」</p>
            <p className="mt-1 text-caption text-ink-faint">{rec.context}</p>
          </div>
        </div>

        <div className="mt-4 border-t border-dashed border-edge pt-3 text-center">
          <button
            onClick={() => {
              setSaved(true);
              setTimeout(() => setSaved(false), 1600);
            }}
            className="flex items-center gap-1.5 rounded-full bg-rose px-5 py-2 text-caption text-paper-soft shadow-2 transition-transform hover:scale-[1.02] active:scale-95"
          >
            <BookmarkPlus size={14} strokeWidth={1.6} /> 这套不错，记下来
          </button>
          <StampSeal show={saved} />
        </div>
      </motion.div>
    </motion.section>
  );
}

/* ---------- 加载骨架（纸面占位） ---------- */
function HomeSkeleton() {
  return (
    <div className="mx-auto max-w-md px-6 pb-36 pt-8">
      <div className="mb-6 text-center">
        <div className="mx-auto h-3 w-40 animate-pulse rounded bg-edge" />
        <div className="mx-auto mt-3 h-9 w-48 animate-pulse rounded bg-edge/80" />
      </div>
      <div className="mb-8 h-20 animate-pulse rounded-lg bg-paper-deep" />
      <div className="mb-8 h-[420px] animate-pulse rounded-xl bg-paper-deep" />
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-16 animate-pulse rounded-full bg-paper-deep" />
        ))}
      </div>
    </div>
  );
}
