import { useState, useEffect } from "react";
import { X, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PROMOS = [
  { id: 1, text: "🔥 Use o cupom PENABOLA10 e ganhe 10% OFF em toda a loja!", bg: "from-primary/20 to-accent/10" },
  { id: 2, text: "⚽ FRETE GRÁTIS acima de R$ 500! Aproveite agora!", bg: "from-accent/20 to-primary/10" },
  { id: 3, text: "🏆 Primeira compra? Use PRIMEIRACOMPRA e ganhe 20% OFF!", bg: "from-primary/30 to-background" },
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
    <div className={`relative border-b border-primary/20 bg-gradient-to-r ${promo.bg}`}>
      <div className="container mx-auto flex items-center justify-center gap-2 px-4 py-2.5">
        <AnimatePresence mode="wait">
          <motion.p
            key={promo.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-center text-sm font-medium text-foreground"
          >
            <Zap className="hidden h-4 w-4 text-primary sm:block" />
            {promo.text}
          </motion.p>
        </AnimatePresence>
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-3 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default PromoBanner;
