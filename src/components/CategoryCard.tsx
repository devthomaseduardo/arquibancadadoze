
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Category } from "../types";

interface CategoryCardProps {
  category: Partial<Category>;
  index?: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link
        to={`/produtos?cat=${category.slug}`}
        className="group relative block overflow-hidden rounded-2xl border border-white/10 shadow-xl shadow-black/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/15 hover:border-primary/30 hover:scale-[1.02]"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-zinc-900">
          <img
            src={category.image}
            alt={category.name}
            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="font-heading text-xl md:text-2xl font-bold text-white drop-shadow-lg group-hover:text-primary transition-colors">
              {category.name}
            </h3>
            <p className="mt-2 text-xs font-bold text-primary uppercase tracking-[0.2em] opacity-90 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              Explorar coleção
              <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CategoryCard;
