"use client";

import { useState, useEffect } from "react";
import { programs as staticPrograms, Program } from "@/data/programs";
import { loadSiteData } from "@/lib/site-data-client";

/** A tpp_programs row as /api/programs returns it (with its fees). */
type DbProgram = {
  key: string;
  profit_target?: Program["profitTarget"] | null;
  max_drawdown?: Program["maxDrawdown"] | null;
  daily_drawdown?: Program["dailyDrawdown"] | null;
  profit_split?: Program["profitSplit"] | null;
  phases?: Program["phases"] | null;
  tpp_program_fees?: { account_size: number; fee: number }[] | null;
};

export function useHydratedPrograms() {
  const [programs, setPrograms] = useState<Program[]>(staticPrograms);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLivePrograms() {
      try {
        // Shared with the stats and platform hooks: one request per page, not one per hook.
        const data = await loadSiteData();
        if (!data) throw new Error("Failed to fetch programs");
        const dbPrograms = (data.programs || []) as DbProgram[];

        // Hydrate static programs with DB prices and targets
        const hydrated = staticPrograms.map(staticProg => {
          const dbProg = dbPrograms.find((p) => p.key === staticProg.key);
          
          if (!dbProg) return staticProg; // Keep static if not found in DB

          // Map DB fees into a Record<AccountSize, number>
          const newFees: Record<number, number> = {};
          if (dbProg.tpp_program_fees && Array.isArray(dbProg.tpp_program_fees)) {
            dbProg.tpp_program_fees.forEach((f) => {
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
