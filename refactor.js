const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function getAllFiles(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

// 1. Delete obsolete files
const filesToDelete = [
  'src/components/landing/ChallengeCalculator.tsx',
  'src/components/landing/ProfitCalculator.tsx',
  'src/components/v3/V3Footer.tsx',
  'src/components/layout/Navbar.tsx' // Will be replaced by V3Header
];

filesToDelete.forEach(file => {
  const p = path.join(__dirname, file);
  if (fs.existsSync(p)) fs.unlinkSync(p);
});

// 2. Rename and Move files
const moves = [
  { from: 'src/components/v3/V3Animations.tsx', to: 'src/components/ui/Animations.tsx' },
  { from: 'src/components/v3/V3Header.tsx', to: 'src/components/layout/Navbar.tsx' },
  { from: 'src/components/v3/V3Layout.tsx', to: 'src/components/layout/PageLayout.tsx' },
  { from: 'src/components/v3/V3PageHero.tsx', to: 'src/components/layout/PageHero.tsx' },
  { from: 'src/components/v3/V3Section.tsx', to: 'src/components/layout/PageSection.tsx' },
  { from: 'src/components/landing/V2ChallengeCalculator.tsx', to: 'src/components/landing/ChallengeCalculator.tsx' },
  { from: 'src/components/landing/ProfitCalculatorV3.tsx', to: 'src/components/landing/ProfitCalculator.tsx' }
];

moves.forEach(m => {
  const fromP = path.join(__dirname, m.from);
  const toP = path.join(__dirname, m.to);
  if (fs.existsSync(fromP)) {
    // Ensure dir exists
    fs.mkdirSync(path.dirname(toP), { recursive: true });
    fs.renameSync(fromP, toP);
  }
});

// 3. Delete V3 index and folder
const v3Index = path.join(__dirname, 'src/components/v3/index.ts');
if (fs.existsSync(v3Index)) fs.unlinkSync(v3Index);

const v3Dir = path.join(__dirname, 'src/components/v3');
if (fs.existsSync(v3Dir)) {
  if (fs.readdirSync(v3Dir).length === 0) {
    fs.rmdirSync(v3Dir);
  }
}

// 4. Update contents of all files
const allFiles = getAllFiles(srcDir);

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replacements
  // Imports
  content = content.replace(/@\/components\/v3\/V3Animations/g, '@/components/ui/Animations');
  content = content.replace(/@\/components\/v3\/V3Header/g, '@/components/layout/Navbar');
  content = content.replace(/@\/components\/v3\/V3Layout/g, '@/components/layout/PageLayout');
  content = content.replace(/@\/components\/v3\/V3PageHero/g, '@/components/layout/PageHero');
  content = content.replace(/@\/components\/v3\/V3Section/g, '@/components/layout/PageSection');
  content = content.replace(/@\/components\/v3/g, '@/components/layout'); // catch-all for index imports
  
  content = content.replace(/@\/components\/landing\/V2ChallengeCalculator/g, '@/components/landing/ChallengeCalculator');
  content = content.replace(/@\/components\/landing\/ProfitCalculatorV3/g, '@/components/landing/ProfitCalculator');

  content = content.replace(/\.\/V3Animations/g, '@/components/ui/Animations');

  // Component names
  content = content.replace(/V2ChallengeCalculator/g, 'ChallengeCalculator');
  content = content.replace(/ProfitCalculatorV3/g, 'ProfitCalculator');
  content = content.replace(/V3Header/g, 'Navbar');
  content = content.replace(/V3Layout/g, 'PageLayout');
  content = content.replace(/V3PageHero/g, 'PageHero');
  content = content.replace(/V3Section/g, 'PageSection');
  content = content.replace(/V3Page/g, 'HomePage');

  // CSS classes
  content = content.replace(/v3-has-cursor/g, 'custom-cursor');
  content = content.replace(/v3-page/g, 'page-wrapper');

  // In Navbar.tsx (formerly V3Header), it imported Magnetic from "./V3Animations". The regex above changed it to "@/components/ui/Animations", which is correct!
  
  // Specific fix for index imports: `import { PageLayout, PageHero, PageSection } from "@/components/layout"`
  // If we had `import { ... } from "@/components/v3"`, we need to make sure the exports in layout/index.ts exist, OR we just let it fail and fix it.
  // Actually, `@/components/layout` doesn't have an `index.ts`. I should create one!
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content);
  }
});

// Create layout/index.ts
const layoutIndexContent = `export { Navbar } from "./Navbar";
export { Footer } from "./Footer";
export { ChromeGate } from "./ChromeGate";
export { SmoothScroll } from "./SmoothScroll";
export { Logo } from "./Logo";
export { PageLayout } from "./PageLayout";
export { PageHero } from "./PageHero";
export { PageSection } from "./PageSection";
`;
fs.writeFileSync(path.join(__dirname, 'src/components/layout/index.ts'), layoutIndexContent);

// Fix Navbar component name collision in Navbar.tsx
// It might still have `export function Navbar() {` if we renamed V3Header to Navbar, but wait: the regex changed `V3Header` to `Navbar`, so `export function V3Header` became `export function Navbar`, which is correct!
console.log("Refactoring complete.");
