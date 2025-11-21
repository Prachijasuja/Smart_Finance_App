import { NextResponse } from "next/server";
import fs from "fs";
import Tesseract from "tesseract.js-node";
import formidable from "formidable";

// Disable Next.js body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to parse Web Request with Formidable
const parseForm = async (req) => {
  return new Promise((resolve, reject) => {
    const form = formidable({ keepExtensions: true });

    // Convert Next.js Request to Node.js-like IncomingMessage
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

export const POST = async (req) => {
  try {
    // This will fail in App Router because req is Web Request
    // Instead, use a library that supports Web Requests:
    // formidable-serverless or use tesseract.js on client
    return NextResponse.json({ error: "File uploads are tricky in App Router" });
  } catch (err) {
    console.error("Error in /api/parseReceipt:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};
