'use client'
import '../css/app.css';
import { useRef, useState, useEffect } from "react";
import Header from '../components/header/Header';
import { getData, getImageData, getRandomUnique } from '../services/fetch';
import ImgGrid from '../components/img-grid/ImgGrid'

const MetGallery: React.FC = () => {
  // state
  const [objectIds, setObjectIds] = useState<number[]>([]);
  const [images, setImages] = useState<ImageData[]>([]);
  const [loadMore, setLoadMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  //for intersect laterzz
  const elementRef = useRef(null);
  const [visible, setVisible] = useState(false);



  useEffect(() => {
    const fetchIds = async () => {
      setLoading(true);
      const ids = await getData();
      setObjectIds(ids);
      setLoading(false);
    };
    fetchIds();
  }, []);

  console.log(objectIds)


  // add to favorites

  const handleToggleFavorite = (id: number, checked: boolean) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, favorites: checked } : img
      )
    );

    // find the image object
    const image = images.find((img) => img.id === id);
    if (!image) return;

    if (checked) {
      localStorage.setItem(id.toString(), JSON.stringify(image));
    } else {
      localStorage.removeItem(id.toString());
    }
  };


/**
 * Intersection observer _WIP
 * @returns 
 */

  ///
const loadMoreImages = async () => {
  if (objectIds.length === 0) return;

  setLoading(true);
  try {
    const randomIds = getRandomUnique(objectIds, 10);
    const imageResults = await Promise.all(randomIds.map((id) => getImageData(id)));

    const validImages = imageResults.filter(
      (img): img is ImageData => img !== null
    );

    setImages((prev) => [...prev, ...validImages]);
  } catch (err) {
    console.error("Error fetching next randoms:", err);
  } finally {
    setLoading(false);
  }
};
  //

  const loaderRef = useRef<HTMLDivElement | null>(null);

useEffect(() => {
  if (!loaderRef.current) return;

  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && !loading) {
        console.log("visble");
        loadMoreImages();
      } else {
        console.log('ajmo skrolaj')
      }
    },
    {
      root: null, // viewport
      rootMargin: "0px",
      threshold: 0.1, // fire when 10% of element is visible
    }
  );

  observer.observe(loaderRef.current);

  // cleanup
  return () => {
    if (loaderRef.current) observer.unobserve(loaderRef.current);
  };
}, [loaderRef.current, loading, objectIds]); // re-run if IDs or loading state change



  useEffect(() => {

  if (objectIds.length > 0) {
    const randomIds = getRandomUnique(objectIds, 10);

    const fetchImages = async () => {
      setLoading(true);
      try {
        // Fetch all 10 images in parallel
        const imageResults = await Promise.all(
          randomIds.map((id) => getImageData(id))
        );

        // Filter out null results
        const validImages = imageResults.filter(
          (img): img is ImageData => img !== null
        );

        setImages(validImages);
      } catch (err) {
        console.error("Error fetching image details:", err);
      } finally {
        setLoading(false);

      }
    };

    fetchImages();
  }
}, [objectIds]); 


  return (
    <>
      <Header isLoading={loading}></Header>

        <div>
          {loading && <p className="text-center py-8">Loading gallery...</p>}
          {!loading && objectIds.length > 0 && (
            <ImgGrid objectIds={objectIds} />
          )}
        </div>

    </>
  );
};

export default MetGallery;
