'use client'

import { useRef, useState, useEffect } from "react";
//import Image from "next/image";
import ImgCard from '../../components/ImgCard';
import Link from 'next/link';
interface ImageData {
  id: number;
  title: string;
  srcSmall: string;
  srcLarge?: string;
  author?: string;
  medium?: string;
  favorites: boolean;
}

const Gallery: React.FC = () => {

  const [favorites, setFavorites] = useState<ImageData[]>([]);

  const getFavorites = ():ImageData[] => {
    const savedImg:[] = [];
    Object.keys(localStorage).forEach((key) => {
    const item: string | null = localStorage.getItem(key);
    if (item) {
    console.log(item);
      savedImg.push(JSON.parse(item));
    }
  });
    return savedImg;
  } 

  useEffect(() => {
    const stored = getFavorites();
    setFavorites(stored);
  }, []);


  return (
    <>
      <main>
        <div className={'columns-2 md:columns-3 lg:columns-4 gap-4 main-container'}>
            <p>alo</p>
            {favorites.map((img, index) => (

            <div key={index} className="img-wrap">   
              <img key={img.id} src={img.srcSmall}/>
              <Link href={`/gallery/edit/${img.id}`}>
                <button>Edit</button>
              </Link>
            </div>
          ))}
        </div>
      </main>
    </>
  );
};

export default Gallery;