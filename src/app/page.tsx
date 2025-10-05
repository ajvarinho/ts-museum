'use client'
import '../css/app.css';
import { useRef, useState, useEffect } from "react";
//import Image from "next/image";
import Header from '../components/Header';
import ImgCard from '../components/ImgCard';
import fallbackImg from '../assets/not-found.jpg';



//Define API response types

// Response from first fetch - object IDs
interface SearchAPIResponse {
  total: number;
  objectIDs: number[] | null;
}

// Response from second fetch - specific image (/objects/:id)
interface imgResponse {
  objectID: number;
  title?: string;
  primaryImage?: string;
  primaryImageSmall?: string;
  artistDisplayName?: string;
  medium?: string;
  dimensions?: string;
}

// Data format - image type fetched and saved
interface ImageData {
  id: number;
  title: string;
  srcSmall: string;
  srcLarge?: string;
  author?: string;
  medium?: string;
  favorites: boolean;
}

interface entry {
  isIntersecting: boolean;
}

const API_URL =
'https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q="painting"';
const FALLBACK_IMG = fallbackImg.src;

/////

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



  /**
   * Helper function to get randon unique IDs from fetched array
   * @param arr 
   * @param count 
   * @returns 
   */
  const getRandomUnique = (arr: number[], count: number): number[] => {
    const result: number[] = [];
    const used = new Set<number>();

    while (result.length < count && result.length < arr.length) {
      const randomIndex = Math.floor(Math.random() * arr.length);
      const num = arr[randomIndex];
      if (!used.has(num)) {
        used.add(num);
        result.push(num);
      }
    }
    return result;
  };

  /**
   * Function to fetch image data using specific ID
   * @param id 
   * @returns image
   */
  const getImageData = async (id: number): Promise<ImageData | null> => {
    try {
      const res = await fetch(
        `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`
      );
      const data: imgResponse = await res.json();

      // helper to check if data.primaryImage is empty string
      const hasValidImage =
      data.primaryImageSmall && data.primaryImageSmall.trim() !== "";

      const image: ImageData = {
        id: data.objectID,
        title: data.title || "Image not found",
        srcSmall: hasValidImage ? data.primaryImageSmall : FALLBACK_IMG,
        srcLarge: data.primaryImage || undefined,
        author: data.artistDisplayName || undefined,
        medium: data.medium || undefined,
        favorites: false,
      };
      console.log('image in get image data', image)
      return image;
    } catch (err) {
      console.error("Error fetching image:", err);
      return null;
    }
  };

  /**
   * Function to fetch all initial IDs from API rute
   */
  const getData = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data: SearchAPIResponse = await res.json();
      setObjectIds(data.objectIDs || []); 
    } catch (err) {
      console.error("Error fetching data:", err);
    }
    setLoading(false);
  };

  // Use IDs to load 10 random images
  const loadImages = async (): Promise<void> => {
    setLoaded(false);
    if (objectIds.length === 0) return;
    const randomIds = getRandomUnique(objectIds, 10);
    const results = await Promise.all(randomIds.map(getImageData));
    console.log('results from loadImages', results)
    const validImages = results.filter(
      (img): img is ImageData => img !== null
    );
    setImages((prev) => [...prev, ...validImages]);
    setLoaded(true);
  };

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


  // intersection observer

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

    // 👇 Append new images to the existing ones
    setImages((prev) => [...prev, ...validImages]);
  } catch (err) {
    console.error("Error fetching next batch:", err);
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
        console.log("🔍 Watcher visible — loading next batch...");
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


  //

  // -----------------
  // Step 5: Lifecycle
  // -----------------
  // Run once when component mounts
  useEffect(() => {
    getData();
  }, []);


  useEffect(() => {
  // 2. When objectIds are loaded, fetch details for 10 random IDs
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
}, [objectIds]); // 👈 run whenever objectIds change

//

useEffect(() => {
  const saved: ImageData[] = [];

  Object.keys(localStorage).forEach((key) => {
    const item = localStorage.getItem(key);
    if (item) {
      saved.push(JSON.parse(item));
    }
  });

  if (saved.length > 0) {
    setImages(saved);
  }
}, []);

  // -----------------
  // Step 6: UI
  // -----------------
  return (
    <>
      <Header isLoading={loading}></Header>
      <img src={fallbackImg} alt="test" width="200" />
      <main>
        {/* // + (loading ? '' : ' loaded') */}
        <div className={'columns-2 md:columns-3 lg:columns-4 gap-4 main-container'}>
          {images.map((img, index) => (

            <div key={index} className="img-wrap">   
              <ImgCard key={img.id} image={img} onToggleFavorite={handleToggleFavorite}/>
            </div>
          ))}

          {loading && <div>
            <div className="animation-wrap">

            </div>
          </div>}
        </div>
      </main>
      <div className="intersection" ref={loaderRef}></div>
    </>
  );
};

export default MetGallery;
