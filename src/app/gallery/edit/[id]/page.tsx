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
  const { id } = useParams<{ id: string }>();
  const [image, setImage] = useState<ImageData | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  //const [draw, setDraw ] = useState<DrawData>(null);

  /**
   * handle stroke weight and color change
   */
  const strokeRef = useRef<number>(1);
  const colorRef = useRef<string>('0, 0, 0')

  const handleStrokeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    strokeRef.current = Number(e.target.value);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    colorRef.current = e.target.value;
  };

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
          const colorVal = p.color(colorRef.current);
          p.stroke(colorVal);
          const strokeVal = strokeRef.current;
          p.strokeWeight(strokeVal)
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
      <div className="edit-controls">
        <div className="stroke-wrap p-4">
          <label htmlFor="stroke-weight">
            Stroke Weight
            <input id="stroke-weight" name="stroke-weight" type="range" min="1" max="10" onChange={handleStrokeChange}></input>
          </label>
          <label htmlFor="color-input">
            Stroke Color
            <input id="color-input" name="color-input" type="color" defaultValue="128, 128, 255" onChange={handleColorChange}></input>
          </label>
        </div>
      </div>
    </main>
  );
}
