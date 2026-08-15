import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import WardrobePage from "@/pages/WardrobePage";
import ItemDetailPage from "@/pages/ItemDetailPage";
import LookbookPage from "@/pages/LookbookPage";
import CombinePage from "@/pages/CombinePage";
import AddItemPage from "@/pages/AddItemPage";
import EditItemPage from "@/pages/EditItemPage";
import MePage from "@/pages/MePage";
import InspirationPage from "@/pages/InspirationPage";
import InspirationDetailPage from "@/pages/InspirationDetailPage";
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
          <Route path="/" element={<Navigate to="/wardrobe" replace />} />
          <Route path="/wardrobe" element={<WardrobePage />} />
          <Route path="/inspiration" element={<InspirationPage />} />
          <Route path="/inspiration/:id" element={<InspirationDetailPage />} />
          <Route path="/lookbook" element={<LookbookPage />} />
          <Route path="/combine" element={<CombinePage />} />
          <Route path="/add" element={<AddItemPage />} />
          <Route path="/edit/:id" element={<EditItemPage />} />
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
