export default function V2Layout({ children }: { children: React.ReactNode }) {
  return (
    /* Override the root layout's light background + hide Navbar/Footer via a wrapper that resets everything */
    <div className="v2-root">
      {children}
    </div>
  );
}
