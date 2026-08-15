import { useNavigate } from "react-router-dom";
import type { Look } from "@/types";
import { formatFolioDate } from "@/utils";
import { FolioText } from "@/components/ui/FolioText";
import { ClothingImage } from "@/components/ui/ClothingImage";
import { haptic } from "@/haptics";

/**
 * 搭配条目（作品卡）：日期 + 大的单品拼合 + 标题 + 手写短句
 */
export function LookEntry({
  look,
  manage = false,
  onDelete,
}: {
  look: Look;
  manage?: boolean;
  onDelete?: () => void;
}) {
  const navigate = useNavigate();
  const pieces = look.items.slice(0, 3);
  const more = look.items.length - pieces.length;

  return (
    <div className="border-b border-edge/50 py-6 last:border-0">
      <div className="flex items-baseline justify-between">
        <FolioText>{formatFolioDate(look.created_at)}</FolioText>
        {manage ? (
          <button
            onClick={onDelete}
            className="flex items-center gap-1 text-folio text-terra transition-colors hover:text-ink"
          >
            ✕ 删除
          </button>
        ) : (
          <FolioText>LOOK NO.{String(look.id).padStart(2, "0")}</FolioText>
        )}
      </div>

      {/* 大的穿搭拼合（居中） */}
      <div className="mt-5 flex items-start justify-center">
        {pieces.map((item, i) => (
          <button
            key={item.id}
            onClick={() => {
              haptic.tap();
              navigate(`/item/${item.id}`);
            }}
            className={
              i === 0
                ? "-rotate-2"
                : i === 1
                  ? "-ml-10 mt-5 rotate-1"
                  : "-ml-9 mt-10 rotate-2"
            }
          >
            <div className="bg-paper-soft p-2 shadow-plate" style={{ borderRadius: 2 }}>
              <ClothingImage item={item} className="h-36 w-28" />
            </div>
          </button>
        ))}
        {more > 0 && (
          <span className="mt-10 ml-2 font-hand text-sm text-ink-faint">+{more}</span>
        )}
      </div>

      <div className="mt-4">
        {/^LOOK\s+\d+$/i.test(look.title) ? (
          <FolioText>{look.title}</FolioText>
        ) : (
          <h3 className="font-serif text-h2 leading-tight text-ink">「{look.title}」</h3>
        )}
        {look.note && <p className="mt-1 truncate font-hand text-caption text-ink-soft">{look.note}</p>}
        {look.inspiration_id && look.inspiration_image && (
          <button
            onClick={() => navigate(`/inspiration/${look.inspiration_id}`)}
            className="mt-2 inline-flex items-center gap-1.5 text-folio text-ink-faint transition-colors hover:text-rose-deep"
          >
            <img
              src={look.inspiration_image}
              alt="inspired by"
              className="h-6 w-5 border border-edge/50 object-cover"
              style={{ borderRadius: 1 }}
            />
            INSPIRED BY
          </button>
        )}
      </div>
    </div>
  );
}
