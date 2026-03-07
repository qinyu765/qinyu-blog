import React from 'react';

const RIPPLE_COUNT = 7;

/**
 * 背景视觉层（由下至上叠加）：
 * 1. p3r-bg-base    — 多层径向渐变底色
 * 2. p3r-caustics   — 模拟水面焦散光斑（screen 混合 + 缓动位移）
 * 3. p3r-noise      — SVG 噪声纹理覆盖（overlay 混合）
 * 4. 残月 (moon)     — 三层：bloom 外晕 → light 月面渐变 → mask 遮罩形成残月轮廓
 * 5. 水波纹 (ripple) — 多条 SVG 正弦曲线，各自有独立时长/延迟/透明度
 */
const styles = `
  .p3r-bg-base {
    background:
      radial-gradient(1100px 900px at 18% 10%, rgba(81,238,252,0.08), transparent 70%),
      radial-gradient(1000px 800px at 82% 18%, rgba(109,154,199,0.08), transparent 68%),
      radial-gradient(600px 600px at 50% 40%, rgba(81,238,252,0.04), transparent 70%),
      #000000;
  }

  .p3r-caustics {
    background-image:
      radial-gradient(closest-side at 22% 34%, rgba(81,238,252,0.14), transparent 62%),
      radial-gradient(closest-side at 68% 54%, rgba(81,238,252,0.10), transparent 64%),
      radial-gradient(closest-side at 42% 80%, rgba(109,154,199,0.10), transparent 66%),
      radial-gradient(closest-side at 86% 78%, rgba(109,154,199,0.08), transparent 68%);
    background-size: 140% 140%;
    background-position: 0% 0%;
    mix-blend-mode: screen;
    opacity: 0.42;
    filter: blur(0.6px);
    animation: p3r-caustics-drift 15s ease-in-out infinite;
  }

  @keyframes p3r-caustics-drift {
    0%   { background-position: 0% 0%;   transform: translate3d(0,0,0); }
    50%  { background-position: 60% 35%; transform: translate3d(1.4%,-1%,0); }
    100% { background-position: 0% 0%;   transform: translate3d(0,0,0); }
  }

  .p3r-noise {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
    background-size: 200px 200px;
    opacity: 0.12;
    mix-blend-mode: overlay;
    width: 200%;
    height: 200%;
    top: -50%;
    left: -50%;
    will-change: transform;
    animation: p3r-noise-shift 0.3s steps(3) infinite;
  }

  @keyframes p3r-noise-shift {
    0%   { transform: translate(0, 0); }
    33%  { transform: translate(-40px, 20px); }
    66%  { transform: translate(30px, -30px); }
    100% { transform: translate(0, 0); }
  }

  .p3r-moon {
    animation: p3r-moon-drift 12s ease-in-out infinite;
    will-change: transform;
  }

  @keyframes p3r-moon-drift {
    0%   { transform: translate3d(0,0,0); }
    50%  { transform: translate3d(-10px,12px,0); }
    100% { transform: translate3d(0,0,0); }
  }

  .p3r-moon-bloom {
    position: absolute;
    inset: -18%;
    border-radius: 9999px;
    background: radial-gradient(circle at 40% 38%, rgba(81,238,252,0.18), transparent 70%);
    filter: blur(2px);
    opacity: 0.9;
  }

  .p3r-moon-light {
    position: absolute;
    inset: 0;
    border-radius: 9999px;
    background: radial-gradient(circle at 35% 35%, rgba(81,238,252,0.80) 0%, rgba(109,154,199,0.50) 38%, transparent 72%);
    box-shadow: 0 0 60px rgba(81,238,252,0.16), 0 0 140px rgba(81,238,252,0.09);
    opacity: 0.9;
  }

  .p3r-moon-mask {
    position: absolute;
    inset: 0;
    border-radius: 9999px;
    background: rgba(18,105,204,0.92);
    transform: translateX(18%);
    filter: blur(0.6px);
  }

  .p3r-ripple {
    animation-name: p3r-ripple-float;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
    will-change: transform;
    filter: drop-shadow(0 0 10px rgba(81,238,252,0.12));
  }

  @keyframes p3r-ripple-float {
    0%   { transform: translate3d(0,0,0); }
    25%  { transform: translate3d(14px,-6px,0); }
    50%  { transform: translate3d(28px,0,0); }
    75%  { transform: translate3d(14px,6px,0); }
    100% { transform: translate3d(0,0,0); }
  }
`;

export const BackgroundEffect: React.FC = () => {
  const ripples = Array.from({ length: RIPPLE_COUNT }, (_, i) => i);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none" aria-hidden="true">
      <style>{styles}</style>

      <div className="absolute inset-0 p3r-bg-base" />
      <div className="absolute inset-0 p3r-noise" />

      {/* 残月：bloom 外晕 → light 月面 → mask 遮罩（translateX 偏移形成月牙） */}
      <div className="absolute -top-[18vh] -right-[18vh] w-[70vh] h-[70vh] p3r-moon">
        <div className="p3r-moon-bloom" />
        <div className="p3r-moon-light" />
        <div className="p3r-moon-mask" />
      </div>

      {/* 水波纹：多条正弦 SVG 曲线，交替使用 cyan/mid 配色 */}
      <div className="absolute bottom-[-8%] left-0 w-full h-[60%]">
        {ripples.map((i) => (
          <svg
            key={i}
            className="absolute left-[-10%] w-[120%] h-[90px] p3r-ripple"
            viewBox="0 0 1440 80"
            preserveAspectRatio="none"
            style={{
              bottom: `${i * 12}%`,
              opacity: 0.18 + i * 0.07,
              animationDelay: `${-i * 1.7}s`,
              animationDuration: `${12 - (i % 3) * 1.5}s`,
            }}
          >
            <path
              d="M0,40 C160,24 320,56 480,40 S800,56 960,40 S1280,24 1440,40"
              fill="none"
              stroke={i % 2 === 0 ? 'rgba(81,238,252,0.55)' : 'rgba(109,154,199,0.45)'}
              strokeWidth={1.15}
              strokeLinecap="round"
            />
          </svg>
        ))}
      </div>
    </div>
  );
};
