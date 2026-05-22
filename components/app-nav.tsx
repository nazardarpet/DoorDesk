import Link from "next/link";
import { Boxes, LayoutDashboard, Shield, ShoppingBag, Users } from "lucide-react";
import { UserRole } from "@prisma/client";
import { auth } from "@/auth";
import { logoutAction } from "@/app/actions/auth-actions";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/orders", label: "Orders", icon: ShoppingBag },
  { href: "/products", label: "Products", icon: Boxes },
  { href: "/admin", label: "Admin", icon: Shield, adminOnly: true }
];

export async function AppNav() {
  const session = await auth();
  const visibleItems = navItems.filter((item) => !item.adminOnly || session?.user?.role === UserRole.ADMIN);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white md:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="text-lg font-semibold text-slate-950">DoorDesk</div>
            <div className="text-xs text-slate-500">{session?.user?.name}</div>
          </div>
          <nav className="flex-1 space-y-1 p-3">
            {visibleItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
          <form action={logoutAction} className="border-t border-slate-200 p-3">
            <Button type="submit" variant="secondary" className="w-full">
              Sign out
            </Button>
          </form>
        </div>
      </aside>
      <nav className="fixed inset-x-0 bottom-0 z-20 grid border-t border-slate-200 bg-white md:hidden" style={{ gridTemplateColumns: `repeat(${visibleItems.length}, minmax(0, 1fr))` }}>
        {visibleItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 px-2 py-2 text-xs font-medium text-slate-700"
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
