/**
 * ImageGenerator Component
 * Purpose: Lets users enter a prompt, select number of images, image size, and quality, then generate and download images via the /api/generate-image endpoint.
 * How it works: Sends prompt, n, size, and quality to backend; displays image(s) or errors; offers download links.
 * Integrates visually and functionally with the app's main page.
 * Author/Model: GPT-4.1
 * Date: 2025-05-19
 *
 * To use: Import and render <ImageGenerator /> in your main page or UI.
 */

"use client";
import React, { useState } from "react";

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [n, setN] = useState(2); // default 2 images
  const [size, setSize] = useState("1024x1024");
  const [customSize, setCustomSize] = useState("");
  const [quality, setQuality] = useState("high");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<string[]>([]);

  // Sizes supported by gpt-image-1: 1024x1024, 1024x1536, 1536x1024, auto
  const presetSizes = [
    "1024x1024",
    "1024x1536",
    "1536x1024",
    "auto"
  ];

  async function handleGenerate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setImages([]);
    try {
      const chosenSize = size === "Custom" && customSize ? customSize : size;
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, n, size: chosenSize, quality })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
      // Support both url and b64_json (base64) for robustness
      const imageSources = data.data.map((img: { url?: string; b64_json?: string }) => {
        if (img.url) return img.url;
        if (img.b64_json) return `data:image/png;base64,${img.b64_json}`;
        return null;
      }).filter(Boolean);
      setImages(imageSources);
    } catch (err: unknown) {
      // Type-safe error handling for unknown type
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to generate image");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 my-8 max-w-2xl w-full mx-auto">
      <h2 className="text-xl font-bold mb-4 text-blue-700 dark:text-blue-200">Image Generator</h2>
      <form onSubmit={handleGenerate} className="flex flex-col md:flex-row md:items-end gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-1">Prompt</label>
          <textarea
            className="border rounded-md p-2 min-h-[60px] w-full text-black"
            placeholder="Describe the image you want to generate..."
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col min-w-[120px]">
          <label className="text-sm font-medium mb-1">Number of Images</label>
          <input
            type="number"
            min={1}
            max={10}
            value={n}
            onChange={e => setN(Number(e.target.value))}
            className="border rounded-md p-2 text-black"
            required
          />
        </div>
        <div className="flex flex-col min-w-[120px]">
          <label className="text-sm font-medium mb-1">Size</label>
          <select
            className="border rounded-md p-2 text-black"
            value={size}
            onChange={e => setSize(e.target.value)}
          >
            {presetSizes.map(sz => (
              <option key={sz} value={sz}>{sz}</option>
            ))}
          </select>
          <span className="text-xs text-gray-500 mt-1">Supported: 1024x1024, 1024x1536, 1536x1024, auto</span>
        </div>
        <div className="flex flex-col min-w-[120px]">
          <label className="text-sm font-medium mb-1">Quality</label>
          <select
            className="border rounded-md p-2 text-black"
            value={quality}
            onChange={e => setQuality(e.target.value)}
          >
            <option value="high">High</option>
            <option value="standard">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 min-w-[150px] mt-2 md:mt-0 self-end"
        >
          {loading ? "Generating..." : "Generate Image"}
        </button>
      </form>
      {error && <div className="text-red-500 mt-2">{error}</div>}
      {images.length === 0 && !loading && (
        <div className="text-gray-500 mt-6">No images to display. Try generating some!</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {images.map((src, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <img src={src} alt={`Generated ${idx+1}`} className="rounded shadow w-full h-auto" />
            <a href={src} download={`generated-image-${idx+1}.png`} className="mt-2 text-blue-600 underline">Download</a>
          </div>
        ))}
      </div>
    </div>
  );
}

