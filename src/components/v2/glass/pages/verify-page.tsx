"use client";

import Image from "next/image";
import { Award, Calendar, CircleDollarSign, Handshake, ShieldAlert, ShieldCheck, Trophy, User, type LucideIcon } from "lucide-react";
import { certificateImagePath, certificateTitle, type ShareableCertificate } from "@/lib/certificates/types";
import { Button, Container, Section } from "../ui";
import { Reveal, Stagger, StaggerItem } from "../motion";
import { PageHero } from "../page-hero";
import { Cta } from "../cta";
import { href } from "../routes";

function lede(c: ShareableCertificate) {
  const of = c.program ? ` of the ${c.program}` : "";
  const on = c.accountSize ? ` on a ${c.accountSize} account` : "";
  switch (c.kind) {
    case "phase_pass":
      return `This certifies that ${c.traderName} passed ${c.phase ?? "the evaluation"}${of}${on} on ${c.issuedOn}.`;
    case "funded":
      return `This certifies that ${c.traderName} was issued a ${c.accountSize ?? ""} funded account${c.program ? ` (${c.program})` : ""} on ${c.issuedOn}.`;
    case "payout":
      return `This certifies that ${c.traderName} received a ${c.amount} payout from The People Prop on ${c.issuedOn}.`;
    case "highest_payout":
      return `This certifies that ${c.traderName} received the largest single payout The People Prop made in ${c.period}: ${c.amount}.`;
    case "award":
      return `This certifies that The People Prop presented ${c.traderName} with the ${c.title ?? "award"} on ${c.issuedOn}.`;
    case "partner":
      return `The People Prop recognizes ${c.traderName} as an approved collaborator in its Partner Program. This certificate was issued on ${c.issuedOn}.`;
  }
}

function details(c: ShareableCertificate): { icon: LucideIcon; label: string; value: string }[] {
  const name = { icon: User, label: c.kind === "partner" ? "Collaborator" : "Trader name", value: c.traderName };
  const date = { icon: Calendar, label: c.kind === "payout" || c.kind === "highest_payout" ? "Paid on" : "Issued on", value: c.issuedOn };
  switch (c.kind) {
    case "phase_pass":
      return [name, { icon: Trophy, label: c.phase ? `${c.phase} passed` : "Evaluation passed", value: c.accountSize ?? c.program ?? "—" }, date];
    case "funded":
      return [name, { icon: Trophy, label: "Funded account", value: c.accountSize ?? "—" }, date];
    case "payout":
      return [name, { icon: CircleDollarSign, label: "Amount paid", value: c.amount ?? "—" }, date];
    case "highest_payout":
      return [name, { icon: CircleDollarSign, label: `Highest payout · ${c.period ?? ""}`, value: c.amount ?? "—" }, date];
    case "award":
      return [name, { icon: Award, label: c.highlightLabel || "Award", value: c.highlightValue || c.title || "—" }, date];
    case "partner":
      return [name, { icon: Handshake, label: "Program", value: "The People Prop Partner Program" }, date];
  }
}

/** Public certificate check. `certificate` is null when no certificate matches the id. */
export function VerifyPage({ certificate }: { certificate: ShareableCertificate | null }) {
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
          lede="No certificate matches this link. Check the address, or contact support and quote the certificate number."
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

  const revoked = certificate.status === "revoked";
  const test = certificate.isTest;

  return (
    <>
      <PageHero
        art="/art/page-verify.webp"
        crumb="Certificate"
        eyebrow={test ? `Test · ${certificateTitle(certificate)}` : revoked ? `Revoked · ${certificateTitle(certificate)}` : `Verified · ${certificateTitle(certificate)}`}
        icon={test || revoked ? ShieldAlert : ShieldCheck}
        lead={test ? "Test" : "Certificate"}
        fade={test ? "certificate." : revoked ? "revoked." : "verified."}
        lede={
          test
            ? "This is a test certificate made by The People Prop staff to check the design. It does not certify a real result."
            : revoked
              ? `The People Prop withdrew this certificate${certificate.revokedReason ? ` (${certificate.revokedReason.replace(/\.$/, "")})` : ""}. It is no longer valid.`
              : lede(certificate)
        }
      >
        <Button href="#certificate">View certificate</Button>
      </PageHero>

      <Section id="certificate" shell={false} className="pt-6 pb-40 sm:pb-48">
        <Container>
          <Reveal>
            <div className="g-glass g-hair mx-auto max-w-5xl rounded-[32px] p-2 sm:p-3">
              <div className="relative aspect-[1.6] w-full overflow-hidden rounded-[26px] bg-[#0b0d0c]">
                <Image
                  src={certificateImagePath(certificate.id)}
                  alt={`${certificateTitle(certificate)} for ${certificate.traderName}`}
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
            Certificate No. <span className="g-num text-white/60">{certificate.number}</span> · ID <span className="g-num break-all text-white/60">{certificate.id}</span>
          </p>
        </Container>
      </Section>

      <Cta />
    </>
  );
}
