'use client'
import '../css/app.css';
import { useState, useEffect } from "react";
import { getData } from '../services/fetch';
import Header from '../components/header/Header';
import ImgGrid from '../components/img-grid/ImgGrid'

const ImgGallery: React.FC = () => {
  // state
  const [objectIds, setObjectIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchIds = async () => {
      setLoading(true);
      const ids = await getData();
      setObjectIds(ids);
      setLoading(false);
    };
    fetchIds();
  }, []);

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

export default ImgGallery;
