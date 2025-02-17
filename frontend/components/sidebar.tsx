import { Image, Settings, User, Menu, Upload } from "lucide-react"

const menuItems = [
    { icon: Image, label: "Your Uploads", href: "/dashboard" },
    { icon: User, label: "Shortened URLs", href: "/dashboard/urls" },
    { icon: Upload, label: "Upload Files", href: "/dashboard/upload" },
    { icon: Settings, label: "ShareX Configs", href: "/dashboard/config" },
]

interface SidebarProps {
    isOpen: boolean
    toggleSidebar: () => void
}

export function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
    return (
        <>
            <button
                className="fixed left-4 top-4 z-20 rounded-md bg-[#171619] p-2 text-gray-400 lg:hidden"
                onClick={toggleSidebar}
            >
                <Menu className="h-6 w-6" />
            </button>
            <aside
                className={`fixed left-0 top-0 z-10 h-full w-45 bg-[#171619]  transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                <div className="flex h-full flex-col">
                    <div className="flex items-center justify-between p-4">
                        <h2 className="text-lg font-semibold text-white ml-4 mt-2.5">Tritan ShareX Host</h2>
                    </div>
                    <nav className="flex-1 space-y-2 p-4">
                        {menuItems.map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                className="flex items-center rounded-md px-4 py-2 text-gray-300 hover:bg-purple-500 hover:text-white"
                            >
                                <item.icon className="mr-3 h-5 w-5" />
                                {item.label}
                            </a>
                        ))}
                    </nav>
                </div>
            </aside>
        </>
    )
}

