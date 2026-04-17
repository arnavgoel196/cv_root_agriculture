import { analyzeRootImage, getDataUrlFromBytes } from "@/lib/root-analysis";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set(["image/png", "image/jpeg"]);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Please choose an image to upload." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Please upload a PNG, JPG, or JPEG image." },
        { status: 400 },
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const result = await analyzeRootImage(bytes);

    return NextResponse.json({
      filename: file.name,
      previewDataUrl: getDataUrlFromBytes(bytes, file.type || "image/jpeg"),
      ...result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong while analyzing the image.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
