const fs = require('fs');
let content = fs.readFileSync('src/components/landing/ChallengeCalculator.tsx', 'utf8');

// Replace component name
content = content.replace('export function ChallengeCalculator', 'export function V2ChallengeCalculator');

// Replace colors to V2 Lime theme
content = content.replace(/var\(--accent\)/g, '#bcff2e');
content = content.replace(/var\(--accent-50\)/g, '#bcff2e20');
content = content.replace(/var\(--accent-400\)/g, '#a5e622');
content = content.replace(/var\(--accent-700\)/g, '#0c0c0c');

// Fix text color for lime background (white text on lime is invisible)
content = content.replace(/text-white/g, (match, offset, str) => {
  // Rough heuristic to only change it if it's near bg-[#bcff2e]
  const context = str.substring(offset - 40, offset + 40);
  if (context.includes('bg-[#bcff2e]')) {
    return 'text-[#0c0c0c]';
  }
  return match;
});

// Remove orbs and bg-grid
content = content.replace(/<div[^>]*orb-blue[^>]*\/>/g, '');
content = content.replace(/<div[^>]*orb-violet[^>]*\/>/g, '');
content = content.replace(/<div[^>]*orb-amber[^>]*\/>/g, '');
content = content.replace(/<div[^>]*bg-grid[^>]*\/>/g, '');

fs.writeFileSync('src/components/landing/V2ChallengeCalculator.tsx', content);
console.log('Done');
