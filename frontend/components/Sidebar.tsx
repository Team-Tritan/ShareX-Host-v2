import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Image,
  LinkIcon,
  LogOutIcon,
  MailIcon,
  Menu,
  Settings,
  Upload,
  User2Icon,
  X,
} from "lucide-react";

const menuItems = [
  { icon: Image, label: "Your Uploads", href: "/dashboard" },
  { icon: LinkIcon, label: "Shortened URLs", href: "/dashboard/urls" },
  { icon: Upload, label: "Upload Files", href: "/dashboard/upload" },
  { icon: Settings, label: "ShareX Configs", href: "/dashboard/config" },
  { icon: User2Icon, label: "Account Settings", href: "/dashboard/account" },
];

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const path = usePathname();
  const router = useRouter();

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        className="fixed left-4 top-4 z-20 rounded-xl bg-[#171619]/80 backdrop-blur-sm p-3 text-gray-400 hover:text-white hover:bg-[#171619] border border-zinc-800/50 transition-all duration-200 lg:hidden"
        onClick={toggleSidebar}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-5 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-10 h-full w-64 bg-gradient-to-b from-[#171619]/95 via-[#171619] to-[#0d0c0e] backdrop-blur-md border-r border-zinc-800/50 shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="relative p-6">
            <Link href="/dashboard" className="flex items-center justify-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 via-pink-500 to-fuchsia-400 bg-clip-text text-transparent">
                Tritan Uploader
              </h1>
            </Link>
            
            <button
              onClick={toggleSidebar}
              className="absolute right-4 top-4 p-2 text-gray-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-2 px-4 pb-4">
            {menuItems.map((item) => {
              const active = path === item.href;
              return (
                <div key={item.label}>
                  <Link
                    href={item.href}
                    className={`group flex items-center rounded-xl px-4 py-3 transition-all duration-200 ${
                      active
                        ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30"
                        : "text-gray-400 hover:text-white hover:bg-zinc-800/50"
                    }`}
                  >
                    <item.icon className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                      active ? "text-purple-400" : "text-gray-400 group-hover:text-white"
                    }`} />
                    <span className="font-medium">{item.label}</span>
                    {active && (
                      <div className="ml-auto w-2 h-2 bg-purple-400 rounded-full" />
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>

          <div className="border-t border-zinc-800/50 p-4 space-y-3">
            <div>
              <Link
                href="https://tritan.gg/tickets/new?type=question_support"
                className="flex items-center text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-zinc-800/50 transition-all duration-200 group"
              >
                <MailIcon className="mr-3 h-5 w-5 group-hover:text-indigo-400 transition-colors duration-200" />
                <span className="font-medium">Contact Us</span>
              </Link>
            </div>
            
            <div>
              <button
                onClick={() => {
                  router.push("/");
                }}
                className="flex w-full items-center justify-start px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all duration-200 group"
              >
                <LogOutIcon className="mr-3 h-5 w-5 group-hover:text-red-400 transition-colors duration-200" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>

          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-purple-500/10 via-pink-500/5 to-transparent pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-purple-500/10 via-transparent to-transparent rounded-full blur-xl pointer-events-none"></div>
        </div>
      </aside>
    </>
  );
}