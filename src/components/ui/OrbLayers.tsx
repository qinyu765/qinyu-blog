import React, { forwardRef } from 'react';

export const OrbLayers = forwardRef<HTMLCanvasElement>(function OrbLayers(
  _props,
  canvasRef,
) {
  return (
    <div className="p3r-orb-layer-frame absolute inset-0" aria-hidden="true">
      <div className="p3r-orb-bloom absolute" />
      <div className="p3r-orb-light absolute inset-0 rounded-full" />
      <div className="p3r-orb-surface absolute inset-0 z-[2]">
        <div className="p3r-orb-mask absolute inset-0 rounded-full" />
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="p3r-orb-wordmark pointer-events-none absolute inset-0 z-[3] h-full w-full"
        />
      </div>
    </div>
  );
});
