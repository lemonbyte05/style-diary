import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, Plus } from "lucide-react";
import { api } from "@/api";
import { CATEGORIES, type Collection, type Item } from "@/types";
import { FolioText } from "@/components/ui/FolioText";
import { ArchivePlate, type PlateVariant } from "@/components/ui/ArchivePlate";
import { ClothingImage } from "@/components/ui/ClothingImage";
import { haptic } from "@/haptics";

export default function WardrobePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [category, setCategory] = useState("全部");
  const [mode, setMode] = useState<"archive" | "index">("archive");
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionId, setCollectionId] = useState<number | null>(null);
  const [creatingCol, setCreatingCol] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [delColId, setDelColId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showColMenu, setShowColMenu] = useState(false);
  const [flashId, setFlashId] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const highlightId = (location.state as { highlightId?: number } | null)?.highlightId;

  useEffect(() => {
    if (!highlightId) return;
    setFlashId(highlightId);
    const raf = requestAnimationFrame(() => {
      document.getElementById(`plate-${highlightId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    const t = setTimeout(() => setFlashId(null), 3000);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [highlightId]);

  const loadCollections = () => {
    api.collections().then((r) => setCollections(r.collections));
  };
  useEffect(loadCollections, []);

  useEffect(() => {
    api.items({ category, collection_id: collectionId ?? undefined }).then((res) => setItems(res.items));
  }, [category, collectionId]);

  const toggleSelect = (id: number) =>
    setSelectedIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const createCollection = async () => {
    const name = newColName.trim();
    if (!name) return;
    haptic.tap();
    await api.collectionCreate(name);
    setNewColName("");
    setCreatingCol(false);
    loadCollections();
  };

  const removeCollection = async (id: number) => {
    if (delColId !== id) {
      setDelColId(id);
      setTimeout(() => setDelColId(null), 4000);
      return;
    }
    haptic.stamp();
    await api.collectionDelete(id);
    if (collectionId === id) setCollectionId(null);
    setDelColId(null);
    loadCollections();
  };

  const addSelectedToCollection = async (cid: number) => {
    haptic.stamp();
    for (const id of selectedIds) {
      await api.collectionAddItem(cid, id);
    }
    setSelectedIds([]);
    setSelecting(false);
    setShowColMenu(false);
    loadCollections();
  };

  const filtered = query
    ? items.filter((i) => i.name.includes(query) || i.tags.some((t) => t.includes(query)))
    : items;

  return (
    <div className="mx-auto max-w-md px-7 pb-44 pt-9">
      <motion.header
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="flex items-baseline justify-between">
          <FolioText>✦ FASHION ARCHIVE</FolioText>
          <div className="flex items-baseline gap-4">
            <button
              onClick={() => navigate("/add")}
              className="text-folio text-ink-faint transition-colors hover:text-rose"
            >
              ＋ 入册
            </button>
            <button
              onClick={() => {
                setSelecting((s) => !s);
                setSelectedIds([]);
                setShowColMenu(false);
              }}
              className={`text-folio transition-colors ${selecting ? "text-rose-deep" : "text-ink-faint hover:text-ink"}`}
            >
              {selecting ? "完成" : "勾选"}
            </button>
          </div>
        </div>
        <h1 className="mt-4 font-serif text-display leading-[1.02] text-ink">WARDROBE</h1>
        <p className="mt-2 font-serif text-caption text-ink-soft">我的衣橱</p>
        <div className="mt-4 flex items-center gap-4">
          <button
            onClick={() => setMode("archive")}
            className={`text-folio tracking-[0.12em] transition-colors ${
              mode === "archive" ? "border-b border-ink text-ink" : "text-ink-faint hover:text-ink-soft"
            }`}
          >
            ARCHIVE
          </button>
          <button
            onClick={() => setMode("index")}
            className={`text-folio tracking-[0.12em] transition-colors ${
              mode === "index" ? "border-b border-ink text-ink" : "text-ink-faint hover:text-ink-soft"
            }`}
          >
            INDEX
          </button>
          <span className="h-px flex-1 bg-edge/60" />
          <FolioText>{items.length} PIECES</FolioText>
        </div>
      </motion.header>

      {/* 搜索 */}
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

      {/* 品类 */}
      <div className="mt-5 flex flex-wrap items-center">
        {["全部", ...CATEGORIES].map((c, i) => (
          <button key={c} onClick={() => setCategory(c)} className="flex items-center">
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

      {/* 我的收藏夹 */}
      <div className="mt-4 flex flex-wrap items-center">
        <button
          onClick={() => setCollectionId(null)}
          className={`text-caption transition-colors ${
            collectionId === null ? "border-b border-rose-deep text-rose-deep" : "text-ink-faint hover:text-ink-soft"
          }`}
        >
          全部
        </button>
        {collections.map((c) => (
          <span key={c.id} className="flex items-center">
            <span className="mx-2 text-edge">·</span>
            <button
              onClick={() => setCollectionId(c.id)}
              className={`text-caption transition-colors ${
                collectionId === c.id ? "border-b border-rose-deep text-rose-deep" : "text-ink-faint hover:text-ink-soft"
              }`}
            >
              {c.name}
              <span className="text-ink-faint/60"> {c.count}</span>
            </button>
            {collectionId === c.id && (
              <button
                onClick={() => removeCollection(c.id)}
                className={`ml-1.5 text-caption transition-colors ${
                  delColId === c.id ? "text-terra" : "text-ink-faint/60 hover:text-terra"
                }`}
              >
                {delColId === c.id ? "确认删?" : "✕"}
              </button>
            )}
          </span>
        ))}
        {creatingCol ? (
          <span className="ml-3 flex items-center gap-1">
            <input
              autoFocus
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createCollection()}
              placeholder="收藏夹名字"
              className="w-28 border-b border-ink bg-transparent pb-0.5 text-caption text-ink outline-none placeholder:text-ink-faint/60"
            />
            <button onClick={createCollection} className="text-caption text-rose-deep">
              建
            </button>
          </span>
        ) : (
          <button
            onClick={() => setCreatingCol(true)}
            className="ml-3 flex items-center gap-0.5 text-caption text-ink-faint transition-colors hover:text-rose"
          >
            <Plus size={12} strokeWidth={1.4} /> 收藏夹
          </button>
        )}
      </div>

      <div className="editorial-rule mt-7 w-full" />

      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center py-28 text-center"
        >
          <span className="font-serif text-4xl text-ink-faint/40">—</span>
          <h2 className="mt-6 font-serif text-h2 tracking-[0.08em] text-ink">YOUR ARCHIVE IS EMPTY</h2>
          <p className="mt-3 font-hand text-lg text-ink-soft">从第一件衣服开始。</p>
          <button
            onClick={() => navigate("/add")}
            className="mt-8 flex items-center gap-2 border-b border-ink pb-1 text-folio tracking-[0.2em] text-ink transition-colors hover:text-rose-deep"
          >
            ＋ ADD YOUR FIRST PIECE
          </button>
        </motion.div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-center">
          <span className="font-serif text-3xl text-ink-faint/40">—</span>
          <p className="mt-4 font-hand text-lg text-ink-soft">没有匹配的单品。</p>
          <FolioText className="mt-2">{collectionId ? "换个收藏夹试试" : "换个分类或关键词"}</FolioText>
        </div>
      ) : (
        <>
          {mode === "index" ? (
            <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-7">
              {filtered.map((item) => {
                const on = selectedIds.includes(item.id);
                const flash = flashId === item.id;
                return (
                  <button
                    key={item.id}
                    id={`plate-${item.id}`}
                    onClick={() => (selecting ? toggleSelect(item.id) : navigate(`/item/${item.id}`))}
                    className="group flex flex-col"
                    style={{
                      outline: selecting && on ? "1px solid rgb(var(--c-rose-deep))" : undefined,
                      boxShadow: flash ? "0 0 0 3px rgb(var(--c-rose))" : undefined,
                    }}
                  >
                    <div
                      className="w-full overflow-hidden bg-paper-soft transition-all"
                      style={{
                        borderRadius: 3,
                        aspectRatio: "3/4",
                        opacity: selecting && !on ? 0.72 : 1,
                        boxShadow: "var(--sh-plate)",
                      }}
                    >
                      <ClothingImage item={item} className="h-full w-full" />
                    </div>
                    <p className="mt-1.5 truncate text-center font-serif text-[13px] text-ink">{item.name}</p>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-7 grid grid-cols-2 gap-x-5 gap-y-9">
              {renderWall(filtered, (id) => navigate(`/item/${id}`), selecting, selectedIds, toggleSelect, flashId)}
            </div>
          )}
          <motion.button
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            onClick={() => navigate("/add")}
            className="mt-8 flex w-full flex-col items-center gap-2 border border-dashed border-edge py-12 transition-colors hover:border-rose"
            style={{ borderRadius: 2 }}
          >
            <span className="font-serif text-3xl text-ink-faint/50">＋</span>
            <span className="text-folio tracking-[0.2em] text-ink-faint">入册新衣 · ADD TO ARCHIVE</span>
          </motion.button>
        </>
      )}

      {/* 勾选组合 / 加入收藏夹 */}
      {selecting && selectedIds.length > 0 && (
        <div className="fixed inset-x-0 bottom-[64px] z-30 px-7">
          <div className="relative mx-auto max-w-md">
            {showColMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-full mb-2 w-full border border-edge bg-paper-soft/95 px-5 py-3 shadow-3 backdrop-blur-sm"
              >
                <FolioText>加入收藏夹</FolioText>
                <div className="mt-2 flex flex-wrap items-center">
                  {collections.map((c, i) => (
                    <button key={c.id} onClick={() => addSelectedToCollection(c.id)} className="flex items-center">
                      {i > 0 && <span className="mx-2 text-edge">·</span>}
                      <span className="text-caption text-ink-soft transition-colors hover:text-rose-deep">{c.name}</span>
                    </button>
                  ))}
                  {collections.length === 0 && (
                    <span className="font-hand text-xs text-ink-faint">还没有收藏夹，先建一个</span>
                  )}
                </div>
              </motion.div>
            )}
            <div className="flex items-center justify-between border border-edge bg-paper-soft/95 px-5 py-3 shadow-3 backdrop-blur-sm">
              <FolioText>已选 {selectedIds.length} 件</FolioText>
              <div className="flex items-center gap-5">
                <button
                  onClick={() => setShowColMenu((v) => !v)}
                  className="text-folio text-ink-soft transition-colors hover:text-rose-deep"
                >
                  加入收藏夹
                </button>
                <button
                  onClick={() => navigate("/combine", { state: { selectedIds } })}
                  className="text-folio tracking-[0.18em] text-ink transition-colors hover:text-rose-deep"
                >
                  组合它们 →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- 编辑式档案墙 ---------- */
function renderWall(
  items: Item[],
  onOpen: (id: number) => void,
  selecting: boolean,
  selectedIds: number[],
  toggleSelect: (id: number) => void,
  flashId?: number | null
) {
  const nodes: React.ReactNode[] = [];
  for (let i = 0; i < items.length; i++) {
    if (i % 4 === 0) {
      const band = items.slice(i, i + 2);
      if (band.length === 0) continue;
      nodes.push(
        <div key={`band-${i}`} className="col-span-2">
          <div className="flex items-baseline justify-between">
            <FolioText>COLLECTION NO.{String(Math.floor(i / 4) + 1).padStart(2, "0")}</FolioText>
            <span className="font-hand text-xs text-ink-faint">并列陈列，可勾选组合</span>
          </div>
          <div className="mt-3 flex gap-4">
            {band.map((item, j) => (
              <div
                key={item.id}
                id={`plate-${item.id}`}
                className={j === 1 ? "mt-7 w-1/2" : "w-1/2"}
                style={{ boxShadow: flashId === item.id ? "0 0 0 3px rgb(var(--c-rose))" : undefined }}
              >
                <ArchivePlate
                  item={item}
                  index={item.id}
                  variant={j === 0 ? "editorial" : "archive"}
                  rotate={j === 0 ? -1.4 : 1.6}
                  tall={false}
                  onOpen={onOpen}
                  selectable={selecting}
                  selected={selectedIds.includes(item.id)}
                  onSelect={toggleSelect}
                />
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
    const variant: PlateVariant =
      mod === 2 ? "editorial" : mod === 3 ? "minimal" : "polaroid";
    nodes.push(
      <div
        key={item.id}
        id={`plate-${item.id}`}
        className={mod === 2 ? "mt-10" : ""}
        style={{ boxShadow: flashId === item.id ? "0 0 0 3px rgb(var(--c-rose))" : undefined }}
      >
        <ArchivePlate
          item={item}
          index={i}
          variant={variant}
          rotate={mod === 1 ? -1.6 : 1.2}
          tall={mod !== 2}
          tape={i === 1 || i === 5}
          onOpen={onOpen}
          selectable={selecting}
          selected={selectedIds.includes(item.id)}
          onSelect={toggleSelect}
        />
      </div>
    );
  }
  return nodes;
}
