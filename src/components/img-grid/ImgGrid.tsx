'use client';
import { useEffect, useState, useCallback } from "react";
import { getImageData, getRandomUnique } from "../../services/fetch";
import { ImageData } from "../../services/interfaces";
import ImgCard from "../img-card/ImgCard";
import ScrollObserver from '../scroll-observer/ScrollObserver';
//import IntersectionObserver from "../intersection-observer/IntersectionObserver";

interface GalleryGridProps {
  objectIds: number[];
}

const ImgGrid: React.FC<GalleryGridProps> = ({ objectIds }) => {

  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(false);

  const loadImages = useCallback(async () => {
    if (objectIds.length === 0 || loading) return;
    setLoading(true);
    const randomIds = getRandomUnique(objectIds, 10);
    const results = await Promise.all(randomIds.map(getImageData));
    const validImages = results.filter(
      (img): img is ImageData => img !== null
    );
    setImages((prev) => [...prev, ...validImages]);
    setLoading(false);
  }, [objectIds, loading]);

  // Initial load
  useEffect(() => {
    loadImages();
  }, [objectIds]);

  return (
    <div>
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 main-container">
        {images.map((img) => (
          <div key={img.id} className="img-wrap">
            <ImgCard key={img.id} image={img} onToggleFavorite={() => {}} />
          </div>
        ))}
      </div>

      {loading && (
        <p className="text-center py-4 opacity-50">Loading more images...</p>
      )}

      <ScrollObserver onVisible={loadImages} disabled={loading} />
    </div>
  );
};

export default ImgGrid;