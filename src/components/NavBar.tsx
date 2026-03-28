"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Trophy, BarChart2, Target, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart2 },
  { href: "/predictions", label: "Predictions", icon: Target },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

export default function NavBar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <span className="text-xl font-bold text-white">NextPick</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === href
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* User + logout */}
          <div className="hidden md:flex items-center gap-3">
            <span className="text-sm text-slate-400">
              {session?.user?.name}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-slate-400 hover:text-white"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 px-4 pb-4 space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                pathname === href
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-800">
            <p className="text-xs text-slate-500 px-4 py-1">
              {session?.user?.email}
            </p>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm text-slate-400 hover:text-white w-full"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
