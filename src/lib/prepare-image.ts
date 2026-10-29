"use client";

import { coloursOfPixels } from "@/lib/colours";
import type { ColourKey } from "@/lib/taxonomy";
import { FULL_MAX_PX, THUMB_MAX_PX, UPLOAD_MAX_BYTES, UPLOAD_TYPES } from "@/lib/work-form";

export type PreparedImage = { full: Blob; thumb: Blob; width: number; height: number; colours: ColourKey[]; ext: "webp" | "jpg" };

// Resizes in the browser so the original (up to 25 MB) never leaves the artist's computer. Re-encoding also
// drops camera metadata such as GPS location. WebP where the browser supports it, JPEG otherwise.
export async function prepareImage(file: File): Promise<PreparedImage> {
  if (!(UPLOAD_TYPES as readonly string[]).includes(file.type)) throw new Error("Use a JPG, PNG or WebP image.");
  if (file.size > UPLOAD_MAX_BYTES) throw new Error("The image is larger than 25 MB.");

  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("The image could not be read.");
  }
  const width = bmp.width;
  const height = bmp.height;

  const draw = (max: number) => {
    const k = Math.min(1, max / Math.max(width, height));
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(width * k));
    c.height = Math.max(1, Math.round(height * k));
    const ctx = c.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bmp, 0, 0, c.width, c.height);
    return c;
  };
  const encode = (c: HTMLCanvasElement, quality: number) =>
    new Promise<Blob>((resolve, reject) =>
      c.toBlob(
        (b) => {
          if (b && b.type === "image/webp") resolve(b);
          else c.toBlob((j) => (j ? resolve(j) : reject(new Error("The image could not be converted."))), "image/jpeg", quality);
        },
        "image/webp",
        quality,
      ),
    );

  const fullCanvas = draw(FULL_MAX_PX);
  const full = await encode(fullCanvas, 0.86);
  const thumb = await encode(draw(THUMB_MAX_PX), 0.82);

  const sample = document.createElement("canvas");
  sample.width = sample.height = 40;
  const sctx = sample.getContext("2d")!;
  sctx.drawImage(bmp, 0, 0, 40, 40);
  const colours = coloursOfPixels(sctx.getImageData(0, 0, 40, 40).data);
  bmp.close();

  return { full, thumb, width: fullCanvas.width, height: fullCanvas.height, colours, ext: full.type === "image/webp" ? "webp" : "jpg" };
}
