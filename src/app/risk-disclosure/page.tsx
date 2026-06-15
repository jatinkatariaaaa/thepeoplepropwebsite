import { Footer } from "@/components/layout/Footer";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Risk Disclosure",
  description:
    "Read The People Prop risk disclosure. All evaluation and funded accounts are simulated environments. Trading carries a high level of risk — understand it before you start.",
  path: "/risk-disclosure",
});

export default function RiskDisclosurePage() {
  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white flex flex-col">
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-24 mt-20">
        <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4">Risk Disclosure</h1>
        <p className="text-white/50 mb-12">Last Updated: June 2026</p>
        
        <div className="prose prose-invert max-w-none text-white/70 leading-relaxed space-y-6">
          <p>
            Trading foreign exchange (Forex), contracts for difference (CFDs), cryptocurrencies, and other financial instruments carries a high level of risk and may not be suitable for all individuals. Before participating in our evaluation programs, you should carefully consider this Risk Disclosure.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Simulated Trading Environment</h2>
          <p>
            <strong>All accounts provided during the evaluation phase are simulated (demo) accounts.</strong> You are trading with virtual funds in a simulated environment. Your performance in this simulated environment does not guarantee future success in live trading.
          </p>
          <p>
            Even after passing an evaluation and being offered a "Funded Account", your trades may still be executed in a simulated environment, and your compensation will be based on the simulated performance according to your contractor agreement. We do not act as a broker, and you are not risking your own capital beyond the initial evaluation fee.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. No Financial Advice</h2>
          <p>
            Information provided on The People Prop website, social media, discord community, or any educational materials does not constitute financial, investment, or trading advice. All information is provided for educational and informational purposes only. You must make your own trading decisions based on your own judgment.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. High Risk of Loss</h2>
          <p>
            The high degree of leverage that is often obtainable in forex and CFD trading can work against you as well as for you. The use of leverage can lead to large losses as well as gains. You could lose some or all of your initial evaluation fee if you fail to meet the challenge objectives or violate the trading rules.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Hypothetical Performance Results</h2>
          <p>
            Hypothetical or simulated performance results have certain inherent limitations. Unlike an actual performance record, simulated results do not represent actual live trading. Since the trades have not actually been executed in a live market, the results may have under-or-over compensated for the impact, if any, of certain market factors, such as lack of liquidity.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Technological Risks</h2>
          <p>
            Trading on an electronic platform carries inherent risks. These include, but are not limited to, hardware failures, software malfunctions, internet connectivity issues, and platform downtime. The People Prop is not responsible for any losses or failed evaluations resulting from such technological failures.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">Acknowledgment</h2>
          <p>
            By purchasing an evaluation challenge, you acknowledge that you have read, understood, and accept all the risks detailed in this disclosure.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
