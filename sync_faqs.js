const fs = require('fs');
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values.length > 0) process.env[key.trim()] = values.join('=').trim().replace(/['"]/g, '');
  });
}
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const faqs = [
  {
    question: "What is The People Prop?",
    answer: "TPP is a proprietary trading firm that funds skilled retail traders with up to $200,000 in evaluation capital. Pass the evaluation, trade our capital, and keep up to 90% of the profits.",
    category: "general",
  },
  {
    question: "What is TPP referral campaign?",
    answer: "Join our telegram community and get your unique referral link and refer your friends to our telegram community and win guaranteed evaluations.",
    category: "general",
  },
  {
    question: "Do I need experience to apply?",
    answer: "There is no formal experience requirement, but our evaluation is built for traders who have a demonstrated edge. We strongly recommend 6+ months of consistent demo or live trading before purchasing.",
    category: "general",
  },
  {
    question: "What platforms do you support?",
    answer: "TPP runs on MetaTrader 5 and cTrader at launch, with TradingView integration in Q4 2026. All execution is on raw spreads with $3 round-turn commission per standard lot.",
    category: "platform",
  },
  {
    question: "How long does the evaluation take?",
    answer: "There is no time limit. Most traders pass the 1-step evaluation in 8 to 25 trading days. Minimum is 3 trading days.",
    category: "rules",
  },
  {
    question: "What is the profit split on a funded account?",
    answer: "Profit splits range from 80% on the $5K starter to 90% on the $25K and $50K accounts. The first payout includes a 100% refund of your evaluation fee.",
    category: "payouts",
  },
  {
    question: "How often are payouts processed?",
    answer: "Bi-weekly. Standard processing time is under 24 hours via bank wire, USDT, or major e-wallets. Your first payout is available 14 days after your first funded trade.",
    category: "payouts",
  },
  {
    question: "What's the maximum daily loss?",
    answer: "4% of the previous day's closing balance, including floating P&L. The limit resets at midnight UTC. Breaching it ends the evaluation; funded accounts get one soft breach allowance.",
    category: "rules",
  },
  {
    question: "Can I trade news events?",
    answer: "Yes — news trading is permitted on both evaluation and funded accounts. Profits during the 5-minute window around Tier-1 news may be subject to review on funded accounts.",
    category: "rules",
  },
  {
    question: "Can I hold positions over the weekend?",
    answer: "Yes, weekend holding is permitted with no penalty on all account types. Be mindful that gap risk still counts toward Monday's daily loss limit.",
    category: "rules",
  },
  {
    question: "What is the consistency rule?",
    answer: "No single trading day's profit may exceed 30% of your total profit at payout review. This applies only on funded accounts, and it pauses payouts rather than breaching the account.",
    category: "rules",
  },
  {
    question: "How does the scaling plan work?",
    answer: "After 4 months of consistent funded performance with 10% net profit and no rule breaches, your account scales by 25% of the original balance. Maximum scaled size is 4× the starting account.",
    category: "general",
  }
];

async function run() {
  console.log("Clearing existing FAQs...");
  await supabase.from("tpp_faqs").delete().neq('id', 0); // Delete all
  
  console.log("Inserting all original FAQs...");
  const dataToInsert = faqs.map((f, i) => ({
    ...f,
    sort_order: i + 1,
    is_active: true
  }));
  
  const { error } = await supabase.from("tpp_faqs").insert(dataToInsert);
  
  if (error) {
    console.error("Error inserting:", error);
  } else {
    console.log("Successfully synced all FAQs!");
  }
}

run();
