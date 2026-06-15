import { Footer } from "@/components/layout/Footer";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Cookie Policy",
  description:
    "How The People Prop uses cookies and similar technologies to operate, secure, and improve our website and trading platform.",
  path: "/cookie",
});

export default function CookiePage() {
  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white flex flex-col">
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-24 mt-20">
        <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4">Cookie Policy</h1>
        <p className="text-white/50 mb-12">Last Updated: June 2026</p>
        
        <div className="prose prose-invert max-w-none text-white/70 leading-relaxed space-y-6">
          <p>
            This Cookie Policy explains how The People Prop uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">What are cookies?</h2>
          <p>
            Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">Why do we use cookies?</h2>
          <p>We use first-party and third-party cookies for several reasons:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Essential Cookies:</strong> Some cookies are required for technical reasons in order for our website to operate, such as enabling secure user logins and managing sessions.</li>
            <li><strong>Performance and Analytics Cookies:</strong> These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously (e.g., Google Analytics).</li>
            <li><strong>Functional Cookies:</strong> These cookies enable the website to provide enhanced functionality and personalization, such as remembering your language or region preferences.</li>
            <li><strong>Targeting/Advertising Cookies:</strong> These cookies are used to deliver advertisements more relevant to you and your interests. They may also be used to limit the number of times you see an advertisement.</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">How can I control cookies?</h2>
          <p>
            You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in your web browser. Most web browsers automatically accept cookies, but you can usually modify your browser setting to decline cookies if you prefer.
          </p>
          <p>
            Please note that if you choose to reject cookies, doing so may impair some of our website's functionality and prevent you from accessing certain features, such as the dashboard or checkout processes.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">Updates to this policy</h2>
          <p>
            We may update this Cookie Policy from time to time in order to reflect changes to the cookies we use or for other operational, legal, or regulatory reasons. Please revisit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
