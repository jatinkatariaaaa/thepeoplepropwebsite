"use client";

import { Trophy, ArrowRight } from "lucide-react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";

interface FeatureCard {
  id: string;
  title: string;
  desc: string;
  image: string;
}

const featureCards: FeatureCard[] = [
  {
    id: "platform",
    title: "Premium Trading Platform",
    desc: "Trade on our lightning-fast, custom-built web terminal with advanced charting and execution.",
    image: "./images/cards/111.webp",
  },
  {
    id: "dashboard",
    title: "Intuitive Dashboard",
    desc: "Track your objectives, manage accounts, and view deep analytics in one central hub.",
    image: "./images/cards/112.webp",
  },
  {
    id: "analytics",
    title: "Deep Performance Analytics",
    desc: "Gain edge with institutional-grade metrics, trade journaling, and behavioral analysis.",
    image: "./images/cards/113.webp",
  },
  {
    id: "splits",
    title: "Up to 100% Profit Splits",
    desc: "Keep more of what you earn. Scale your account and unlock the industry's highest payouts.",
    image: "./images/cards/114.webp",
  },
  {
    id: "payouts",
    title: "Fast On-Demand Payouts",
    desc: "Request your profits anytime. We process withdrawals securely within 24 hours.",
    image: "./images/cards/115.webp",
  },
];

export function CardStackSection() {
  return (
    <section className="relative overflow-hidden z-20 py-24 md:py-32 bg-[#050914]">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[1400px] mx-auto">
        
        {/* Huge Header Section */}
        <AnimatedSection className="px-5 md:px-8 text-center flex flex-col items-center">
          <h2 className="text-[36px] sm:text-[56px] md:text-[72px] lg:text-[80px] font-black leading-[0.95] text-white uppercase tracking-tight max-w-5xl mx-auto">
            Trading<br />
            <span className="text-white/90">But with less risk</span><br />
            <span className="text-white/80">With more capital</span><br />
            <span className="text-white/70">And more reward</span>
          </h2>

          <p className="mt-8 text-[16px] md:text-[18px] text-white/60 font-medium max-w-2xl mx-auto">
            Simulated Capital with Real Rewards. Paid Fast &amp; Secure.
          </p>

          <div className="mt-10 flex flex-col items-center gap-5">
            <a 
              href="/dashboard"
              className="group relative inline-flex items-center justify-center gap-3 bg-[#FACC15] hover:bg-[#EAB308] text-black font-bold text-[16px] px-8 py-4 rounded-xl transition-all duration-300 shadow-[0_0_40px_rgba(250,204,21,0.2)] hover:shadow-[0_0_60px_rgba(250,204,21,0.3)] hover:-translate-y-1"
            >
              Get Funded
              <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-3.5 h-3.5 text-black" strokeWidth={3} />
              </div>
            </a>
            
            <div className="flex items-center gap-2 text-[#FACC15] text-[13px] font-bold tracking-wide uppercase bg-[#FACC15]/10 px-3 py-1.5 rounded-full border border-[#FACC15]/20">
              <Trophy className="w-4 h-4" /> 
              <span>Join 240,000+ Traders</span>
            </div>
          </div>
        </AnimatedSection>

        {/* Feature Cards Horizontal Scroll */}
        <div className="mt-20 md:mt-24 w-full relative">
          
          {/* Edge fade gradients for scroll indication */}
          <div className="absolute top-0 bottom-0 left-0 w-8 md:w-24 bg-gradient-to-r from-[#050914] to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-8 md:w-24 bg-gradient-to-l from-[#050914] to-transparent z-10 pointer-events-none" />

          <div className="flex overflow-x-auto snap-x snap-mandatory gap-5 md:gap-6 px-5 md:px-12 pb-12 w-full hide-scrollbar">
            {featureCards.map((card, index) => (
              <AnimatedSection 
                key={card.id}
                className="snap-center shrink-0 w-[85vw] sm:w-[400px] md:w-[450px] bg-[#0E1424] rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden group border border-white/5 hover:border-white/10 transition-colors duration-500"
              >
                {/* Text Content */}
                <div className="relative z-10">
                  <h3 className="text-white text-[22px] md:text-[26px] font-bold leading-tight mb-3 pr-8">
                    {card.title}
                  </h3>
                  <p className="text-white/50 text-[14px] md:text-[15px] leading-relaxed font-medium">
                    {card.desc}
                  </p>
                </div>
                
                {/* Image / Graphic Container */}
                <div className="mt-10 md:mt-12 relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl transition-transform duration-700 group-hover:-translate-y-2 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 bg-black">
                  <img 
                    src={card.image} 
                    alt={card.title} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" 
                  />
                  {/* Internal Glow Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                </div>
              </AnimatedSection>
            ))}
          </div>
          
          <style jsx>{`
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
            .hide-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>

        </div>
      </div>
    </section>
  );
}
