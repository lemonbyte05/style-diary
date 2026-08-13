import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "@/api";
import type { HomeData } from "@/types";
import { formatFolioDate } from "@/utils";
import { TornDivider } from "@/components/ui/TornDivider";
import { FolioText } from "@/components/ui/FolioText";
import { ClothingImage } from "@/components/ui/ClothingImage";
import { ArchivePlate } from "@/components/ui/ArchivePlate";
import { StampSeal } from "@/components/ui/StampSeal";
import { LeafSpray } from "@/components/ui/LeafSpray";
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

      <PageColophon
        vol={masthead.vol}
        today={masthead.date}
        outfit={today_outfit}
        keywords={style_keywords}
      />
    </div>
  );
}

/* ---------- 卷首语页脚：轻量锚点，非卡片 ---------- */
function PageColophon({
  vol,
  today,
  outfit,
  keywords,
}: {
  vol: number;
  today: string;
  outfit: HomeData["today_outfit"];
  keywords: string[];
}) {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="mt-20"
    >
      <div className="editorial-rule w-full" />
      <div className="mt-5 flex items-baseline justify-between">
        <FolioText>LOOK NO.07</FolioText>
        <FolioText>{formatFolioDate(today)}</FolioText>
      </div>
      <div className="mt-1.5 flex items-baseline justify-between">
        <FolioText>
          {outfit?.weather ?? "—"} · {outfit?.occasion ?? "—"}
        </FolioText>
        <span className="font-hand text-xs text-ink-faint">
          {keywords.slice(0, 2).join(" / ")}
        </span>
      </div>
      <p className="mt-6 text-center font-hand text-sm text-ink-soft">
        下一个月，也要好好穿衣。
      </p>
      <div className="mt-8 text-center">
        <p className="font-serif text-lg text-ink-faint/70">MY STYLE DIARY</p>
        <FolioText className="mt-1.5">VOL.{vol} · 一本只属于你的时尚册</FolioText>
      </div>
    </motion.footer>
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
        <span className="flex items-center gap-4">
          <ThemeToggle />
          <FolioText>VOL.{vol}</FolioText>
        </span>
      </div>
      <h1 className="mt-5 font-serif text-display leading-[1.05] text-ink">我的衣橱</h1>
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

  return (
    <motion.section
      ref={containerRef}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: EASE }}
      className="relative scroll-mt-24 py-4"
    >
      {/* Editorial Collage：纸面拼贴，无背景色块 */}
      <div className="relative">
        {/* 极轻的植物线描点缀 */}
        <LeafSpray className="pointer-events-none absolute -left-2 top-2 h-10 w-20 text-ink-faint/40" />

        {/* 竖排卷标 */}
        <span
          className="pointer-events-none absolute inset-y-4 right-1 text-folio tracking-[0.3em] text-ink/25"
          style={{ writingMode: "vertical-rl" }}
        >
          LOOK 01 · {formatFolioDate(outfit.date)}
        </span>

        {/* 服装拼贴：主角 + 配饰 */}
        <motion.div style={{ y: plateY }} className="relative px-4 pt-10">
          <motion.button
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
            onClick={() => main && onOpen(main.id)}
            className="relative block w-[70%] -rotate-1"
          >
            <div className="washi-tape" aria-hidden />
            <div className="bg-paper-soft px-3 pb-3 pt-3" style={{ borderRadius: 2 }}>
              {main && <ClothingImage item={main} className="aspect-[3/4] w-full" />}
            </div>
            <p className="mt-2 pl-1 text-folio text-ink-soft">{main?.name}</p>
          </motion.button>

          {/* 配饰：小一号，轻微覆盖主角 */}
          <motion.button
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.32, ease: EASE }}
            onClick={() => second && onOpen(second.id)}
            className="absolute right-6 top-24 block w-[38%] rotate-2"
          >
            <div className="bg-paper-soft px-2.5 pb-2.5 pt-2.5" style={{ borderRadius: 2 }}>
              {second && <ClothingImage item={second} className="aspect-square w-full" />}
            </div>
            <p className="mt-1.5 pr-1 text-right text-folio text-ink-faint">{second?.name}</p>
          </motion.button>

          {/* 日期印章 + 手写记忆 */}
          <span className="absolute bottom-2 left-1 -rotate-6 text-folio text-rose-deep/75">
            ARCHIVE {formatFolioDate(outfit.date)}
          </span>
          <span className="absolute right-8 bottom-6 font-hand text-xs text-ink-faint">
            {outfit.mood === "🎀" ? "像一封没有寄出的信" : outfit.note}
          </span>
        </motion.div>

        {/* 编辑体标题层（浮于拼贴之下，非卡片） */}
        <motion.div style={{ y: textY }} className="relative px-1 pb-2 pt-10">
          <div className="flex items-baseline gap-2 text-folio text-ink-soft">
            <span>{outfit.weather}</span>
            <span>·</span>
            <span>{outfit.occasion}</span>
            <span className="ml-auto">{formatFolioDate(outfit.date)}</span>
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
  const navigate = useNavigate();

  const openItem = (id: number) => navigate(`/item/${id}`);

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
            <button onClick={() => main && openItem(main.id)} className="absolute left-0 top-0 w-[52%] -rotate-2">
              <div className="bg-paper-soft px-3 pb-3 pt-3 shadow-plate" style={{ borderRadius: 2 }}>
                {main && <ClothingImage item={main} className="aspect-[3/4] w-full" />}
              </div>
              {main && <p className="mt-2 pl-1 text-folio text-ink-soft">{main.name}</p>}
            </button>
            <button onClick={() => second && openItem(second.id)} className="absolute right-0 top-16 w-[40%] rotate-[1.5deg]">
              <div className="bg-paper-soft px-2.5 pb-2.5 pt-2.5 shadow-plate" style={{ borderRadius: 2 }}>
                {second && <ClothingImage item={second} className="aspect-[4/5] w-full" />}
              </div>
            </button>
            <span className="absolute bottom-0 right-1 font-hand text-[13px] text-ink-faint">curated, not random</span>
            <span className="absolute left-0 top-1 text-folio text-ink-faint/80">EDIT NO.{String(main?.id ?? 1).padStart(2, "0")}</span>
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
