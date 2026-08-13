import { motion } from "framer-motion";

/** 印章：确认/已入册动作（红章按下回弹） */
export function StampSeal({
  label = "已入册",
  show,
}: {
  label?: string;
  show: boolean;
}) {
  return (
    <motion.div
      initial={false}
      animate={show ? { opacity: 1, scale: [1.3, 0.92, 1], rotate: [0, -8, -4] } : { opacity: 0, scale: 0.6 }}
      transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
    >
      <span
        className="border-2 border-rose-deep px-4 py-2 font-hand text-xl text-rose-deep"
        style={{ borderRadius: "6px", boxShadow: "inset 0 0 0 1px rgba(176,111,96,0.2)" }}
      >
        {label}
      </span>
    </motion.div>
  );
}
