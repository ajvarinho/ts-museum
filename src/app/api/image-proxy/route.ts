import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing image URL" }, { status: 400 });
  }

  try {

    const res = await fetch(url);

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch image" }, { status: res.status });
    }

    const blob = await res.blob();

    console.log(blob, 'blobby')

    const response = new NextResponse(blob, {
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "image/jpeg",
        "Access-Control-Allow-Origin": "*", 
        "Cache-Control": "public, max-age=3600", 
      },
    });

    return response;
  } catch (err) {
    console.error("Proxy error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
