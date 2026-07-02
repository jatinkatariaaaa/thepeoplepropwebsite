"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

export type AdminRole = "super_admin" | "finance" | "support" | "marketing";

interface AdminRoleContextValue {
  role: AdminRole;
}

const AdminRoleContext = createContext<AdminRoleContextValue>({
  role: "super_admin",
});

export function AdminRoleProvider({
  role,
  children,
}: {
  role: AdminRole;
  children: ReactNode;
}) {
  // Memoize the context value so consumers only re-render when `role` changes,
  // not on every provider render (which would happen with a fresh object).
  const value = useMemo(() => ({ role }), [role]);
  return (
    <AdminRoleContext.Provider value={value}>
      {children}
    </AdminRoleContext.Provider>
  );
}

export function useAdminRole() {
  return useContext(AdminRoleContext);
}
