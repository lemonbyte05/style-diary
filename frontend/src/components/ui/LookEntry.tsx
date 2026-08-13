import { useNavigate } from "react-router-dom";
import type { OutfitItem } from "@/types";
import { formatFolioDate } from "@/utils";
import { FolioText } from "@/components/ui/FolioText";
import { ClothingImage } from "@/components/ui/ClothingImage";
import { haptic } from "@/haptics";

/**
 * 穿搭条目（编辑体，非卡片）：日期 + 两件小版画 + 标题 + 手写短句
 */
export function LookEntry({ outfit }: { outfit: OutfitItem }) {
  const navigate = useNavigate();

  return (
    <div className="border-b border-edge/50 py-5 last:border-0">
      <div className="flex items-baseline justify-between">
        <FolioText>{formatFolioDate(outfit.date)}</FolioText>
        <FolioText>
          {outfit.weather} · {outfit.occasion}
        </FolioText>
      </div>
      <div className="mt-3 flex items-center gap-4">
        <div className="flex shrink-0 items-start">
          {outfit.items.slice(0, 2).map((item, i) => (
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
          <h3 className="font-serif text-h2 leading-tight text-ink">「{outfit.title}」</h3>
          <p className="mt-1 truncate font-hand text-caption text-ink-soft">{outfit.note}</p>
        </div>
      </div>
    </div>
  );
}
