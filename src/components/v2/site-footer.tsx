const footerLinks = [
  "Home",
  "Rewards",
  "Affiliate",
  "About",
  "Privacy Policy",
  "Refund Policy",
  "Cookie Policy",
  "Terms and Conditions",
  "Contact",
  "FAQ",
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-sm font-semibold text-foreground">Subscribe for our newsletter</p>
            <form
              className="flex w-full max-w-md items-center gap-2"
              onSubmit={undefined}
              action="#"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                placeholder="Enter your email"
                className="h-11 w-full rounded-full border border-border bg-secondary px-5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="h-11 shrink-0 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Subscribe
              </button>
            </form>
            <p className="text-xs text-muted-foreground">
              Your information is never disclosed to third parties.
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              {footerLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-4 border-t border-border pt-8 text-center">
            <p className="text-xs text-muted-foreground">
              {
                "\u00A9ThePeopleProp 2026. All Rights Reserved - thepeopleprop.live"
              }
            </p>
            <div className="mx-auto flex max-w-4xl flex-col gap-3 text-left text-[11px] leading-relaxed text-muted-foreground/70">
              <p>
                Clients are provided with demo accounts containing simulated funds. All client
                trading operations are conducted in a simulated environment. More details can be
                found in the FAQ section.
              </p>
              <p>
                <span className="font-semibold">Important:</span> The People Prop is not a financial
                institution and does not promote or sell any financial products or services. All
                accounts are demo accounts with simulated funds, and no real money is involved in
                any trading activity on the platform.
              </p>
              <p>
                <span className="font-semibold">Risk Warning:</span> Speculative trading, even in a
                simulated environment, carries substantial risk. Leverage can magnify both gains
                and losses. We do not provide investment advice; our services are intended for
                educational and practice purposes only. Consider your objectives, financial
                situation, and experience before trading, and consult an independent financial
                advisor if you have concerns.
              </p>
              <p>
                <span className="font-semibold">Disclaimer:</span> Simulated trading is not
                suitable for everyone, and past performance in simulated trading is not indicative
                of future results. All content on this website is for educational purposes only and
                should not be construed as investment advice or an offer to buy or sell any
                financial instruments. The People Prop does not act as a broker, custodian, or financial
                advisor and does not conduct any regulated financial activities.
              </p>
              <p>
                BLUEWAVE DIGITAL EDUCATION - FZCO, IFZA Properties, Dubai Silicon Oasis, Dubai,
                UAE, acts solely as a technology and platform provider, remains the sole seller and
                issuer of all products and services on this website, and provides simulated trading
                platforms and related technological infrastructure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
