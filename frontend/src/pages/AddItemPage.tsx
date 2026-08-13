import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api } from "@/api";
import { FolioText } from "@/components/ui/FolioText";
import { ItemForm } from "@/components/ItemForm";
import { LeafSpray } from "@/components/ui/LeafSpray";

export default function AddItemPage() {
  const navigate = useNavigate();

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
        <FolioText>VOL.NEW</FolioText>
      </motion.header>

      <h1 className="mt-4 font-serif text-display leading-[1.02] text-ink">入册</h1>
      <p className="mt-2 font-serif text-caption text-ink-soft">把一件新衣服，收进你的收藏册</p>

      <div className="editorial-rule mt-6 w-full" />

      <ItemForm
        submitLabel="SAVE TO ARCHIVE"
        onSubmit={async (payload) => {
          const { item } = await api.itemCreate(payload);
          navigate(`/item/${item.id}`);
        }}
      />
    </div>
  );
}
