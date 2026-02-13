
import React, { useState, useEffect } from "react";
import { X, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PROMOS = [
  { id: 1, text: "🔥 Use o cupom PENABOLA10 e ganhe 10% OFF em toda a loja!" },
  { id: 2, text: "⚽ FRETE GRÁTIS acima de R$ 500! Aproveite agora!" },
];

const PromoBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PROMOS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (dismissed) return null;

  const promo = PROMOS[currentIndex];

  return (
    <div className="relative border-b border-primary/20 bg-zinc-900">
      <div className="container mx-auto flex items-center justify-center gap-2 px-4 py-2">
        <AnimatePresence mode="wait">
          <motion.p
            key={promo.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-center text-xs font-medium text-white"
          >
            <Zap className="h-3 w-3 text-primary" />
            {promo.text}
          </motion.p>
        </AnimatePresence>
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-3 text-zinc-500 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default PromoBanner;
