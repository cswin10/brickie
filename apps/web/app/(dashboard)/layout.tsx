"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Camera,
  FolderOpen,
  Settings,
  LogOut,
  Plus,
  Sparkles,
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
      <div className="min-h-screen bg-mesh bg-grid flex items-center justify-center dark-theme">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brick-500 to-brick-600 blur-xl opacity-50 animate-pulse" />
            <div className="relative w-16 h-16 bg-gradient-to-br from-brick-500 to-brick-600 rounded-2xl flex items-center justify-center shadow-lg glow-brick">
              <span className="text-3xl">🧱</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-brick-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-brick-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-brick-500 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
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
    <div className="min-h-screen bg-mesh flex flex-col dark-theme">
      {/* Main content */}
      <main className={`flex-1 ${hideNav ? '' : 'pb-24 sm:pb-0'}`}>
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 sm:hidden glass-dark safe-bottom z-40">
          <div className="flex items-center justify-around py-3 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              if (item.isMain) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex flex-col items-center -mt-8"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-brick-500 to-brick-600 rounded-2xl blur-lg opacity-50" />
                      <div className="relative w-14 h-14 bg-gradient-to-br from-brick-500 to-brick-600 rounded-2xl flex items-center justify-center shadow-lg glow-brick animate-pulse-glow">
                        <item.icon className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-white mt-2">{item.label}</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center py-2 px-4 group"
                >
                  <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-white/10' : ''}`}>
                    <item.icon className={`w-6 h-6 transition-colors ${isActive ? 'text-brick-400' : 'text-slate-400 group-hover:text-white'}`} />
                  </div>
                  <span className={`text-xs mt-1 font-medium transition-colors ${isActive ? 'text-brick-400' : 'text-slate-400 group-hover:text-white'}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden sm:flex fixed left-0 top-0 bottom-0 w-64 glass-dark flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-white/5">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-brick-500 to-brick-600 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative w-10 h-10 bg-gradient-to-br from-brick-500 to-brick-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl">🧱</span>
              </div>
            </div>
            <span className="text-xl font-extrabold text-gradient">
              Brickie
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {[
            { href: "/dashboard", icon: Sparkles, label: "New Estimate" },
            { href: "/dashboard/jobs", icon: FolderOpen, label: "Saved Jobs" },
            { href: "/dashboard/settings", icon: Settings, label: "Settings" },
          ].map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                  isActive
                    ? "bg-brick-500/20 text-brick-400 border border-brick-500/30"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-brick-400' : 'group-hover:text-white'}`} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t border-white/5">
          <div className="mb-3 px-4">
            <p className="text-sm text-slate-300 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:text-red-400 transition-colors" />
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
