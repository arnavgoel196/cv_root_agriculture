import sharp from "sharp";

const SCALE_FACTOR = 0.066;
const MAX_SIZE = 10 * 1024 * 1024;

type Point = {
  x: number;
  y: number;
};

type BinaryImage = {
  width: number;
  height: number;
  data: Uint8Array;
};

function clampIndex(width: number, x: number, y: number) {
  return y * width + x;
}

function grayscaleHistogram(data: Uint8Array) {
  const histogram = new Array<number>(256).fill(0);

  for (const value of data) {
    histogram[value] += 1;
  }

  return histogram;
}

function otsuThreshold(data: Uint8Array) {
  const histogram = grayscaleHistogram(data);
  const total = data.length;
  let sum = 0;

  for (let i = 0; i < histogram.length; i += 1) {
    sum += i * histogram[i];
  }

  let sumBackground = 0;
  let weightBackground = 0;
  let maxVariance = -1;
  let threshold = 0;

  for (let i = 0; i < histogram.length; i += 1) {
    weightBackground += histogram[i];
    if (weightBackground === 0) {
      continue;
    }

    const weightForeground = total - weightBackground;
    if (weightForeground === 0) {
      break;
    }

    sumBackground += i * histogram[i];

    const meanBackground = sumBackground / weightBackground;
    const meanForeground = (sum - sumBackground) / weightForeground;
    const variance =
      weightBackground * weightForeground * (meanBackground - meanForeground) ** 2;

    if (variance > maxVariance) {
      maxVariance = variance;
      threshold = i;
    }
  }

  return threshold;
}

function toBinaryImage(width: number, height: number, grayscale: Uint8Array, threshold: number): BinaryImage {
  const data = new Uint8Array(width * height);

  for (let i = 0; i < grayscale.length; i += 1) {
    data[i] = grayscale[i] > threshold ? 1 : 0;
  }

  return { width, height, data };
}

function erode(image: BinaryImage): BinaryImage {
  const { width, height, data } = image;
  const output = new Uint8Array(width * height);

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      let keep = 1;

      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (data[clampIndex(width, x + dx, y + dy)] === 0) {
            keep = 0;
          }
        }
      }

      output[clampIndex(width, x, y)] = keep;
    }
  }

  return { width, height, data: output };
}

function dilate(image: BinaryImage): BinaryImage {
  const { width, height, data } = image;
  const output = new Uint8Array(width * height);

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      let fill = 0;

      for (let dy = -1; dy <= 1 && fill === 0; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (data[clampIndex(width, x + dx, y + dy)] === 1) {
            fill = 1;
            break;
          }
        }
      }

      output[clampIndex(width, x, y)] = fill;
    }
  }

  return { width, height, data: output };
}

function morphologyOpen(image: BinaryImage): BinaryImage {
  return dilate(erode(image));
}

function transitions(pixels: number[]) {
  let count = 0;

  for (let i = 0; i < pixels.length; i += 1) {
    const current = pixels[i];
    const next = pixels[(i + 1) % pixels.length];
    if (current === 0 && next === 1) {
      count += 1;
    }
  }

  return count;
}

function getSkeleton(image: BinaryImage) {
  const { width, height } = image;
  const data = new Uint8Array(image.data);
  let hasChanges = true;

  while (hasChanges) {
    hasChanges = false;
    const firstPass: number[] = [];

    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const index = clampIndex(width, x, y);
        if (data[index] === 0) {
          continue;
        }

        const p2 = data[clampIndex(width, x, y - 1)];
        const p3 = data[clampIndex(width, x + 1, y - 1)];
        const p4 = data[clampIndex(width, x + 1, y)];
        const p5 = data[clampIndex(width, x + 1, y + 1)];
        const p6 = data[clampIndex(width, x, y + 1)];
        const p7 = data[clampIndex(width, x - 1, y + 1)];
        const p8 = data[clampIndex(width, x - 1, y)];
        const p9 = data[clampIndex(width, x - 1, y - 1)];
        const ring = [p2, p3, p4, p5, p6, p7, p8, p9];
        const sum = ring.reduce((acc, value) => acc + value, 0);
        const sequenceTransitions = transitions(ring);

        if (
          sum >= 2 &&
          sum <= 6 &&
          sequenceTransitions === 1 &&
          p2 * p4 * p6 === 0 &&
          p4 * p6 * p8 === 0
        ) {
          firstPass.push(index);
        }
      }
    }

    if (firstPass.length > 0) {
      hasChanges = true;
      for (const index of firstPass) {
        data[index] = 0;
      }
    }

    const secondPass: number[] = [];

    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const index = clampIndex(width, x, y);
        if (data[index] === 0) {
          continue;
        }

        const p2 = data[clampIndex(width, x, y - 1)];
        const p3 = data[clampIndex(width, x + 1, y - 1)];
        const p4 = data[clampIndex(width, x + 1, y)];
        const p5 = data[clampIndex(width, x + 1, y + 1)];
        const p6 = data[clampIndex(width, x, y + 1)];
        const p7 = data[clampIndex(width, x - 1, y + 1)];
        const p8 = data[clampIndex(width, x - 1, y)];
        const p9 = data[clampIndex(width, x - 1, y - 1)];
        const ring = [p2, p3, p4, p5, p6, p7, p8, p9];
        const sum = ring.reduce((acc, value) => acc + value, 0);
        const sequenceTransitions = transitions(ring);

        if (
          sum >= 2 &&
          sum <= 6 &&
          sequenceTransitions === 1 &&
          p2 * p4 * p8 === 0 &&
          p2 * p6 * p8 === 0
        ) {
          secondPass.push(index);
        }
      }
    }

    if (secondPass.length > 0) {
      hasChanges = true;
      for (const index of secondPass) {
        data[index] = 0;
      }
    }
  }

  return { width, height, data };
}

