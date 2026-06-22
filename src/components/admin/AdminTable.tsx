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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-400)]" />
          <input
            type="text"
            placeholder="Search all columns..."
            value={activeGlobalFilter}
            onChange={(e) => activeSetGlobalFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ink-950)] transition-all"
          />
        </div>
      )}

      <div className="rounded-2xl border border-[var(--border)] bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[var(--paper-2)] border-b border-[var(--border)] text-[var(--ink-500)] font-semibold">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={`px-6 py-4 cursor-pointer select-none ${header.column.getCanSort() ? "hover:text-[var(--ink-950)]" : ""}`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <ArrowUpDown className="w-3 h-3 opacity-50" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-[var(--ink-950)]">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-[var(--ink-400)]">
                    <div className="flex justify-center items-center">
                      <div className="w-6 h-6 border-2 border-[var(--ink-200)] border-t-[var(--ink-950)] rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-[var(--ink-400)]">
                    No results found
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-[var(--paper-2)] transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4">
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
          <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--border)] bg-[var(--paper-2)]">
            <div className="text-sm text-[var(--ink-500)]">
              Showing{" "}
              <span className="font-medium text-[var(--ink-950)]">
                {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-[var(--ink-950)]">
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  data.length
                )}
              </span>{" "}
              of <span className="font-medium text-[var(--ink-950)]">{data.length}</span> results
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="p-1 rounded text-[var(--ink-500)] hover:text-[var(--ink-950)] hover:bg-[var(--border)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronsLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="p-1 rounded text-[var(--ink-500)] hover:text-[var(--ink-950)] hover:bg-[var(--border)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="p-1 rounded text-[var(--ink-500)] hover:text-[var(--ink-950)] hover:bg-[var(--border)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="p-1 rounded text-[var(--ink-500)] hover:text-[var(--ink-950)] hover:bg-[var(--border)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronsRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
