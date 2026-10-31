const fs = require('fs');
const path = require('path');
const pagePath = path.join(__dirname, 'src/app/page.tsx');
let code = fs.readFileSync(pagePath, 'utf8');

// 1. Add state and fetch for tpp_stats
const hookInject = `
  const [dynamicPlatformsText, setDynamicPlatformsText] = useState("MT5 · DXTrade · TPP Terminal");
  const [dbStats, setDbStats] = useState<any[]>([
    { value: "250+", label: "Successful payouts", key_name: "total_payouts", mt: "" },
    { value: "142+", label: "Countries served", key_name: "countries", mt: "md:mt-20" },
    { value: "5*", label: "TrustPilot rating", key_name: "trustpilot", mt: "md:mt-12" }
  ]);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Fetch platforms
    supabase.from("tpp_platforms").select("name").eq("is_active", true).order("created_at")
      .then(({data}) => {
        if (data && data.length > 0) setDynamicPlatformsText(data.map(p => p.name).join(" · "));
      });

    // Fetch stats
    supabase.from("tpp_stats").select("*").order("key_name")
      .then(({data}) => {
        if (data && data.length > 0) {
          // Merge with default margins
          const margins = ["", "md:mt-20", "md:mt-12", "md:-mt-8"];
          setDbStats(data.map((d, i) => ({ ...d, mt: margins[i % margins.length] })));
        }
      });
  }, []);
`;

code = code.replace(
  /const \[dynamicPlatformsText, setDynamicPlatformsText\] = useState\("MT5 · DXTrade · TPP Terminal"\);\s*useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);/m,
  hookInject
);

// 2. Replace the static stats grid
const statsReplacement = `
          <div className="flex flex-col gap-16 text-center md:flex-row md:text-left">
            {dbStats.map((s, i) => (
              <Reveal key={s.label || s.key_name} delay={i * 0.1} className={cn("flex-1", s.mt)}>
                <div className="flex flex-col items-center gap-2 md:items-start lg:gap-4">
                  <div className="text-6xl font-medium leading-none tracking-tight text-[#0c0c0c] lg:text-[8rem]">
                    {s.value}
                  </div>
                  <span className="text-base font-medium text-[#6c6a68] lg:text-lg">{s.label}</span>
                </div>
              </Reveal>
            ))}
          </div>
`;

code = code.replace(
  /<div className="flex flex-col gap-16 text-center md:flex-row md:text-left">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/,
  statsReplacement + '\n        </div>\n      </section>'
);

fs.writeFileSync(pagePath, code);
console.log('Updated page.tsx with dynamic stats.');
