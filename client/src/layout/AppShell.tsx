// src/layout/AppShell.tsx
import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { MessageCircle, Calendar, Settings } from "lucide-react";

interface AppShellProps {
  title: string;
  children: ReactNode;
}

export function AppShell({ title, children }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-50">
      {/* Top bar */}
      <header className="h-14 flex items-center justify-between px-4 pb-1 pt-3">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <button className="h-9 w-9 rounded-full bg-slate-800/80 flex items-center justify-center border border-slate-700/70">
          <span className="text-sm">👤</span>
        </button>
      </header>

      {/* Scrollable content */}
      <main className="flex-1 px-4 pb-14 space-y-4 overflow-y-auto">
        {children}
      </main>

      {/* Bottom tab bar */}
      <nav className="h-14 border-t border-slate-800 bg-slate-900/95 backdrop-blur flex">
        <TabItem to="/conversations" label="Messages" icon={<MessageCircle size={18} />} />
        <TabItem to="/calendar" label="Calendar" icon={<Calendar size={18} />} />
        <TabItem to="/settings" label="Settings" icon={<Settings size={18} />} />
      </nav>
    </div>
  );
}

function TabItem({
  to,
  label,
  icon,
}: {
  to: string;
  label: string;
  icon: ReactNode;
}) {
  const [location] = useLocation();
  const isActive = location === to;

  return (
    <Link
      href={to}
      className={[
        "flex-1 flex flex-col items-center justify-center text-xs gap-1",
        isActive ? "text-slate-50" : "text-slate-400",
      ].join(" ")}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
