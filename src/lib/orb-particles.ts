export interface ParticleOrigin {
  x: number;
  y: number;
}

export interface WordParticle extends ParticleOrigin {
  driftX: number;
  driftY: number;
  delay: number;
  radius: number;
  color: '#F0F0F0' | '#CBD6E2';
}

export interface RenderParticle {
  x: number;
  y: number;
  opacity: number;
  radius: number;
  color: WordParticle['color'];
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const smoothstep = (value: number) => value * value * (3 - 2 * value);

const mulberry32 = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

export function sampleAlphaGrid(
  alpha: Uint8ClampedArray,
  width: number,
  height: number,
  spacing: number,
  alphaThreshold = 96,
): ParticleOrigin[] {
  const origins: ParticleOrigin[] = [];

  for (let y = 0; y < height; y += spacing) {
    for (let x = 0; x < width; x += spacing) {
      if (alpha[y * width + x] >= alphaThreshold) {
        origins.push({ x, y });
      }
    }
  }

  return origins;
}

export function createWordParticles(
  origins: ParticleOrigin[],
  seed = 0x4c494e,
): WordParticle[] {
  const random = mulberry32(seed);

  return origins.map((origin) => {
    const angle = random() * Math.PI * 2;
    const distance = 6 + random() * 14;

    return {
      ...origin,
      driftX: Math.cos(angle) * distance,
      driftY: Math.sin(angle) * distance,
      delay: random() * 0.12,
      radius: 0.8 + random(),
      color: random() < 0.82 ? '#F0F0F0' : '#CBD6E2',
    };
  });
}

export function particleStateAt(
  particle: WordParticle,
  scrollProgress: number,
): RenderParticle {
  const dissolveProgress = clamp01((scrollProgress - 0.10) / 0.72);
  const localProgress = clamp01(
    (dissolveProgress - particle.delay) / (1 - particle.delay),
  );
  const easedProgress = smoothstep(localProgress);

  return {
    x: particle.x + particle.driftX * easedProgress,
    y: particle.y + particle.driftY * easedProgress,
    opacity: 1 - easedProgress,
    radius: particle.radius,
    color: particle.color,
  };
}
