import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { api } from "@/api";
import type { Item } from "@/types";
import { FolioText } from "@/components/ui/FolioText";
import { ArchivePlate } from "@/components/ui/ArchivePlate";

const CATEGORIES = ["全部", "上衣", "裙装", "外套", "配饰"];

export default function WardrobePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [category, setCategory] = useState("全部");
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.items(category).then((res) => setItems(res.items));
  }, [category]);

  const filtered = query
    ? items.filter((i) => i.name.includes(query) || i.tags.some((t) => t.includes(query)))
    : items;

  return (
    <div className="mx-auto max-w-md px-7 pb-40 pt-9">
      <motion.header
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="flex items-baseline justify-between">
          <FolioText>✦ FASHION ARCHIVE</FolioText>
          <FolioText>VOL.01</FolioText>
        </div>
        <h1 className="mt-4 font-serif text-display leading-[1.02] text-ink">WARDROBE</h1>
        <p className="mt-2 font-serif text-caption text-ink-soft">我的衣橱</p>
        <p className="mt-4 text-folio text-ink-faint">
          {items.length} PIECES / AUGUST ARCHIVE
        </p>
        <p className="mt-2 font-hand text-sm text-ink-soft">每一件，都是某一段日子的收藏。</p>
      </motion.header>

      {/* 发丝线搜索（非胶囊） */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="mt-7 flex items-center gap-2 border-b border-edge pb-2"
      >
        <Search size={14} strokeWidth={1.2} className="shrink-0 text-ink-faint" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="找一件喜欢的…"
          className="w-full bg-transparent text-body text-ink outline-none placeholder:text-ink-faint/70"
        />
      </motion.div>

      {/* 分类：细线文字链接 */}
      <div className="mt-5 flex flex-wrap items-center">
        {CATEGORIES.map((c, i) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className="flex items-center"
          >
            {i > 0 && <span className="mx-2 text-edge">·</span>}
            <span
              className={`text-caption transition-colors ${
                category === c ? "border-b border-ink text-ink" : "text-ink-faint hover:text-ink-soft"
              }`}
            >
              {c}
            </span>
          </button>
        ))}
      </div>

      <div className="editorial-rule mt-7 w-full" />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-center">
          <span className="font-serif text-3xl text-ink-faint/40">—</span>
          <p className="mt-4 font-hand text-lg text-ink-soft">还没有找到，再想想别的关键词？</p>
          <FolioText className="mt-2">OR START A NEW COLLECTION</FolioText>
        </div>
      ) : (
        <div className="mt-7 grid grid-cols-2 gap-x-5 gap-y-9">
          {renderWall(filtered, (id) => navigate(`/item/${id}`))}
        </div>
      )}
    </div>
  );
}

/* ---------- 编辑式档案墙：横向 Collection 带 + 大小错落 ---------- */
function renderWall(items: Item[], onOpen: (id: number) => void) {
  const nodes: React.ReactNode[] = [];
  for (let i = 0; i < items.length; i++) {
    if (i % 4 === 0) {
      const band = items.slice(i, i + 2);
      if (band.length === 0) continue;
      nodes.push(
        <div key={`band-${i}`} className="col-span-2">
          <div className="flex items-baseline justify-between">
            <FolioText>COLLECTION NO.{String(Math.floor(i / 4) + 1).padStart(2, "0")}</FolioText>
            <span className="font-hand text-xs text-ink-faint">顺手搭在一起的一件</span>
          </div>
          <div className="mt-3 flex gap-4">
            {band.map((item, j) => (
              <div key={item.id} className={j === 1 ? "mt-7 w-1/2" : "w-1/2"}>
                <ArchivePlate item={item} index={item.id} rotate={j === 0 ? -1.4 : 1.6} tall={false} onOpen={onOpen} />
              </div>
            ))}
          </div>
        </div>
      );
      i++;
      continue;
    }
    const mod = i % 4;
    const item = items[i];
    nodes.push(
      <div key={item.id} className={mod === 2 ? "mt-10" : ""}>
        <ArchivePlate
          item={item}
          index={i}
          rotate={mod === 1 ? -1.6 : 1.2}
          tall={mod !== 2}
          tape={i === 1 || i === 5}
          onOpen={onOpen}
        />
      </div>
    );
  }
  return nodes;
}
