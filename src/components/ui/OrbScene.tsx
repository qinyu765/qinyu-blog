'use client';

import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { OrbLayers } from '@/components/ui/OrbLayers';
import { useHomeEntry } from '@/components/providers/HomeEntryProvider';
import {
  createWordParticles,
  particleStateAt,
  sampleAlphaGrid,
  type WordParticle,
} from '@/lib/orb-particles';
import {
  getOrbAmbientIntensity,
  getOrbAmbientState,
  getOrbDepartureDuration,
  getOrbMotionGeometry,
  getOrbMotionState,
  getOrbScrollProgress,
  resolveOrbRouteTransition,
  type OrbMotionGeometry,
  type OrbVisualMode,
} from '@/lib/orb-motion';
import {
  getHomeSectionFromHash,
  resolveOrbEntryMode,
} from '@/lib/home-entry';

const PARTICLE_SEED = 0x4c494e;
const RETURN_DURATION = 1.1;
const RETURN_HANDOFF_DURATION = 0.16;
const SETTLED_PROGRESS = 0.98;

interface ParticleRenderer {
  draw: (progress: number) => void;
  clear: () => void;
}

interface SceneInputs {
  pathname: string;
  pendingHomeSection: ReturnType<typeof getHomeSectionFromHash>;
  hash: string;
  homeIntroRequest: ReturnType<typeof useHomeEntry>['homeIntroRequest'];
  consumedHomeIntroKey: number;
  consumeHomeIntro: ReturnType<typeof useHomeEntry>['consumeHomeIntro'];
}

interface RouteSnapshot {
  previousPathname: string;
  pathname: string;
  previousHomeProgress: number;
}

