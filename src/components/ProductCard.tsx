import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BadgePercent, ShieldCheck, Truck, ShoppingCart } from "lucide-react";
import type { StoreProduct } from "@/lib/store-mappers";
import { formatCurrency } from "@/lib/utils";

const ProductCard = ({ product, index = 0 }: { product: StoreProduct; index?: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="h-full"
    >
      <div className="group relative h-full flex flex-col overflow-hidden rounded-xl border border-white/5 bg-zinc-900/40 transition-all duration-300 hover:border-primary/50 hover:bg-zinc-900/80 hover:shadow-2xl hover:shadow-primary/10">
        <Link to={`/produto/${product.slug}`} className="block relative aspect-[4/5] overflow-hidden bg-zinc-950">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          {product.badge && (
            <span className="absolute left-3 top-3 rounded bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-lg">
              {product.badge}
            </span>
          )}

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-40" />

          {/* Quick Actions */}
          <div className="absolute bottom-3 left-3 right-3 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 flex gap-2">
            <span
              className="flex-1 inline-flex items-center justify-center gap-2 rounded bg-white text-black py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-white/90 transition-colors"
            >
              Ver Detalhes
            </span>
          </div>
        </Link>

        <div className="p-4 flex flex-col flex-1 justify-between">
          <div className="mb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">{product.team}</p>
            <h3 className="line-clamp-2 font-heading text-lg leading-tight text-white group-hover:text-primary/90 transition-colors">
              {product.name}
            </h3>
          </div>

          <div className="mt-2">
            <span className="text-[10px] uppercase text-muted-foreground font-medium block">A partir de</span>
            <span className="font-heading text-2xl text-white tracking-wide">{formatCurrency(product.priceMin)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
