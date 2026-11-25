import { addOns, type AddOnKey, type ProgramKey } from "@/data/programs";
import type { CouponEligibility } from "@/lib/coupon-eligibility";

/**
 * Order pricing. Pure and shared: the checkout form calls it to show the
 * total, and the server calls it again with values read from Supabase to
 * decide what is actually charged. The browser never sets a price.
 */

export interface CouponInfo {
  code: string;
  discountPct: number;
  /** A "free evaluation" coupon covers the whole order. */
  freeEvaluation: boolean;
  /** Add-ons this coupon includes at no charge. */
  grantsAddons: string[];
  eligibility: CouponEligibility;
}

export interface QuoteLine {
  key: string;
  label: string;
  amount: number;
  /** included by a coupon */
  free?: boolean;
}

export interface Quote {
  programKey: ProgramKey;
  size: number;
  base: number;
  addOns: QuoteLine[];
  /** add-on keys the order ends up with (selected + granted by the coupon) */
  addOnKeys: AddOnKey[];
  platformFee: number;
  discount: number;
  couponCode: string | null;
  /** full price of the order */
  total: number;
  /** what the checkout charges now */
  dueToday: number;
  /** Access only: charged after the evaluation is passed */
  dueAfterPass: number;
}

const money = (n: number) => Math.round(n * 100) / 100;

export function buildQuote(input: {
  programKey: ProgramKey;
  size: number;
  /** fee for this program and size */
  base: number;
  addOnKeys: string[];
  platformExtraPct?: number;
  coupon?: CouponInfo | null;
  /** Access: pay `upfrontFee` now and the rest after passing */
  payAfterPass?: boolean;
  upfrontFee?: number | null;
}): Quote {
  const { programKey, size, base } = input;
  const coupon = input.coupon ?? null;
  const granted = new Set(coupon?.grantsAddons ?? []);
  const wanted = new Set<string>([...input.addOnKeys, ...granted]);

  const lines: QuoteLine[] = addOns
    .filter((a) => wanted.has(a.key) && a.appliesTo.includes(programKey))
    .map((a) => {
      const free = granted.has(a.key);
      return { key: a.key, label: a.label, amount: free ? 0 : money((base * a.feePct) / 100), free };
    });

  const platformFee = money((base * (input.platformExtraPct ?? 0)) / 100);
  const gross = base + lines.reduce((s, l) => s + l.amount, 0) + platformFee;

  let discount = 0;
  if (coupon) {
    discount = coupon.freeEvaluation || coupon.discountPct >= 100 ? gross : money((base * coupon.discountPct) / 100);
    discount = Math.min(discount, gross);
  }
  const total = money(Math.max(0, gross - discount));

  const upfront = input.payAfterPass ? Math.max(0, Number(input.upfrontFee ?? 0)) : 0;
  const dueToday = input.payAfterPass ? (total <= 0 ? 0 : money(Math.min(upfront, total))) : total;
  const dueAfterPass = input.payAfterPass ? total : 0;

  return {
    programKey,
    size,
    base,
    addOns: lines,
    addOnKeys: lines.map((l) => l.key as AddOnKey),
    platformFee,
    discount,
    couponCode: coupon?.code ?? null,
    total,
    dueToday,
    dueAfterPass,
  };
}
