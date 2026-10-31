"use client";

import Image from "next/image";
import { Calendar, ShieldAlert, ShieldCheck, Trophy, User } from "lucide-react";
import { Button, Container, Section } from "../ui";
import { Reveal, Stagger, StaggerItem } from "../motion";
import { PageHero } from "../page-hero";
import { Cta } from "../cta";
import { href } from "../routes";

export type Certificate = { id: string; traderName: string; accountSize: string; passDate: string };

/** Public certificate check. `certificate` is null when the id is unknown or the account hasn't passed. */
export function VerifyPage({ certificate }: { certificate: Certificate | null }) {
  if (!certificate)
    return (
      <>
        <PageHero
          art="/art/page-verify.webp"
          crumb="Certificate"
          eyebrow="Certificate check"
          icon={ShieldAlert}
          lead="Certificate"
          fade="not found."
          lede="This certificate is invalid or the account has not met the passing criteria."
          className="pb-16"
        >
          <div className="flex flex-wrap gap-3">
            <Button href={href("contact")}>Contact support</Button>
            <Button href={href("home")} kind="glass" arrow={false}>
              Back to home
            </Button>
          </div>
        </PageHero>
        <Cta />
      </>
    );

  const details = [
    { icon: User, label: "Trader name", value: certificate.traderName },
    { icon: Trophy, label: "Account size", value: certificate.accountSize },
    { icon: Calendar, label: "Issue date", value: certificate.passDate },
  ];

  return (
    <>
      <PageHero
        art="/art/page-verify.webp"
        crumb="Certificate"
        eyebrow="Verified certificate"
        icon={ShieldCheck}
        lead="Certificate"
        fade="verified."
        lede={`This certifies that ${certificate.traderName} has passed The People Prop evaluation and met all required trading objectives.`}
      >
        <Button href="#certificate">View certificate</Button>
      </PageHero>

      <Section id="certificate" shell={false} className="pt-6 pb-40 sm:pb-48">
        <Container>
          <Reveal>
            <div className="g-glass g-hair mx-auto max-w-5xl rounded-[32px] p-2 sm:p-3">
              <div className="relative aspect-[1.41] w-full overflow-hidden rounded-[26px] bg-[#0b0d0c]">
                <Image
                  src={`/api/certificate/${certificate.id}`}
                  alt={`Certificate for ${certificate.traderName}`}
                  fill
                  className="object-contain"
                  priority
                  unoptimized // Allow the API route to serve it directly
                />
              </div>
            </div>
          </Reveal>
          <Stagger className="mx-auto mt-3 grid max-w-5xl gap-3 sm:grid-cols-3">
            {details.map(({ icon: Icon, label, value }) => (
              <StaggerItem key={label}>
                <div className="g-glass g-hair flex items-start gap-4 rounded-[24px] p-5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-white/[0.07] text-[var(--g-lime)] ring-1 ring-white/10">
                    <Icon className="h-5 w-5" strokeWidth={1.9} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[12.5px] text-white/50">{label}</span>
                    <span className="mt-1 block truncate text-[16px] font-semibold text-white">{value}</span>
                  </span>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          <p className="mx-auto mt-5 max-w-5xl text-[12.5px] text-white/40">
            Certificate ID <span className="g-num break-all text-white/60">{certificate.id}</span>
          </p>
        </Container>
      </Section>

      <Cta />
    </>
  );
}
