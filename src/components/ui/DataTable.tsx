import * as React from "react";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: keyof T | string;
  header: React.ReactNode;
  render?: (row: T) => React.ReactNode;
  align?: "left" | "right" | "center";
  highlight?: boolean;
}

interface Props<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  className?: string;
  rowClassName?: (row: T, idx: number) => string | undefined;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  className,
  rowClassName,
}: Props<T>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--border)] bg-white overflow-hidden shadow-[0_1px_2px_rgba(11,15,26,0.04)]",
        className,
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--paper-2)]">
              {columns.map((c, i) => (
                <th
                  key={i}
                  className={cn(
                    "px-5 py-4 text-[11px] tracking-eyebrow font-medium text-[var(--ink-500)] whitespace-nowrap",
                    c.align === "right" && "text-right",
                    c.align === "center" && "text-center",
                    c.align !== "right" && c.align !== "center" && "text-left",
                  )}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={idx}
                className={cn(
                  "border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--paper-2)]/60 transition-colors",
                  rowClassName?.(row, idx),
                )}
              >
                {columns.map((c, ci) => {
                  const value = c.render
                    ? c.render(row)
                    : (row[c.key as keyof T] as React.ReactNode);
                  return (
                    <td
                      key={ci}
                      className={cn(
                        "px-5 py-4 text-[var(--ink-700)] tabular-nums",
                        c.align === "right" && "text-right",
                        c.align === "center" && "text-center",
                        c.highlight && "text-[var(--ink-950)] font-semibold",
                      )}
                    >
                      {value as React.ReactNode}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}