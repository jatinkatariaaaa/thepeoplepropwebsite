"use client";

import Link from "next/link";
import { ChevronUp } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-4 rounded-t-[2rem] bg-[#cbfb45] text-[#0c0c0c] lg:rounded-t-[3rem]">
      <div className="mx-auto max-w-[1440px] px-5 pb-8 pt-16 lg:px-10 lg:pt-24">
        
        <div className="mb-16 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_2fr]">
          {/* Left Col - Brand & Newsletter */}
          <div className="flex flex-col">
            <span className="mb-2 text-3xl font-black tracking-tight">The People Prop</span>
            <p className="mb-8 max-w-[300px] text-[15px] font-medium opacity-70">
              Evaluating traders worldwide. Built by traders, for traders. No hidden rules, just real capital scaling.
            </p>
            
            <h4 className="mb-4 text-[14px] font-bold uppercase tracking-widest opacity-50">Newsletter</h4>
            <div className="mb-8 flex max-w-[320px] border-b-2 border-[#0c0c0c] pb-2">
              <input type="email" placeholder="Enter your email" className="flex-1 bg-transparent text-base font-medium outline-none placeholder:text-[#0c0c0c]/40" />
              <button className="text-xl font-medium transition-transform hover:translate-x-1" aria-label="Subscribe">→</button>
            </div>

            <div className="flex gap-4">
              <Link href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#0c0c0c]/20 transition-all hover:bg-[#0c0c0c] hover:text-[#cbfb45]" aria-label="X (Twitter)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </Link>
              <Link href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#0c0c0c]/20 transition-all hover:bg-[#0c0c0c] hover:text-[#cbfb45]" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </Link>
              <Link href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#0c0c0c]/20 transition-all hover:bg-[#0c0c0c] hover:text-[#cbfb45]" aria-label="YouTube">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                </svg>
              </Link>
              <Link href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#0c0c0c]/20 transition-all hover:bg-[#0c0c0c] hover:text-[#cbfb45]" aria-label="Discord">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* Right Col - Navigation Links */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:justify-items-end">
            <div className="flex flex-col gap-4">
              <h4 className="mb-2 text-[14px] font-bold uppercase tracking-widest opacity-50">Platform</h4>
              <Link href="/dashboard" className="text-[15px] font-medium transition-opacity hover:opacity-60">Dashboard</Link>
              <Link href="/challenges" className="text-[15px] font-medium transition-opacity hover:opacity-60">Challenges</Link>
              <Link href="/heatmap" className="text-[15px] font-medium transition-opacity hover:opacity-60">Heatmap</Link>
              <Link href="/leaderboard" className="text-[15px] font-medium transition-opacity hover:opacity-60">Leaderboard</Link>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="mb-2 text-[14px] font-bold uppercase tracking-widest opacity-50">Resources</h4>
              <Link href="/rules" className="text-[15px] font-medium transition-opacity hover:opacity-60">Trading Rules</Link>
              <Link href="/faq" className="text-[15px] font-medium transition-opacity hover:opacity-60">FAQ</Link>

              <Link href="/blog" className="text-[15px] font-medium transition-opacity hover:opacity-60">Blog</Link>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="mb-2 text-[14px] font-bold uppercase tracking-widest opacity-50">Company</h4>
              <Link href="/about" className="text-[15px] font-medium transition-opacity hover:opacity-60">About Us</Link>
              <Link href="/contact" className="text-[15px] font-medium transition-opacity hover:opacity-60">Contact</Link>
              <Link href="/careers" className="text-[15px] font-medium transition-opacity hover:opacity-60">Careers</Link>
              <Link href="/reviews" className="text-[15px] font-medium transition-opacity hover:opacity-60">Reviews</Link>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="mb-2 text-[14px] font-bold uppercase tracking-widest opacity-50">Legal</h4>
              <Link href="/terms" className="text-[15px] font-medium transition-opacity hover:opacity-60">Terms</Link>
              <Link href="/privacy" className="text-[15px] font-medium transition-opacity hover:opacity-60">Privacy Policy</Link>
              <Link href="/cookie" className="text-[15px] font-medium transition-opacity hover:opacity-60">Cookie Policy</Link>
              <Link href="/risk-disclosure" className="text-[15px] font-medium transition-opacity hover:opacity-60">Risk Disclosure</Link>
              <Link href="/aml-policy" className="text-[15px] font-medium transition-opacity hover:opacity-60">AML Policy</Link>
            </div>
          </div>
        </div>

        <h2 className="my-8 select-none text-center font-black leading-[0.8] tracking-[-0.05em] text-[#0c0c0c]" style={{ fontSize: "clamp(5rem, 20vw, 22rem)" }}>
          TPP
        </h2>

        <div className="flex flex-col gap-8 border-t border-[#0c0c0c]/10 pt-8">
          <p className="mx-auto max-w-6xl text-center text-[12px] leading-relaxed opacity-60 md:text-left">
            <strong>Risk Warning:</strong> The People Prop provides simulated trading environments. All accounts provided to clients are simulated accounts. Trading in financial markets involves a high degree of risk and may not be suitable for all investors. The simulated capital provided is not real money and cannot be lost by the trader. Past performance is not indicative of future results. Please ensure you fully understand the risks involved and seek independent advice if necessary. The People Prop is not a broker and does not accept deposits.
          </p>
          <div className="flex flex-col items-center justify-between gap-4 text-[13px] font-medium opacity-80 sm:flex-row">
            <span>&copy; {new Date().getFullYear()} The People Prop. All rights reserved.</span>
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="inline-flex items-center gap-1.5 rounded-full bg-[#0c0c0c]/5 px-4 py-2 transition-opacity hover:opacity-100">
              <ChevronUp className="h-4 w-4" strokeWidth={2.5} /> Back to top
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}