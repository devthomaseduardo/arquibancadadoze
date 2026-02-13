
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
        className="group relative block overflow-hidden rounded-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20"
      >
        <div className="relative aspect-[4/5] overflow-hidden">
          <img
            src={category.image}
            alt={category.name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-110 group-hover:rotate-1"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent transition-opacity duration-300 group-hover:opacity-80" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="font-heading text-2xl text-white transform group-hover:translate-x-1 transition-transform">{category.name}</h3>
            <p className="mt-2 text-sm font-semibold text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              Explorar Coleção
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CategoryCard;
