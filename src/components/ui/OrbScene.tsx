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
  getOrbMotionGeometry,
  getOrbMotionState,
  getOrbScrollProgress,
  type OrbMotionGeometry,
} from '@/lib/orb-motion';
import { resolveOrbEntryMode, type OrbEntryMode } from '@/lib/home-entry';

const PARTICLE_SEED = 0x4c494e;
const RETURN_DURATION = 1.1;
const RETURN_HANDOFF_DURATION = 0.16;

interface ParticleRenderer {
  draw: (progress: number) => void;
  clear: () => void;
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

function clearCanvas(canvas: HTMLCanvasElement) {
  // 静态终态不再需要像素缓冲，缩小 backing store 以释放高 DPR 画布内存。
  canvas.width = 1;
  canvas.height = 1;
}

function applyTargetState(
  motionElement: HTMLDivElement,
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
  const isReturningRequest = pathname === '/'
    && pendingHomeSection === null
    && homeIntroRequest.mode === 'returning'
    && homeIntroRequest.key > consumedHomeIntroKey;

  useLayoutEffect(() => {
    const motionElement = motionRef.current;
    if (!motionElement || !isReturningRequest) return;

    applyTargetState(
      motionElement,
      getOrbMotionGeometry(window.innerWidth, window.innerHeight),
    );
  }, [homeIntroRequest.key, isReturningRequest]);

  useEffect(() => {
    const motionElement = motionRef.current;
    const canvas = canvasRef.current;
    if (!motionElement || !canvas) return;

    const desktopQuery = window.matchMedia('(min-width: 1024px)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let setupVersion = 0;
    let resizeFrame = 0;
    let resizeTimer = 0;
    let disposeAnimation = () => {};
    let returnActive = false;
    let returnCompleted = false;
    let handleReturnResize = () => {};

    const applyRestingState = () => {
      const geometry = getOrbMotionGeometry(window.innerWidth, window.innerHeight);
      Object.assign(motionElement.style, {
        left: '0px',
        top: '0px',
        width: `${geometry.targetSize}px`,
        height: `${geometry.targetSize}px`,
        transform: `translate3d(${geometry.targetLeft}px, ${geometry.targetTop}px, 0) scale(1)`,
        transformOrigin: 'top left',
      });
      canvas.style.opacity = '1';
      clearCanvas(canvas);
    };

    const initialize = async () => {
      setupVersion += 1;
      const currentVersion = setupVersion;

      const resolvedEntryMode = resolveOrbEntryMode({
        pathname,
        pendingHomeSection,
        hash: window.location.hash,
        viewportWidth: window.innerWidth,
        reducedMotion: reducedMotionQuery.matches,
        homeIntroRequest,
        consumedHomeIntroKey,
      });
      const entryMode: OrbEntryMode = resolvedEntryMode === 'returning' && returnCompleted
        ? 'intro'
        : resolvedEntryMode;

      const hasPendingReturningRequest = pathname === '/'
        && pendingHomeSection === null
        && homeIntroRequest.mode === 'returning'
        && homeIntroRequest.key > consumedHomeIntroKey;
      if (hasPendingReturningRequest && resolvedEntryMode === 'resting') {
        consumeHomeIntro(homeIntroRequest.key);
      }

      if (entryMode !== 'intro' && entryMode !== 'returning') {
        disposeAnimation();
        disposeAnimation = () => {};
        applyRestingState();
        return;
      }

      const initialGeometry = getOrbMotionGeometry(window.innerWidth, window.innerHeight);

      try {
        const [, { gsap }, { ScrollTrigger }] = await Promise.all([
          document.fonts.ready,
          import('gsap'),
          import('gsap/ScrollTrigger'),
        ]);
        if (currentVersion !== setupVersion) return;

        disposeAnimation();
        disposeAnimation = () => {};

        const renderer = createParticleRenderer(canvas, initialGeometry.targetSize);
        if (!renderer) {
          applyRestingState();
          return;
        }

        gsap.registerPlugin(ScrollTrigger);
        let activeGeometry = initialGeometry;
        let returnTween: { kill: () => void; progress: () => number } | null = null;
        let handoffTween: { kill: () => void } | null = null;
        let scrollTimeline: { kill: () => void; scrollTrigger?: { kill: () => void } } | null = null;
        let returnScrollListener: (() => void) | null = null;
        let returnDeadline = 0;

        const createScrollTimeline = (initialProgress: number) => {
          scrollTimeline?.scrollTrigger?.kill();
          scrollTimeline?.kill();

          const timeline = gsap.timeline({
            scrollTrigger: {
              start: 0,
              end: () => window.innerHeight,
              scrub: 0.35,
              invalidateOnRefresh: true,
              onUpdate: (self) => renderer.draw(self.progress),
            },
          });

          timeline.fromTo(
            motionElement,
            {
              x: activeGeometry.startLeft,
              y: activeGeometry.startTop,
              scale: activeGeometry.startScale,
            },
            {
              x: activeGeometry.targetLeft,
              y: activeGeometry.targetTop,
              scale: 1,
              duration: 1,
              ease: 'none',
              immediateRender: false,
            },
          );
          timeline.progress(initialProgress);
          scrollTimeline = timeline;
          ScrollTrigger.refresh();
          renderer.draw(timeline.scrollTrigger?.progress ?? initialProgress);
          return timeline;
        };

        const stopReturnListener = () => {
          if (returnScrollListener) {
            window.removeEventListener('scroll', returnScrollListener);
            returnScrollListener = null;
          }
        };

        const completeReturn = () => {
          if (!returnActive) return;
          returnActive = false;
          returnCompleted = true;
          handleReturnResize = () => {};
          stopReturnListener();
          returnTween = null;
          gsap.killTweensOf(canvas);
          gsap.set(canvas, { opacity: 1 });
          createScrollTimeline(getOrbScrollProgress(window.scrollY, window.innerHeight));
          consumeHomeIntro(homeIntroRequest.key);
        };

        const handoffToScroll = () => {
          if (!returnActive) return;
          returnActive = false;
          returnCompleted = true;
          handleReturnResize = () => {};
          stopReturnListener();
          returnTween?.kill();
          returnTween = null;

          const progress = getOrbScrollProgress(window.scrollY, window.innerHeight);
          const state = getOrbMotionState(activeGeometry, progress);
          const currentOpacity = Number(gsap.getProperty(canvas, 'opacity')) || 0;
          renderer.draw(progress);
          gsap.killTweensOf(canvas);

          handoffTween = gsap.to(motionElement, {
            x: state.x,
            y: state.y,
            scale: state.scale,
            duration: RETURN_HANDOFF_DURATION,
            ease: 'power2.out',
            onComplete: () => {
              handoffTween = null;
              const latestProgress = getOrbScrollProgress(window.scrollY, window.innerHeight);
              renderer.draw(latestProgress);
              gsap.to(canvas, {
                opacity: 1,
                duration: RETURN_HANDOFF_DURATION,
                ease: 'power2.out',
              });
              createScrollTimeline(latestProgress);
              consumeHomeIntro(homeIntroRequest.key);
            },
          });
          gsap.fromTo(canvas, { opacity: currentOpacity }, {
            opacity: 1,
            duration: RETURN_HANDOFF_DURATION,
            ease: 'power2.out',
          });
        };

        if (entryMode === 'returning') {
          returnActive = true;
          applyTargetState(motionElement, activeGeometry);
          renderer.draw(0);
          gsap.set(canvas, { opacity: 0 });

          returnScrollListener = handoffToScroll;
          window.addEventListener('scroll', returnScrollListener, { passive: true });

          returnTween = gsap.fromTo(
            motionElement,
            {
              x: activeGeometry.targetLeft,
              y: activeGeometry.targetTop,
              scale: 1,
            },
            {
              x: activeGeometry.startLeft,
              y: activeGeometry.startTop,
              scale: activeGeometry.startScale,
              duration: RETURN_DURATION,
              ease: 'power3.out',
              onComplete: completeReturn,
            },
          );
          returnDeadline = performance.now() + RETURN_DURATION * 1000;
          gsap.to(canvas, {
            opacity: 1,
            delay: RETURN_DURATION * 0.2,
            duration: RETURN_DURATION * 0.8,
            ease: 'power2.out',
          });

          handleReturnResize = () => {
            if (!returnActive || !returnTween) return;
            const currentX = Number(gsap.getProperty(motionElement, 'x'));
            const currentY = Number(gsap.getProperty(motionElement, 'y'));
            const currentScale = Number(gsap.getProperty(motionElement, 'scale'));
            const visualSize = activeGeometry.targetSize * currentScale;
            const nextGeometry = getOrbMotionGeometry(window.innerWidth, window.innerHeight);
            activeGeometry = nextGeometry;
            returnTween.kill();
            gsap.killTweensOf(canvas);
            gsap.set(motionElement, {
              width: nextGeometry.targetSize,
              height: nextGeometry.targetSize,
              x: currentX,
              y: currentY,
              scale: visualSize / nextGeometry.targetSize,
            });
            const remainingDuration = Math.max(0, (returnDeadline - performance.now()) / 1000);
            if (remainingDuration <= 0.02) {
              gsap.set(motionElement, {
                x: nextGeometry.startLeft,
                y: nextGeometry.startTop,
                scale: nextGeometry.startScale,
              });
              completeReturn();
              return;
            }
            returnTween = gsap.to(motionElement, {
              x: nextGeometry.startLeft,
              y: nextGeometry.startTop,
              scale: nextGeometry.startScale,
              duration: remainingDuration,
              ease: 'power3.out',
              onComplete: completeReturn,
            });
            gsap.to(canvas, {
              opacity: 1,
              duration: Math.min(remainingDuration, RETURN_DURATION * 0.8),
              ease: 'power2.out',
            });
          };
        } else {
          const scrollProgress = getOrbScrollProgress(window.scrollY, window.innerHeight);
          const motionState = getOrbMotionState(activeGeometry, scrollProgress);
          gsap.set(motionElement, {
            left: 0,
            top: 0,
            width: activeGeometry.targetSize,
            height: activeGeometry.targetSize,
            transformOrigin: 'top left',
            xPercent: 0,
            yPercent: 0,
            x: motionState.x,
            y: motionState.y,
            scale: motionState.scale,
          });
          gsap.set(canvas, { opacity: 1 });
          renderer.draw(scrollProgress);
          createScrollTimeline(scrollProgress);
        }

        disposeAnimation = () => {
          stopReturnListener();
          handleReturnResize = () => {};
          returnTween?.kill();
          handoffTween?.kill();
          scrollTimeline?.scrollTrigger?.kill();
          scrollTimeline?.kill();
          gsap.killTweensOf(canvas);
          renderer.clear();
        };
      } catch {
        if (currentVersion !== setupVersion) return;
        disposeAnimation();
        disposeAnimation = () => {};
        applyRestingState();
      }
    };

    const scheduleInitialize = () => {
      if (returnActive) {
        handleReturnResize();
        return;
      }

      setupVersion += 1;
      window.cancelAnimationFrame(resizeFrame);
      window.clearTimeout(resizeTimer);
      resizeFrame = window.requestAnimationFrame(() => {
        resizeTimer = window.setTimeout(() => {
          void initialize();
        }, 120);
      });
    };

    const handleMotionPreferenceChange = () => {
      returnActive = false;
      returnCompleted = true;
      if (pathname === '/' && homeIntroRequest.mode === 'returning') {
        consumeHomeIntro(homeIntroRequest.key);
      }
      disposeAnimation();
      scheduleInitialize();
    };

    desktopQuery.addEventListener('change', handleMotionPreferenceChange);
    reducedMotionQuery.addEventListener('change', handleMotionPreferenceChange);
    window.addEventListener('resize', scheduleInitialize, { passive: true });
    void initialize();

    return () => {
      setupVersion += 1;
      window.cancelAnimationFrame(resizeFrame);
      window.clearTimeout(resizeTimer);
      desktopQuery.removeEventListener('change', handleMotionPreferenceChange);
      reducedMotionQuery.removeEventListener('change', handleMotionPreferenceChange);
      window.removeEventListener('resize', scheduleInitialize);
      disposeAnimation();
    };
  }, [
    consumedHomeIntroKey,
    consumeHomeIntro,
    homeIntroRequest,
    pathname,
    pendingHomeSection,
  ]);

  const isHomeIntro = pathname === '/'
    && pendingHomeSection === null
    && !isReturningRequest;

  return (
    <div
      ref={motionRef}
      data-home-intro={isHomeIntro ? 'true' : 'false'}
      data-home-returning={isReturningRequest ? 'true' : 'false'}
      className="p3r-orb-motion pointer-events-none"
      aria-hidden="true"
    >
      <OrbLayers ref={canvasRef} />
    </div>
  );
};
