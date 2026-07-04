// Portrait-as-particles: samples the photo into a dot field.
// The 2D renderer paints the static portrait instantly on every device;
// the WebGL scene reuses the same sampler to bring it alive on gesture.

export interface DotField {
  /** normalized x,y in [0..1] (y down), luminance in [0..1] */
  dots: Float32Array; // [x, y, lum] * n
  count: number;
  aspect: number; // width / height
}

const CLAY = [224, 133, 92] as const;
const INK = [243, 237, 228] as const;
const DARK = [90, 55, 40] as const;
// light theme: bright areas go DARK bronze so the face stays readable on cream
const L_CLAY = [169, 77, 42] as const;
const L_DEEP = [61, 38, 26] as const;
const L_SOFT = [216, 158, 128] as const;

function lerp3(a: readonly number[], b: readonly number[], t: number): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

export function isLightTheme(): boolean {
  return document.documentElement.dataset.theme === 'light';
}

/** Dot color for a luminance value — the approved "constellation portrait" ramp. */
export function dotColor(lum: number, light = isLightTheme()): [number, number, number] {
  const t = Math.min(1, lum * 1.35);
  if (light) {
    // inverted tonality: face (bright) → deep bronze, shirt (dark) → soft clay
    return lum > 0.55 ? lerp3(L_CLAY, L_DEEP, t * 0.8) : lerp3(L_SOFT, L_CLAY, t * 1.6);
  }
  return lum > 0.55 ? lerp3(CLAY, INK, t * 0.75) : lerp3(DARK, CLAY, t * 1.6);
}

export async function samplePortrait(imgUrl: string, cols = 96): Promise<DotField> {
  const img = new Image();
  img.src = imgUrl;
  await img.decode();
  const aspect = img.naturalWidth / img.naturalHeight;
  const rows = Math.round(cols / aspect);
  const off = document.createElement('canvas');
  off.width = cols;
  off.height = rows;
  const ctx = off.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, cols, rows);
  const data = ctx.getImageData(0, 0, cols, rows).data;

  const out: number[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = (y * cols + x) * 4;
      const a = data[i + 3] / 255;
      if (a < 0.35) continue;
      const lum = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
      out.push((x + 0.5) / cols, (y + 0.5) / rows, lum);
    }
  }
  return { dots: new Float32Array(out), count: out.length / 3, aspect };
}

/** Paints the static dot portrait onto a 2D canvas (fits the canvas box). */
export async function paintStaticPortrait(canvas: HTMLCanvasElement, imgUrl: string) {
  const field = await samplePortrait(imgUrl, 96);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d')!;
  const cell = canvas.width / 96;
  const { dots, count } = field;
  for (let i = 0; i < count; i++) {
    const x = dots[i * 3] * canvas.width;
    const y = dots[i * 3 + 1] * canvas.height;
    const lum = dots[i * 3 + 2];
    const r = (0.08 + Math.pow(lum, 0.8) * 0.46) * cell;
    if (r < 0.6) continue;
    const [cr, cg, cb] = dotColor(lum);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${cr | 0},${cg | 0},${cb | 0},${Math.min(1, 0.55 + lum * 0.6)})`;
    ctx.fill();
  }
  return field;
}
