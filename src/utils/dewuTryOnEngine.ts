import cashmereCoatImg from '../assets/images/cashmere_coat_pure_1789983734738.jpg';
import silkShirtImg from '../assets/images/silk_shirt_pure_1789983755888.jpg';
import woolTrousersImg from '../assets/images/wool_trousers_pure_1789983806824.jpg';
import knitDressImg from '../assets/images/knit_dress_pure_1789983773041.jpg';
import techJacketImg from '../assets/images/tech_jacket_pure_1789983785361.jpg';

export interface GarmentAssetConfig {
  id: string;
  name: string;
  category: 'outerwear' | 'top' | 'bottom' | 'dress';
  studioImage: string;
  defaultScale: number;
  defaultOffsetY: number; // percentage of canvas height
  defaultOffsetX: number; // percentage of canvas width
  targetBodyPart: 'shoulders' | 'legs' | 'fullbody';
  fabricType: 'cashmere' | 'silk' | 'wool' | 'knit' | 'technical';
  colorTone: string;
}

export const STUDIO_GARMENT_MAP: Record<string, GarmentAssetConfig> = {
  c1: {
    id: 'c1',
    name: '雾霭蓝法式西装羊绒大衣',
    category: 'outerwear',
    studioImage: cashmereCoatImg,
    defaultScale: 1.0,
    defaultOffsetY: 0.21,
    defaultOffsetX: 0,
    targetBodyPart: 'fullbody',
    fabricType: 'cashmere',
    colorTone: '#688296',
  },
  c2: {
    id: 'c2',
    name: '重磅真丝光泽感垂坠衬衫',
    category: 'top',
    studioImage: silkShirtImg,
    defaultScale: 1.0,
    defaultOffsetY: 0.225,
    defaultOffsetX: 0,
    targetBodyPart: 'shoulders',
    fabricType: 'silk',
    colorTone: '#F5F5F7',
  },
  c3: {
    id: 'c3',
    name: '高腰压褶高定羊毛阔腿西裤',
    category: 'bottom',
    studioImage: woolTrousersImg,
    defaultScale: 1.0,
    defaultOffsetY: 0.485,
    defaultOffsetX: 0,
    targetBodyPart: 'legs',
    fabricType: 'wool',
    colorTone: '#2B2C2D',
  },
  c4: {
    id: 'c4',
    name: '优雅斜裁立体收腰针织长裙',
    category: 'dress',
    studioImage: knitDressImg,
    defaultScale: 1.0,
    defaultOffsetY: 0.22,
    defaultOffsetX: 0,
    targetBodyPart: 'fullbody',
    fabricType: 'knit',
    colorTone: '#631826',
  },
  c5: {
    id: 'c5',
    name: '山系机能防风防雨立体夹克',
    category: 'outerwear',
    studioImage: techJacketImg,
    defaultScale: 1.0,
    defaultOffsetY: 0.22,
    defaultOffsetX: 0,
    targetBodyPart: 'shoulders',
    fabricType: 'technical',
    colorTone: '#4A4D50',
  },
  c6: {
    id: 'c6',
    name: '精梳美利奴羊毛经典半高领衫',
    category: 'top',
    studioImage: silkShirtImg,
    defaultScale: 1.0,
    defaultOffsetY: 0.225,
    defaultOffsetX: 0,
    targetBodyPart: 'shoulders',
    fabricType: 'wool',
    colorTone: '#1F2937',
  },
};

export interface ProcessedGarmentResult {
  canvas: HTMLCanvasElement; // Trimmed transparent canvas
  width: number;
  height: number;
  category: 'outerwear' | 'top' | 'bottom' | 'dress';
  targetBodyPart: 'shoulders' | 'legs' | 'fullbody';
}

// In-memory cache for processed trimmed alpha garment canvases
const trimmedGarmentCache = new Map<string, ProcessedGarmentResult>();

/**
 * Boundary-connected flood-fill background removal + auto content-trimming:
 * 1. Traverses inward from the 4 image borders, turning white studio background transparent.
 * 2. Scans for the tight bounding box [minX, minY, maxX, maxY] of the garment.
 * 3. Trims away all empty margin so the top of the canvas is the real collar/waistband,
 *    and the width exactly corresponds to the shoulder span or leg span.
 */
