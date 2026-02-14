
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { formatCurrency } from "../lib/utils";
import { Product } from "../types";

interface ProductCardProps {
  product: Partial<Product>;
  index?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="h-full"
    >
      <div className="group relative h-full flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/80 shadow-xl shadow-black/30 transition-all duration-500 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2">
        <Link to={`/produto/${product.slug}`} className="block relative aspect-[4/5] overflow-hidden bg-zinc-800">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
          {product.badge && (
            <div className="absolute left-0 top-5 sport-skew bg-primary px-5 py-1.5 shadow-lg">
              <span className="text-[10px] font-black uppercase tracking-widest text-white italic">
                {product.badge}
              </span>
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="rounded-full bg-primary/90 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-2xl backdrop-blur-sm">
              Ver Manto
            </span>
          </div>
        </Link>

        <div className="p-5 flex flex-col flex-1 min-h-[140px]">
          <div className="mb-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">{product.team}</span>
            <h3 className="mt-1.5 font-heading text-base md:text-lg leading-tight text-white group-hover:text-primary transition-colors line-clamp-2">
              {product.name}
            </h3>
            <p className="mt-1 text-[10px] text-zinc-500 line-clamp-2">Tecido premium dry-fit • Bordados 1:1</p>
          </div>
          <div className="mt-auto border-t border-white/10 pt-4 flex items-end justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase text-zinc-500">A partir de</p>
              <p className="font-fat text-xl md:text-2xl italic tracking-tighter text-white">
                {product.priceMin ? formatCurrency(product.priceMin) : "---"}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl border-2 border-primary/50 flex items-center justify-center text-primary font-bold text-lg group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all group-hover:animate-bounce-ball">
              +
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
