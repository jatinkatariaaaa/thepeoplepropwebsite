"use client";

import createGlobe from "cobe";
import { useEffect, useRef } from "react";

export function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;
    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 1000 * 2,
      height: 1000 * 2,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.05, 0.05, 0.05],
      markerColor: [188 / 255, 255 / 255, 46 / 255], // Lime green #bcff2e
      glowColor: [188 / 255, 255 / 255, 46 / 255],
      markers: [
        // London
        { location: [51.5072, 0.1276], size: 0.05 },
        // New York
        { location: [40.7128, -74.0060], size: 0.05 },
        // Tokyo
        { location: [35.6762, 139.6503], size: 0.05 },
        // Sydney
        { location: [-33.8688, 151.2093], size: 0.05 },
        // Dubai
        { location: [25.2048, 55.2708], size: 0.05 },
        // Sao Paulo
        { location: [-23.5505, -46.6333], size: 0.05 },
        // Singapore
        { location: [1.3521, 103.8198], size: 0.05 },
      ],
      // @ts-expect-error onRender is valid in cobe but missing from its type definitions
      onRender: (state: any) => {
        state.phi = phi;
        phi += 0.003;
      },
    });

    setTimeout(() => {
      if (canvasRef.current) canvasRef.current.style.opacity = '1';
    }, 100);

    return () => {
      globe.destroy();
    };
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.35] md:opacity-[0.45] mix-blend-screen overflow-hidden">
      <div className="relative w-full max-w-[1000px] aspect-square translate-y-[20%] md:translate-y-[10%]">
        <canvas
          ref={canvasRef}
          className="transition-opacity duration-1000 ease-in-out"
          style={{ width: "100%", height: "100%", contain: "layout paint size", opacity: 0 }}
          onMouseEnter={() => {}} // Just to avoid unused
        />
      </div>
    </div>
  );
}

// Add a simple hook or just use CSS animation in global or a class.
// Wait, an easier way is to just use a useLayoutEffect to set opacity to 1.
// But I'll just rely on a standard setTimeout in useEffect inside the main globe init.
