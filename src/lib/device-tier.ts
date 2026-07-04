export type Tier = 'high' | 'low';

interface NavigatorExtras {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
}

/** Conservative device classification for scaling the WebGL scene. */
export function deviceTier(): Tier {
  const nav = navigator as Navigator & NavigatorExtras;
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 8;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  if (cores <= 4 || memory <= 4 || coarse) return 'low';
  return 'high';
}

export function saveData(): boolean {
  const nav = navigator as Navigator & NavigatorExtras;
  return nav.connection?.saveData === true;
}

export function webglAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}
