import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { Shirt, Sparkles, User, Camera, Plus } from "lucide-react";

const TAB_ITEMS = [
  { to: "/wardrobe", label: "衣橱", icon: Shirt, state: undefined },
  { to: "/", label: "穿搭", icon: Camera, state: { scrollTo: "outfit" } },
] as const;

const SIDE_ITEMS = [
  { to: "/", label: "灵感", icon: Sparkles, state: { scrollTo: "inspiration" } },
  { to: "/", label: "我的", icon: User, state: { scrollTo: "diary" } },
] as const;

function isActive(to: string, pathname: string): boolean {
  if (to === "/") return pathname === "/";
  return pathname.startsWith(to);
}

export function TabBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const go = (item: { to: string; state?: object; label: string }) => {
    if (item.state) {
      navigate(item.to, { state: item.state });
    } else {
      navigate(item.to);
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40">
      <div className="mx-auto max-w-md px-4 pb-[max(env(safe-area-inset-bottom),14px)]">
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
          className="relative flex items-center justify-around rounded-full bg-paper-soft/90 px-2 py-2 shadow-3 backdrop-blur-md"
          style={{ border: "1px solid rgba(229,220,203,0.8)" }}
        >
          {TAB_ITEMS.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.to, pathname);
            return (
              <button
                key={tab.label}
                onClick={() => go(tab)}
                className="relative flex flex-col items-center gap-0.5 px-4 py-1"
              >
                {active && (
                  <motion.span
                    layoutId="tab-marker"
                    className="absolute -top-1 h-1 w-6 rounded-full bg-rose"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon
                  size={18}
                  strokeWidth={active ? 1.8 : 1.4}
                  className={active ? "text-ink" : "text-ink-faint"}
                />
                <span
                  className={`text-folio ${active ? "text-ink" : "text-ink-faint"}`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}

          {/* 中央 FAB：花瓣式 */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => go({ to: "/", state: { scrollTo: "outfit" }, label: "记录" })}
            className="relative -mt-10 flex h-14 w-14 items-center justify-center rounded-full bg-rose shadow-hero"
            aria-label="记录"
          >
            <span className="absolute inset-0 rounded-full bg-rose" aria-hidden />
            <motion.span
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 4 }}
              className="relative"
            >
              <Plus size={24} strokeWidth={1.8} className="text-paper-soft" />
            </motion.span>
          </motion.button>

          {SIDE_ITEMS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.label}
                onClick={() => go(tab)}
                className="flex flex-col items-center gap-0.5 px-4 py-1"
              >
                <Icon size={18} strokeWidth={1.4} className="text-ink-faint" />
                <span className="text-folio text-ink-faint">{tab.label}</span>
              </button>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
