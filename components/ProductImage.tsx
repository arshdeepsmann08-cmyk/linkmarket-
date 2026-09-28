"use client";

const FALLBACK_IMAGE = "https://placehold.co/800x600/f1f5f9/64748b?text=No+Image";

export function ProductImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <img
      src={src || FALLBACK_IMAGE}
      alt={alt}
      className={className}
      onError={(e) => {
        const img = e.currentTarget;
        if (img.src !== FALLBACK_IMAGE) {
          img.src = FALLBACK_IMAGE;
        }
      }}
    />
  );
}

