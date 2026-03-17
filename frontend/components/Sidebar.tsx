import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/stores/user";
import {
  Image, LinkIcon, LogOutIcon, MailIcon, Menu,
  Settings, Upload, User2Icon, X, Terminal, Shield,
} from "lucide-react";

const menuItems = [
  { icon: Image,     label: "Your Uploads",    href: "/dashboard" },
  { icon: LinkIcon,  label: "Shortened URLs",  href: "/dashboard/urls" },
  { icon: Upload,    label: "Upload Files",    href: "/dashboard/upload" },
  { icon: Settings,  label: "ShareX Configs",  href: "/dashboard/config" },
  { icon: User2Icon, label: "Account Settings",href: "/dashboard/account" },
];

const adminMenuItem = { icon: Shield, label: "Admin", href: "/dashboard/admin" };

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const path = usePathname();
  const router = useRouter();
  const isAdmin = useUser((state) => state.isAdmin);
  const visibleMenuItems = isAdmin ? [...menuItems, adminMenuItem] : menuItems;

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed left-4 top-4 lg:hidden rounded-sm p-2.5 transition-colors"
        style={{
          zIndex: 30,
          border: "1px solid rgba(139,92,246,0.2)",
          backgroundColor: "#0a0a12",
          color: "#71717a",
        }}
        onClick={toggleSidebar}
        onMouseEnter={e => { e.currentTarget.style.color = "#f4f4f5"; e.currentTarget.style.backgroundColor = "rgba(139,92,246,0.08)"; }}
        onMouseLeave={e => { e.currentTarget.style.color = "#71717a"; e.currentTarget.style.backgroundColor = "#0a0a12"; }}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 lg:hidden"
          style={{ zIndex: 15, backgroundColor: "rgba(6,6,14,0.7)", backdropFilter: "blur(4px)" }}
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 flex flex-col transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          zIndex: 20,
          backgroundColor: "#0a0a12",
          borderRight: "1px solid rgba(139,92,246,0.15)",
        }}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(139,92,246,0.12)" }}>
          <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-sm flex items-center justify-center flex-shrink-0"
              style={{ border: "1px solid rgba(139,92,246,0.3)", backgroundColor: "rgba(139,92,246,0.12)" }}>
              <Terminal className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold tracking-tight truncate" style={{ color: "#f4f4f5" }}>Tritan Uploader</p>
              <p className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "#3f3f46" }}>AS393577</p>
            </div>
          </Link>
          <button onClick={toggleSidebar}
            className="lg:hidden w-6 h-6 rounded-sm flex items-center justify-center flex-shrink-0 transition-colors"
            style={{ color: "#52525b" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#f4f4f5"; e.currentTarget.style.backgroundColor = "rgba(139,92,246,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#52525b"; e.currentTarget.style.backgroundColor = "transparent"; }}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav label */}
        <div className="px-5 pt-4 pb-2">
          <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "#3f3f46" }}>Navigation</span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {visibleMenuItems.map((item) => {
            const active = path === item.href;
            return (
              <Link key={item.label} href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all duration-150"
                style={{
                  backgroundColor: active ? "rgba(139,92,246,0.12)" : "transparent",
                  border: active ? "1px solid rgba(139,92,246,0.25)" : "1px solid transparent",
                  color: active ? "#f4f4f5" : "#71717a",
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.backgroundColor = "rgba(139,92,246,0.06)"; e.currentTarget.style.color = "#a1a1aa"; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#71717a"; } }}>
                <item.icon className="h-4 w-4 flex-shrink-0" style={{ color: active ? "#a78bfa" : "inherit" }} />
                <span className="text-sm font-medium flex-1 truncate">{item.label}</span>
                {active && <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: "#8b5cf6" }} />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-3 space-y-0.5" style={{ borderTop: "1px solid rgba(139,92,246,0.12)" }}>
          <span className="block px-3 pb-1.5 font-mono text-[9px] uppercase tracking-widest" style={{ color: "#3f3f46" }}>Support</span>
          <Link href="https://tritan.gg/tickets/new?type=question_support"
            className="flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all duration-150"
            style={{ color: "#71717a", border: "1px solid transparent" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(139,92,246,0.06)"; e.currentTarget.style.color = "#a1a1aa"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#71717a"; }}>
            <MailIcon className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm font-medium">Contact Us</span>
          </Link>
          <button onClick={() => router.push("/")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all duration-150 text-left"
            style={{ color: "#71717a", border: "1px solid transparent" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.08)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.15)"; e.currentTarget.style.color = "#f87171"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.color = "#71717a"; }}>
            <LogOutIcon className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>

        {/* Version */}
        <div className="px-5 py-2.5" style={{ borderTop: "1px solid rgba(139,92,246,0.08)" }}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px]" style={{ color: "#27272a" }}>v2.0.0</span>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: "#4ade80" }} />
              <span className="font-mono text-[9px]" style={{ color: "#27272a" }}>online</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}