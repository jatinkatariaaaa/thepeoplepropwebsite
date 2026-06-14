import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function AMLPolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink-950)] flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-24 mt-20">
        <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4">Anti-Money Laundering (AML) Policy</h1>
        <p className="text-[var(--ink-500)] mb-12">Last Updated: June 2026</p>
        
        <div className="prose prose-neutral max-w-none text-[var(--ink-700)] leading-relaxed space-y-6">
          <p>
            The People Prop is committed to the highest standards of Anti-Money Laundering (AML) and Counter-Terrorist Financing (CTF) compliance. This policy outlines our procedures to prevent our services from being used for illicit purposes.
          </p>

          <h2 className="text-2xl font-bold text-[var(--ink-950)] mt-8 mb-4">1. Know Your Customer (KYC)</h2>
          <p>
            Before we issue any payouts or establish a funded contractor relationship with a trader, we require mandatory KYC verification. You will be required to provide:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>A valid, government-issued photographic identification (e.g., Passport, National ID, or Driver's License).</li>
            <li>Proof of residential address issued within the last 3 months (e.g., utility bill or bank statement).</li>
            <li>A live selfie or biometric verification through our third-party verification partners.</li>
          </ul>

          <h2 className="text-2xl font-bold text-[var(--ink-950)] mt-8 mb-4">2. Prohibited Jurisdictions</h2>
          <p>
            The People Prop does not offer services to residents of certain sanctioned countries and jurisdictions, as determined by major global regulatory bodies (e.g., OFAC, UN, EU). If you reside in a restricted region, your account will be suspended, and any fees paid will not be refunded.
          </p>

          <h2 className="text-2xl font-bold text-[var(--ink-950)] mt-8 mb-4">3. Payment and Payout Source Verification</h2>
          <p>
            We strictly enforce a "closed-loop" payment system wherever possible. This means that:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Payments for evaluation accounts must come from an account or crypto wallet in your own name.</li>
            <li>Payouts of your profit split will only be sent to bank accounts or crypto wallets that have been verified to belong to you.</li>
            <li>Third-party payments are strictly prohibited and will be rejected.</li>
          </ul>

          <h2 className="text-2xl font-bold text-[var(--ink-950)] mt-8 mb-4">4. Monitoring and Reporting</h2>
          <p>
            Our compliance team actively monitors all transactions, including challenge purchases and profit payouts, for suspicious activity. Any transactions that raise red flags will be investigated. We reserve the right to report suspicious activities to the relevant financial intelligence units or law enforcement agencies without prior notice to the user.
          </p>

          <h2 className="text-2xl font-bold text-[var(--ink-950)] mt-8 mb-4">5. Account Suspension</h2>
          <p>
            Failure to comply with our KYC requirements or any suspicion of involvement in money laundering, terrorist financing, or fraud will result in the immediate and permanent suspension of your account and forfeiture of any simulated profits.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
