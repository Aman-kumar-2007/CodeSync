import { useState } from "react"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"

function Layout({
    children,
    activePage,
    setActivePage,
    onLogout,
    profile,
}) {
    const [sidebarCollapsed, setSidebarCollapsed] =
        useState(false)

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Sidebar
                activePage={activePage}
                setActivePage={setActivePage}
                onLogout={onLogout}
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
                profile={profile}
            />

            <main
                className={`
                    min-h-screen
                    overflow-x-hidden
                    pt-[72px]
                    ${sidebarCollapsed
                        ? "ml-[76px]"
                        : "ml-[240px]"
                    }
                `}
            >
                <Topbar
                    activePage={activePage}
                    setActivePage={setActivePage}
                    sidebarCollapsed={
                        sidebarCollapsed
                    }
                />

                {children}
            </main>
        </div>
    )
}

export default Layout