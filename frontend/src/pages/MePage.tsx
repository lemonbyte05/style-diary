import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { api } from "@/api";
import { FolioText } from "@/components/ui/FolioText";
import { LeafSpray } from "@/components/ui/LeafSpray";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export default function MePage() {
  const [total, setTotal] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.items().then((r) => setTotal(r.items.length)).catch(() => setTotal(0));
  }, []);

  return (
    <div className="relative mx-auto max-w-md px-7 pb-40 pt-9">
      <LeafSpray className="pointer-events-none absolute right-2 top-2 h-10 w-20 text-ink-faint/30" />

      <motion.header
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <div className="flex items-baseline justify-between">
          <FolioText>✦ PERSONAL FASHION ARCHIVE</FolioText>
          <FolioText>VOL.03</FolioText>
        </div>
        <h1 className="mt-4 font-serif text-display leading-[1.02] text-ink">MY ARCHIVE</h1>
        <p className="mt-2 font-serif text-caption text-ink-soft">我的收藏册</p>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
        className="pt-10"
      >
        <p className="font-serif text-title leading-snug text-ink">
          已收藏 {total ?? "—"} 件衣服
        </p>
        <p className="mt-3 font-hand text-caption text-ink-soft">
          这些衣服，都是你自己的收藏和记忆。
        </p>
      </motion.div>

      <div className="editorial-rule mt-8 w-full" />

      <section className="pt-8">
        <button
          onClick={() => navigate("/lookbook")}
          className="group flex w-full items-baseline justify-between"
        >
          <span className="font-serif text-h2 text-ink transition-colors group-hover:text-rose-deep">
            我的搭配 →
          </span>
          <FolioText>LOOKBOOK</FolioText>
        </button>
        <button
          onClick={() => navigate("/combine")}
          className="group mt-6 flex w-full items-baseline justify-between"
        >
          <span className="font-serif text-h2 text-ink transition-colors group-hover:text-rose-deep">
            去搭配一套 →
          </span>
          <FolioText>COMBINE</FolioText>
        </button>
      </section>

      <p className="mt-12 font-hand text-center text-sm text-ink-faint">
        MY STYLE DIARY · 一本只属于你的时尚册
      </p>
    </div>
  );
}
