import { motion } from "framer-motion";
import { shade } from "@/utils";

export type GarmentShape = "top" | "dress" | "skirt" | "jacket" | "bag";

/** 时装版画轮廓（viewBox 0 0 160 200，4:5 竖版） */
const PATHS: Record<Exclude<GarmentShape, "skirt">, string> = {
  top: `
    M30 62 C38 52 52 46 64 46 L64 36 C64 30 72 28 76 32
    C80 29 88 29 92 32 C96 28 104 30 104 36 L104 46
    C116 46 130 52 138 62 L130 74 C124 80 116 78 116 72
    L116 122 C116 130 52 130 52 122 L52 72 C52 78 44 80 38 74 Z
  `,
  dress: `
    M66 28 C66 22 94 22 94 28 L92 46
    C104 58 110 78 110 100 L114 160
    C115 176 102 186 80 186 C58 186 45 176 46 160
    L50 100 C50 78 56 58 68 46 Z
  `,
  jacket: `
    M34 60 C40 50 54 44 66 44 L66 34 C66 28 76 26 80 32
    C86 26 94 28 94 34 L94 44 C106 44 120 50 126 60
    L118 74 C112 80 104 78 104 72 L104 168 C104 172 56 172 56 168
    L56 72 C56 78 48 80 42 74 Z
  `,
  bag: `
    M54 78 V58 C54 48 62 42 70 42 H90 C98 42 106 48 106 58 V78
    H114 V126 H46 V78 Z
  `,
};

const SKIRT_BODY = `
  M58 54 H102 V60 C98 96 84 128 80 160 C79 166 74 168 73 164
  C70 128 64 100 62 60 Z
`;

/** 根据品类 + 名称推断版画形状 */
export function pickShape(item: { category: string; name: string }): GarmentShape {
  const c = item.category;
  const n = item.name;
  if (c === "裙装") return n.includes("半裙") ? "skirt" : "dress";
  if (c === "外套") return "jacket";
  if (c === "配饰") return "bag";
  return "top";
}

/**
 * 服装版画：去背景"时装档案图版"
 * 服装以整块颜色悬浮于纸面之上，细线描边，底部柔和落影
 */
export function GarmentPlate({
  colorHex,
  name,
  shape,
  className = "",
  interactive = false,
}: {
  colorHex: string;
  name: string;
  shape: GarmentShape;
  className?: string;
  interactive?: boolean;
}) {
  const fill = colorHex;
  const outline = shade(colorHex, 0.78);

  const body = shape === "skirt" ? SKIRT_BODY : PATHS[shape];

  return (
    <motion.div
      whileHover={interactive ? { scale: 1.02 } : undefined}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`relative ${className}`}
      role="img"
      aria-label={name}
    >
      <svg viewBox="0 0 160 200" className="h-full w-full overflow-visible">
        {/* 落影 */}
        <ellipse cx="80" cy="196" rx={shape === "bag" ? 40 : 46} ry="4.5" fill="rgba(48,40,33,0.09)" />
        {shape === "skirt" && (
          <rect x="58" y="50" width="44" height="7" rx="2.5" fill={fill} stroke={outline} strokeWidth="1.4" strokeLinejoin="round" />
        )}
        <path
          d={body}
          fill={fill}
          stroke={outline}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        {shape === "jacket" && (
          <>
            <path d="M66 44 C60 56 57 64 57 72 M94 44 C100 56 103 64 103 72" fill="none" stroke={outline} strokeWidth="1.1" />
            <path d="M80 46 V168" stroke={outline} strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
          </>
        )}
        {shape === "top" && (
          <path d="M72 36 C74 39 86 39 88 36" fill="none" stroke={outline} strokeWidth="1.1" opacity="0.7" />
        )}
        {shape === "bag" && (
          <path d="M70 42 V32 C70 22 90 22 90 32 V42" fill="none" stroke={outline} strokeWidth="2.4" strokeLinecap="round" />
        )}
        {shape === "dress" && (
          <path d="M72 30 C76 34 84 34 88 30" fill="none" stroke={outline} strokeWidth="1.1" opacity="0.7" />
        )}
      </svg>
    </motion.div>
  );
}
