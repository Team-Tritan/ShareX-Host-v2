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
      <button
        className="fixed left-4 top-4 z-20 rounded-md bg-[#171619] p-2 text-gray-400 lg:hidden"
        onClick={toggleSidebar}
      >
        <Menu className="h-6 w-6" />
      </button>
      <aside
        className={`fixed left-0 top-0 z-10 h-full w-64 bg-[#171619] shadow-lg transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-center p-6">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-white bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent animate-gradient-flow">
                Tritan Uploader
              </h1>
            </Link>
          </div>
          <nav className="flex-1 space-y-2 p-4">
            {menuItems.map((item) => {
              const active = path === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center rounded-md px-4 py-2 ${
                    active
                      ? "bg-purple-600 text-white"
                      : "text-gray-400 hover:bg-purple-700 hover:text-white"
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-gray-700 p-4">
            <Link
              href="https://tritan.gg/tickets/new?type=question_support"
              className="flex items-center text-gray-400 hover:text-white mb-4"
            >
              <MailIcon className="mr-3 h-5 w-5" />
              Contact Us
            </Link>
            <button
              onClick={() => {
                router.push("/");
              }}
              className="flex w-full items-center justify-start rounded-md text-gray-400 hover:text-white"
            >
              <LogOutIcon className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