function createParticleRenderer(
  canvas: HTMLCanvasElement,
  size: number,
): ParticleRenderer | null {
  const context = canvas.getContext('2d');
  if (!context) return null;

  const renderSize = Math.max(1, Math.round(size));
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(renderSize * pixelRatio);
  canvas.height = Math.round(renderSize * pixelRatio);
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const sampleCanvas = document.createElement('canvas');
  sampleCanvas.width = renderSize;
  sampleCanvas.height = renderSize;
  const sampleContext = sampleCanvas.getContext('2d', { willReadFrequently: true });
  if (!sampleContext) return null;

  const fontSize = renderSize * 0.245;
  sampleContext.fillStyle = '#F0F0F0';
  sampleContext.font = `900 ${fontSize}px Anton, sans-serif`;
  sampleContext.textAlign = 'center';
  sampleContext.textBaseline = 'middle';
  sampleContext.fillText('lin', renderSize / 2, renderSize / 2);

  const rgba = sampleContext.getImageData(0, 0, renderSize, renderSize).data;
  const alpha = new Uint8ClampedArray(renderSize * renderSize);
  for (let index = 0; index < alpha.length; index += 1) {
    alpha[index] = rgba[index * 4 + 3];
  }

  const spacing = Math.max(4, Math.round(renderSize / 108));
  const origins = sampleAlphaGrid(alpha, renderSize, renderSize, spacing, 96);
  const particles: WordParticle[] = createWordParticles(origins, PARTICLE_SEED);

  const clear = () => context.clearRect(0, 0, renderSize, renderSize);
  const draw = (progress: number) => {
    clear();
    for (const particle of particles) {
      const state = particleStateAt(particle, progress);
      if (state.opacity <= 0.01) continue;

      context.globalAlpha = state.opacity;
      context.fillStyle = state.color;
      context.beginPath();
      context.arc(state.x, state.y, state.radius, 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;
  };

  return { draw, clear };
}

function applyStaticTargetState(
  motionElement: HTMLDivElement,
  canvas: HTMLCanvasElement,
  geometry: OrbMotionGeometry,
) {
  Object.assign(motionElement.style, {
    left: '0px',
    top: '0px',
    width: `${geometry.targetSize}px`,
    height: `${geometry.targetSize}px`,
    transform: `translate3d(${geometry.targetLeft}px, ${geometry.targetTop}px, 0) scale(1)`,
    transformOrigin: 'top left',
  });
  motionElement.dataset.orbState = 'resting';
  const bloomElement = motionElement.querySelector<HTMLElement>('.p3r-orb-bloom');
  const lightElement = motionElement.querySelector<HTMLElement>('.p3r-orb-light');
  const surfaceElement = motionElement.querySelector<HTMLElement>('.p3r-orb-surface');
  Object.assign(bloomElement?.style ?? {}, { transform: 'none', opacity: '0.9' });
  Object.assign(lightElement?.style ?? {}, { transform: 'none', opacity: '0.9' });
  Object.assign(surfaceElement?.style ?? {}, { transform: 'translateX(18%)', opacity: '1' });
  canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
}

export const OrbScene: React.FC = () => {
  const pathname = usePathname();
  const {
    pendingHomeSection,
    homeIntroRequest,
    consumedHomeIntroKey,
    consumeHomeIntro,
  } = useHomeEntry();
  const motionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previousPathnameRef = useRef(pathname);
  const visualProgressRef = useRef(pathname === '/' ? 0 : 1);
  const syncSceneRef = useRef<() => void>(() => {});
  const inputsRef = useRef<SceneInputs>({
    pathname,
    pendingHomeSection,
    hash: '',
    homeIntroRequest,
    consumedHomeIntroKey,
    consumeHomeIntro,
  });
  const routeSnapshotRef = useRef<RouteSnapshot>({
    previousPathname: pathname,
    pathname,
    previousHomeProgress: visualProgressRef.current,
  });

  useLayoutEffect(() => {
    const previousPathname = previousPathnameRef.current;
    if (previousPathname !== pathname) {
      routeSnapshotRef.current = {
        previousPathname,
        pathname,
        previousHomeProgress: visualProgressRef.current,
      };
    }

    previousPathnameRef.current = pathname;
    inputsRef.current = {
      pathname,
      pendingHomeSection,
      hash: window.location.hash,
      homeIntroRequest,
      consumedHomeIntroKey,
      consumeHomeIntro,
    };
    syncSceneRef.current();
  }, [
    consumedHomeIntroKey,
    consumeHomeIntro,
    homeIntroRequest,
    pathname,
    pendingHomeSection,
  ]);

  useEffect(() => {
    const motionElement = motionRef.current;
    const canvas = canvasRef.current;
    if (!motionElement || !canvas) return;

    const bloomElement = motionElement.querySelector<HTMLElement>('.p3r-orb-bloom');
    const lightElement = motionElement.querySelector<HTMLElement>('.p3r-orb-light');
    const surfaceElement = motionElement.querySelector<HTMLElement>('.p3r-orb-surface');
    if (!bloomElement || !lightElement || !surfaceElement) return;

    const desktopQuery = window.matchMedia('(min-width: 1024px)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let disposed = false;
    let resizeTimer = 0;
    let geometry = getOrbMotionGeometry(window.innerWidth, window.innerHeight);
    let renderer: ParticleRenderer | null = null;
    let scrollTimeline: gsap.core.Timeline | null = null;
    let routeTween: gsap.core.Tween | null = null;
    let handoffTween: gsap.core.Tween | null = null;
    let returnScrollListener: (() => void) | null = null;
    let ambientIntensity = 0;
    let ambientTickerAttached = false;
    let activeMode: OrbVisualMode = inputsRef.current.pathname === '/' ? 'intro' : 'resting';
    let gsapApi: typeof import('gsap')['gsap'] | null = null;
    let scrollTriggerApi: typeof import('gsap/ScrollTrigger')['ScrollTrigger'] | null = null;

    const setMode = (mode: OrbVisualMode) => {
      activeMode = mode;
      motionElement.dataset.orbState = mode;
    };

    const renderAmbient = (elapsedSeconds: number) => {
      if (!gsapApi) return;
      const state = getOrbAmbientState(
        elapsedSeconds,
        ambientIntensity,
        geometry.targetSize,
      );
      gsapApi.set(bloomElement, {
        x: state.bloom.x,
        y: state.bloom.y,
        scale: state.bloom.scale,
        opacity: state.bloom.opacity,
      });
      gsapApi.set(lightElement, {
        x: state.light.x,
        y: state.light.y,
        scale: state.light.scale,
        opacity: state.light.opacity,
      });
      gsapApi.set(surfaceElement, {
        xPercent: 0,
        yPercent: 0,
        x: state.surface.x,
        y: state.surface.y,
        scale: state.surface.scale,
        opacity: state.surface.opacity,
      });
    };

    const updateAmbientTicker = (nextIntensity: number) => {
      if (!gsapApi) return;
      ambientIntensity = nextIntensity;

      if (ambientIntensity > 0 && !ambientTickerAttached) {
        gsapApi.ticker.add(renderAmbient);
        ambientTickerAttached = true;
      } else if (ambientIntensity === 0 && ambientTickerAttached) {
        gsapApi.ticker.remove(renderAmbient);
        ambientTickerAttached = false;
      }

      if (!ambientTickerAttached) {
        renderAmbient(performance.now() / 1000);
      }
    };

    const applyProgress = (progress: number, mode: OrbVisualMode) => {
      if (!gsapApi || !renderer) return;
      const clampedProgress = Math.min(1, Math.max(0, progress));
      const motionState = getOrbMotionState(geometry, clampedProgress);
      visualProgressRef.current = clampedProgress;
      setMode(mode);

      gsapApi.set(motionElement, {
        left: 0,
        top: 0,
        width: geometry.targetSize,
        height: geometry.targetSize,
        transformOrigin: 'top left',
        xPercent: 0,
        yPercent: 0,
        x: motionState.x,
        y: motionState.y,
        scale: motionState.scale,
      });
      renderer.draw(clampedProgress);
      updateAmbientTicker(getOrbAmbientIntensity(clampedProgress));
    };

    const stopReturnScrollListener = () => {
      if (!returnScrollListener) return;
      window.removeEventListener('scroll', returnScrollListener);
      returnScrollListener = null;
    };

    const killScrollTimeline = () => {
      scrollTimeline?.scrollTrigger?.kill();
      scrollTimeline?.kill();
      scrollTimeline = null;
    };

    const killRouteTween = () => {
      stopReturnScrollListener();
      routeTween?.kill();
      handoffTween?.kill();
      routeTween = null;
      handoffTween = null;
    };

    const createScrollTimeline = (initialProgress: number) => {
      if (!gsapApi || !scrollTriggerApi || !renderer) return;
      killRouteTween();
      killScrollTimeline();

      const progressProxy = { value: 0 };
      const timeline = gsapApi.timeline({
        scrollTrigger: {
          start: 0,
          end: () => window.innerHeight,
          scrub: 0.35,
          invalidateOnRefresh: true,
        },
      });
      timeline.fromTo(
        progressProxy,
        { value: 0 },
        {
          value: 1,
          duration: 1,
          ease: 'none',
          onUpdate: () => {
            const mode: OrbVisualMode = progressProxy.value <= 0.001
              ? 'intro'
              : 'scrolling';
            applyProgress(progressProxy.value, mode);
          },
        },
      );
      timeline.progress(initialProgress);
      scrollTimeline = timeline;
      scrollTriggerApi.refresh();
      applyProgress(
        timeline.scrollTrigger?.progress ?? initialProgress,
        initialProgress <= 0.001 ? 'intro' : 'scrolling',
      );
    };

    const applyRestingState = () => {
      killRouteTween();
      killScrollTimeline();
      applyProgress(1, 'resting');
    };

    const startDeparture = (startProgress: number) => {
      if (!gsapApi) return;
      killRouteTween();
      killScrollTimeline();

      const progress = Math.min(1, Math.max(0, startProgress));
      if (progress >= SETTLED_PROGRESS) {
        applyProgress(1, 'resting');
        return;
      }

      const progressProxy = { value: progress };
      applyProgress(progress, 'departing');
      routeTween = gsapApi.to(progressProxy, {
        value: 1,
        duration: getOrbDepartureDuration(progress),
        ease: 'power3.inOut',
        onUpdate: () => applyProgress(progressProxy.value, 'departing'),
        onComplete: () => {
          routeTween = null;
          applyProgress(1, 'resting');
        },
      });
    };

    const startReturn = (startProgress: number, requestKey: number | null) => {
      if (!gsapApi) return;
      killRouteTween();
      killScrollTimeline();

      const progress = Math.min(1, Math.max(0, startProgress));
      const progressProxy = { value: progress };
      applyProgress(progress, 'returning');

      returnScrollListener = () => {
        const scrollProgress = getOrbScrollProgress(window.scrollY, window.innerHeight);
        if (scrollProgress <= 0.001 || activeMode !== 'returning') return;

        stopReturnScrollListener();
        routeTween?.kill();
        routeTween = null;
        handoffTween = gsapApi?.to(progressProxy, {
          value: scrollProgress,
          duration: RETURN_HANDOFF_DURATION,
          ease: 'power2.out',
          onUpdate: () => applyProgress(progressProxy.value, 'scrolling'),
          onComplete: () => {
            handoffTween = null;
            createScrollTimeline(getOrbScrollProgress(window.scrollY, window.innerHeight));
            if (requestKey !== null) {
              inputsRef.current.consumeHomeIntro(requestKey);
            }
          },
        }) ?? null;
      };
      window.addEventListener('scroll', returnScrollListener, { passive: true });

      routeTween = gsapApi.to(progressProxy, {
        value: 0,
        duration: Math.max(0.18, RETURN_DURATION * progress),
        ease: 'power3.out',
        onUpdate: () => applyProgress(progressProxy.value, 'returning'),
        onComplete: () => {
          routeTween = null;
          stopReturnScrollListener();
          const scrollProgress = getOrbScrollProgress(window.scrollY, window.innerHeight);
          createScrollTimeline(scrollProgress);
          if (requestKey !== null) {
            inputsRef.current.consumeHomeIntro(requestKey);
          }
        },
      });
    };

    const syncScene = () => {
      if (!gsapApi || !renderer) return;
      const inputs = inputsRef.current;
      const routeSnapshot = routeSnapshotRef.current;
      const enteringHomeAnchor = inputs.pendingHomeSection !== null
        || getHomeSectionFromHash(inputs.hash) !== null;
      const canAnimate = desktopQuery.matches && !reducedMotionQuery.matches;
      const routeTransition = resolveOrbRouteTransition({
        previousPathname: routeSnapshot.previousPathname,
        pathname: routeSnapshot.pathname,
        previousHomeProgress: routeSnapshot.previousHomeProgress,
        viewportWidth: window.innerWidth,
        reducedMotion: reducedMotionQuery.matches,
        enteringHomeAnchor,
      });
      routeSnapshotRef.current = {
        previousPathname: inputs.pathname,
        pathname: inputs.pathname,
        previousHomeProgress: visualProgressRef.current,
      };

      if (!canAnimate) {
        if (
          inputs.homeIntroRequest.mode === 'returning'
          && inputs.homeIntroRequest.key > inputs.consumedHomeIntroKey
        ) {
          inputs.consumeHomeIntro(inputs.homeIntroRequest.key);
        }
        applyRestingState();
        return;
      }

      if (routeTransition === 'departing') {
        startDeparture(routeSnapshot.previousHomeProgress);
        return;
      }

      if (routeTransition === 'returning') {
        const requestKey = (
          inputs.homeIntroRequest.mode === 'returning'
          && inputs.homeIntroRequest.key > inputs.consumedHomeIntroKey
        )
          ? inputs.homeIntroRequest.key
          : null;
        startReturn(visualProgressRef.current, requestKey);
        return;
      }

      if (inputs.pathname !== '/') {
        if (activeMode === 'departing' && visualProgressRef.current < 1) return;
        applyRestingState();
        return;
      }

      const entryMode = resolveOrbEntryMode({
        pathname: inputs.pathname,
        pendingHomeSection: inputs.pendingHomeSection,
        hash: inputs.hash,
        viewportWidth: window.innerWidth,
        reducedMotion: reducedMotionQuery.matches,
        homeIntroRequest: inputs.homeIntroRequest,
        consumedHomeIntroKey: inputs.consumedHomeIntroKey,
      });

      if (entryMode === 'anchor' || entryMode === 'resting') {
        applyRestingState();
        return;
      }

      if (entryMode === 'returning') {
        if (activeMode === 'returning') return;
        startReturn(visualProgressRef.current, inputs.homeIntroRequest.key);
        return;
      }

      if (activeMode === 'returning') return;
      createScrollTimeline(getOrbScrollProgress(window.scrollY, window.innerHeight));
    };

    syncSceneRef.current = syncScene;

    const initialize = async () => {
      try {
        const [, { gsap }, { ScrollTrigger }] = await Promise.all([
          document.fonts.ready,
          import('gsap'),
          import('gsap/ScrollTrigger'),
        ]);
        if (disposed) return;

        gsapApi = gsap;
        scrollTriggerApi = ScrollTrigger;
        gsapApi.registerPlugin(scrollTriggerApi);
        renderer = createParticleRenderer(canvas, geometry.targetSize);
        if (!renderer) {
          applyStaticTargetState(motionElement, canvas, geometry);
          return;
        }

        syncScene();
      } catch {
        if (!disposed) {
          applyStaticTargetState(motionElement, canvas, geometry);
        }
      }
    };

    const scheduleResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        geometry = getOrbMotionGeometry(window.innerWidth, window.innerHeight);
        if (!gsapApi) {
          applyStaticTargetState(motionElement, canvas, geometry);
          return;
        }

        renderer = createParticleRenderer(canvas, geometry.targetSize);
        if (!renderer) {
          applyStaticTargetState(motionElement, canvas, geometry);
          return;
        }

        applyProgress(visualProgressRef.current, activeMode);
        scrollTriggerApi?.refresh();
        syncScene();
      }, 120);
    };

    const handleMotionPreferenceChange = () => syncScene();

    desktopQuery.addEventListener('change', handleMotionPreferenceChange);
    reducedMotionQuery.addEventListener('change', handleMotionPreferenceChange);
    window.addEventListener('resize', scheduleResize, { passive: true });
    void initialize();

    return () => {
      disposed = true;
      syncSceneRef.current = () => {};
      window.clearTimeout(resizeTimer);
      desktopQuery.removeEventListener('change', handleMotionPreferenceChange);
      reducedMotionQuery.removeEventListener('change', handleMotionPreferenceChange);
      window.removeEventListener('resize', scheduleResize);
      stopReturnScrollListener();
      killRouteTween();
      killScrollTimeline();
      if (gsapApi && ambientTickerAttached) {
        gsapApi.ticker.remove(renderAmbient);
      }
      renderer?.clear();
    };
  }, []);

  const initialState: OrbVisualMode = pathname === '/'
    && pendingHomeSection === null
    ? 'intro'
    : 'resting';

  return (
    <div
      ref={motionRef}
      data-orb-state={initialState}
      className="p3r-orb-motion pointer-events-none"
      aria-hidden="true"
    >
      <OrbLayers ref={canvasRef} />
    </div>
  );
};
