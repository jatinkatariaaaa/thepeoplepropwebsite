import Image from "next/image";
import { Container } from "./primitives";

const COLUMNS = [
  {
    title: "Trading",
    links: [
      { label: "Evaluation accounts", href: "#pricing" },
      { label: "Instant funding", href: "#pricing" },
      { label: "Scaling plan", href: "#edge" },
      { label: "Platforms", href: "#platforms" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About TPP", href: "#edge" },
      { label: "Payout ledger", href: "#proof" },
      { label: "Affiliates", href: "#cta" },
      { label: "Careers", href: "#cta" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help centre", href: "#faq" },
      { label: "Contact us", href: "#cta" },
      { label: "Trading rules", href: "#faq" },
      { label: "Status", href: "#platforms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative isolate overflow-hidden border-t border-border bg-background">
      <Container className="pt-16 pb-10">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="flex flex-col gap-5 lg:col-span-4">
            <a href="/v2" className="flex items-center gap-2.5">
              <Image
                src="/images/logo.webp"
                alt="The People Prop"
                width={28}
                height={28}
                className="h-7 w-7 rounded-full"
              />
              <span className="font-heading text-[15px] font-medium">
                The People Prop
              </span>
            </a>
            <p className="max-w-xs text-[13px] leading-relaxed text-muted-foreground text-pretty">
              A proprietary trading firm built by traders who got tired of the
              small print. Funded capital, honest rules, fast payouts.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav
              key={col.title}
              aria-label={col.title}
              className="flex flex-col gap-4 lg:col-span-2"
            >
              <h3 className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                {col.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[13px] text-foreground/70 transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="flex flex-col gap-3 lg:col-span-2">
            <h3 className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
              Community
            </h3>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              31,400 traders in our Discord.
            </p>
            <a
              href="#cta"
              className="v2-glass inline-flex w-fit items-center rounded-full px-4 py-2 text-[12.5px] text-foreground/85 transition-colors hover:text-foreground"
            >
              Join Discord
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-5 border-t border-border pt-8">
          <p className="text-[11.5px] leading-relaxed text-muted-foreground/70">
            All information on this site is for educational purposes only and
            does not constitute financial advice. The People Prop provides
            simulated trading environments; participants trade on demo accounts
            and are compensated on performance. Past performance is not
            indicative of future results. Trading carries substantial risk.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
              © {new Date().getFullYear()} The People Prop
            </p>
            <ul className="flex flex-wrap gap-6">
              {["Terms", "Privacy", "Refunds", "Cookies"].map((item) => (
                <li key={item}>
                  <a
                    href="#faq"
                    className="text-[12px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </footer>
  );
}
