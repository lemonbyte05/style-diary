import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api } from "@/api";
import type { Collection, Item } from "@/types";
import { FolioText } from "@/components/ui/FolioText";
import { ItemForm } from "@/components/ItemForm";
import { LeafSpray } from "@/components/ui/LeafSpray";
import { haptic } from "@/haptics";

export default function EditItemPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [inCollection, setInCollection] = useState<Set<number>>(new Set());
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    api.item(id!).then((r) => {
      setItem(r.item);
      setInCollection(new Set(r.item.collections ?? []));
    });
    api.collections().then((r) => setCollections(r.collections));
  }, [id]);

  if (!item) {
    return (
      <div className="mx-auto max-w-md px-7 pb-40 pt-6">
        <div className="h-4 w-20 animate-pulse bg-edge/60" />
        <div className="mt-5 aspect-[3/4] w-[76%] animate-pulse bg-paper-deep" />
      </div>
    );
  }

  const toggleCollection = async (cid: number) => {
    const next = new Set(inCollection);
    haptic.tap();
    try {
      if (next.has(cid)) {
        next.delete(cid);
        await api.collectionRemoveItem(cid, item.id);
      } else {
        next.add(cid);
        await api.collectionAddItem(cid, item.id);
      }
      setInCollection(next);
    } catch {
      /* 保持原状 */
    }
  };

  const removeFromArchive = async () => {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 4000);
      return;
    }
    haptic.stamp();
    await api.itemDelete(item.id);
    navigate("/wardrobe");
  };

  return (
    <div className="relative mx-auto max-w-md px-7 pb-40 pt-6">
      <LeafSpray className="pointer-events-none absolute right-2 top-2 h-10 w-20 text-ink-faint/30" />

      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-2 flex items-baseline justify-between"
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-folio text-ink-faint transition-colors hover:text-ink"
        >
          <ArrowLeft size={14} strokeWidth={1.2} /> 返回
        </button>
        <FolioText>NO.{String(item.id).padStart(2, "0")} · 编辑</FolioText>
      </motion.header>

      <h1 className="mt-4 font-serif text-display leading-[1.02] text-ink">编辑</h1>
      <p className="mt-2 font-serif text-caption text-ink-soft">整理这一件的名字、故事与收藏</p>

      <div className="editorial-rule mt-6 w-full" />

      <ItemForm
        initial={{
          name: item.name,
          category: item.category,
          color_hex: item.color_hex,
          tags: item.tags,
          story: item.story,
          love_level: item.love_level,
          image_url: item.image_url ?? null,
          image_type: item.image_type ?? "photo",
          season: item.season ?? "",
          brand: item.brand ?? "",
          material: item.material ?? "",
          purchased_at: item.purchased_at ?? "",
          price: item.price ?? "",
        }}
        submitLabel="SAVE CHANGES"
        onSubmit={async (payload) => {
          await api.itemUpdate(item.id, payload);
          navigate(`/item/${item.id}`);
        }}
      />

      {/* 收藏夹归属 */}
      <section className="mt-10">
        <div className="flex items-baseline gap-3">
          <FolioText>所属收藏夹</FolioText>
          <span className="h-px flex-1 bg-edge/60" />
        </div>
        {collections.length === 0 ? (
          <p className="mt-3 font-hand text-caption text-ink-faint">还没有收藏夹，去衣橱页新建一个。</p>
        ) : (
          <div className="mt-3 flex flex-wrap items-center">
            {collections.map((c, i) => {
              const on = inCollection.has(c.id);
              return (
                <button key={c.id} onClick={() => toggleCollection(c.id)} className="flex items-center">
                  {i > 0 && <span className="mx-2 text-edge">·</span>}
                  <span
                    className={`text-caption transition-colors ${
                      on ? "border-b border-rose-deep text-rose-deep" : "text-ink-faint hover:text-ink-soft"
                    }`}
                  >
                    {c.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* 移出衣橱 */}
      <div className="mt-12 border-t border-edge/60 pt-6">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={removeFromArchive}
          className={`text-folio tracking-[0.18em] transition-colors ${
            confirming ? "text-terra" : "text-ink-faint hover:text-terra"
          }`}
        >
          {confirming ? "再次点击确认移出衣橱" : "移出衣橱"}
        </motion.button>
        <p className="mt-2 font-hand text-xs text-ink-faint">
          移出后，它也会从所有搭配里取下。
        </p>
      </div>
    </div>
  );
}
