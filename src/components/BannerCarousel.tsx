import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type BannerCarouselProps = {
  images: Array<{ src: string; alt: string }>;
  intervalMs?: number;
  className?: string;
  imgClassName?: string;
  aspectClassName?: string;
  showArrows?: boolean;
};

const BannerCarousel = ({
  images,
  intervalMs = 4500,
  className = "",
  imgClassName = "h-full w-full object-cover",
  aspectClassName = "aspect-[3/2]",
  showArrows = true,
}: BannerCarouselProps) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [images.length, intervalMs]);

  if (images.length === 0) return null;

  return (
    <div className={`relative overflow-hidden ${aspectClassName} ${className}`}>
      {images.map((image, i) => (
        <img
          key={image.src}
          src={image.src}
          alt={image.alt}
          className={`${imgClassName} absolute inset-0 transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      {showArrows && images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Banner anterior"
            onClick={() => setIndex((prev) => (prev - 1 + images.length) % images.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-black/30 p-2 text-white backdrop-blur transition hover:bg-black/60"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Próximo banner"
            onClick={() => setIndex((prev) => (prev + 1) % images.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-black/30 p-2 text-white backdrop-blur transition hover:bg-black/60"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-black/35 px-3 py-1 backdrop-blur">
          {images.map((_, i) => (
            <button
              type="button"
              key={i}
              onClick={() => setIndex(i)}
              className={`h-2 w-2 rounded-full transition-all ${i === index ? "w-6 bg-primary" : "bg-white/70"}`}
              aria-label={`Ir para banner ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerCarousel;
