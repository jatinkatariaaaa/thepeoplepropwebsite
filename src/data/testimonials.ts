export interface Testimonial {
  name: string;
  handle: string;
  location: string;
  payout: string;
  body: string;
  initials: string;
}

export const testimonials: Testimonial[] = [
  {
    name: "Marcus Adeyemi",
    handle: "@marcus.fx",
    location: "Lagos, NG",
    payout: "$18,420",
    initials: "MA",
    body:
      "I've evaluated with four prop firms before TPP. The execution feels like a real institutional desk — no slippage tricks, no shifting goalposts. Got my first payout in 11 days.",
  },
  {
    name: "Sofía Carrasco",
    handle: "@sofi.trades",
    location: "Madrid, ES",
    payout: "$9,610",
    initials: "SC",
    body:
      "The consistency rule is actually fair here. It's about being a real trader, not gaming the system. The 90% split on the 25K is the highest I've seen anywhere.",
  },
  {
    name: "Daniel Park",
    handle: "@dpfx",
    location: "Seoul, KR",
    payout: "$24,300",
    initials: "DP",
    body:
      "Scaling plan got me from a 25K to a 75K in 8 months. Bi-weekly payouts always land on time. The whole experience just feels premium — a different tier from anything else I've used.",
  },
];

/* Extended set used by the marquee-style testimonial rows */
export const testimonialsExtended: Testimonial[] = [
  ...testimonials,
  {
    name: "Aisha Okafor",
    handle: "@aisha.fx",
    location: "Abuja, NG",
    payout: "$14,850",
    initials: "AO",
    body:
      "Sub-24h payouts aren't marketing fluff — my withdrawal hit in 9 hours. The dashboard is clean, the rules are transparent, and the execution is razor-sharp.",
  },
  {
    name: "Liam O'Connor",
    handle: "@liam.scalps",
    location: "Dublin, IE",
    payout: "$7,200",
    initials: "LO",
    body:
      "No time limit on the evaluation was a game-changer for me. I could trade at my own pace without the pressure of a 30-day clock. Passed in 3 weeks, funded the next day.",
  },
  {
    name: "Priya Mehta",
    handle: "@priyafx",
    location: "Mumbai, IN",
    payout: "$11,320",
    initials: "PM",
    body:
      "The one-step evaluation is refreshing. No second phases, no hidden gotchas. Hit the target, get funded. My fee was refunded with my first payout — exactly as promised.",
  },
  {
    name: "Ahmed Hassan",
    handle: "@ahmed.trades",
    location: "Cairo, EG",
    payout: "$16,750",
    initials: "AH",
    body:
      "News trading is allowed, weekend holding is allowed — TPP doesn't penalise you for trading like a real trader. That alone sets them apart from every other firm.",
  },
  {
    name: "Chen Wei",
    handle: "@chen.markets",
    location: "Singapore, SG",
    payout: "$21,400",
    initials: "CW",
    body:
      "I've been funded for 6 months now. Auto-scaling bumped me from $25K to $50K without any paperwork. The profit split at this level is 90% — hard to beat anywhere.",
  },
  {
    name: "Elena Volkov",
    handle: "@elena.fx",
    location: "Berlin, DE",
    payout: "$8,900",
    initials: "EV",
    body:
      "Tier-1 liquidity, raw spreads, no re-quotes. The execution quality is exactly what they promise. My drawdown never spiked from bad fills — that's rare in this space.",
  },
  {
    name: "James Osei",
    handle: "@james.funded",
    location: "Accra, GH",
    payout: "$12,640",
    initials: "JO",
    body:
      "Bi-weekly payouts keep the cash flow consistent. I requested via USDT and it arrived same day. The support team actually responds — not bots, real people.",
  },
  {
    name: "Yuki Tanaka",
    handle: "@yuki.fx",
    location: "Tokyo, JP",
    payout: "$19,200",
    initials: "YT",
    body:
      "The 4% daily drawdown and 8% max are strict but fair. It forces discipline. I've actually become a better trader since joining TPP — the structure works.",
  },
  {
    name: "Ricardo Silva",
    handle: "@ricardo.trades",
    location: "São Paulo, BR",
    payout: "$15,800",
    initials: "RS",
    body:
      "142 countries served — I was skeptical, but the onboarding was smooth from Brazil. Bank wire payout arrived in under 24 hours. Legitimate operation, no question.",
  },
  {
    name: "Fatima Al-Rashid",
    handle: "@fatima.fx",
    location: "Dubai, AE",
    payout: "$22,100",
    initials: "FR",
    body:
      "Started with the $10K challenge, now trading a $50K funded account. The scaling plan is automatic — hit your targets, grow your capital. Simple as it should be.",
  },
  {
    name: "Oliver Strand",
    handle: "@oliver.swing",
    location: "Stockholm, SE",
    payout: "$6,480",
    initials: "OS",
    body:
      "As a swing trader, the no time limit policy is essential. Most firms force you into scalping strategies. TPP lets you trade your style — that's why I chose them.",
  },
  {
    name: "Grace Nwankwo",
    handle: "@grace.fx",
    location: "London, UK",
    payout: "$13,750",
    initials: "GN",
    body:
      "The Founders' Cohort pricing is genuinely competitive. 100% refund on first payout means the challenge is essentially free if you're a profitable trader. No-brainer.",
  },
  {
    name: "Raj Patel",
    handle: "@raj.scalps",
    location: "Toronto, CA",
    payout: "$17,920",
    initials: "RP",
    body:
      "Three trading days minimum, no time limit maximum. That's the kind of flexibility a real trader needs. I passed in 5 days, got my credentials in under 24 hours.",
  },
  {
    name: "Maria Santos",
    handle: "@maria.trades",
    location: "Lisbon, PT",
    payout: "$10,340",
    initials: "MS",
    body:
      "The e-wallet payout option is perfect for me. Fast, no conversion fees, arrives same day. Combined with the 90% split, the maths just works out better than any other firm.",
  },
  {
    name: "Kwame Asante",
    handle: "@kwame.fx",
    location: "Kumasi, GH",
    payout: "$8,120",
    initials: "KA",
    body:
      "From signup to first funded trade took 12 days. The evaluation is straightforward — 10% target, 3 day minimum, no tricks. Just prove you can trade. Clean and simple.",
  },
  {
    name: "Nina Kowalski",
    handle: "@nina.markets",
    location: "Warsaw, PL",
    payout: "$20,500",
    initials: "NK",
    body:
      "I've been consistently hitting bi-weekly payouts for 4 months. The 90% profit split on my $50K account means I'm earning more than I ever did with a full-time job.",
  },
  {
    name: "Tariq Mahmoud",
    handle: "@tariq.fx",
    location: "Karachi, PK",
    payout: "$11,800",
    initials: "TM",
    body:
      "What convinced me was the one-step process. Other firms make you pass 2-3 phases over 60 days. TPP: one phase, no time limit, funded in days. The industry should take notes.",
  },
];