export async function getTransparentGarmentCanvas(
  config: GarmentAssetConfig
): Promise<ProcessedGarmentResult> {
  const cacheKey = `${config.id}_trimmed_v4`;
  if (trimmedGarmentCache.has(cacheKey)) {
    return trimmedGarmentCache.get(cacheKey)!;
  }

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = config.studioImage;

  await new Promise<void>((resolve, reject) => {
    if (img.complete) resolve();
    else {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load ${config.studioImage}`));
    }
  });

  const width = img.naturalWidth || 800;
  const height = img.naturalHeight || 800;

  const rawCanvas = document.createElement('canvas');
  rawCanvas.width = width;
  rawCanvas.height = height;
  const rawCtx = rawCanvas.getContext('2d', { willReadFrequently: true });
  if (!rawCtx) {
    const fallback: ProcessedGarmentResult = {
      canvas: rawCanvas,
      width,
      height,
      category: config.category,
      targetBodyPart: config.targetBodyPart,
    };
    return fallback;
  }

  rawCtx.drawImage(img, 0, 0, width, height);

  const imgData = rawCtx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Queue-based boundary flood fill
  const visited = new Uint8Array(width * height);
  const queue: number[] = [];

  const isWhiteBg = (x: number, y: number): boolean => {
    const idx = (y * width + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const maxVal = Math.max(r, g, b);
    const minVal = Math.min(r, g, b);
    const diff = maxVal - minVal;
    // Studio white background threshold
    return r > 224 && g > 224 && b > 224 && diff < 22;
  };

  // Seed with all 4 borders
  for (let x = 0; x < width; x++) {
    if (isWhiteBg(x, 0)) {
      queue.push(x, 0);
      visited[x] = 1;
    }
    const bottomIdx = (height - 1) * width + x;
    if (isWhiteBg(x, height - 1)) {
      queue.push(x, height - 1);
      visited[bottomIdx] = 1;
    }
  }

  for (let y = 0; y < height; y++) {
    const leftIdx = y * width;
    if (!visited[leftIdx] && isWhiteBg(0, y)) {
      queue.push(0, y);
      visited[leftIdx] = 1;
    }
    const rightIdx = y * width + (width - 1);
    if (!visited[rightIdx] && isWhiteBg(width - 1, y)) {
      queue.push(width - 1, y);
      visited[rightIdx] = 1;
    }
  }

  // BFS Flood Fill
  let head = 0;
  while (head < queue.length) {
    const cx = queue[head++];
    const cy = queue[head++];

    const pIdx = (cy * width + cx) * 4;
    data[pIdx + 3] = 0; // pure transparent

    const neighbors = [
      [cx + 1, cy],
      [cx - 1, cy],
      [cx, cy + 1],
      [cx, cy - 1],
    ];

    for (let i = 0; i < neighbors.length; i++) {
      const nx = neighbors[i][0];
      const ny = neighbors[i][1];

      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nIdx = ny * width + nx;
        if (!visited[nIdx]) {
          visited[nIdx] = 1;
          if (isWhiteBg(nx, ny)) {
            queue.push(nx, ny);
          } else {
            // Border anti-aliasing feather
            const edgeIdx = (ny * width + nx) * 4;
            const er = data[edgeIdx];
            const eg = data[edgeIdx + 1];
            const eb = data[edgeIdx + 2];
            const minV = Math.min(er, eg, eb);
            if (minV > 215) {
              const alphaFactor = Math.max(0, 1 - (minV - 215) / 30);
              data[edgeIdx + 3] = Math.round(data[edgeIdx + 3] * alphaFactor);
            }
          }
        }
      }
    }
  }

  // Find tight bounding box of non-transparent garment pixels
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (data[idx + 3] > 15) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  // Guard against empty image
  if (minX > maxX || minY > maxY) {
    minX = 0;
    minY = 0;
    maxX = width - 1;
    maxY = height - 1;
  }

  const trimmedWidth = maxX - minX + 1;
  const trimmedHeight = maxY - minY + 1;

  rawCtx.putImageData(imgData, 0, 0);

  // Create cleanly cropped trimmed canvas
  const trimmedCanvas = document.createElement('canvas');
  trimmedCanvas.width = trimmedWidth;
  trimmedCanvas.height = trimmedHeight;
  const trimmedCtx = trimmedCanvas.getContext('2d');
  if (trimmedCtx) {
    trimmedCtx.drawImage(
      rawCanvas,
      minX,
      minY,
      trimmedWidth,
      trimmedHeight,
      0,
      0,
      trimmedWidth,
      trimmedHeight
    );
  }

  const result: ProcessedGarmentResult = {
    canvas: trimmedCanvas,
    width: trimmedWidth,
    height: trimmedHeight,
    category: config.category,
    targetBodyPart: config.targetBodyPart,
  };

  trimmedGarmentCache.set(cacheKey, result);
  return result;
}
