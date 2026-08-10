'use client';

import React, { useEffect, useRef } from 'react';
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
} from '@/lib/orb-motion';
import { resolveOrbEntryMode } from '@/lib/home-entry';

const PARTICLE_SEED = 0x4c494e;

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

export const OrbScene: React.FC = () => {
  const pathname = usePathname();
  const { pendingHomeSection, homeIntroKey } = useHomeEntry();
  const motionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
      clearCanvas(canvas);
    };

    const initialize = async () => {
      setupVersion += 1;
      const currentVersion = setupVersion;

      const entryMode = resolveOrbEntryMode({
        pathname,
        pendingHomeSection,
        hash: window.location.hash,
        viewportWidth: window.innerWidth,
        reducedMotion: reducedMotionQuery.matches,
      });
      if (entryMode !== 'intro') {
        disposeAnimation();
        disposeAnimation = () => {};
        applyRestingState();
        return;
      }

      const geometry = getOrbMotionGeometry(window.innerWidth, window.innerHeight);
      let disposeReplacement = () => {};

      try {
        const [, { gsap }, { ScrollTrigger }] = await Promise.all([
          document.fonts.ready,
          import('gsap'),
          import('gsap/ScrollTrigger'),
        ]);
        if (currentVersion !== setupVersion) return;

        const scrollProgress = getOrbScrollProgress(
          window.scrollY,
          window.innerHeight,
        );
        const motionState = getOrbMotionState(geometry, scrollProgress);

        // 新依赖与几何都准备好后再同步替换，避免 resize 时闪回起点。
        disposeAnimation();
        disposeAnimation = () => {};

        const renderer = createParticleRenderer(canvas, geometry.targetSize);
        if (!renderer) {
          applyRestingState();
          return;
        }
        disposeReplacement = renderer.clear;

        gsap.registerPlugin(ScrollTrigger);
        gsap.set(motionElement, {
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
        renderer.draw(scrollProgress);

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
            x: geometry.startLeft,
            y: geometry.startTop,
            scale: geometry.startScale,
          },
          {
            x: geometry.targetLeft,
            y: geometry.targetTop,
            scale: 1,
            duration: 1,
            ease: 'none',
            immediateRender: false,
          },
        );

        timeline.progress(scrollProgress);
        ScrollTrigger.refresh();
        renderer.draw(timeline.scrollTrigger?.progress ?? scrollProgress);

        disposeReplacement = () => {
          timeline.scrollTrigger?.kill();
          timeline.kill();
          renderer.clear();
        };
        disposeAnimation = disposeReplacement;
        disposeReplacement = () => {};
      } catch {
        disposeReplacement();
        if (currentVersion !== setupVersion) return;
        disposeAnimation();
        disposeAnimation = () => {};
        applyRestingState();
      }
    };

    const scheduleInitialize = () => {
      setupVersion += 1;
      window.cancelAnimationFrame(resizeFrame);
      window.clearTimeout(resizeTimer);
      resizeFrame = window.requestAnimationFrame(() => {
        resizeTimer = window.setTimeout(() => {
          void initialize();
        }, 120);
      });
    };

    desktopQuery.addEventListener('change', scheduleInitialize);
    reducedMotionQuery.addEventListener('change', scheduleInitialize);
    window.addEventListener('resize', scheduleInitialize, { passive: true });
    void initialize();

    return () => {
      setupVersion += 1;
      window.cancelAnimationFrame(resizeFrame);
      window.clearTimeout(resizeTimer);
      desktopQuery.removeEventListener('change', scheduleInitialize);
      reducedMotionQuery.removeEventListener('change', scheduleInitialize);
      window.removeEventListener('resize', scheduleInitialize);
      disposeAnimation();
    };
  }, [homeIntroKey, pathname, pendingHomeSection]);

  return (
    <div
      ref={motionRef}
      data-home-intro={pathname === '/' && pendingHomeSection === null ? 'true' : 'false'}
      className="p3r-orb-motion pointer-events-none"
      aria-hidden="true"
    >
      <OrbLayers ref={canvasRef} />
    </div>
  );
};
