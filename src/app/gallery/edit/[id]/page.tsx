"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import type p5 from "p5";

interface ImageData {
  id: number;
  title: string;
  srcSmall: string;
  srcLarge?: string;
  author?: string;
  medium?: string;
  favorites: boolean;
}

export default function EditImagePage() {
  const { id } = useParams<{ id: string }>(); // 1️⃣ route param
  const [image, setImage] = useState<ImageData | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);

  /**
   * get image from localStorage
   */
  useEffect(() => {
    if (!id) return;

    const storedItem = localStorage.getItem(id);
    if (storedItem) {
      const parsed = JSON.parse(storedItem) as ImageData;
      setImage(parsed);
    } 
  }, [id]);

  /**
   * if image is ready, set up p5
   */

  useEffect(() => {
    if (!image) return;

    const loadP5 = async () => {

      //set up p5
      const p5module = await import("p5");
      const p5constructor = p5module.default;
      // get proxy img
      const proxiedUrl = `/api/image-proxy?url=${encodeURIComponent(image.srcSmall)}`;

      // 5️⃣ Define p5 sketch using async/await (modern approach)
      const sketch = (p: p5) => {
        let img: p5.Image | null = null;

        p.setup = async () => {
          p.createCanvas(600, 400);
          p.background(240);

          try {
            img = await new Promise<p5.Image>((resolve, reject) => {
              p.loadImage(
                proxiedUrl,
                (loadedImg) => resolve(loadedImg),
                (err) => reject(err)
              );
            });

            p.image(img, 0, 0, p.width, p.height);
          } catch (err) {
            console.error("error when loading image:", err);
          }
        };

        p.mouseDragged = () => {
          if (!img) return;
          p.stroke(255, 0, 0);
          p.strokeWeight(5);
          p.line(p.pmouseX, p.pmouseY, p.mouseX, p.mouseY);
        };
      };

      if (mountRef.current) {
        new p5constructor(sketch, mountRef.current);
      }
    };

    loadP5();
  }, [image]);

  return (
    <main className="p-4">
      <h1 className="text-xl font-semibold mb-4">Edit Image #{id}</h1>
      <div ref={mountRef}></div>
    </main>
  );
}
