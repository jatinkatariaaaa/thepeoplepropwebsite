"use client";

import Image from "next/image";
import { Calendar, CircleDollarSign, ShieldAlert, ShieldCheck, Trophy, User, type LucideIcon } from "lucide-react";
import { certificateImagePath, certificateTitle, type Certificate } from "@/lib/certificates/types";
import { Button, Container, Section } from "../ui";
import { Reveal, Stagger, StaggerItem } from "../motion";
import { PageHero } from "../page-hero";
import { Cta } from "../cta";
import { href } from "../routes";

function lede(c: Certificate) {
  if (c.kind === "payout") return `This certifies that ${c.traderName} received a ${c.amount} payout from The People Prop on ${c.issuedOn}.`;
  if (c.kind === "highest") return `This certifies that ${c.traderName} received the largest single payout The People Prop made in ${c.period}: ${c.amount}.`;
  return `This certifies that ${c.traderName} has passed The People Prop evaluation and met all required trading objectives.`;
}

function details(c: Certificate): { icon: LucideIcon; label: string; value: string }[] {
  if (c.kind === "funded")
    return [
      { icon: User, label: "Trader name", value: c.traderName },
      { icon: Trophy, label: "Account size", value: c.accountSize },
      { icon: Calendar, label: "Issue date", value: c.issuedOn },
    ];
  return [
    { icon: User, label: "Trader name", value: c.traderName },
    { icon: CircleDollarSign, label: c.kind === "highest" ? `Highest payout · ${c.period}` : "Amount paid", value: c.amount ?? "" },
    { icon: Calendar, label: "Paid on", value: c.issuedOn },
  ];
}

/** Public certificate check. `certificate` is null when the id matches no passed account or paid payout. */
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
          lede="This certificate is invalid, or the account or payout it refers to doesn't qualify for one."
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

  return (
    <>
      <PageHero
        art="/art/page-verify.webp"
        crumb="Certificate"
        eyebrow={`Verified · ${certificateTitle[certificate.kind]}`}
        icon={ShieldCheck}
        lead="Certificate"
        fade="verified."
        lede={lede(certificate)}
      >
        <Button href="#certificate">View certificate</Button>
      </PageHero>

      <Section id="certificate" shell={false} className="pt-6 pb-40 sm:pb-48">
        <Container>
          <Reveal>
            <div className="g-glass g-hair mx-auto max-w-5xl rounded-[32px] p-2 sm:p-3">
              <div className="relative aspect-[1.6] w-full overflow-hidden rounded-[26px] bg-[#0b0d0c]">
                <Image
                  src={certificateImagePath(certificate.kind, certificate.id)}
                  alt={`${certificateTitle[certificate.kind]} for ${certificate.traderName}`}
                  fill
                  className="object-contain"
                  priority
                  unoptimized // Allow the API route to serve it directly
                />
              </div>
            </div>
          </Reveal>
          <Stagger className="mx-auto mt-3 grid max-w-5xl gap-3 sm:grid-cols-3">
            {details(certificate).map(({ icon: Icon, label, value }) => (
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
