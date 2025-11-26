"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Camera,
  FolderOpen,
  Settings,
  LogOut,
  Plus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useStore } from "@/lib/store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser, setProfile, isLoading, setLoading } = useStore();

  useEffect(() => {
    const supabase = createClient();

    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser({ id: user.id, email: user.email || "" });

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setProfile(profile);
      }

      setLoading(false);
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router, setUser, setProfile, setLoading]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-brick-500 to-brick-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brick-500/25 animate-pulse">
            <span className="text-2xl">🧱</span>
          </div>
          <div className="w-6 h-6 border-2 border-brick-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/dashboard/jobs", icon: FolderOpen, label: "Jobs" },
    { href: "/dashboard", icon: Plus, label: "New", isMain: true },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  ];

  // Check if we're on a page that shouldn't show bottom nav
  const hideNav = pathname.includes("/result") || pathname.includes("/jobs/");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Main content */}
      <main className={`flex-1 ${hideNav ? '' : 'pb-20 sm:pb-0'}`}>
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 sm:hidden bg-white/90 backdrop-blur-lg border-t border-slate-200 safe-bottom z-40">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              if (item.isMain) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex flex-col items-center -mt-6"
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-brick-500 to-brick-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brick-500/30">
                      <item.icon className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-xs font-medium text-slate-600 mt-1">{item.label}</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center py-2 px-4"
                >
                  <item.icon className={`w-6 h-6 ${isActive ? 'text-brick-600' : 'text-slate-400'}`} />
                  <span className={`text-xs mt-1 ${isActive ? 'text-brick-600 font-semibold' : 'text-slate-500'}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden sm:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-brick-500 to-brick-600 rounded-xl flex items-center justify-center shadow-lg shadow-brick-500/20">
              <span className="text-xl">🧱</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Brickie
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {[
            { href: "/dashboard", icon: Camera, label: "New Estimate" },
            { href: "/dashboard/jobs", icon: FolderOpen, label: "Saved Jobs" },
            { href: "/dashboard/settings", icon: Settings, label: "Settings" },
          ].map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-brick-50 text-brick-600"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t border-slate-100">
          <div className="mb-3 px-4">
            <p className="text-sm text-slate-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-600 hover:bg-slate-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Desktop content offset */}
      <style jsx global>{`
        @media (min-width: 640px) {
          main {
            margin-left: 16rem;
          }
        }
      `}</style>
    </div>
  );
}
