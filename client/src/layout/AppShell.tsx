// src/layout/AppShell.tsx
import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { MessageCircle, Calendar, Settings, User } from "lucide-react";

interface AppShellProps {
  title: string;
  children: ReactNode;
}

export function AppShell({ title, children }: AppShellProps) {
  return (
    <div className="gradient-bg min-h-screen flex flex-col">
      {/* Top bar with glass effect */}
      <header className="glass-nav h-16 flex items-center justify-between px-4">
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h1>
        <button className="glass-card h-10 w-10 rounded-full flex items-center justify-center">
          <User size={20} style={{ color: 'var(--text-primary)' }} />
        </button>
      </header>

      {/* Scrollable content */}
      <main className="flex-1 px-4 pb-20 pt-4 space-y-4 overflow-y-auto">
        {children}
      </main>

      {/* Bottom tab bar with glass effect */}
      <nav className="glass-tab-bar h-16 flex items-center px-2">
        <TabItem to="/conversations" label="Messages" icon={<MessageCircle size={20} />} />
        <TabItem to="/calendar" label="Calendar" icon={<Calendar size={20} />} />
        <TabItem to="/settings" label="Settings" icon={<Settings size={20} />} />
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
      className={`glass-tab-item flex-1 ${isActive ? 'active' : ''}`}
    >
      {icon}
      <span className="text-xs font-medium mt-1">{label}</span>
    </Link>
  );
}
