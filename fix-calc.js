const fs = require('fs');

let content = fs.readFileSync('src/app/challenges/page.tsx', 'utf8');

content = content.replace(
  'import { ChallengeCalculator } from "@/components/landing/ChallengeCalculator";',
  'import { V2ChallengeCalculator } from "@/components/landing/V2ChallengeCalculator";'
);

content = content.replace(
  '<ChallengeCalculator />',
  '<div className="mx-auto max-w-7xl px-5 py-8 md:px-8"><V2ChallengeCalculator /></div>'
);

fs.writeFileSync('src/app/challenges/page.tsx', content, 'utf8');
console.log('Fixed ChallengeCalculator import');
