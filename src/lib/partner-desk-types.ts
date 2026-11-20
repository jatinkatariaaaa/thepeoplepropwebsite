export type PartnerDeskMember = {
  rank: string;
  permissions: string[];
  directCode: string;
  poolBps: number | null;
};

export type PartnerDeskLink = {
  id: string;
  code: string;
  recipient: string;
  shareBps: number;
  active: boolean;
  referredLogins?: number;
};

export type PartnerDeskPromotion = {
  code: string;
  active: boolean;
  shareBps: number;
  sales: number;
  earnedCents: number;
};

export type PartnerDeskSnapshot = {
  member: PartnerDeskMember | null;
  totalLogins?: number;
  referredLogins?: number;
  directLogins?: number;
  commissions?: { sales: number; earnedCents: number };
  links?: PartnerDeskLink[];
  promotions: PartnerDeskPromotion[];
};
