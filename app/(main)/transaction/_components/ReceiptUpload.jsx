"use client";

import React, { useState } from "react";
import Tesseract from "tesseract.js";

export default function ReceiptUpload({ onParsed }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detectedTotal, setDetectedTotal] = useState(""); // For user confirmation

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setDetectedTotal("");
  };

  const preprocessImage = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");

        ctx.drawImage(img, 0, 0);

        // Grayscale
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < imgData.data.length; i += 4) {
          const avg = 0.3 * imgData.data[i] + 0.59 * imgData.data[i + 1] + 0.11 * imgData.data[i + 2];
          imgData.data[i] = imgData.data[i + 1] = imgData.data[i + 2] = avg;
        }
        ctx.putImageData(imgData, 0, 0);

        // Slight contrast boost
        ctx.globalCompositeOperation = "lighter";
        ctx.drawImage(canvas, 0, 0);

        canvas.toBlob(resolve);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    try {
      const preprocessedFile = await preprocessImage(file);

      const { data } = await Tesseract.recognize(preprocessedFile, "eng", {
        tessedit_char_whitelist: "0123456789.$-/:",
      });

      const text = data.text;
      console.log("OCR Text:", text);

      const lines = text.split("\n").map(line => line.trim()).filter(Boolean);

      // Detect amount from Total line
      let amount = "";
      const totalLine = lines.find(line => /total/i.test(line));
      if (totalLine) {
        const match = totalLine.match(/\$?(\d+(?:\.\d{1,2})?)/);
        if (match) amount = match[1];
      }

      setDetectedTotal(amount || "");

    } catch (err) {
      console.error("Error scanning receipt:", err);
      alert("Failed to scan receipt. Make sure the image is clear and legible.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    // After user confirms total, parse other info
    Tesseract.recognize(file, "eng", {
      tessedit_char_whitelist: "0123456789.$-/:",
    }).then(({ data }) => {
      const text = data.text;
      const lines = text.split("\n").map(line => line.trim()).filter(Boolean);

      // Date
      let date = null;
      lines.forEach(line => {
        const match1 = line.match(/(\d{4}-\d{2}-\d{2})/);
        const match2 = line.match(/(\d{2}-\d{2}-\d{4})/);
        const match3 = line.match(/(\d{2}\/\d{2}\/\d{4})/);
        if (match1) date = match1[1];
        else if (match2) date = match2[1];
        else if (match3) date = match3[1];
      });

      // Description
      let description = lines.find(line => /[a-zA-Z]/.test(line)) || "";

      // Category
      let category = "Unknown";
      const categoryMap = {
        Grocery: ["SuperMart", "Walmart", "Grocery", "Market"],
        Food: ["Cafe", "Restaurant", "Pizza", "Burger", "Food"],
        Fuel: ["Petrol", "Gas", "Shell", "Fuel"]
      };
      for (const [cat, keywords] of Object.entries(categoryMap)) {
        if (lines.some(line => keywords.some(k => line.includes(k)))) {
          category = cat;
          break;
        }
      }

      onParsed({
        amount: parseFloat(detectedTotal),
        date: date || new Date().toISOString().split("T")[0],
        category,
        description
      });
    });
  };

  return (
    <div className="mb-4">
      <label className="block font-medium mb-1">Upload Receipt</label>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button
        type="button"
        onClick={handleUpload}
        className="mt-2 px-4 py-2 bg-green-600 text-white rounded mr-2"
        disabled={loading || !file}
      >
        {loading ? "Scanning..." : "Scan Receipt"}
      </button>

      {detectedTotal && (
        <div className="mt-4">
          <label className="block font-medium mb-1">Detected Total:</label>
          <input
            type="text"
            value={detectedTotal}
            onChange={(e) => setDetectedTotal(e.target.value)}
            className="border px-2 py-1 rounded"
          />
          <button
            type="button"
            onClick={handleConfirm}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Confirm
          </button>
        </div>
      )}
    </div>
  );
}