function collectPoints(image: BinaryImage) {
  const points: Point[] = [];
  const { width, height, data } = image;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[clampIndex(width, x, y)] === 1) {
        points.push({ x, y });
      }
    }
  }

  return points;
}

function cross(o: Point, a: Point, b: Point) {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

function convexHull(points: Point[]) {
  if (points.length < 3) {
    return points;
  }

  const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  const lower: Point[] = [];
  const upper: Point[] = [];

  for (const point of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) {
      lower.pop();
    }
    lower.push(point);
  }

  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    const point = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) {
      upper.pop();
    }
    upper.push(point);
  }

  lower.pop();
  upper.pop();
  return [...lower, ...upper];
}

function polygonArea(points: Point[]) {
  if (points.length < 3) {
    return 0;
  }

  let area = 0;
  for (let i = 0; i < points.length; i += 1) {
    const current = points[i];
    const next = points[(i + 1) % points.length];
    area += current.x * next.y - next.x * current.y;
  }

  return Math.abs(area) / 2;
}

function countForegroundPixels(image: BinaryImage) {
  let count = 0;

  for (const value of image.data) {
    count += value;
  }

  return count;
}

function toMaskData(image: BinaryImage) {
  const channels = new Uint8ClampedArray(image.width * image.height * 3);

  for (let i = 0; i < image.data.length; i += 1) {
    const pixelValue = image.data[i] === 1 ? 255 : 0;
    const offset = i * 3;
    channels[offset] = pixelValue;
    channels[offset + 1] = pixelValue;
    channels[offset + 2] = pixelValue;
  }

  return channels;
}

export function getDataUrlFromBytes(bytes: Buffer, mimeType: string) {
  return `data:${mimeType};base64,${bytes.toString("base64")}`;
}

export async function analyzeRootImage(imageBytes: Buffer) {
  if (imageBytes.byteLength > MAX_SIZE) {
    throw new Error("Please upload an image smaller than 10 MB.");
  }

  const { data, info } = await sharp(imageBytes)
    .greyscale()
    .blur(1.5)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const grayscale = new Uint8Array(data);
  const threshold = otsuThreshold(grayscale);
  const binary = toBinaryImage(info.width, info.height, grayscale, threshold);
  const cleaned = morphologyOpen(binary);
  const points = collectPoints(cleaned);

  if (points.length <= 3) {
    throw new Error("Not enough root structure was detected in this image to calculate metrics.");
  }

  const skeleton = getSkeleton(cleaned);
  const trlPx = countForegroundPixels(skeleton);
  const trlMm = trlPx * SCALE_FACTOR;

  const minY = Math.min(...points.map((point) => point.y));
  const maxY = Math.max(...points.map((point) => point.y));
  const depthPx = maxY - minY;
  const depthMm = depthPx * SCALE_FACTOR;
  const tortuosity = depthPx > 0 ? trlPx / depthPx : 0;

  const hull = convexHull(points);
  const areaPx2 = polygonArea(hull);
  const areaMm2 = areaPx2 * SCALE_FACTOR * SCALE_FACTOR;

  const maskBuffer = await sharp(Buffer.from(toMaskData(cleaned)), {
    raw: {
      width: cleaned.width,
      height: cleaned.height,
      channels: 3,
    },
  })
    .png()
    .toBuffer();

  return {
    trlMm: Number(trlMm.toFixed(2)),
    depthMm: Number(depthMm.toFixed(2)),
    tortuosity: Number(tortuosity.toFixed(3)),
    hullAreaMm2: Number(areaMm2.toFixed(2)),
    maskDataUrl: `data:image/png;base64,${maskBuffer.toString("base64")}`,
  };
}
