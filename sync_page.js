const fs = require('fs');
const path = require('path');
const pagePath = path.join(__dirname, 'src/app/page.tsx');
let code = fs.readFileSync(pagePath, 'utf8');

if (!code.includes('createBrowserClient')) {
  code = code.replace(
    'import Link from "next/link";',
    'import Link from "next/link";\nimport { createBrowserClient } from "@supabase/ssr";'
  );
}

if (!code.includes('const [dynamicPlatformsText, setDynamicPlatformsText]')) {
  const hookInject = `
  const [dynamicPlatformsText, setDynamicPlatformsText] = useState("MT5 · DXTrade · TPP Terminal");
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase.from("tpp_platforms").select("name").eq("is_active", true).order("created_at")
      .then(({data, error}) => {
        if (data && data.length > 0) {
          setDynamicPlatformsText(data.map(p => p.name).join(" · "));
        }
      });
  }, []);
  `;

  code = code.replace(
    /export default function HomePage\(\) \{/,
    `export default function HomePage() {${hookInject}`
  );
}

code = code.replace(
  /title:\s*"MT5 · DXTrade · TPP Terminal"/g,
  `title: dynamicPlatformsText`
);

fs.writeFileSync(pagePath, code);
console.log('Updated page.tsx with dynamic platform sync.');
