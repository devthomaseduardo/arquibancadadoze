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
      <div className="group glass-card relative h-full overflow-hidden rounded-2xl border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_16px_40px_rgba(123,63,242,0.28)]">
        <Link to={`/produto/${product.slug}`} className="block">
          <div className="relative aspect-[4/5] overflow-hidden bg-pitch">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            {product.badge && (
              <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase text-accent-foreground z-10">
                {product.badge}
              </span>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/35 to-transparent opacity-85" />
            <div className="absolute bottom-3 left-3 right-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="gradient-primary inline-flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold uppercase text-primary-foreground">
                <ShoppingCart className="h-4 w-4" />
                Comprar
              </span>
            </div>
          </div>
        </Link>

        <div className="p-4">
          <div className="mb-2 flex items-start justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{product.team}</p>
            <div className="flex gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
              <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
            </div>
          </div>
          <h3 className="mb-3 h-10 line-clamp-2 text-sm font-semibold uppercase tracking-tight text-white transition-colors group-hover:text-primary">
            {product.name}
          </h3>

          <div className="flex items-end justify-between border-t border-white/10 pt-3">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase text-muted-foreground">A partir de</p>
              <p className="font-heading text-3xl leading-none tracking-tight text-white">{formatCurrency(product.priceMin)}</p>
            </div>
            <span className="gradient-primary rounded-lg px-3 py-2 text-xs font-semibold text-primary-foreground">Comprar</span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-[9px] uppercase text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded border border-white/10 bg-pitch/50 px-2 py-1.5">
              <ShieldCheck className="h-3 w-3 text-primary" />
              Seguro
            </span>
            <span className="inline-flex items-center gap-1 rounded border border-white/10 bg-pitch/50 px-2 py-1.5">
              <Truck className="h-3 w-3 text-primary" />
              Brasil
            </span>
            <span className="inline-flex items-center gap-1 rounded border border-white/10 bg-pitch/50 px-2 py-1.5">
              <BadgePercent className="h-3 w-3 text-primary" />
              Oferta
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
