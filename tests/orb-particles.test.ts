import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createWordParticles,
  particleStateAt,
  sampleAlphaGrid,
} from '../src/lib/orb-particles';

test('sampleAlphaGrid 只采样超过阈值且落在间距网格上的像素', () => {
  const alpha = new Uint8ClampedArray([
    255, 0, 255, 0,
    0, 0, 0, 0,
    255, 0, 255, 0,
    0, 0, 0, 0,
  ]);

  assert.deepEqual(sampleAlphaGrid(alpha, 4, 4, 2, 128), [
    { x: 0, y: 0 },
    { x: 2, y: 0 },
    { x: 0, y: 2 },
    { x: 2, y: 2 },
  ]);
});

test('相同 seed 生成完全一致的白色粒子', () => {
  const origins = [{ x: 10, y: 20 }, { x: 30, y: 40 }];
  const first = createWordParticles(origins, 0x4c494e);
  const second = createWordParticles(origins, 0x4c494e);

  assert.deepEqual(first, second);
  assert.ok(first.every((particle) => ['#F0F0F0', '#CBD6E2'].includes(particle.color)));
});

test('粒子在开始时保持字形，结束时局部漂散并透明', () => {
  const particle = createWordParticles([{ x: 10, y: 20 }], 0x4c494e)[0];

  assert.deepEqual(particleStateAt(particle, 0), {
    x: 10,
    y: 20,
    opacity: 1,
    radius: particle.radius,
    color: particle.color,
  });

  const end = particleStateAt(particle, 1);
  assert.equal(end.opacity, 0);
  assert.ok(Math.hypot(end.x - 10, end.y - 20) <= 28);
});
