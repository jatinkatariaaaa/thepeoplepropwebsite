"use client";

import { useRef, useCallback, useState, type ReactNode } from "react";
import { motion } from "framer-motion";

/**
 * SpotlightCard — mouse-tracking radial glow overlay on hover.
 * Wrap any bento card or feature card for interactive depth.
 */
export function SpotlightCard({
  children,
  className = "",
  glowColor = "rgba(37, 99, 235, 0.10)",
  glowSize = 500,
}: {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  glowSize?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      setPos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    },
    [],
  );

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative ${className}`}
    >
      {/* Spotlight gradient */}
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-[inherit] pointer-events-none transition-opacity duration-300 z-10"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(${glowSize}px circle at ${pos.x}% ${pos.y}%, ${glowColor}, transparent 40%)`,
        }}
      />
      {children}
    </div>
  );
}

/**
 * TiltCard — 3D perspective tilt on mouse hover with spring physics.
 */
export function TiltCard({
  children,
  className = "",
  intensity = 10,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(800px) rotateX(0deg) rotateY(0deg)");

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotateX = ((y - 0.5) * -intensity).toFixed(1);
      const rotateY = ((x - 0.5) * intensity).toFixed(1);
      setTransform(`perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02,1.02,1.02)`);
    },
    [intensity],
  );

  const handleMouseLeave = useCallback(() => {
    setTransform("perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)");
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        transform,
        transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}

/**
 * MagneticButton — subtle magnetic attraction toward cursor on hover.
 */
export function MagneticButton({
  children,
  className = "",
  strength = 0.3,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("translate(0px, 0px)");

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const x = ((e.clientX - rect.left - rect.width / 2) * strength).toFixed(1);
      const y = ((e.clientY - rect.top - rect.height / 2) * strength).toFixed(1);
      setTransform(`translate(${x}px, ${y}px)`);
    },
    [strength],
  );

  const handleMouseLeave = useCallback(() => {
    setTransform("translate(0px, 0px)");
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        transform,
        transition: "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}
