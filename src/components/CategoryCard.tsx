import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { Category } from "@/data/categories";

const CategoryCard = ({ category, index = 0 }: { category: Category; index?: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link
        to={`/produtos?cat=${category.slug}`}
        className="group relative block overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary/40"
      >
        <div className="relative aspect-square overflow-hidden">
          <img
            src={category.image}
            alt={category.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-heading text-lg text-foreground">{category.name}</h3>
            <p className="mt-0.5 text-sm font-semibold text-primary">{category.priceRange}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CategoryCard;
