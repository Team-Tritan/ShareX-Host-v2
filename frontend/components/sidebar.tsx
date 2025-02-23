import { Image, LinkIcon, Menu, Settings, Upload, User2Icon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

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
      <button
        className="fixed left-4 top-4 z-20 rounded-md bg-[#171619] p-2 text-gray-400 lg:hidden"
        onClick={toggleSidebar}
      >
        <Menu className="h-6 w-6" />
      </button>
      <aside
        className={`fixed left-0 top-0 z-10 h-full w-45 bg-gradient-to-b from-[#1c1b1e] to-[#171619] shadow-lg transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-xl font-semibold text-white ml-6 mt-3">
              Tritan Uploader
            </h2>
          </div>
          <nav className="flex-1 space-y-2 p-4">
            {menuItems.map((item) => {
              const active = path === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center rounded-md px-4 py-2 ${active
                    ? "bg-purple-500 text-white"
                    : "text-gray-300 hover:bg-purple-500 hover:text-white"
                    }`}
                >
                  <item.icon className="mr-3 h-6 w-6" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <hr className="border-zinc-800" />

          <button
            onClick={() => router.push("/")}
            className="flex items-center rounded-md px-4 py-2 text-gray-300 hover:text-white"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}