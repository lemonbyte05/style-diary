import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Camera } from "lucide-react";
import { api } from "@/api";
import type { Inspiration } from "@/types";
import { FolioText } from "@/components/ui/FolioText";
import { haptic } from "@/haptics";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;
/** 大部分 0°，仅少量轻微旋转，不循环规律 */
const rotFor = (i: number) => (i % 5 === 2 ? -1.8 : i % 5 === 4 ? 1.4 : 0);

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

  const [featured, ...rest] = list;

  return (
    <div className="mx-auto max-w-md px-7 pb-44 pt-9">
      <motion.header
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <div className="flex items-baseline justify-between">
          <FolioText>MOODBOARD</FolioText>
          <FolioText>{list.length} SAVED</FolioText>
        </div>
        <h1 className="mt-4 font-serif text-display leading-[1.02] text-ink">INSPIRATION</h1>
        <p className="mt-2 font-serif text-caption text-ink-soft">我的灵感集</p>
      </motion.header>

      {/* 轻量保存入口 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
        className="pt-7"
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
          className="group flex w-full items-baseline gap-3"
        >
          <span className="flex items-center gap-2 border-b border-ink pb-0.5 text-folio tracking-[0.16em] text-ink transition-colors group-hover:text-rose-deep">
            <Camera size={13} strokeWidth={1.2} />
            {uploading ? "保存中…" : "＋ SAVE A NEW IDEA"}
          </span>
          <span className="h-px flex-1 bg-edge/50" />
        </button>
        <p className="mt-2 font-hand text-xs text-ink-faint">看到喜欢的穿搭，先存起来。</p>
      </motion.div>

      <div className="editorial-rule mt-7 w-full" />

      {/* 灵感墙：图片为主角 */}
      <section className="pt-7">
        {list.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center py-28 text-center"
          >
            <span className="font-serif text-4xl text-ink-faint/30">✦</span>
            <p className="mt-6 font-hand text-lg text-ink-soft">灵感集还空着。</p>
            <p className="mt-2 font-hand text-sm text-ink-faint">把喜欢的穿搭、配色先存进来，不填任何字也行。</p>
          </motion.div>
        ) : (
          <>
            {/* 最新一张：hero */}
            {featured && (
              <motion.button
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: EASE }}
                onClick={() => navigate(`/inspiration/${featured.id}`)}
                className="relative block w-full"
              >
                <div className="flex justify-center border border-edge/20 bg-paper-soft" style={{ borderRadius: 2 }}>
                  <img
                    src={featured.image_url}
                    alt="latest inspiration"
                    className="max-h-[62vh] w-auto max-w-full object-contain"
                  />
                </div>
                {featured.tags.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-x-2">
                    {featured.tags.map((t) => (
                      <span key={t} className="font-hand text-[11px] text-ink-faint">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </motion.button>
            )}

            {/* 其余：masonry，多为 0° */}
            {rest.length > 0 && (
              <div className={`columns-2 gap-x-5 ${featured ? "mt-6" : ""}`}>
                {rest.map((insp, i) => {
                  const rot = rotFor(i);
                  return (
                    <motion.button
                      key={insp.id}
                      initial={{ opacity: 0, scale: 0.985 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true, margin: "-30px" }}
                      transition={{ duration: 0.5, ease: EASE }}
                      onClick={() => navigate(`/inspiration/${insp.id}`)}
                      className="mb-5 block w-full break-inside-avoid text-left"
                      style={rot ? { rotate: `${rot}deg` } : undefined}
                    >
                      <img
                        src={insp.image_url}
                        alt="inspiration"
                        loading="lazy"
                        className="w-full border border-edge/25 bg-paper-soft"
                        style={{ borderRadius: 2 }}
                      />
                      {insp.tags.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-x-2">
                          {insp.tags.map((t) => (
                            <span key={t} className="font-hand text-[10px] text-ink-faint">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
