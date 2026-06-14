const fs = require('fs');
const path = require('path');

// 1. Fix PageLayout.tsx
const layoutFile = path.join(__dirname, 'src/components/layout/PageLayout.tsx');
let layoutContent = fs.readFileSync(layoutFile, 'utf8');
layoutContent = layoutContent.replace(/import { V3Footer } from "\.\/V3Footer";/g, 'import { Footer } from "./Footer";');
layoutContent = layoutContent.replace(/<V3Footer \/>/g, '<Footer />');
fs.writeFileSync(layoutFile, layoutContent);

// 2. Fix page imports
['challenges', 'faqs', 'heatmap', 'rules', 'contact'].forEach(dir => {
  const file = path.join(__dirname, `src/app/${dir}/page.tsx`);
  if (!fs.existsSync(file)) return;
  
  let content = fs.readFileSync(file, 'utf8');
  
  // Find the multi-line import block for layout
  content = content.replace(/import\s*\{([^}]*)\}\s*from\s*"@\/components\/layout";/s, (match, p1) => {
    const layoutImports = [];
    const animImports = [];
    
    p1.split(',').forEach(imp => {
      const i = imp.trim();
      if (!i) return;
      if (['PageLayout', 'PageHero', 'PageSection'].includes(i)) {
        layoutImports.push(i);
      } else {
        animImports.push(i);
      }
    });
    
    let res = '';
    if (layoutImports.length > 0) res += `import { ${layoutImports.join(', ')} } from "@/components/layout";\n`;
    if (animImports.length > 0) res += `import { ${animImports.join(', ')} } from "@/components/ui/Animations";\n`;
    return res.trim();
  });
  
  fs.writeFileSync(file, content);
});

console.log('Build fixes applied.');
