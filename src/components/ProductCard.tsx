
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
      <div className="group relative h-full flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-secondary/20 transition-all duration-500 hover:border-primary/50 hover:bg-secondary/40 hover:-translate-y-2">
        <Link to={`/produto/${product.slug}`} className="block relative aspect-[4/5] overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          {product.badge && (
            <div className="absolute left-0 top-6 sport-skew bg-primary px-4 py-1 shadow-lg">
              <span className="text-[10px] font-black uppercase tracking-widest text-white italic">
                {product.badge}
              </span>
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
             <div className="gradient-primary rounded-full p-4 shadow-2xl">
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Ver Manto</span>
             </div>
          </div>
        </Link>

        <div className="p-6 flex flex-col flex-1">
          <div className="mb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{product.team}</span>
            <h3 className="mt-1 font-heading text-lg leading-tight text-white group-hover:text-primary transition-colors italic">
              {product.name}
            </h3>
          </div>
          
          <div className="mt-auto border-t border-white/5 pt-4 flex items-end justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase text-muted-foreground">Performance Gear</p>
              <p className="font-fat text-2xl italic tracking-tighter text-white">
                {product.priceMin ? formatCurrency(product.priceMin) : "---"}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full border border-primary/30 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
              +
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
