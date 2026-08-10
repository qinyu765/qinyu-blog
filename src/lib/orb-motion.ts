export interface OrbAnimationContext {
  pathname: string;
  viewportWidth: number;
  reducedMotion: boolean;
}

export interface OrbMotionGeometry {
  startCenterX: number;
  startCenterY: number;
  startSize: number;
  startLeft: number;
  startTop: number;
  startScale: number;
  targetLeft: number;
  targetTop: number;
  targetSize: number;
}

export interface OrbMotionState {
  x: number;
  y: number;
  scale: number;
}

const DESKTOP_MIN_WIDTH = 1024;
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export function shouldAnimateOrb({
  pathname,
  viewportWidth,
  reducedMotion,
}: OrbAnimationContext): boolean {
  return pathname === '/'
    && viewportWidth >= DESKTOP_MIN_WIDTH
    && !reducedMotion;
}

export function getOrbMotionGeometry(
  viewportWidth: number,
  viewportHeight: number,
): OrbMotionGeometry {
  const startCenterX = viewportWidth * 0.5;
  const startCenterY = viewportHeight * 0.45;
  const startSize = Math.min(viewportHeight * 0.58, viewportWidth * 0.52);
  const targetSize = viewportHeight * 0.7;
  const targetTop = viewportHeight * -0.18;
  const targetLeft = viewportWidth - viewportHeight * 0.52;

  return {
    startCenterX,
    startCenterY,
    startSize,
    startLeft: startCenterX - startSize / 2,
    startTop: startCenterY - startSize / 2,
    startScale: startSize / targetSize,
    targetLeft,
    targetTop,
    targetSize,
  };
}

export function getOrbScrollProgress(
  scrollY: number,
  viewportHeight: number,
): number {
  if (viewportHeight <= 0) return scrollY > 0 ? 1 : 0;
  return clamp01(scrollY / viewportHeight);
}

export function getOrbMotionState(
  geometry: OrbMotionGeometry,
  progress: number,
): OrbMotionState {
  const clampedProgress = clamp01(progress);
  const interpolate = (start: number, end: number) => (
    start + (end - start) * clampedProgress
  );

  return {
    x: interpolate(geometry.startLeft, geometry.targetLeft),
    y: interpolate(geometry.startTop, geometry.targetTop),
    scale: interpolate(geometry.startScale, 1),
  };
}
