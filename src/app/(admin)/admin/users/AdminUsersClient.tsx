"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export function AdminUsersClient({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function updateKycStatus(userId: string, status: string) {
    setIsUpdating(userId);
    try {
      // In a real app, you would have a secure API route for this,
      // but if the admin user's JWT has access, this will work.
      // Alternatively, we can assume RLS policies are permissive for admins.
      const { error } = await supabase
        .from("profiles")
        .update({ kyc_status: status })
        .eq("id", userId);

      if (error) {
        console.error("Error updating KYC:", error);
        alert("Failed to update KYC status");
      } else {
        setUsers(users.map(u => u.id === userId ? { ...u, kyc_status: status } : u));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(null);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--paper-2)] border-b border-[var(--border)] text-[13px] uppercase tracking-wider text-[var(--ink-500)]">
              <th className="px-6 py-4 font-medium">User ID</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Joined Date</th>
              <th className="px-6 py-4 font-medium">KYC Status</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {users?.map((user) => (
              <tr key={user.id} className="hover:bg-[var(--paper-2)] transition-colors">
                <td className="px-6 py-4">
                  <span className="font-mono text-xs text-[var(--ink-500)]">{user.id.substring(0, 8)}...</span>
                </td>
                <td className="px-6 py-4 font-medium text-[var(--ink-950)]">{user.email}</td>
                <td className="px-6 py-4 text-[var(--ink-600)]">{user.display_name || "-"}</td>
                <td className="px-6 py-4">
                  <span className={\`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold \${user.is_admin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}\`}>
                    {user.is_admin ? "Admin" : "User"}
                  </span>
                </td>
                <td className="px-6 py-4 text-[var(--ink-500)] text-sm">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span className={\`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold \${
                    user.kyc_status === 'verified' ? 'bg-green-100 text-green-700' :
                    user.kyc_status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }\`}>
                    {(user.kyc_status || 'pending').toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    disabled={isUpdating === user.id || user.kyc_status === 'verified'}
                    onClick={() => updateKycStatus(user.id, 'verified')}
                    className="text-xs px-2 py-1 bg-[#cbfb45] text-black font-semibold rounded hover:bg-[#b5e03e] disabled:opacity-50"
                  >
                    Verify
                  </button>
                  <button
                    disabled={isUpdating === user.id || user.kyc_status === 'rejected'}
                    onClick={() => updateKycStatus(user.id, 'rejected')}
                    className="text-xs px-2 py-1 bg-red-100 text-red-700 font-semibold rounded hover:bg-red-200 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
            {(!users || users.length === 0) && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-[var(--ink-500)]">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
