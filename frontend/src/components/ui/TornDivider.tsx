import { motion } from "framer-motion";

/** 撕线分隔 + Folio 章号（杂志章节元素） */
export function TornDivider({ label }: { label?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6 }}
      className="torn-divider"
      data-label={label}
    />
  );
}
