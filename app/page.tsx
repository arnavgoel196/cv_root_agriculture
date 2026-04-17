"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";

type AnalysisResponse = {
  filename: string;
  previewDataUrl: string;
  maskDataUrl: string;
  trlMm: number;
  depthMm: number;
  tortuosity: number;
  hullAreaMm2: number;
};

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [results, setResults] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setResults(null);
    setError("");

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    if (!file) {
      setPreviewUrl("");
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      setError("Please choose an image to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);

    setIsLoading(true);
    setError("");
    setResults(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Something went wrong while analyzing the image.");
        return;
      }

      setResults(payload);
    } catch {
      setError("Unable to reach the analysis server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Computer Vision for Root Imaging</p>
        <h1>Upload a root image and get phenotyping results instantly.</h1>
        <p className="intro">
          This Next.js app applies grayscale conversion, Otsu segmentation,
          morphological cleanup, skeletonization, and convex-hull analysis to root images.
        </p>

        <form className="upload-panel" onSubmit={handleSubmit}>
          <label htmlFor="image" className="upload-label">
            Select image
          </label>
          <input
            id="image"
            name="image"
            type="file"
            accept=".png,.jpg,.jpeg"
            onChange={handleFileChange}
            required
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Analyzing..." : "Analyze Image"}
          </button>
        </form>

        {error ? <div className="message error">{error}</div> : null}
      </section>

      {previewUrl || results ? (
        <section className="results-grid">
          {previewUrl ? (
            <article className="card preview-card">
              <h2>Uploaded Image</h2>
              <p className="card-subtitle">{selectedFile?.name ?? "Selected image"}</p>
              <img src={previewUrl} alt="Uploaded root image preview" />
            </article>
          ) : null}

          {results ? (
            <>
              <article className="card preview-card">
                <h2>Detected Mask</h2>
                <p className="card-subtitle">Generated from thresholding and cleanup</p>
                <img src={results.maskDataUrl} alt="Binary mask preview" />
              </article>

              <article className="card metrics-card">
                <h2>Phenotyping Metrics</h2>
                <div className="metrics">
                  <div className="metric">
                    <span>Total Root Length</span>
                    <strong>{results.trlMm} mm</strong>
                  </div>
                  <div className="metric">
                    <span>Depth</span>
                    <strong>{results.depthMm} mm</strong>
                  </div>
                  <div className="metric">
                    <span>Tortuosity</span>
                    <strong>{results.tortuosity}</strong>
                  </div>
                  <div className="metric">
                    <span>Hull Area</span>
                    <strong>
                      {results.hullAreaMm2} mm<sup>2</sup>
                    </strong>
                  </div>
                </div>
              </article>
            </>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
