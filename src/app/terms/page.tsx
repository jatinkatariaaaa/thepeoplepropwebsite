import { Footer } from "@/components/layout/Footer";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Terms of Service",
  description:
    "The terms and conditions governing your use of The People Prop evaluation challenges, funded accounts, and services.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white flex flex-col">
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-24 mt-20">
        <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4">Terms of Service</h1>
        <p className="text-white/50 mb-12">Last Updated: June 2026</p>
        
        <div className="prose prose-invert max-w-none text-white/70 leading-relaxed space-y-6">
          <p>
            Welcome to The People Prop. By accessing or using our website and services, you agree to comply with and be bound by the following terms and conditions. Please read them carefully.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By registering for an account, purchasing a challenge, or participating in our trading evaluation programs, you confirm that you are at least 18 years old and possess the legal authority to enter into these Terms of Service.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Services Provided</h2>
          <p>
            The People Prop provides proprietary trading evaluation services. We offer demo accounts for users to prove their trading skills based on specific rules and objectives. Successful completion of an evaluation may lead to an offer to trade a funded account, subject to an independent contractor agreement.
          </p>
          <p>
            <strong>Important Notice:</strong> We do not provide financial advice, investment services, or act as a broker. All trading during the evaluation phase occurs in a simulated environment.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Evaluation Rules and Conduct</h2>
          <p>Participants must adhere strictly to the trading rules outlined for their specific challenge. These rules include, but are not limited to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Adhering to daily and maximum drawdown limits.</li>
            <li>Meeting the specified profit targets.</li>
            <li>Refraining from prohibited trading strategies (e.g., latency arbitrage, malicious hedging, exploiting demo environments).</li>
          </ul>
          <p>Violation of any rules will result in immediate termination of the evaluation account without a refund.</p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Fees and Refunds</h2>
          <p>
            All fees paid for evaluations and add-ons are strictly non-refundable once the evaluation account has been actively traded. Refunds may only be granted if requested prior to executing the first trade on the account.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Intellectual Property</h2>
          <p>
            All content on this website, including logos, texts, graphics, and software, is the property of The People Prop and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our express permission.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Limitation of Liability</h2>
          <p>
            The People Prop is not liable for any direct, indirect, incidental, or consequential damages resulting from your use of our services. Trading carries a high level of risk, and you assume full responsibility for any outcomes related to your trading activities.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">7. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your account at any time if we suspect you have violated these Terms of Service, engaged in fraudulent activity, or abused our systems.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">8. Governing Law</h2>
          <p>
            These Terms of Service are governed by and construed in accordance with the laws of the jurisdiction in which The People Prop operates, without regard to its conflict of law principles.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
