import { Footer } from "@/components/layout/Footer";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "Learn how The People Prop collects, uses, and protects your personal data across our evaluation programs, funded accounts, and website.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white flex flex-col">
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-24 mt-20">
        <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-white/50 mb-12">Last Updated: June 2026</p>
        
        <div className="prose prose-invert max-w-none text-white/70 leading-relaxed space-y-6">
          <p>
            At The People Prop, we take your privacy seriously. This Privacy Policy describes how we collect, use, and protect your personal information when you use our website and services.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Personal Identification Information:</strong> Name, email address, phone number, and physical address when you register for an account or participate in challenges.</li>
            <li><strong>Financial Information:</strong> Payment details, billing address, and crypto wallet addresses used for payouts. Payments are processed securely via third-party gateways; we do not store full card details.</li>
            <li><strong>Usage Data:</strong> Information on how you interact with our platform, including IP addresses, browser types, and trading performance metrics.</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. How We Use Your Information</h2>
          <p>We use the collected data for various purposes, including:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To provide, maintain, and improve our proprietary trading services.</li>
            <li>To process your payments and distribute payouts accurately.</li>
            <li>To verify your identity and ensure compliance with our AML and KYC policies.</li>
            <li>To communicate with you regarding your account, updates, and promotional offers.</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Data Sharing and Disclosure</h2>
          <p>
            We do not sell or rent your personal information to third parties. We may share your information with trusted third-party service providers (e.g., payment processors, trading platforms, identity verification services) solely to facilitate our services. All third parties are obligated to maintain the confidentiality and security of your data.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Data Security</h2>
          <p>
            We implement industry-standard security measures, including encryption and secure server hosting, to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Your Data Rights</h2>
          <p>
            Depending on your location, you may have the right to access, correct, update, or request deletion of your personal data. You can manage your account information through your dashboard or contact our support team for assistance.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Changes to This Policy</h2>
          <p>
            We reserve the right to update this Privacy Policy at any time. We will notify you of any significant changes by posting the new policy on this page and updating the "Last Updated" date.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">7. Contact Us</h2>
          <p>
            If you have any questions or concerns about this Privacy Policy, please contact us at support@thepeopleprop.com.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
