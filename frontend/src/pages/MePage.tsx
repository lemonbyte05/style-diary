import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { api } from "@/api";
import { FolioText } from "@/components/ui/FolioText";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export default function MePage() {
  const [counts, setCounts] = useState({ items: 0, looks: 0, inspirations: 0 });

  useEffect(() => {
    Promise.all([api.items(), api.looks(), api.inspirations()])
      .then(([it, lk, insp]) =>
        setCounts({ items: it.items.length, looks: lk.looks.length, inspirations: insp.inspirations.length })
      )
      .catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-md px-7 pb-40 pt-9">
      <motion.header
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <div className="flex items-baseline justify-between">
          <FolioText>MY STYLE ARCHIVE</FolioText>
          <FolioText>PERSONAL</FolioText>
        </div>
        <h1 className="mt-4 font-serif text-display leading-[1.02] text-ink">MY ARCHIVE</h1>
        <p className="mt-2 font-serif text-caption text-ink-soft">我的个人时尚档案</p>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: EASE }}
        className="pt-8"
      >
        <CountRow
          value={counts.items}
          label="衣服"
          note="我拥有的"
          to="/wardrobe"
          delay={0}
        />
        <CountRow
          value={counts.looks}
          label="搭配"
          note="我创造的"
          to="/lookbook"
          delay={0.06}
        />
        <CountRow
          value={counts.inspirations}
          label="灵感"
          note="我喜欢的"
          to="/inspiration"
          delay={0.12}
        />
      </motion.div>

      {/* 风格摘要空间（本轮仅占位，不做统计） */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: EASE }}
        className="mt-10 border-t border-edge/60 pt-6"
      >
        <FolioText>STYLE NOTES</FolioText>
        <div className="mt-4 flex flex-col items-center border border-dashed border-edge/70 py-12 text-center" style={{ borderRadius: 2 }}>
          <span className="font-serif text-2xl text-ink-faint/30">✦</span>
          <p className="mt-3 font-hand text-caption text-ink-faint">你的风格，正在慢慢成形。</p>
        </div>
      </motion.div>

      <p className="mt-14 text-center font-hand text-sm text-ink-faint">
        MY STYLE DIARY · 一本只属于你的时尚册
      </p>
    </div>
  );
}

function CountRow({
  value,
  label,
  note,
  to,
  delay,
}: {
  value: number;
  label: string;
  note: string;
  to: string;
  delay: number;
}) {
  const navigate = useNavigate();
  return (
    <motion.button
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay, ease: EASE }}
      onClick={() => navigate(to)}
      className="group flex w-full items-baseline justify-between border-b border-edge/40 py-5 text-left"
    >
      <span>
        <span className="font-serif text-[40px] leading-none text-ink">{value}</span>
        <span className="ml-3 font-serif text-h2 text-ink transition-colors group-hover:text-rose-deep">{label}</span>
      </span>
      <span className="font-hand text-xs text-ink-faint">{note}</span>
    </motion.button>
  );
}
