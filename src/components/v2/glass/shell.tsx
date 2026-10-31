import { Header } from "./header";
import { Footer } from "./footer";
import { V2DataProvider } from "./data";

/** The frame every public page sits in: shared data, header and footer. */
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="v2-scope min-h-screen overflow-x-clip antialiased">
      <V2DataProvider>
        <Header />
        <main id="content">{children}</main>
        <Footer />
      </V2DataProvider>
    </div>
  );
}
