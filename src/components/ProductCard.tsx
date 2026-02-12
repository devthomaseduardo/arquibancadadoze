import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BadgePercent, ShieldCheck, Truck } from "lucide-react";
import type { StoreProduct } from "@/lib/store-mappers";

const ProductCard = ({ product, index = 0 }: { product: StoreProduct; index?: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link
        to={`/produto/${product.slug}`}
        className="group block overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary/50 hover:neon-glow"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          {product.badge && (
            <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
              {product.badge}
            </span>
          )}
        </div>
        <div className="p-4">
          <p className="text-xs text-muted-foreground">{product.team}</p>
          <h3 className="mt-1 line-clamp-2 font-body text-sm font-semibold text-card-foreground">
            {product.name}
          </h3>
          <p className="mt-2 font-heading text-xl text-primary">
            R$ {product.priceMin.toFixed(2).replace(".", ",")}
          </p>
          {product.priceMax > product.priceMin && (
            <p className="mt-1 text-xs text-muted-foreground">
              Faixa: R$ {product.priceMin.toFixed(2).replace(".", ",")} a R$ {product.priceMax.toFixed(2).replace(".", ",")}
            </p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            até 3x de R$ {(product.priceMin / 3).toFixed(2).replace(".", ",")}
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1 rounded bg-secondary/70 px-2 py-1">
              <ShieldCheck className="h-3 w-3 text-primary" />
              Seguro
            </span>
            <span className="flex items-center gap-1 rounded bg-secondary/70 px-2 py-1">
              <Truck className="h-3 w-3 text-primary" />
              Brasil
            </span>
            <span className="flex items-center gap-1 rounded bg-secondary/70 px-2 py-1">
              <BadgePercent className="h-3 w-3 text-primary" />
              Oferta
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
