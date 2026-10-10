import { useState } from "react"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"

function Layout({ children, activePage, setActivePage, onLogout, profile }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

    return (
        <div className="min-h-screen w-full overflow-x-clip bg-background text-foreground">
            <Sidebar
                activePage={activePage}
                setActivePage={setActivePage}
                onLogout={onLogout}
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
                mobileOpen={mobileSidebarOpen}
                setMobileOpen={setMobileSidebarOpen}
                profile={profile}
            />

            <main
                className={`min-h-screen min-w-0 overflow-x-clip pt-[72px] transition-[margin] duration-200 ${
                    sidebarCollapsed ? "md:ml-[76px]" : "md:ml-[240px]"
                }`}
            >
                <Topbar
                    activePage={activePage}
                    setActivePage={setActivePage}
                    sidebarCollapsed={sidebarCollapsed}
                    onMenuClick={() => setMobileSidebarOpen(true)}
                />
                {children}
            </main>
        </div>
    )
}

export default Layout
