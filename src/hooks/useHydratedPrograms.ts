"use client";

import { useState, useEffect } from "react";
import { programs as staticPrograms, Program } from "@/data/programs";

export function useHydratedPrograms() {
  const [programs, setPrograms] = useState<Program[]>(staticPrograms);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLivePrograms() {
      try {
        const response = await fetch("/api/programs");
        if (!response.ok) throw new Error("Failed to fetch programs");
        
        const data = await response.json();
        const dbPrograms = data.programs || [];

        // Hydrate static programs with DB prices and targets
        const hydrated = staticPrograms.map(staticProg => {
          const dbProg = dbPrograms.find((p: any) => p.key === staticProg.key);
          
          if (!dbProg) return staticProg; // Keep static if not found in DB

          // Map DB fees into a Record<AccountSize, number>
          const newFees: Record<number, number> = {};
          if (dbProg.tpp_program_fees && Array.isArray(dbProg.tpp_program_fees)) {
            dbProg.tpp_program_fees.forEach((f: any) => {
              newFees[f.account_size] = f.fee;
            });
          }

          return {
            ...staticProg,
            profitTarget: dbProg.profit_target || staticProg.profitTarget,
            maxDrawdown: dbProg.max_drawdown || staticProg.maxDrawdown,
            dailyDrawdown: dbProg.daily_drawdown || staticProg.dailyDrawdown,
            profitSplit: dbProg.profit_split || staticProg.profitSplit,
            phases: dbProg.phases ?? staticProg.phases,
            // If DB returned fees for this program, overwrite the static fees
            fees: Object.keys(newFees).length > 0 ? newFees : staticProg.fees,
          } as Program;
        });

        setPrograms(hydrated);
      } catch (err) {
        console.error("Error hydrating programs:", err);
        // Fallback to static programs on error
      } finally {
        setIsLoading(false);
      }
    }

    fetchLivePrograms();
  }, []);

  return { programs, isLoading };
}
