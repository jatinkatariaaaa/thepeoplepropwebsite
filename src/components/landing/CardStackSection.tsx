"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

// Register GSAP plugins at module level
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface CardData {
  id: number | string;
  image: string;
  alt?: string;
}

const defaultCards: CardData[] = [
  { id: 1, image: "./images/cards/111.webp", alt: "TPP Trading Platform" },
  { id: 2, image: "./images/cards/112.webp", alt: "Funded Account Dashboard" },
  { id: 3, image: "./images/cards/113.webp", alt: "Trading Performance" },
  { id: 4, image: "./images/cards/114.webp", alt: "Profit Splits" },
  { id: 5, image: "./images/cards/115.webp", alt: "Payout History" },
];

export function CardStackSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    const trigger = triggerRef.current;
    const images = imageRefs.current.filter(Boolean) as HTMLImageElement[];
    const totalCards = images.length;

    if (!trigger || totalCards === 0) return;

    // Set initial positions: first card visible, rest below
    gsap.set(images[0], { yPercent: 0, scale: 1, rotation: 0 });
    for (let i = 1; i < totalCards; i++) {
      gsap.set(images[i], { yPercent: 100, scale: 1, rotation: 0 });
    }

    // Build the scroll-driven timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: trigger,
        start: "top top",
        end: () => `+=${window.innerHeight * (totalCards - 1)}`,
        pin: true,
        scrub: 0.5,
        pinSpacing: true,
        invalidateOnRefresh: true,
      },
    });

    for (let i = 0; i < totalCards - 1; i++) {
      // Current card shrinks and rotates
      tl.to(
        images[i],
        {
          scale: 0.7,
          rotation: 5,
          duration: 1,
          ease: "none",
        },
        i,
      );

      // Next card slides up into view
      tl.to(
        images[i + 1],
        {
          yPercent: 0,
          duration: 1,
          ease: "none",
        },
        i,
      );
    }

    // Refresh on resize
    const ro = new ResizeObserver(() => ScrollTrigger.refresh());
    if (sectionRef.current) ro.observe(sectionRef.current);

    return () => {
      ro.disconnect();
      tl.kill();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden z-20"
      style={{
        background: "linear-gradient(135deg, #eef2f7 0%, #dde6f2 45%, #e9f0fa 100%)",
        backgroundAttachment: "fixed",
      }}
    >
      {/* This div is what ScrollTrigger pins */}
      <div
        ref={triggerRef}
        className="relative flex items-center justify-center overflow-hidden"
        style={{ height: "100vh", width: "100%" }}
      >
        {/* Card wrapper — holds all stacked images */}
        <div
          className="relative overflow-hidden rounded-3xl aspect-square md:aspect-none w-[90vw] md:w-[min(900px,90vw)] h-auto md:h-[80vh]"
        >
          {defaultCards.map((card, i) => (
            <img
              key={card.id}
              src={card.image}
              alt={card.alt || ""}
              className={cn(
                "absolute inset-0 w-full h-full rounded-3xl object-cover will-change-transform",
              )}
              ref={(el) => {
                imageRefs.current[i] = el;
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
