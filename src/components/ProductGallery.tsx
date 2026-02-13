import { useState, useRef, MouseEvent } from "react";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
    images: string[];
    productName: string;
}

const ProductGallery = ({ images, productName }: ProductGalleryProps) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isZooming, setIsZooming] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const imageRef = useRef<HTMLImageElement>(null);

    const activeImage = images[activeIndex];

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!imageRef.current) return;
        const { left, top, width, height } = imageRef.current.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setMousePos({ x, y });
    };

    const nextImage = () => setActiveIndex((prev) => (prev + 1) % images.length);
    const prevImage = () => setActiveIndex((prev) => (prev - 1 + images.length) % images.length);

    return (
        <div className="flex flex-col gap-4">
            {/* Main Image Area */}
            <div
                className="group relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-white/5 bg-zinc-900"
                onMouseEnter={() => setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
                onMouseMove={handleMouseMove}
            >
                <img
                    ref={imageRef}
                    src={activeImage}
                    alt={`${productName} - Vista ${activeIndex + 1}`}
                    className={cn(
                        "h-full w-full object-cover transition-transform duration-200 ease-out",
                        isZooming ? "scale-150" : "scale-100"
                    )}
                    style={{
                        transformOrigin: isZooming ? `${mousePos.x}% ${mousePos.y}%` : "center center",
                    }}
                />

                {/* Navigation Arrows (visible when not zooming) */}
                {images.length > 1 && !isZooming && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); prevImage(); }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/50 p-2 text-white backdrop-blur transition-all hover:bg-black/80 hover:scale-110 opacity-0 group-hover:opacity-100"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); nextImage(); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/50 p-2 text-white backdrop-blur transition-all hover:bg-black/80 hover:scale-110 opacity-0 group-hover:opacity-100"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </>
                )}

                {/* Zoom Hint */}
                <div className="absolute bottom-4 right-4 rounded-full bg-black/60 p-2 text-white/70 backdrop-blur pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="h-4 w-4" />
                </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="grid grid-cols-5 gap-3">
                    {images.map((img, idx) => (
                        <button
                            key={`${img}-${idx}`}
                            onClick={() => setActiveIndex(idx)}
                            className={cn(
                                "relative aspect-square overflow-hidden rounded-lg border transition-all",
                                activeIndex === idx
                                    ? "border-primary ring-1 ring-primary"
                                    : "border-white/10 opacity-60 hover:opacity-100 hover:border-white/30"
                            )}
                        >
                            <img
                                src={img}
                                alt={`Thumbnail ${idx + 1}`}
                                className="h-full w-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductGallery;
