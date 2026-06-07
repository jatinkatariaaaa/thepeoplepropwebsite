"use client";

import { cn } from "@/lib/utils";

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
  return (
    <section
      className="relative overflow-hidden z-20 py-24 md:py-32"
      style={{
        background: "linear-gradient(135deg, #eef2f7 0%, #dde6f2 45%, #e9f0fa 100%)",
        backgroundAttachment: "fixed",
      }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 60s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}} />

      <div className="relative flex items-center justify-center overflow-hidden w-full">
        {/* Left and right fade gradients for a smoother appearance */}
        <div className="absolute top-0 bottom-0 left-0 w-16 md:w-32 bg-gradient-to-r from-[#eef2f7] to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-16 md:w-32 bg-gradient-to-l from-[#e9f0fa] to-transparent z-10 pointer-events-none" />

        {/* Marquee Wrapper */}
        <div className="flex w-[max-content] animate-marquee gap-6 md:gap-10 px-3 md:px-5">
           {/* First Set */}
           {defaultCards.map((card) => (
             <div 
                key={`set1-${card.id}`} 
                className="relative flex-shrink-0 w-[85vw] md:w-[700px] lg:w-[900px] aspect-[4/3] rounded-2xl md:rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(10,37,64,0.15)] group cursor-grab active:cursor-grabbing border border-white/40"
              >
               <img 
                 src={card.image} 
                 alt={card.alt} 
                 className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
               />
               <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
             </div>
           ))}
           {/* Duplicate Set for seamless infinite loop */}
           {defaultCards.map((card) => (
             <div 
                key={`set2-${card.id}`} 
                className="relative flex-shrink-0 w-[85vw] md:w-[700px] lg:w-[900px] aspect-[4/3] rounded-2xl md:rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(10,37,64,0.15)] group cursor-grab active:cursor-grabbing border border-white/40"
              >
               <img 
                 src={card.image} 
                 alt={card.alt} 
                 className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
               />
               <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
             </div>
           ))}
        </div>
      </div>
    </section>
  );
}
