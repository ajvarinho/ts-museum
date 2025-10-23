//import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import './img-card.css';

// redefining the type
interface ImageData {
  id: number;
  title: string;
  srcSmall: string;
  srcLarge?: string;
  author?: string;
  medium?: string;
}

// Props 
interface ImgCardProps {
  image: ImageData;
  onToggleFavorite: (id: number, checked: boolean) => void;
}

const FAVOURITES_STORE_KEY = 'favorite_images';

const ImgCard: React.FC<ImgCardProps> = ({ image, onToggleFavorite }) => {

  const [favorite, setFavorite] = useState([]);
  const [overlay, setOverlay] = useState(false);
  const [large, setLarge] = useState(false);
  //
  const [checked, setChecked] = useState(false);

  // open / close info overlay

  const openInfo = () => {
    setOverlay(true);
    console.log('lo overlay')
  };

  const closeInfo = () => {
    setOverlay(false);
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

  return (
    <div className="img-card">
        {overlay && 
        <div className="overlay">
          <button onClick={closeInfo}>X</button>  
          <p>{image.title}</p>
          <p>{image.author}</p>        
        </div>}

        
        <figure>
            <img
            id={image.id}
            className="img-default"
            src={image.srcSmall || FALLBACK_IMG} 
            alt={image.author + '' + image.title}
            />
            <figcaption>{image.title}</figcaption>
        </figure>
        <div className="img-menu">
            <button className="info btn" onClick={openInfo}>info</button>
            <button className="large btn">large</button>
            <div className="fav-wrap">
              <label htmlFor="save">
                Save
                <input
                  type="checkbox"
                  checked={image.favorites}
                  onChange={(e) => onToggleFavorite(image.id, e.target.checked)}
                />
              </label>
            </div>
        </div>
    </div>
  );
}

export default ImgCard;