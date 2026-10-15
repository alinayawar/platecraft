import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  ChefHat, LayoutDashboard, CalendarDays, BookOpen,
  ShoppingBasket, Activity, ArrowRight, Settings, Menu, X
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/planner', label: 'Weekly Planner', icon: CalendarDays },
  { href: '/recipes', label: 'Recipes', icon: BookOpen },
  { href: '/grocery-list', label: 'Grocery List', icon: ShoppingBasket },
  { href: '/nutrition', label: 'Nutrition', icon: Activity },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <>
      <Link href="/" className="flex items-center gap-2.5 px-6 h-16">
        <span className="w-8 h-8 rounded-lg bg-olive-600 text-cream grid place-items-center">
          <ChefHat className="w-4 h-4" />
        </span>
        <span className="font-serif text-xl font-semibold text-olive-900">Platecraft</span>
      </Link>
      <nav className="px-3 mt-4 space-y-0.5 text-sm">
        <p className="px-3 pb-2 text-[11px] uppercase tracking-wider text-muted">Kitchen</p>
        {navItems.map((item) => {
          const active = router.pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                active
                  ? 'bg-olive-50 text-olive-700 font-medium'
                  : 'text-ink/80 hover:bg-cream'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mx-4 mt-6 p-4 rounded-xl bg-olive-700 text-cream">
        <p className="font-serif text-base leading-snug">Sunday prep day</p>
        <p className="text-xs text-cream/70 mt-1">3 recipes can be batch-cooked for the week ahead.</p>
        <Link href="/planner" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-cream">
          Open planner <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="mt-auto p-4 border-t border-line flex items-center gap-3">
        <img
          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop"
          alt=""
          className="w-9 h-9 rounded-full object-cover"
        />
        <div className="text-sm leading-tight">
          <p className="font-medium">Maya Okafor</p>
          <p className="text-xs text-muted">Household of 3</p>
        </div>
        <button type="button" className="ml-auto text-muted hover:text-ink" aria-label="Settings">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </>
  );

  return (
    <div className="h-screen overflow-hidden bg-cream flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 h-screen flex-col bg-paper border-r border-line shrink-0">
        {sidebar}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="absolute inset-0 bg-olive-900/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-60 h-screen flex flex-col bg-paper border-r border-line z-10">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-muted"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <main className="flex-1 overflow-y-auto h-screen">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-3 p-4 border-b border-line bg-paper">
          <button onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-serif text-lg font-semibold text-olive-900">Platecraft</span>
        </div>
        <div className="p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}