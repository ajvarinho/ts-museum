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

interface mouseCoordinates {
  x: number;
  y: number;
}

// const width = window.innerWidth;
// const height = window.innerHeight;

export default function EditImagePage() {
  const { id } = useParams<{ id: string }>();
  const [image, setImage] = useState<ImageData | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  //const [draw, setDraw ] = useState<DrawData>(null);
  const [crop, setCrop] = useState(false);

  /**
   * handle stroke weight and color change
   */
  const strokeRef = useRef<number>(1);
  const colorRef = useRef<string>('#000000');
  const cropRef = useRef<boolean>(false);

  const handleStrokeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    strokeRef.current = Number(e.target.value);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    colorRef.current = e.target.value;
  };

  const handleCrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    cropRef.current = e.target.checked;
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
        //const coordinatesArr:object[] = [];
        // new
        const coordinatesArr: { x: number; y: number }[] = [];

        p.setup = async () => {
          //p.createCanvas(width, height);
          p.createCanvas(500, 500);
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

            console.log('coordinates check', coordinatesArr);
            //p.loadPixels(); 

          } catch (err) {
            console.error("error when loading image:", err);
          }
        };

        p.mouseDragged = () => {
          if (!img) return;

          const colorVal:string = colorRef.current;
          const activeColor = p.color(colorVal);
          p.stroke(activeColor);
          const strokeVal = strokeRef.current;
          p.strokeWeight(strokeVal)
          p.line(p.pmouseX, p.pmouseY, p.mouseX, p.mouseY);
        };

        const valsX:number[] = [];
        const valsY:number[] = [];
        const initVal: number = 0;

        p.mousePressed = () => {
          if (!img) return;

            if(cropRef.current) {
              console.log('jea')
              //if(p.mouseButton === 'LEFT') {
                console.log('px desnity', p.pixelDensity());
                console.log('ou jea')
              //p.pixelDensity(3);
                p.loadPixels();
              //let d = p.pixelDensity();
              //console.log('cek aut', d)
                const x = Math.round(p.mouseX);
                valsX.push(x);
                const y = Math.round(p.mouseY);
                valsY.push(y);
                const coordinatePair: mouseCoordinates = {
                  x: x,
                  y: y
                };
              
                coordinatesArr.push(coordinatePair);
                console.log('total', coordinatesArr)

                if(coordinatesArr.length >= 4) {
                  //p.line(x,y)

                  //
                  p.stroke(255, 0, 0);
                  p.strokeWeight(2);

                  for (let i = 0; i < coordinatesArr.length - 1; i++) {
                    const start = coordinatesArr[i];
                    const end = coordinatesArr[i + 1];
                    p.line(start.x, start.y, end.x, end.y);
                  }
                  //

  
                  // find the center of gravity for user defined shape
                  const sumX = valsX.reduce(
                    (accumulator, currentValue) => accumulator + currentValue,
                    0,
                  );

                  const sumY = valsY.reduce(
                    (accumulator, currentValue) => accumulator + currentValue,
                    10,
                  );

                  const cogX = sumX / valsX.length;
                  const cogY = sumY / valsY.length;
                  p.strokeWeight(5);
                  p.point(cogX, cogY);

                  //


                  //
                }

              // } else if (p.mouseButton === 'RIGHT') {
              //   alert('alo bre')
              // }
              
              else {
                p.text('add at least 4 points to cut ', 100, 100)
              }

            }
        }
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
          <label htmlFor="crop">
            Crop image
            <input id="crop" name="crop" type="checkbox" defaultChecked={false} onChange={handleCrop}></input>
          </label>
        </div>
      </div>
    </main>
  );
}
