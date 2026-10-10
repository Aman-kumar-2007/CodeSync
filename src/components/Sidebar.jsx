import { memo, useState } from "react"
import { supabase } from "../lib/supabase"

import {
    LayoutDashboard,
    Code2,
    Trophy,
    BarChart3,
    Settings,
    LogOut,
    ChevronLeft,
    UserRound,
    Medal,
    X,
    AlertTriangle,
    ShieldCheck,
} from "lucide-react"

function Sidebar({
    activePage,
    setActivePage,
    onLogout,
    collapsed,
    setCollapsed,
    profile,
    mobileOpen = false,
    onMobileClose,
}) {
    const [logoutOpen, setLogoutOpen] = useState(false)

    /*
     * ---------------------------------------------------------
     * PROFILE
     * ---------------------------------------------------------
     */

    const displayName =
        profile?.name ||
        profile?.full_name ||
        profile?.fullname ||
        "Student"

    const username =
        profile?.username ||
        profile?.userName ||
        "student"

    /*
     * Always use initials.
     * No profile image request.
     * No broken image.
     * No image loading delay.
     */

    const initials =
        displayName
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0])
            .join("")
            .toUpperCase() || "S"


    const avatarUrl = profile?.avatar || null;
    /*
     * ---------------------------------------------------------
     * NAVIGATION
     * ---------------------------------------------------------
     */

    const menuItems = [
        {
            label: "Dashboard",
            icon: LayoutDashboard,
        },
        {
            label: "Leaderboard",
            icon: Medal,
        },
        {
            label: "Student Profile",
            icon: UserRound,
        },
        {
            label: "Contests",
            icon: Trophy,
        },
        {
            label: "Analytics",
            icon: BarChart3,
        },
    ]

    /*
     * ---------------------------------------------------------
     * LOGOUT
     * ---------------------------------------------------------
     */

    const handleLogout = async () => {
        setLogoutOpen(false)

        if (onLogout) {
            await onLogout()
            return
        }

        await supabase.auth.signOut()
    }

    /*
     * ---------------------------------------------------------
     * NAVIGATION HANDLER
     * ---------------------------------------------------------
     */

    const navigateTo = (page) => {
        setActivePage(page)
        onMobileClose?.()
    }

    return (
        <>
            {/* ================================================= */}
            {/* SIDEBAR */}
            {/* ================================================= */}

            {mobileOpen && (
                <button
                    type="button"
                    aria-label="Close navigation menu"
                    className="codesync-mobile-overlay"
                    onClick={onMobileClose}
                />
            )}

            <aside
                className={`codesync-sidebar ${mobileOpen ? "mobile-open" : ""}
                    fixed
                    left-0
                    top-0
                    z-[60]
                    flex
                    h-screen
                    flex-col
                    border-r
                    border-border
                    bg-background
                    ${collapsed
                        ? "w-[76px]"
                        : "w-[240px]"
                    }
                `}
            >
                {/* ================================================= */}
                {/* BRAND */}
                {/* ================================================= */}

                <div
                    className={`
                        flex
                        h-[72px]
                        shrink-0
                        items-center
                        border-b
                        border-border
                        ${collapsed
                            ? "justify-center px-2"
                            : "px-5"
                        }
                    `}
                >
                    <button
                        type="button"
                        onClick={() =>
                            navigateTo("Dashboard")
                        }
                        className={`
                            group
                            flex
                            items-center
                            ${collapsed
                                ? "justify-center"
                                : "gap-3"
                            }
                        `}
                    >
                        {/* Logo */}

                        <div
                            className="
                                relative
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-primary
                                text-primary-foreground
                                shadow-[0_0_25px_rgba(99,102,241,0.18)]
                                transition-transform
                                duration-200
                                group-hover:scale-105
                            "
                        >
                            <Code2
                                size={20}
                                strokeWidth={2.5}
                            />
                        </div>

                        {/* Brand */}

                        {!collapsed && (
                            <div className="text-left">
                                <h1 className="text-sm font-extrabold tracking-tight text-foreground">
                                    CodeSync
                                </h1>

                                <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                    Coding Platform
                                </p>
                            </div>
                        )}
                    </button>
                </div>

                {/* ================================================= */}
                {/* NAVIGATION */}
                {/* ================================================= */}

                <nav className="flex-1 overflow-y-auto px-3 py-5">
                    {!collapsed && (
                        <p className="mb-3 px-3 text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                            Overview
                        </p>
                    )}

                    <div className="space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon

                            const isActive =
                                activePage === item.label

                            return (
                                <button
                                    key={item.label}
                                    type="button"
                                    onClick={() =>
                                        navigateTo(
                                            item.label
                                        )
                                    }
                                    title={
                                        collapsed
                                            ? item.label
                                            : undefined
                                    }
                                    className={`
                                        group
                                        relative
                                        flex
                                        w-full
                                        items-center
                                        rounded-xl
                                        text-sm
                                        font-medium
                                        transition-colors
                                        duration-150
                                        ${collapsed
                                            ? "justify-center px-2 py-3"
                                            : "gap-3 px-3 py-2.5"
                                        }
                                        ${isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                        }
                                    `}
                                >
                                    {/* Active line */}

                                    {isActive && (
                                        <span
                                            className="
                                                absolute
                                                left-0
                                                top-1/2
                                                h-5
                                                w-0.5
                                                -translate-y-1/2
                                                rounded-full
                                                bg-primary
                                            "
                                        />
                                    )}

                                    {/* Icon */}

                                    <span
                                        className={`
                                            flex
                                            h-7
                                            w-7
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-lg
                                            ${isActive
                                                ? "bg-primary/10"
                                                : "bg-transparent group-hover:bg-muted"
                                            }
                                        `}
                                    >
                                        <Icon
                                            size={17}
                                            strokeWidth={
                                                isActive
                                                    ? 2
                                                    : 1.8
                                            }
                                        />
                                    </span>

                                    {/* Label */}

                                    {!collapsed && (
                                        <span className="flex-1 text-left">
                                            {item.label}
                                        </span>
                                    )}

                                    {/* Active dot */}

                                    {isActive &&
                                        !collapsed && (
                                            <span
                                                className="
                                                    h-1.5
                                                    w-1.5
                                                    rounded-full
                                                    bg-primary
                                                    shadow-[0_0_8px_rgba(99,102,241,0.65)]
                                                "
                                            />
                                        )}
                                </button>
                            )
                        })}
                    </div>

                    {/* ================================================= */}
                    {/* ACCOUNT */}
                    {/* ================================================= */}

                    {!collapsed ? (
                        <div className="my-6 flex items-center gap-3 px-3">
                            <div className="h-px flex-1 bg-border" />

                            <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
                                Account
                            </span>

                            <div className="h-px flex-1 bg-border" />
                        </div>
                    ) : (
                        <div className="my-6 h-px bg-border" />
                    )}

                    {/* Settings */}

                    <button
                        type="button"
                        onClick={() =>
                            navigateTo("Settings")
                        }
                        title={
                            collapsed
                                ? "Settings"
                                : undefined
                        }
                        className={`
                            relative
                            flex
                            w-full
                            items-center
                            rounded-xl
                            text-sm
                            font-medium
                            transition-colors
                            duration-150
                            ${collapsed
                                ? "justify-center px-2 py-3"
                                : "gap-3 px-3 py-2.5"
                            }
                            ${activePage === "Settings"
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            }
                        `}
                    >
                        {activePage === "Settings" && (
                            <span
                                className="
                                    absolute
                                    left-0
                                    top-1/2
                                    h-5
                                    w-0.5
                                    -translate-y-1/2
                                    rounded-full
                                    bg-primary
                                "
                            />
                        )}

                        <span
                            className={`
                                flex
                                h-7
                                w-7
                                shrink-0
                                items-center
                                justify-center
                                rounded-lg
                                ${activePage ===
                                    "Settings"
                                    ? "bg-primary/10"
                                    : "bg-transparent"
                                }
                            `}
                        >
                            <Settings
                                size={17}
                                strokeWidth={
                                    activePage ===
                                        "Settings"
                                        ? 2
                                        : 1.8
                                }
                            />
                        </span>

                        {!collapsed && (
                            <span className="flex-1 text-left">
                                Settings
                            </span>
                        )}

                        {activePage === "Settings" &&
                            !collapsed && (
                                <span
                                    className="
                                        h-1.5
                                        w-1.5
                                        rounded-full
                                        bg-primary
                                        shadow-[0_0_8px_rgba(99,102,241,0.65)]
                                    "
                                />
                            )}
                    </button>
                </nav>

                {/* ================================================= */}
                {/* USER SECTION */}
                {/* ================================================= */}

                <div className="shrink-0 border-t border-border p-3">
                    <div
                        className={`
                            rounded-xl
                            border
                            border-transparent
                            bg-secondary/40
                            p-2.5
                            ${collapsed
                                ? "flex justify-center"
                                : ""
                            }
                        `}
                    >
                        <div
                            className={`
                                flex
                                items-center
                                ${collapsed
                                    ? "justify-center"
                                    : "gap-3"
                                }
                            `}
                        >
                            {/* ================================================= */}
                            {/* AVATAR */}
                            {/* ================================================= */}

                            <button
                                type="button"
                                onClick={() =>
                                    navigateTo(
                                        "Student Profile"
                                    )
                                }
                                title={
                                    collapsed
                                        ? "Student Profile"
                                        : undefined
                                }
                                className="relative shrink-0"
                            >
                                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full">
                                    {avatarUrl ? (
                                        <img
                                            src={avatarUrl}
                                            alt={displayName}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
                                            {initials}
                                        </div>
                                    )}
                                </div>

                                {/* Online */}

                                <span
                                    className="
                                        absolute
                                        bottom-0
                                        right-0
                                        h-2.5
                                        w-2.5
                                        rounded-full
                                        border-2
                                        border-background
                                        bg-emerald-400
                                    "
                                />
                            </button>

                            {/* ================================================= */}
                            {/* USER DETAILS */}
                            {/* ================================================= */}

                            {!collapsed && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigateTo(
                                                "Student Profile"
                                            )
                                        }
                                        className="
                                            min-w-0
                                            flex-1
                                            text-left
                                        "
                                    >
                                        <p
                                            className="
                                                whitespace-nowrap
                                                text-[11px]
                                                font-bold
                                                leading-4
                                                text-foreground
                                            "
                                        >
                                            {displayName}
                                        </p>

                                        <div className="mt-0.5 flex items-center gap-1.5">
                                            <p className="text-[10px] text-muted-foreground">
                                                Student
                                            </p>

                                            <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/50" />

                                            <span className="text-[9px] font-semibold text-primary">
                                                Verified
                                            </span>
                                        </div>
                                    </button>

                                    {/* Logout */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setLogoutOpen(
                                                true
                                            )
                                        }
                                        aria-label="Logout"
                                        title="Logout"
                                        className="
                                            flex
                                            h-8
                                            w-8
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-lg
                                            text-muted-foreground
                                            transition-colors
                                            hover:bg-red-400/10
                                            hover:text-red-400
                                        "
                                    >
                                        <LogOut
                                            size={15}
                                            strokeWidth={1.8}
                                        />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* ================================================= */}
                {/* COLLAPSE */}
                {/* ================================================= */}

                <button
                    type="button"
                    onClick={() =>
                        setCollapsed(
                            (value) => !value
                        )
                    }
                    aria-label={
                        collapsed
                            ? "Expand sidebar"
                            : "Collapse sidebar"
                    }
                    title={
                        collapsed
                            ? "Expand sidebar"
                            : "Collapse sidebar"
                    }
                    className={`
                        absolute
                        -right-3
                        top-[58px]
                        z-[100]
                        flex
                        h-7
                        w-7
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-border
                        bg-card
                        text-muted-foreground
                        shadow-lg
                        transition-transform
                        duration-200
                        hover:border-primary/40
                        hover:bg-primary/10
                        hover:text-primary
                        ${collapsed
                            ? "rotate-180"
                            : ""
                        }
                    `}
                >
                    <ChevronLeft
                        size={15}
                        strokeWidth={2}
                    />
                </button>
            </aside>

            {/* ================================================= */}
            {/* LOGOUT MODAL */}
            {/* ================================================= */}

            {logoutOpen && (
                <div
                    className="
                        fixed
                        inset-0
                        z-[300]
                        flex
                        items-center
                        justify-center
                        bg-black/70
                        p-4
                        backdrop-blur-sm
                    "
                    onMouseDown={() =>
                        setLogoutOpen(false)
                    }
                >
                    <div
                        className="
                            w-full
                            max-w-[400px]
                            overflow-hidden
                            rounded-2xl
                            border
                            border-border
                            bg-card
                            shadow-[0_30px_100px_rgba(0,0,0,0.6)]
                        "
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >
                        {/* Header */}

                        <div className="flex items-start justify-between border-b border-border p-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-400/10 text-red-400">
                                    <AlertTriangle
                                        size={18}
                                    />
                                </div>

                                <div>
                                    <h3 className="text-base font-bold">
                                        Logout from CodeSync?
                                    </h3>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        You can sign in again anytime.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setLogoutOpen(false)
                                }
                                className="
                                    flex
                                    h-7
                                    w-7
                                    items-center
                                    justify-center
                                    rounded-lg
                                    text-muted-foreground
                                    hover:bg-secondary
                                    hover:text-foreground
                                "
                            >
                                <X size={15} />
                            </button>
                        </div>

                        {/* Body */}

                        <div className="p-5">
                            <div className="rounded-xl border border-border bg-secondary/40 p-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="
                                            flex
                                            h-10
                                            w-10
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-full
                                            bg-gradient-to-br
                                            from-indigo-500
                                            to-violet-600
                                            text-xs
                                            font-bold
                                            text-white
                                        "
                                    >
                                        {initials}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="truncate text-sm font-bold">
                                                {displayName}
                                            </p>

                                            <ShieldCheck
                                                size={13}
                                                className="shrink-0 text-primary"
                                            />
                                        </div>

                                        <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                                            @{username}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}

                            <div className="mt-5 grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setLogoutOpen(
                                            false
                                        )
                                    }
                                    className="
                                        h-11
                                        rounded-xl
                                        border
                                        border-border
                                        bg-secondary
                                        text-xs
                                        font-semibold
                                        text-muted-foreground
                                        hover:border-primary/30
                                        hover:text-foreground
                                    "
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="
                                        flex
                                        h-11
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-xl
                                        bg-red-500
                                        text-xs
                                        font-bold
                                        text-white
                                        hover:bg-red-600
                                    "
                                >
                                    <LogOut size={14} />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default memo(Sidebar)