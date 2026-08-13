import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import HomePage from "@/pages/HomePage";
import WardrobePage from "@/pages/WardrobePage";
import ItemDetailPage from "@/pages/ItemDetailPage";
import LookbookPage from "@/pages/LookbookPage";
import CombinePage from "@/pages/CombinePage";
import MePage from "@/pages/MePage";
import { TabBar } from "@/components/TabBar";

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/wardrobe" element={<WardrobePage />} />
          <Route path="/lookbook" element={<LookbookPage />} />
          <Route path="/combine" element={<CombinePage />} />
          <Route path="/me" element={<MePage />} />
          <Route path="/item/:id" element={<ItemDetailPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <AnimatedRoutes />
        <TabBar />
      </div>
    </BrowserRouter>
  );
}
