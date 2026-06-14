const fs = require('fs');
const path = require('path');

const pages = [
  'privacy', 'terms', 'cookie', 'aml-policy', 'risk-disclosure'
];

pages.forEach(page => {
  const file = path.join(__dirname, `src/app/${page}/page.tsx`);
  let content = fs.readFileSync(file, 'utf8');

  // Remove Navbar import and rendering
  content = content.replace(/import { Navbar } from "@\/components\/layout\/Navbar";\n/g, '');
  content = content.replace(/\s*<Navbar \/>\n/g, '\n');

  // Change background and text colors for dark mode
  content = content.replace(/bg-\[var\(--paper\)\] text-\[var\(--ink-950\)\]/g, 'bg-[#0c0c0c] text-white');
  content = content.replace(/text-\[var\(--ink-500\)\]/g, 'text-white/50');
  content = content.replace(/text-\[var\(--ink-700\)\]/g, 'text-white/70');
  content = content.replace(/text-\[var\(--ink-950\)\]/g, 'text-white');
  content = content.replace(/prose-neutral/g, 'prose-invert');

  fs.writeFileSync(file, content);
  console.log(`Updated ${page}`);
});
