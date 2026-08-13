import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { Shirt, Sparkles, User, Plus } from "lucide-react";

interface TabItem {
  to: string;
  label: string;
  icon: typeof Shirt | null;
  textOnly: boolean;
  state?: object;
}

const LEFT_TABS: TabItem[] = [
  { to: "/wardrobe", label: "衣橱", icon: Shirt, textOnly: false },
  { to: "/", label: "LOOK", icon: null, textOnly: true, state: { scrollTo: "outfit" } },
];

const RIGHT_TABS: TabItem[] = [
  { to: "/", label: "EDIT", icon: Sparkles, textOnly: false, state: { scrollTo: "inspiration" } },
  { to: "/", label: "我的", icon: User, textOnly: false, state: { scrollTo: "diary" } },
];

function isActive(to: string, pathname: string): boolean {
  if (to === "/") return pathname === "/";
  return pathname.startsWith(to);
}

export function TabBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const go = (item: { to: string; state?: object; label: string }) => {
    if (item.state) navigate(item.to, { state: item.state });
    else navigate(item.to);
  };

  const renderItem = (tab: TabItem) => {
    const Icon = tab.icon;
    const active = isActive(tab.to, pathname);
    return (
      <button
        key={tab.label}
        onClick={() => go(tab)}
        className="relative flex flex-1 flex-col items-center gap-1 py-1"
      >
        {active && <span className="absolute bottom-[-7px] h-[2px] w-5 bg-rose" />}
        {tab.textOnly ? (
          <span className={`font-serif text-[13px] tracking-[0.2em] ${active ? "text-ink" : "text-ink-faint"}`}>
            LOOK
          </span>
        ) : (
          <>
            {Icon && <Icon size={17} strokeWidth={1.25} className={active ? "text-ink" : "text-ink-faint"} />}
            <span className={`text-folio ${active ? "text-ink" : "text-ink-faint"}`}>{tab.label}</span>
          </>
        )}
      </button>
    );
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40">
      <div className="mx-auto max-w-md">
        <motion.nav
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.55, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative flex items-center border-t border-edge/60 bg-paper/90 px-7 pb-[max(env(safe-area-inset-bottom),10px)] pt-2 backdrop-blur-sm"
        >
          {renderItem(LEFT_TABS[0])}
          {renderItem(LEFT_TABS[1])}

          {/* 中央记录：更小的点 */}
          <button
            onClick={() => go({ to: "/", state: { scrollTo: "outfit" }, label: "记录" })}
            aria-label="记录"
            className="relative -top-5 mx-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose text-paper-soft shadow-2 transition-transform hover:scale-105 active:scale-95"
          >
            <Plus size={18} strokeWidth={1.4} />
          </button>

          {RIGHT_TABS.map((t) => renderItem(t))}
        </motion.nav>
      </div>
    </div>
  );
}
