const footerLinks = [
  'Home',
  'Rewards',
  'Affiliate',
  'About',
  'Privacy Policy',
  'Refund Policy',
  'Cookie Policy',
  'Terms and Conditions',
  'Contact',
  'FAQ',
]

export function SiteFooter() {
  return (
    <footer className="bg-background">
      <div className="mx-auto max-w-[1400px] px-5 py-14 md:px-8 md:py-16">
        {/* Newsletter row */}
        <div className="flex flex-col gap-8 border-b border-border pb-12 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Newsletter
            </p>
            <p className="mt-3 max-w-sm font-heading text-2xl font-bold tracking-tight text-foreground">
              Market notes, payout reports, and offers &mdash; straight to your
              inbox.
            </p>
          </div>
          <form
            className="flex w-full max-w-md items-stretch"
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
              className="h-12 w-full border border-foreground bg-transparent px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="h-12 shrink-0 border border-l-0 border-foreground bg-foreground px-6 text-sm font-bold uppercase tracking-[0.12em] text-background transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              Subscribe
            </button>
          </form>
        </div>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Your information is never disclosed to third parties.
        </p>

        {/* Links */}
        <nav aria-label="Footer" className="mt-10">
          <ul className="flex flex-wrap gap-x-8 gap-y-3">
            {footerLinks.map((link) => (
              <li key={link}>
                <a
                  href="#"
                  className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Giant wordmark */}
        <p
          aria-hidden="true"
          className="mt-14 select-none border-b border-border pb-6 font-heading text-[11vw] font-bold uppercase leading-none tracking-tight text-foreground/10 md:text-[7.5rem]"
        >
          ThePeople/Prop
        </p>

        <div className="mt-8 flex flex-col gap-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {'\u00A9 ThePeopleProp 2026. All rights reserved — thepeopleprop.live'}
          </p>
          <div className="flex max-w-4xl flex-col gap-3 text-[11px] leading-relaxed text-muted-foreground/80">
            <p>
              Clients are provided with demo accounts containing simulated
              funds. All client trading operations are conducted in a simulated
              environment. More details can be found in the FAQ section.
            </p>
            <p>
              <span className="font-semibold">Important:</span> The People Prop
              is not a financial institution and does not promote or sell any
              financial products or services. All accounts are demo accounts
              with simulated funds, and no real money is involved in any
              trading activity on the platform.
            </p>
            <p>
              <span className="font-semibold">Risk Warning:</span> Speculative
              trading, even in a simulated environment, carries substantial
              risk. Leverage can magnify both gains and losses. We do not
              provide investment advice; our services are intended for
              educational and practice purposes only. Consider your objectives,
              financial situation, and experience before trading, and consult
              an independent financial advisor if you have concerns.
            </p>
            <p>
              <span className="font-semibold">Disclaimer:</span> Simulated
              trading is not suitable for everyone, and past performance in
              simulated trading is not indicative of future results. All
              content on this website is for educational purposes only and
              should not be construed as investment advice or an offer to buy
              or sell any financial instruments. The People Prop does not act
              as a broker, custodian, or financial advisor and does not conduct
              any regulated financial activities.
            </p>
            <p>
              BLUEWAVE DIGITAL EDUCATION - FZCO, IFZA Properties, Dubai Silicon
              Oasis, Dubai, UAE, acts solely as a technology and platform
              provider, remains the sole seller and issuer of all products and
              services on this website, and provides simulated trading
              platforms and related technological infrastructure.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
