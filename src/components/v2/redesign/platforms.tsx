import Image from "next/image";
import { Container, Eyebrow, Lede, SectionHeading } from "./primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/v2/motion";

const PLATFORMS = [
  {
    name: "MetaTrader 5",
    icon: "/images/icon-mt5.svg",
    body: "The full MT5 suite with expert advisors, custom indicators and one-click execution.",
  },
  {
    name: "DXtrade",
    icon: "/images/icon-dxtrade.svg",
    body: "Browser-native charting with depth of market and no install required.",
  },
  {
    name: "TPP Terminal",
    icon: "/images/icon-tpp-terminal.webp",
    body: "Our own terminal — drawdown tracking, payout requests and analytics in one place.",
  },
];

export function Platforms() {
  return (
    <section
      id="platforms"
      className="relative isolate overflow-hidden border-y border-border py-28 sm:py-32"
    >
      <Container>
        <div className="grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <div className="flex flex-col gap-5">
              <Eyebrow>Execution</Eyebrow>
              <SectionHeading>Trade where you already feel at home.</SectionHeading>
              <Lede>
                Raw spreads from 0.0 pips, execution under 20ms and a single
                account balance shared across every platform you connect.
              </Lede>
            </div>
          </Reveal>

          <Stagger className="flex flex-col lg:col-span-7" staggerDelay={0.1}>
            {PLATFORMS.map((p, i) => (
              <StaggerItem key={p.name}>
                <div
                  className={
                    i === 0
                      ? "group flex items-start gap-5 pb-8"
                      : "group flex items-start gap-5 border-t border-border py-8 last:pb-0"
                  }
                >
                  <span className="v2-glass grid h-12 w-12 shrink-0 place-items-center rounded-2xl transition-shadow duration-300 group-hover:shadow-[0_0_30px_-8px_color-mix(in_oklab,var(--primary)_80%,transparent)]">
                    <Image
                      src={p.icon}
                      alt=""
                      width={22}
                      height={22}
                      className="h-[22px] w-[22px] object-contain opacity-90 brightness-150 contrast-125"
                    />
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-heading text-[17px] text-foreground">
                      {p.name}
                    </h3>
                    <p className="max-w-md text-[13.5px] leading-relaxed text-muted-foreground text-pretty">
                      {p.body}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Container>
    </section>
  );
}
