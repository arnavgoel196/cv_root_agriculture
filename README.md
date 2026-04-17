# Root Phenotyping Web App

This project now includes a Next.js version of the root phenotyping website so it is easier to host on platforms like Vercel.

## What it does

- Uploads a `.png`, `.jpg`, or `.jpeg` image
- Converts it to grayscale and applies blur
- Uses Otsu thresholding to build a binary mask
- Cleans the mask with a 3x3 morphological opening
- Skeletonizes the root structure to estimate total root length
- Calculates depth, tortuosity, and convex hull area
- Shows the uploaded image and generated mask in the browser

## Run the Next.js app locally

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open `http://localhost:3000`.

## Deploy online

The easiest hosting option is Vercel:

1. Push the repo to GitHub.
2. Import the repo into Vercel.
3. Deploy with the default Next.js settings.

## Notes

- The Next.js UI lives in [app/page.tsx](/d:/ugp/app/page.tsx).
- The analysis API route lives in [app/api/analyze/route.ts](/d:/ugp/app/api/analyze/route.ts).
- The root analysis logic lives in [lib/root-analysis.ts](/d:/ugp/lib/root-analysis.ts).
- The original Flask files are still present for reference until you choose to remove them.
