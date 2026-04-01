import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, image } = body;

    if (!name || !description || !image) {
      return NextResponse.json({ error: "Missing metadata fields" }, { status: 400 });
    }

    const pinataJwt = process.env.NEXT_PINATA_JWT;
    if (!pinataJwt) {
      return NextResponse.json({ error: "Pinata credentials missing from environment" }, { status: 500 });
    }

    // 1. Upload Image to Pinata (Assuming image is a data URI data:image/png;base64,...)
    let imageIpfsUri = image;
    if (image.startsWith("data:image")) {
      const base64Data = image.split(",")[1];
      const buffer = Buffer.from(base64Data, "base64");
      const blob = new Blob([buffer], { type: "image/png" });
      
      const formData = new FormData();
      formData.append("file", blob, "mood_artwork.png");

      const imageRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${pinataJwt}`,
        },
        body: formData,
      });

      if (!imageRes.ok) {
        const errorText = await imageRes.text();
        console.error("Pinata Image Upload Error:", errorText);
        return NextResponse.json({ error: "Failed to upload image to Pinata" }, { status: 500 });
      }

      const imageData = await imageRes.json();
      imageIpfsUri = `ipfs://${imageData.IpfsHash}`;
    }

    // 2. Upload Metadata JSON to Pinata
    const jsonRes = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${pinataJwt}`,
      },
      body: JSON.stringify({
        pinataContent: {
          name,
          description,
          image: imageIpfsUri, // We set the newly created IPFS URI here
        },
        pinataMetadata: {
          name: "MoodNFT_Metadata.json",
        },
      }),
    });

    if (!jsonRes.ok) {
      const errorText = await jsonRes.text();
      console.error("Pinata Metadata Error:", errorText);
      return NextResponse.json({ error: "Failed to upload metadata to Pinata" }, { status: 500 });
    }

    const jsonData = await jsonRes.json();
    const tokenURI = `ipfs://${jsonData.IpfsHash}`;

    return NextResponse.json({ tokenURI }, { status: 200 });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
