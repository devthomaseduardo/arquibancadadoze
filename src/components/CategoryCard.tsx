import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { StoreCategory } from "@/lib/store-mappers";

const CategoryCard = ({ category, index = 0 }: { category: StoreCategory; index?: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link
        to={`/produtos?cat=${category.slug}`}
        className="group glass-card relative block overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(123,63,242,0.25)]"
      >
        <div className="relative aspect-[4/5] overflow-hidden">
          <img
            src={category.image}
            alt={category.name}
            className="h-full w-full object-cover grayscale transition duration-500 group-hover:scale-110 group-hover:grayscale-0"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/35 to-transparent transition-opacity duration-300 group-hover:opacity-90" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-heading text-2xl leading-none text-foreground">{category.name}</h3>
            <p className="mt-1 text-sm font-semibold text-primary">{category.priceRange}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CategoryCard;
