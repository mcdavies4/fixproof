"use client";

export type Shot = { blob: Blob; base64: string; preview: string };

/** Downscale a camera photo to max 1600px JPEG: keeps uploads fast and AI cheap. */
export async function compress(file: File, max = 1600, quality = 0.82): Promise<Shot> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const blob: Blob = await new Promise((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error("Image encode failed"))), "image/jpeg", quality)
  );
  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  return { blob, base64: dataUrl.split(",")[1], preview: URL.createObjectURL(blob) };
}

export async function uploadShots(
  supabase: ReturnType<typeof import("@/lib/supabase/client").createClient>,
  userId: string,
  issueId: string,
  shots: Shot[]
) {
  const paths: string[] = [];
  for (const s of shots) {
    const path = `${userId}/${issueId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    const { error } = await supabase.storage.from("evidence").upload(path, s.blob, { contentType: "image/jpeg" });
    if (error) throw error;
    paths.push(path);
  }
  return paths;
}
