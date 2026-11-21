import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSessionUser } from "@/lib/api-auth";
import { CheckoutError, newOrderId, quoteOrder, saveInvoice, siteUrl } from "@/lib/checkout";
import { issuanceId } from "@/lib/issuance-id";
import { isUuid } from "@/lib/certificates/types";
import { provisionNextPhase, provisionTradingAccountForPurchase } from "@/lib/account-provisioning";

/**
 * Checkout. The browser sends what the trader chose; the amount is always
 * worked out here from Supabase. Two kinds of order:
 *   - a new account (default)
 *   - { kind: "activation", accountId }: the fee for a passed Access account
 */
export async function POST(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });

    const body = await request.json();
    if (body.kind === "activation") return await activation(user, body);
    if (body.attemptId != null && (typeof body.attemptId !== "string" || !isUuid(body.attemptId))) throw new CheckoutError("Invalid checkout attempt.");
    const purchaseId = body.attemptId ?? crypto.randomUUID();
    if (body.attemptId) {
      const prior = await supabaseAdmin.from("purchases").select("*").eq("id",purchaseId).eq("user_id",user.id).maybeSingle();
      if (prior.error) throw prior.error;
      if (prior.data) {
        if (prior.data.kind !== "challenge") throw new CheckoutError("Checkout attempt already used.",409);
        if (prior.data.payment_status === "paid") {
          const result = await provisionTradingAccountForPurchase(prior.data);
          return NextResponse.json({ success:true, orderId:prior.data.order_id, account:result.account, invoice_url:siteUrl()+"/dashboard?success=true" });
        }
        if (prior.data.payment_status === "pending" && prior.data.invoice_url) return NextResponse.json({success:true,orderId:prior.data.order_id,invoice_url:prior.data.invoice_url});
        return NextResponse.json({error:"This order already exists. Check Transactions for its status.", restart:prior.data.payment_status==="failed"}, {status:409});
      }
    }

    const { quote, program, platformName } = await quoteOrder({
      programKey: String(body.programKey || ""),
      accountSize: Number(body.accountSize),
      addOns: Array.isArray(body.addOns) ? body.addOns : [],
      platform: body.platform ?? null,
      promoCode: body.promoCode ?? null,
    });

    const orderId = newOrderId();
    const { data: purchase, error: purchaseError } = await supabaseAdmin
      .from("purchases")
      .insert({
        id: purchaseId,
        funded_issue_key: program.phases != null && Number(program.phases) === 0 ? issuanceId("purchase",purchaseId) : null,
        user_id: user.id,
        order_id: orderId,
        full_name: String(body.fullName || "").trim().slice(0, 160) || user.email || "Trader",
        email: user.email,
        country: String(body.country || "").slice(0, 80) || null,
        address: String(body.address || "").slice(0, 300) || null,
        program_key: quote.programKey,
        account_size: quote.size,
        price_amount: quote.dueToday,
        base_fee: quote.base,
        discount_amount: quote.discount,
        activation_fee: quote.dueAfterPass > 0 ? Math.max(0, quote.dueAfterPass - quote.dueToday) : null,
        addons: quote.addOnKeys,
        platform: platformName,
        kind: "challenge",
        payment_status: "pending",
        payment_method: "crypto",
        promo_code: quote.couponCode,
      })
      .select()
      .single();
    if (purchaseError?.code === "23514" && purchaseError.message.includes("allocation")) throw new CheckoutError("Your active funded accounts and reserved orders cannot exceed $400,000.",409);
    if (purchaseError?.code === "23505") throw new CheckoutError("This order is already being created. Check Transactions before retrying.",409);
    if (purchaseError) throw purchaseError;

    // Fully discounted orders have nothing to pay: issue the account now.
    if (quote.dueToday <= 0) {
      const { error: paymentError } = await supabaseAdmin.rpc("settle_free_checkout",{p_id:purchase.id});
      if (paymentError?.code === "23514") {
        const failed=await supabaseAdmin.from("purchases").update({payment_status:"failed"}).eq("id",purchase.id).eq("payment_status","pending");
        if(failed.error) throw failed.error;
        throw new CheckoutError("That offer is no longer available. Review your order.",409);
      }
      if (paymentError) throw paymentError;
      const provisioning = await provisionTradingAccountForPurchase({ ...purchase, user_id: user.id, email: user.email });
      return NextResponse.json({ success: true, orderId, account: provisioning.account, invoice_url: `${siteUrl()}/dashboard?success=true`, message: "Your account is ready." });
    }

    const invoiceUrl = await saveInvoice(purchase.id,{
      amount: quote.dueToday,
      orderId,
      description: `${program.short_label || quote.programKey} $${quote.size.toLocaleString("en-US")} account`,
      email: user.email,
    });
    return NextResponse.json({ success: true, orderId, invoice_url: invoiceUrl, amount: quote.dueToday, message: "Invoice created. Redirecting to payment." });
  } catch (err) {
    if (err instanceof CheckoutError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Could not complete checkout. Check Transactions before trying again." }, { status: 500 });
  }
}

