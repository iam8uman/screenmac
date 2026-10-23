"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ImageSize } from "../model";
import type { ImageSource } from "../render";
import { SAMPLES, UPLOAD_PREFIX } from "../samples";

export interface LibraryImage {
  id: string;
  title: string;
  alt: string;
  image: ImageSource;
  size: ImageSize;
}

type Status = "loading" | "ready" | "error";

/** Largest edge we keep for visitor images; bigger files are scaled down locally. */
export const MAX_UPLOAD_EDGE = 6000;
export const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

function loadElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });
}

async function decodeFile(file: File): Promise<{ image: ImageSource; size: ImageSize }> {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new Error("That file isn't a PNG, JPEG, WebP, or GIF image.");
  }
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("This image couldn't be decoded. Try exporting it as PNG first.");
  }
  const longEdge = Math.max(bitmap.width, bitmap.height);
  if (longEdge <= MAX_UPLOAD_EDGE) {
    return { image: bitmap, size: { width: bitmap.width, height: bitmap.height } };
  }
  const scale = MAX_UPLOAD_EDGE / longEdge;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser could not create a drawing surface.");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return { image: canvas, size: { width: canvas.width, height: canvas.height } };
}

/**
 * Holds every image the editor can show: bundled samples plus images the
 * visitor opened. Images are decoded in the browser and never leave it.
 * Uploads stay in the library so undoing a sample switch can bring them back.
 */
export function useImageLibrary() {
  const [images, setImages] = useState<ReadonlyMap<string, LibraryImage>>(() => new Map());
  const [status, setStatus] = useState<Record<string, Status>>(() =>
    Object.fromEntries(SAMPLES.map((sample) => [sample.id, "loading" as Status])),
  );
  const uploadCount = useRef(0);

  useEffect(() => {
    let cancelled = false;
    for (const sample of SAMPLES) {
      loadElement(sample.src)
        .then((img) => {
          if (cancelled) return;
          setImages((prev) =>
            new Map(prev).set(sample.id, {
              id: sample.id,
              title: sample.title,
              alt: sample.alt,
              image: img,
              size: { width: img.naturalWidth, height: img.naturalHeight },
            }),
          );
          setStatus((s) => ({ ...s, [sample.id]: "ready" }));
        })
        .catch(() => {
          if (!cancelled) setStatus((s) => ({ ...s, [sample.id]: "error" }));
        });
    }
    return () => {
      cancelled = true;
    };
  }, []);

  const addFile = useCallback(async (file: File): Promise<LibraryImage> => {
    const { image, size } = await decodeFile(file);
    uploadCount.current += 1;
    const id = `${UPLOAD_PREFIX}${uploadCount.current}`;
    const title = file.name.replace(/\.[a-z0-9]+$/i, "") || "Your image";
    const entry: LibraryImage = { id, title, alt: `Your image: ${title}`, image, size };
    setImages((prev) => new Map(prev).set(id, entry));
    setStatus((s) => ({ ...s, [id]: "ready" }));
    return entry;
  }, []);

  return { images, status, addFile };
}
