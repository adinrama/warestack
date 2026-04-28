"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Package2, LayoutDashboard, ShoppingBag, Users, LogOut,
  Menu, X, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/products", icon: ShoppingBag, label: "Products" },
  { href: "/team", icon: Users, label: "Team", leadOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLead = session?.user?.role === "STAFF_LEAD";

  const NavLinks = () => (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {navItems
        .filter((item) => !item.leadOnly || isLead)
        .map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all",
                active
                  ? "bg-amber-400 text-ink-900"
                  : "text-ink-400 hover:bg-ink-800 hover:text-white"
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
              {active && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          );
        })}
    </nav>
  );

  const UserSection = () => (
    <div className="px-3 py-4 border-t border-ink-800">
      <div className="flex items-center gap-3 px-3 py-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
          <span className="text-ink-900 font-bold text-sm">
            {session?.user?.name?.[0]?.toUpperCase()}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-white text-sm font-medium truncate">{session?.user?.name}</p>
          <span className={isLead ? "badge-lead" : "badge-staff"}>
            {isLead ? "Staff Lead" : "Staff"}
          </span>
        </div>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="flex items-center gap-3 px-3 py-2 w-full text-ink-400 hover:text-white hover:bg-ink-800 rounded-md text-sm transition-all"
      >
        <LogOut className="w-4 h-4" />
        Sign out
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-ink-900 border-r border-ink-800 min-h-screen">
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-ink-800">
          <div className="w-7 h-7 bg-amber-400 rounded flex items-center justify-center flex-shrink-0">
            <Package2 className="w-4 h-4 text-ink-900" />
          </div>
          <span className="text-white font-bold tracking-tight">WareStack</span>
        </div>
        <NavLinks />
        <UserSection />
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-ink-900 border-b border-ink-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-amber-400 rounded flex items-center justify-center">
            <Package2 className="w-3 h-3 text-ink-900" />
          </div>
          <span className="text-white font-bold text-sm">WareStack</span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="text-ink-400 hover:text-white">
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="w-64 bg-ink-900 flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-ink-800">
              <span className="text-white font-bold">WareStack</span>
              <button onClick={() => setMobileOpen(false)} className="text-ink-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <NavLinks />
            <UserSection />
          </div>
        </div>
      )}
    </>
  );
}