/** Access: the trader has passed and now pays the account fee to receive the funded account. */
async function activation(user: { id: string; email?: string }, body: { accountId?: string }) {
  const { data: account } = await supabaseAdmin.from("trading_accounts").select("*").eq("id", String(body.accountId || "")).eq("user_id", user.id).maybeSingle();
  if (!account) throw new CheckoutError("Account not found.", 404);
  if (account.status !== "passed" || !(Number(account.activation_fee) > 0)) throw new CheckoutError("This account has no activation fee to pay.");
  if (account.activation_due_at && new Date(account.activation_due_at).getTime() < Date.now()) {
    throw new CheckoutError("The activation window for this account has closed. Contact support to have it reopened.");
  }

  const { data: next } = await supabaseAdmin.from("trading_accounts").select("id").eq("previous_account_id", account.id).maybeSingle();
  if (next) throw new CheckoutError("This account is already activated.");

  const fee = Number(account.activation_fee);
  const { data: open } = await supabaseAdmin
    .from("purchases")
    .select("*")
    .eq("kind", "activation")
    .eq("related_account_id", account.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (open?.payment_status === "paid") {
    const result = await provisionNextPhase(account, { activationPaid: true });
    return NextResponse.json({ success: true, account: result.account, invoice_url: `${siteUrl()}/dashboard?success=true` });
  }
  if (open?.invoice_url && open.payment_status === "pending" && Number(open.price_amount) === fee) {
    return NextResponse.json({ success: true, orderId: open.order_id, invoice_url: open.invoice_url, amount: fee });
  }

  const orderId = newOrderId("ACT");
  const { data: purchase, error } = await supabaseAdmin
    .from("purchases")
    .insert({
      user_id: user.id,
      order_id: orderId,
      full_name: user.email || "Trader",
      email: user.email,
      program_key: account.program_key,
      account_size: account.starting_balance,
      price_amount: fee,
      kind: "activation",
      funded_issue_key: issuanceId("phase",account.id,"funded"),
      related_account_id: account.id,
      payment_status: "pending",
      payment_method: "crypto",
    })
    .select()
    .single();
  if (error?.code === "23514" && error.message.includes("allocation")) throw new CheckoutError("Your active funded accounts and reserved orders cannot exceed $400,000.",409);
  if (error?.code === "23505") throw new CheckoutError("An activation order is already open. Check Transactions for its status.",409);
  if (error) throw error;

  const invoiceUrl = await saveInvoice(purchase.id,{ amount: fee, orderId, description: `Access $${Number(account.starting_balance).toLocaleString("en-US")} funded account fee`, email: user.email });
  return NextResponse.json({ success: true, orderId, invoice_url: invoiceUrl, amount: fee });
}
