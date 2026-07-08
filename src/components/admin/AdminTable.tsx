"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown } from "lucide-react";

interface AdminTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  searchable?: boolean;
  globalFilter?: string;
  setGlobalFilter?: (value: string) => void;
  pageSize?: number;
  loading?: boolean;
}

export function AdminTable<T>({
  data,
  columns,
  searchable = true,
  globalFilter,
  setGlobalFilter,
  pageSize = 10,
  loading = false,
}: AdminTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [internalGlobalFilter, setInternalGlobalFilter] = useState("");

  const activeGlobalFilter = globalFilter !== undefined ? globalFilter : internalGlobalFilter;
  const activeSetGlobalFilter = setGlobalFilter !== undefined ? setGlobalFilter : setInternalGlobalFilter;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      globalFilter: activeGlobalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: activeSetGlobalFilter,
    initialState: {
      pagination: { pageSize },
    },
  });

  return (
    <div className="w-full">
      {searchable && (
        <div className="mb-4 relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Search all columns..."
            value={activeGlobalFilter}
            onChange={(e) => activeSetGlobalFilter(e.target.value)}
            className="h-9 w-full rounded-none border border-[var(--dash-hairline)] bg-white pl-9 pr-3 text-[13px] text-ink outline-none transition-colors focus:border-ink-400"
          />
        </div>
      )}

      <div className="dash-card overflow-visible">
        <div className="dash-scroll-x overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-[13px]">
            <thead className="border-b border-[var(--dash-hairline)] bg-[var(--dash-canvas)]">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={`cursor-pointer select-none px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400 ${header.column.getCanSort() ? "transition-colors hover:text-ink" : ""}`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <ArrowUpDown className="h-3 w-3 opacity-40" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-[var(--ink-100)] text-ink-700">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-ink-400">
                    <div className="flex items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink-200 border-t-ink" role="status" aria-label="Loading data"></div>
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-[13px] text-ink-400">
                    No results found
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-ink-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {table.getPageCount() > 1 && (
          <div className="flex items-center justify-between border-t border-[var(--dash-hairline)] bg-[var(--dash-canvas)] px-4 py-2.5">
            <div className="dash-num text-xs text-ink-500">
              Showing{" "}
              <span className="font-medium text-ink">
                {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-ink">
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  data.length
                )}
              </span>{" "}
              of <span className="font-medium text-ink">{data.length}</span> results
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="rounded-none p-1 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="rounded-none p-1 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="rounded-none p-1 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="rounded-none p-1 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
