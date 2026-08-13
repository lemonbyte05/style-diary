import { useNavigate } from "react-router-dom";
import type { Look } from "@/types";
import { formatFolioDate } from "@/utils";
import { FolioText } from "@/components/ui/FolioText";
import { ClothingImage } from "@/components/ui/ClothingImage";
import { haptic } from "@/haptics";

/**
 * 搭配条目（编辑体，非卡片）：日期 + 版画 + 标题 + 手写短句
 */
export function LookEntry({ look }: { look: Look }) {
  const navigate = useNavigate();

  return (
    <div className="border-b border-edge/50 py-5 last:border-0">
      <div className="flex items-baseline justify-between">
        <FolioText>{formatFolioDate(look.created_at)}</FolioText>
        <FolioText>LOOK NO.{String(look.id).padStart(2, "0")}</FolioText>
      </div>
      <div className="mt-3 flex items-center gap-4">
        <div className="flex shrink-0 items-start">
          {look.items.slice(0, 2).map((item, i) => (
            <button
              key={item.id}
              onClick={() => {
                haptic.tap();
                navigate(`/item/${item.id}`);
              }}
              className={i === 0 ? "-rotate-2" : "-ml-5 mt-3 rotate-2"}
            >
              <div className="bg-paper-soft p-1.5 shadow-1" style={{ borderRadius: 2 }}>
                <ClothingImage item={item} className="h-16 w-14" />
              </div>
            </button>
          ))}
        </div>
        <div className="min-w-0">
          <h3 className="font-serif text-h2 leading-tight text-ink">「{look.title}」</h3>
          {look.note && <p className="mt-1 truncate font-hand text-caption text-ink-soft">{look.note}</p>}
        </div>
      </div>
    </div>
  );
}
