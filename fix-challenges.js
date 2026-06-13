const fs = require('fs');

let content = fs.readFileSync('src/app/challenges/page.tsx', 'utf8');

// Hero Word Serif
content = content.replace(
  '<span className="word-serif">funded</span>',
  '<span className="font-serif italic text-[#cbfb45] px-2 bg-[#0c0c0c] rounded-xl -rotate-2 inline-block">funded</span>'
);

// Section 1 wrapper
content = content.replace(
  'className="relative py-16 md:py-24 border-t border-[var(--border)] bg-[var(--paper-2)]"',
  'className="relative py-16 md:py-24 border-t border-[#0c0c0c]/10 bg-[#f1eade]"'
);

// Title word serif
content = content.replace(
  '<span className="word-serif">every</span>',
  '<span className="font-serif italic text-[#cbfb45] px-2 bg-[#0c0c0c] rounded-xl rotate-1 inline-block">every</span>'
);

// Table container
content = content.replace(
  'className="surface-card rounded-2xl overflow-hidden"',
  'className="rounded-2xl overflow-hidden border border-[#0c0c0c]/10 bg-white/50 backdrop-blur-sm"'
);

// Table Header Row
content = content.replace(
  '<tr className="bg-[var(--paper)] border-b border-[var(--border)]">',
  '<tr className="border-b border-[#0c0c0c]/10 bg-[#0c0c0c]/5">'
);
content = content.replace(
  'className="text-left font-medium text-[var(--ink-700)] px-5 py-3.5 sticky left-0 bg-[var(--paper)]"',
  'className="text-left font-bold text-[#0c0c0c] px-5 py-3.5 sticky left-0 bg-[#f1eade]/90 backdrop-blur-sm"'
);
content = content.replace(
  'className="text-right font-medium text-[var(--ink-700)] px-4 py-3.5 whitespace-nowrap"',
  'className="text-right font-bold text-[#0c0c0c] px-4 py-3.5 whitespace-nowrap"'
);

// Table body tr classes
content = content.replace(
  /\? "bg-\[var\(--paper\)\]"[\s\n]+: "bg-white"/,
  '? "bg-[#0c0c0c]/[0.02]"\n                            : "bg-transparent"'
);

// Table sticky col
content = content.replace(
  'className="px-5 py-3.5 sticky left-0 bg-inherit"',
  'className="px-5 py-3.5 sticky left-0 bg-[#f1eade]/90 backdrop-blur-sm"'
);

// Table internal text
content = content.replace(
  'className="font-medium text-[var(--ink-950)]"',
  'className="font-bold text-[#0c0c0c]"'
);
content = content.replace(
  'className="rounded-full bg-[var(--accent-50)] text-[var(--accent-700)] text-[9.5px] tracking-eyebrow font-semibold px-1.5 py-0.5"',
  'className="rounded-full bg-[#cbfb45] text-[#0c0c0c] text-[9.5px] uppercase font-bold px-2 py-0.5"'
);
content = content.replace(
  '{p.badge.toUpperCase()}',
  '{p.badge}'
);
content = content.replace(
  'className="text-[11.5px] text-[var(--ink-500)] mt-0.5"',
  'className="text-[11.5px] text-[#0c0c0c]/60 mt-0.5 font-medium"'
);

// Table right cols
content = content.replace(
  'className="text-right px-4 py-3.5 whitespace-nowrap"',
  'className="text-right px-4 py-3.5 text-[#0c0c0c]/80"'
);
content = content.replace(
  'className="text-[var(--ink-950)]"',
  'className="font-medium"'
);
content = content.replace(
  'className="text-[var(--ink-400)]"',
  'className="text-[#0c0c0c]/30 text-[11px] font-medium"'
);

// Bottom text
content = content.replace(
  'className="px-5 py-3 border-t border-[var(--border)] bg-[var(--paper)] text-[11.5px] text-[var(--ink-500)]"',
  'className="px-5 py-3 mt-2 rounded-xl border border-[#0c0c0c]/10 bg-white/30 backdrop-blur-sm text-[11.5px] text-[#0c0c0c]/60 font-medium"'
);

// FAQ Section
content = content.replace(
  'className="relative py-16 md:py-24 border-t border-[var(--border)]"',
  'className="relative py-16 md:py-24 border-t border-[#0c0c0c]/10 bg-[#f1eade]"'
);
content = content.replace(
  '<span className="word-serif">ask</span>',
  '<span className="font-serif italic text-[#cbfb45] px-2 bg-[#0c0c0c] rounded-xl -rotate-1 inline-block">ask</span>'
);

fs.writeFileSync('src/app/challenges/page.tsx', content, 'utf8');
console.log('Fixed src/app/challenges/page.tsx');
