import React from 'react';

export const BackgroundEffect: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      {/* Deep Blue Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-p3blue/20 via-[#0a0a1a] to-black" />
      
      {/* The Moon / Circle Motif */}
      <div className="absolute top-[-10%] right-[-10%] w-[60vh] h-[60vh] rounded-full border-[1px] border-white/10 opacity-50" />
      <div className="absolute top-[-15%] right-[-5%] w-[70vh] h-[70vh] rounded-full border-[2px] border-p3blue/20 opacity-30" />

      {/* Water Reflection Lines (Abstract) */}
      <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-20">
         {Array.from({ length: 5 }).map((_, i) => (
           <div 
             key={i}
             className="absolute w-full h-[2px] bg-p3cyan shadow-[0_0_10px_#00FFFF]"
             style={{
               bottom: `${i * 10}%`,
               left: 0,
               transform: `rotate(${Math.random() * 2 - 1}deg) translateY(${Math.random() * 10}px)`,
               opacity: 1 - (i * 0.2)
             }}
           />
         ))}
      </div>

      {/* Diagonal Slash Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDQwbDQwLTQwaC0xTDAgMzl6IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDIiLz4KPC9zdmc+')] opacity-20" />
    </div>
  );
};