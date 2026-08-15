import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";

/** 三个一级入口：衣橱（拥有）/ 搭配（创造）/ 灵感（喜欢） */
const TABS = [
  { to: "/wardrobe", label: "衣橱" },
  { to: "/lookbook", label: "搭配" },
  { to: "/inspiration", label: "灵感" },
];

function isActive(to: string, pathname: string): boolean {
  return pathname.startsWith(to);
}

export function TabBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40">
      <div className="mx-auto max-w-md">
        <motion.nav
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.55, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative flex items-center border-t border-edge/60 bg-paper/90 px-7 pb-[max(env(safe-area-inset-bottom),10px)] pt-2 backdrop-blur-sm"
        >
          {TABS.map((tab) => {
            const active = isActive(tab.to, pathname);
            return (
              <button
                key={tab.to}
                onClick={() => navigate(tab.to)}
                className="relative flex flex-1 flex-col items-center gap-1 py-1"
              >
                {active && <span className="absolute bottom-[-7px] h-[2px] w-5 bg-rose" />}
                <span
                  className={`font-serif text-[14px] tracking-[0.2em] ${
                    active ? "text-ink" : "text-ink-faint"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </motion.nav>
      </div>
    </div>
  );
}
