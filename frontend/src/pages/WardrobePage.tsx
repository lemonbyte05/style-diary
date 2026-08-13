import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { api } from "@/api";
import type { Item } from "@/types";
import { TornDivider } from "@/components/ui/TornDivider";
import { FolioText } from "@/components/ui/FolioText";
import { KeywordChip } from "@/components/ui/KeywordChip";
import { PolaroidCard } from "@/components/ui/PolaroidCard";

const CATEGORIES = ["全部", "上衣", "裙装", "外套", "配饰"];

export default function WardrobePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [category, setCategory] = useState("全部");
  const [query, setQuery] = useState("");

  useEffect(() => {
    api.items(category).then((res) => setItems(res.items));
  }, [category]);

  const filtered = query
    ? items.filter((i) => i.name.includes(query) || i.tags.some((t) => t.includes(query)))
    : items;

  return (
    <div className="mx-auto max-w-md px-6 pb-36 pt-8">
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative mb-5 text-center"
      >
        <span className="absolute left-0 top-1 text-folio tracking-[0.2em] text-ink-faint">
          ✦ 收藏册
        </span>
        <span className="absolute right-0 top-1 text-folio tracking-[0.2em] text-ink-faint">
          第 一 页
        </span>
        <p className="font-folio tracking-[0.3em] text-ink-faint">WARDROBE</p>
        <h1 className="mt-2 font-serif text-title text-ink">我的衣橱</h1>
        <FolioText className="mt-1 block">{items.length} 件收藏 · 都是故事</FolioText>
      </motion.header>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="mb-4 flex items-center gap-2 rounded-full bg-paper-soft px-4 py-2.5 shadow-1"
      >
        <Search size={15} strokeWidth={1.5} className="text-ink-faint" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="找一件喜欢的…"
          className="w-full bg-transparent text-body text-ink outline-none placeholder:text-ink-faint"
        />
      </motion.div>

      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map((c, i) => (
          <KeywordChip key={c} label={c} active={category === c} onClick={() => setCategory(c)} delay={i * 0.04} />
        ))}
      </div>

      <TornDivider label="收藏" note="每一件，都值得被记住" />

      {filtered.length === 0 ? (
        <div className="mt-10 flex flex-col items-center py-16 text-center">
          <span className="text-5xl">🪡</span>
          <p className="mt-4 font-hand text-lg text-ink-soft">还没有找到，再想想别的关键词？</p>
          <FolioText className="mt-2">或者，去收藏新的一件</FolioText>
        </div>
      ) : (
        <div className="columns-2 gap-4">
          {filtered.map((item, i) => (
            <div key={item.id} className="mb-4 break-inside-avoid">
              <PolaroidCard
                item={item}
                rotate={i % 3 === 0 ? -1.6 : i % 3 === 1 ? 1.3 : -0.6}
                delay={Math.min(i * 0.05, 0.4)}
                index={i}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
