import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Camera } from "lucide-react";
import { api } from "@/api";
import type { Inspiration } from "@/types";
import { FolioText } from "@/components/ui/FolioText";
import { LeafSpray } from "@/components/ui/LeafSpray";
import { haptic } from "@/haptics";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;
const WALL_ROT = [-1.2, 1.1, -1.7, 1.4, -0.9, 1.6];

export default function InspirationPage() {
  const [list, setList] = useState<Inspiration[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const load = () => {
    api.inspirations().then((r) => setList(r.inspirations)).catch(() => setList([]));
  };
  useEffect(load, []);

  const add = async (file: File | undefined) => {
    if (!file) return;
    haptic.tap();
    setUploading(true);
    try {
      const { url } = await api.inspirationUpload(file);
      await api.inspirationCreate({ image_url: url, tags: [] });
      load();
    } catch {
      /* 保持原状 */
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-7 pb-44 pt-9">
      <LeafSpray className="pointer-events-none absolute right-2 top-2 h-10 w-20 text-ink-faint/30" />

      <motion.header
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <div className="flex items-baseline justify-between">
          <FolioText>✦ MOODBOARD</FolioText>
          <FolioText>{list.length} SAVED</FolioText>
        </div>
        <h1 className="mt-4 font-serif text-display leading-[1.02] text-ink">INSPIRATION</h1>
        <p className="mt-2 font-serif text-caption text-ink-soft">我的灵感集</p>
      </motion.header>

      <div className="editorial-rule mt-6 w-full" />

      {/* 保存灵感（上传即存） */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
        className="pt-6"
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => add(e.target.files?.[0])}
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="flex w-full flex-col items-center gap-2 border-2 border-dashed border-edge/80 bg-paper-soft/40 py-7 transition-colors hover:border-rose"
          style={{ borderRadius: 4 }}
        >
          <Camera size={24} strokeWidth={1.1} className="text-ink-faint" />
          <span className="font-serif text-h2 text-ink">{uploading ? "保存中…" : "＋ ADD INSPIRATION"}</span>
          <span className="font-hand text-caption text-ink-faint">看到喜欢的穿搭，先存起来，以后整理</span>
        </button>
      </motion.section>

      {/* 灵感墙：editorial moodboard（图片为主角） */}
      <section className="pt-8">
        {list.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center py-24 text-center"
          >
            <span className="font-serif text-4xl text-ink-faint/40">✦</span>
            <p className="mt-6 font-hand text-lg text-ink-soft">灵感集还空着。</p>
            <p className="mt-2 font-hand text-sm text-ink-faint">把喜欢的穿搭、配色先存进来，不填任何字也行。</p>
          </motion.div>
        ) : (
          <div className="columns-2 gap-x-5">
            {list.map((insp, i) => (
              <motion.button
                key={insp.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.45, ease: EASE }}
                onClick={() => navigate(`/inspiration/${insp.id}`)}
                className="mb-5 block w-full break-inside-avoid text-left"
                style={{ rotate: `${WALL_ROT[i % WALL_ROT.length]}deg` }}
              >
                <img
                  src={insp.image_url}
                  alt="inspiration"
                  loading="lazy"
                  className="w-full border border-edge/40 bg-paper-soft"
                  style={{ borderRadius: 2 }}
                />
                {insp.tags.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-x-2">
                    {insp.tags.map((t) => (
                      <span key={t} className="font-hand text-[11px] text-ink-faint">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
