import { Navbar } from @/components/layout/Navbar;
import { Footer } from @/components/layout/Footer;

export default function GenericPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-24 mt-20">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8 capitalize">help</h1>
        <div className="prose prose-invert max-w-none text-gray-400">
          <p>This is a placeholder for the help content. Please update this with actual legal or informational text.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
