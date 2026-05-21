import { UserRole } from "@prisma/client";
import Link from "next/link";
import { UserCreateForm } from "@/components/user-create-form";
import { PasswordResetForm } from "@/components/password-reset-form";
import { UserStatusForm } from "@/components/user-status-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Admin</h1>
        <p className="text-sm text-slate-500">Manage internal DoorDesk users.</p>
      </div>
      <Button asChild variant="secondary">
        <Link href="/admin/import">Import products</Link>
      </Button>
      <UserCreateForm />
      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 px-4 py-3 font-medium">Users</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Reset password</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-slate-100 align-top">
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.role === UserRole.ADMIN ? "Admin" : "Sales"}</td>
                  <td className="px-4 py-3">{user.isActive ? "Active" : "Inactive"}</td>
                  <td className="px-4 py-3">
                    <PasswordResetForm userId={user.id} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <UserStatusForm userId={user.id} isActive={user.isActive} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
