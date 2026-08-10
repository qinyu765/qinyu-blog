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

const DESKTOP_MIN_WIDTH = 1024;

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
  const startCenterX = viewportWidth * 0.58;
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
