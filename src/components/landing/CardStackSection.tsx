"use client";

import { Trophy, ArrowRight } from "lucide-react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";

interface FeatureCard {
  id: string;
  title: string;
  desc: string;
  image: string;
}

// Feature cards removed as requested

export function CardStackSection() {
  return (
    <section 
      className="relative overflow-hidden z-20 py-24 md:py-32"
    >
      <div className="relative z-10 w-full max-w-[1400px] mx-auto">
        
        {/* Huge Header Section */}
        <AnimatedSection className="relative px-5 md:px-8 text-center flex flex-col items-center">
          {/* Background Blue Glow & Grain Effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[80%] w-[120%] max-w-[800px] h-[300px] -z-10 pointer-events-none select-none">
            <div 
              className="absolute inset-0 blur-[40px] md:blur-[60px]"
              style={{ background: "radial-gradient(ellipse at center, rgba(37, 99, 235, 0.25) 0%, transparent 65%)" }}
            />
            <div 
              className="absolute inset-0 mix-blend-overlay opacity-[0.15]"
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                WebkitMaskImage: "radial-gradient(ellipse at center, black 0%, transparent 65%)",
                maskImage: "radial-gradient(ellipse at center, black 0%, transparent 65%)"
              }}
            />
          </div>

          <h2 className="relative text-[40px] md:text-[48px] lg:text-[56px] font-bold leading-[1.05] tracking-tight text-[var(--ink-950)] max-w-4xl mx-auto">
            Scale Your Trading<br />
            <span className="text-[var(--ink-700)]">With Zero Personal Risk</span><br />
            <span className="text-[var(--ink-600)]">Access Up To $200k</span><br />
            <span className="text-[var(--accent)] word-serif">And Keep What You Earn</span>
          </h2>

          <p className="mt-8 text-[16px] md:text-[18px] text-[var(--ink-500)] font-medium max-w-2xl mx-auto">
            Trade our capital. Keep your profits. Industry-leading payout conditions designed for your success.
          </p>

          <div className="mt-10 flex flex-col items-center gap-5">
            <a 
              href="/challenges"
              className="group relative inline-flex items-center justify-center gap-3 bg-[var(--accent)] hover:bg-blue-700 text-white font-bold text-[16px] px-8 py-4 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              Start Your Evaluation
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-3.5 h-3.5 text-white" strokeWidth={3} />
              </div>
            </a>
            
            <div className="flex items-center gap-2 text-[var(--ink-600)] text-[13px] font-bold tracking-wide uppercase bg-slate-200/50 px-4 py-2 rounded-full border border-slate-300">
              <Trophy className="w-4 h-4 text-amber-500" /> 
              <span>Trusted by thousands globally</span>
            </div>
          </div>
        </AnimatedSection>


      </div>
    </section>
  );
}
