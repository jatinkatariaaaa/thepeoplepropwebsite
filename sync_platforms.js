const fs = require('fs');
const path = require('path');

const calcPath = path.join(__dirname, 'src/components/landing/ChallengeCalculator.tsx');
let calcCode = fs.readFileSync(calcPath, 'utf8');

// 1. Add extraFeePct to Platform interface
const programsPath = path.join(__dirname, 'src/data/programs.ts');
let programsCode = fs.readFileSync(programsPath, 'utf8');
if (!programsCode.includes('extraFeePct?: number;')) {
  programsCode = programsCode.replace('status?: "live" | "soon";', 'status?: "live" | "soon";\n  extraFeePct?: number;');
  fs.writeFileSync(programsPath, programsCode);
}

// 2. Add livePlatforms state and fetch logic
if (!calcCode.includes('const [livePlatforms, setLivePlatforms]')) {
  calcCode = calcCode.replace(
    /const \[livePrograms, setLivePrograms\] = useState<Program\[\]>\(programs\);/,
    `const [livePrograms, setLivePrograms] = useState<Program[]>(programs);
  const [livePlatforms, setLivePlatforms] = useState<Platform[]>(platforms);`
  );

  calcCode = calcCode.replace(
    /fetchLivePrograms\(\);/,
    `fetchLivePrograms();\n    fetchLivePlatforms();`
  );

  const fetchPlatformsFn = `
  async function fetchLivePlatforms() {
    try {
      const { data, error } = await supabase
        .from("tpp_platforms")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        const mappedPlatforms: Platform[] = data.map((d: any) => ({
          key: d.name.toLowerCase().replace(/[^a-z0-9]/g, '') as PlatformKey,
          label: d.name,
          sub: d.extra_fee_pct > 0 ? \`+$\${d.extra_fee_pct}\` : "Free",
          status: "live",
          extraFeePct: d.extra_fee_pct
        }));
        setLivePlatforms(mappedPlatforms);
        setPlatformKey(mappedPlatforms[0].key);
      }
    } catch (err) {
      console.error("Error fetching platforms:", err);
    }
  }
`;

  calcCode = calcCode.replace(
    /async function fetchLivePrograms\(\) \{/,
    fetchPlatformsFn + '\n  async function fetchLivePrograms() {'
  );
}

// 3. Update the fee calculation
calcCode = calcCode.replace(
  /let platformExtras = 0;\s*if \(platformKey !== "tppdashboard"\) \{\s*platformExtras = \(base \?\? 0\) \* 0\.10;\s*\}/,
  `let platformExtras = 0;
  const currentPlatform = livePlatforms.find(p => p.key === platformKey);
  if (currentPlatform && currentPlatform.extraFeePct) {
    platformExtras = currentPlatform.extraFeePct; // It's absolute USD as per the new DB schema
  }`
);

// 4. Update the mapping references
calcCode = calcCode.replace(/\{platforms\.map\(/g, '{livePlatforms.map(');

fs.writeFileSync(calcPath, calcCode);
console.log('Updated ChallengeCalculator.tsx');

// 5. Update page.tsx feature card
const pagePath = path.join(__dirname, 'src/app/page.tsx');
let pageCode = fs.readFileSync(pagePath, 'utf8');

if (!pageCode.includes('import { createClient } from "@supabase/supabase-js";')) {
  pageCode = 'import { createClient } from "@supabase/supabase-js";\n' + pageCode;
}

if (!pageCode.includes('const supabase = createClient')) {
  pageCode = pageCode.replace(
    /export default function Home\(\) \{/,
    `export default async function Home() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data: platformsData } = await supabase.from('tpp_platforms').select('name').eq('is_active', true).order('created_at');
  const dynamicPlatformsText = platformsData && platformsData.length > 0 ? platformsData.map(p => p.name).join(' · ') : "MT5 · DXTrade · TPP Terminal";
`
  );
}

pageCode = pageCode.replace(
  /title: "MT5 · DXTrade · TPP Terminal"/g,
  `title: dynamicPlatformsText`
);

fs.writeFileSync(pagePath, pageCode);
console.log('Updated page.tsx');
