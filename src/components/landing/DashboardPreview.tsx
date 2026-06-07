"use client";

import { ShieldCheck, ArrowRight } from "lucide-react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { Button } from "@/components/ui/Button";

export function DashboardPreview() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-[#0a1128]">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[800px] h-[800px] bg-[var(--accent)] opacity-20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[600px] h-[600px] bg-blue-600 opacity-[0.15] rounded-full blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-5 md:px-8 relative z-10">
        <AnimatedSection className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
          
          {/* Left Side: Headlines */}
          <div className="flex flex-col relative lg:pr-12">
            <div className="inline-flex items-center gap-2 mb-6 self-start rounded-md bg-white/10 px-3 py-1.5 border border-white/10 backdrop-blur-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] font-bold tracking-widest text-slate-200 uppercase">
                Proprietary Tech
              </span>
            </div>
            
            <h2 className="text-[42px] sm:text-[56px] lg:text-[64px] font-bold leading-[1.05] tracking-tight text-white mb-6">
              Powerful Custom<br />
              Trading <span className="word-serif text-[var(--accent)]">Technology</span>
            </h2>

            <p className="text-[18px] leading-relaxed text-slate-300 mb-8 max-w-md">
              Experience the most intuitive, fast, and feature-rich trader dashboard designed specifically for your success. Accessible anywhere, on any device.
            </p>

            <div className="flex items-center gap-4">
              <Button href="/dashboard" variant="primary" size="lg" className="shadow-lg shadow-blue-500/20">
                Explore Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Right Side: Dashboard Image */}
          <div className="relative flex justify-center lg:justify-end w-full perspective-1000">
            <div className="relative w-full max-w-lg lg:max-w-none transform-gpu transition-transform duration-700 hover:rotate-y-0 hover:rotate-x-0 rotate-y-[-10deg] rotate-x-[5deg]">
              {/* Outer Glow */}
              <div className="absolute inset-0 bg-blue-500/20 blur-[50px] rounded-3xl" />
              
              <img 
                src="/images/dashboard-mockup.webp" 
                alt="The People Prop Custom Dashboard Interface" 
                className="relative z-10 w-full h-auto object-contain drop-shadow-2xl"
              />
            </div>
          </div>

        </AnimatedSection>
      </div>
    </section>
  );
}
