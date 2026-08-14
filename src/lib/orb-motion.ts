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

export type OrbVisualMode =
  | 'intro'
  | 'scrolling'
  | 'departing'
  | 'returning'
  | 'resting';

export interface OrbLayerTransform {
  x: number;
  y: number;
  scale: number;
  opacity: number;
}

export interface OrbAmbientState {
  bloom: OrbLayerTransform;
  light: OrbLayerTransform;
  surface: OrbLayerTransform;
}

export interface OrbRouteTransitionContext {
  previousPathname: string;
  pathname: string;
  previousHomeProgress: number;
  viewportWidth: number;
  reducedMotion: boolean;
  enteringHomeAnchor: boolean;
}

export type OrbRouteTransitionMode = 'departing' | 'returning' | 'none';

const DESKTOP_MIN_WIDTH = 1024;
const AMBIENT_HOLD_PROGRESS = 0.08;
const AMBIENT_SETTLED_PROGRESS = 0.82;
const ROUTE_SETTLED_PROGRESS = 0.98;
const ROUTE_TRANSITION_DURATION = 1.1;
const ROUTE_TRANSITION_MIN_DURATION = 0.18;
const TAU = Math.PI * 2;
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smoothstep = (value: number) => value * value * (3 - 2 * value);

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

export function getOrbAmbientIntensity(progress: number): number {
  const clampedProgress = clamp01(progress);
  if (clampedProgress <= AMBIENT_HOLD_PROGRESS) return 1;
  if (clampedProgress >= AMBIENT_SETTLED_PROGRESS) return 0;

  const localProgress = (
    (clampedProgress - AMBIENT_HOLD_PROGRESS)
    / (AMBIENT_SETTLED_PROGRESS - AMBIENT_HOLD_PROGRESS)
  );
  return 1 - smoothstep(localProgress);
}

export function getOrbAmbientState(
  elapsedSeconds: number,
  intensity: number,
  diameter: number,
): OrbAmbientState {
  const strength = clamp01(intensity);
  const size = Math.max(0, diameter);
  if (strength === 0) {
    return {
      bloom: { x: 0, y: 0, scale: 1, opacity: 0.9 },
      light: { x: 0, y: 0, scale: 1, opacity: 0.9 },
      surface: { x: size * 0.18, y: 0, scale: 1, opacity: 1 },
    };
  }

  const bloomPhase = TAU * elapsedSeconds / 15;
  const lightPhase = TAU * elapsedSeconds / 9;
  const surfacePhase = TAU * elapsedSeconds / 12;
  const bloomOpacity = 0.8 + Math.sin(bloomPhase + 0.55) * 0.16;

  return {
    bloom: {
      x: Math.sin(bloomPhase) * size * 0.055 * strength,
      y: Math.sin(TAU * elapsedSeconds / 12.7 + 1.2) * size * 0.045 * strength,
      scale: 1 + (0.01 + Math.sin(bloomPhase + 0.55) * 0.07) * strength,
      opacity: 0.9 + (bloomOpacity - 0.9) * strength,
    },
    light: {
      x: Math.sin(lightPhase + 2.15) * size * 0.04 * strength,
      y: Math.sin(TAU * elapsedSeconds / 7.7 + 0.35) * size * 0.06 * strength,
      scale: 1 + Math.sin(lightPhase + 1.1) * 0.02 * strength,
      opacity: 0.9,
    },
    surface: {
      x: size * 0.18 + Math.sin(surfacePhase + 4.1) * size * 0.07 * strength,
      y: Math.sin(TAU * elapsedSeconds / 10.2 + 2.1) * size * 0.05 * strength,
      scale: 1,
      opacity: 1,
    },
  };
}

export function getOrbDepartureDuration(progress: number): number {
  const remainingProgress = 1 - clamp01(progress);
  return Math.max(
    ROUTE_TRANSITION_MIN_DURATION,
    ROUTE_TRANSITION_DURATION * remainingProgress,
  );
}

export function resolveOrbRouteTransition({
  previousPathname,
  pathname,
  previousHomeProgress,
  viewportWidth,
  reducedMotion,
  enteringHomeAnchor,
}: OrbRouteTransitionContext): OrbRouteTransitionMode {
  if (viewportWidth < DESKTOP_MIN_WIDTH || reducedMotion) return 'none';

  if (
    previousPathname === '/'
    && pathname !== '/'
    && clamp01(previousHomeProgress) < ROUTE_SETTLED_PROGRESS
  ) {
    return 'departing';
  }

  if (
    previousPathname !== '/'
    && pathname === '/'
    && !enteringHomeAnchor
  ) {
    return 'returning';
  }

  return 'none';
}
