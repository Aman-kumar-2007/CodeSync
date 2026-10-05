import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import {
    Bell,
    Trophy,
    Medal,
    Users,
    Megaphone,
    Palette,
    Sun,
    Moon,
    Monitor,
    Check,
    LogOut,
    ArrowRight,
    ShieldCheck,
    User,
    Sparkles,
    Zap,
    X,
    AlertTriangle,
} from "lucide-react"


/* ============================================================= */
/* CONSTANTS                                                     */
/* ============================================================= */

const ACCENT_COLORS = [
    {
        id: "purple",
        name: "Indigo",
        value: "#6366f1",
    },
    {
        id: "blue",
        name: "Blue",
        value: "#3b82f6",
    },
    {
        id: "cyan",
        name: "Cyan",
        value: "#06b6d4",
    },
    {
        id: "green",
        name: "Green",
        value: "#22c55e",
    },
    {
        id: "orange",
        name: "Orange",
        value: "#f97316",
    },
    {
        id: "pink",
        name: "Pink",
        value: "#ec4899",
    },
]


const DEFAULT_NOTIFICATIONS = {
    contests: true,
    leaderboard: true,
    platform: true,
}

/* ============================================================= */
/* MAIN COMPONENT                                                */
/* ============================================================= */

function Settings({
    profile,
    onLogout,
    onViewProfile,
}) {
    const [notifications, setNotifications] =
        useState(DEFAULT_NOTIFICATIONS)

    const [notificationsLoading, setNotificationsLoading] =
        useState(true)

    const [notificationsSaving, setNotificationsSaving] =
        useState(false)


    const [theme, setTheme] = useState(() => {
        const savedTheme =
            localStorage.getItem("codesync-theme")

        if (savedTheme) {
            return savedTheme
        }

        return (
            document.documentElement.dataset.theme ||
            "light"
        )
    })


    const [accent, setAccent] = useState(() => {
        return (
            localStorage.getItem(
                "codesync-accent"
            ) || "purple"
        )
    })


    const [logoutOpen, setLogoutOpen] =
        useState(false)


    /* ========================================================= */
    /* THEME                                                      */
    /* ========================================================= */

    useEffect(() => {
        applyTheme(theme)

        localStorage.setItem(
            "codesync-theme",
            theme
        )
    }, [theme])


    /* ========================================================= */
    /* ACCENT                                                     */
    /* ========================================================= */

    useEffect(() => {
        applyAccent(accent)

        localStorage.setItem(
            "codesync-accent",
            accent
        )
    }, [accent])


    /* ========================================================= */
    /* NOTIFICATIONS                                              */
    /* ========================================================= */

    useEffect(() => {
        const fetchNotificationPreferences = async () => {
            try {
                setNotificationsLoading(true)

                const {
                    data: { session },
                } = await supabase.auth.getSession()

                if (!session?.access_token) {
                    throw new Error(
                        "Authentication session not found."
                    )
                }

                const response = await fetch(
                    "https://codesync-su2x.onrender.com/api/preferences",
                    {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    }
                )

                const result = await response.json()

                if (!response.ok || !result.success) {
                    throw new Error(
                        result.message ||
                        "Failed to load notification preferences."
                    )
                }

                setNotifications({
                    ...DEFAULT_NOTIFICATIONS,
                    ...result.data,
                })
            } catch (error) {
                console.error(
                    "Notification preferences fetch error:",
                    error
                )
            } finally {
                setNotificationsLoading(false)
            }
        }

        fetchNotificationPreferences()
    }, [])


    const toggleNotification = async (key) => {
        if (notificationsSaving) {
            return
        }

        const nextNotifications = {
            ...notifications,
            [key]: !notifications[key],
        }

        try {
            setNotificationsSaving(true)

            const {
                data: { session },
            } = await supabase.auth.getSession()

            if (!session?.access_token) {
                throw new Error(
                    "Authentication session not found."
                )
            }

            const response = await fetch(
                "https://codesync-su2x.onrender.com/api/preferences",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify(
                        nextNotifications
                    ),
                }
            )

            const result = await response.json()

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ||
                    "Failed to update notification preferences."
                )
            }

            setNotifications({
                ...DEFAULT_NOTIFICATIONS,
                ...result.data,
            })
        } catch (error) {
            console.error(
                "Notification preferences update error:",
                error
            )
        } finally {
            setNotificationsSaving(false)
        }
    }


    /* ========================================================= */
    /* LOGOUT                                                     */
    /* ========================================================= */

    const handleLogout = () => {
        setLogoutOpen(false)

        if (onLogout) {
            onLogout()
        }
    }


    return (
        <div className="min-h-[calc(100vh-72px)] bg-background px-4 py-5 text-foreground sm:px-6 lg:px-7">

            <div className="mx-auto max-w-[1400px]">

                {/* ================================================= */}
                {/* PAGE HEADER                                       */}
                {/* ================================================= */}

                <div className="relative mb-6 overflow-hidden rounded-2xl border border-border bg-card">

                    <div className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-primary/[0.10] blur-[100px]" />

                    <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/[0.06] blur-[90px]" />

                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.06]"
                        style={{
                            backgroundImage:
                                "linear-gradient(rgba(99,102,241,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.35) 1px, transparent 1px)",
                            backgroundSize: "36px 36px",
                        }}
                    />

                    <div className="relative flex flex-col justify-between gap-5 p-6 sm:p-7 lg:flex-row lg:items-center">

                        <div>

                            <div className="mb-2 flex items-center gap-2">

                                <Sparkles
                                    size={14}
                                    className="text-primary"
                                />

                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                                    Preferences
                                </span>

                            </div>

                            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                                Settings
                            </h1>

                            <p className="mt-2 text-sm text-muted-foreground">
                                Customize your CodeSync experience
                            </p>

                        </div>


                        <div className="hidden max-w-xs text-right lg:block">

                            <p className="text-sm italic text-muted-foreground">
                                “A better you,
                                <br />
                                a more productive tomorrow.”
                            </p>

                            <div className="mt-2 ml-auto h-0.5 w-12 rounded-full bg-primary" />

                            <p className="mt-2 text-[10px] text-muted-foreground">
                                — CodeSync
                            </p>

                        </div>

                    </div>

                </div>


                {/* ================================================= */}
                {/* PROFILE SUMMARY                                  */}
                {/* ================================================= */}

                <section className="relative mb-5 overflow-hidden rounded-2xl border border-border bg-card">

                    <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-primary/[0.06] to-transparent" />

                    <div className="relative flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">

                        <div className="flex items-center gap-4 sm:gap-5">

                            {/* Avatar */}
                            <div className="relative shrink-0">

                                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-extrabold text-white shadow-[0_0_30px_rgba(99,102,241,0.20)] sm:h-20 sm:w-20 sm:text-2xl">
                                    {profile?.avatar ? (
                                        <img
                                            src={profile.avatar}
                                            alt={profile?.name || "Profile"}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        (profile?.name || "Student")
                                            .trim()
                                            .split(/\s+/)
                                            .slice(0, 2)
                                            .map((part) => part[0])
                                            .join("")
                                            .toUpperCase()
                                    )}
                                </div>

                                <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-card bg-emerald-400" />

                            </div>


                            <div>

                                <div className="flex flex-wrap items-center gap-2">

                                    <h2 className="text-xl font-bold">
                                        {profile?.name || "Student"}
                                    </h2>

                                    <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-primary">
                                        <ShieldCheck size={10} />
                                        Verified
                                    </span>

                                </div>

                                <p className="mt-1 font-mono text-xs text-muted-foreground">
                                    @{profile?.username || "student"}
                                </p>


                                <div className="mt-3 flex flex-wrap gap-2">

                                    {profile?.branch && (
                                        <span className="rounded-lg border border-border bg-secondary px-2.5 py-1 text-[10px] text-muted-foreground">
                                            {profile.branch}
                                        </span>
                                    )}

                                </div>

                            </div>

                        </div>


                        <button
                            type="button"
                            onClick={onViewProfile}
                            className="group flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-4 text-xs font-semibold transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                        >
                            <User size={14} />
                            View Profile
                            <ArrowRight
                                size={13}
                                className="transition-transform group-hover:translate-x-0.5"
                            />
                        </button>

                    </div>

                </section>


                {/* ================================================= */}
                {/* MAIN GRID                                         */}
                {/* ================================================= */}

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.05fr_0.95fr]">


                    {/* ================================================= */}
                    {/* NOTIFICATIONS                                    */}
                    {/* ================================================= */}

                    <section className="overflow-hidden rounded-2xl border border-border bg-card">

                        <SectionHeading
                            icon={Bell}
                            iconClass="text-primary"
                            bgClass="bg-primary/10"
                            title="Notifications"
                            description="Stay updated with what matters to you."
                        />


                        <div className="divide-y divide-border">

                            <NotificationRow
                                icon={Trophy}
                                iconClass="text-amber-400"
                                title="Contest Notifications"
                                description="Upcoming contests, reminders and results."
                                enabled={
                                    notifications.contests
                                }
                                onToggle={() =>
                                    toggleNotification(
                                        "contests"
                                    )
                                }
                            />


                            <NotificationRow
                                icon={Medal}
                                iconClass="text-blue-400"
                                title="Leaderboard Updates"
                                description="Get notified when your rank changes."
                                enabled={
                                    notifications.leaderboard
                                }
                                onToggle={() =>
                                    toggleNotification(
                                        "leaderboard"
                                    )
                                }
                            />

                            <NotificationRow
                                icon={Megaphone}
                                iconClass="text-cyan-400"
                                title="Platform Updates"
                                description="Features, maintenance and important announcements."
                                enabled={
                                    notifications.platform
                                }
                                onToggle={() =>
                                    toggleNotification(
                                        "platform"
                                    )
                                }
                            />

                        </div>

                    </section>


                    {/* ================================================= */}
                    {/* APPEARANCE                                      */}
                    {/* ================================================= */}

                    <section className="overflow-hidden rounded-2xl border border-border bg-card">

                        <SectionHeading
                            icon={Palette}
                            iconClass="text-violet-400"
                            bgClass="bg-violet-500/10"
                            title="Appearance"
                            description="Make CodeSync feel like yours."
                        />


                        <div className="p-5">

                            {/* Theme */}
                            <div>

                                <p className="mb-3 text-sm font-bold">
                                    Theme Mode
                                </p>


                                <div className="grid grid-cols-3 gap-2">

                                    <ThemeOption
                                        icon={Sun}
                                        title="Light"
                                        active={
                                            theme === "light"
                                        }
                                        onClick={() =>
                                            setTheme(
                                                "light"
                                            )
                                        }
                                    />


                                    <ThemeOption
                                        icon={Moon}
                                        title="Dark"
                                        active={
                                            theme === "dark"
                                        }
                                        onClick={() =>
                                            setTheme(
                                                "dark"
                                            )
                                        }
                                    />


                                    <ThemeOption
                                        icon={Monitor}
                                        title="System"
                                        active={
                                            theme ===
                                            "system"
                                        }
                                        onClick={() =>
                                            setTheme(
                                                "system"
                                            )
                                        }
                                    />

                                </div>

                            </div>


                            {/* Accent */}
                            <div className="mt-6 border-t border-border pt-5">

                                <div className="flex items-center justify-between">

                                    <div>

                                        <p className="text-sm font-bold">
                                            Accent Color
                                        </p>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Choose your CodeSync accent.
                                        </p>

                                    </div>


                                    <span
                                        className="rounded-lg border border-border bg-secondary px-2.5 py-1 text-[9px] font-semibold capitalize text-muted-foreground"
                                    >
                                        {
                                            ACCENT_COLORS.find(
                                                (item) =>
                                                    item.id ===
                                                    accent
                                            )?.name
                                        }
                                    </span>

                                </div>


                                <div className="mt-4 flex flex-wrap gap-3">

                                    {ACCENT_COLORS.map(
                                        (color) => (
                                            <AccentButton
                                                key={
                                                    color.id
                                                }
                                                color={
                                                    color
                                                }
                                                active={
                                                    accent ===
                                                    color.id
                                                }
                                                onClick={() =>
                                                    setAccent(
                                                        color.id
                                                    )
                                                }
                                            />
                                        )
                                    )}

                                </div>

                            </div>


                            {/* Personalization card */}
                            <div className="mt-6 rounded-xl border border-border bg-secondary/40 p-4">

                                <div className="flex items-start gap-3">

                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <Zap size={16} />
                                    </div>

                                    <div>

                                        <p className="text-xs font-bold">
                                            Your preferences are saved
                                        </p>

                                        <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                                            Your notification preferences
                                            are saved to your CodeSync account.
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </section>

                </div>


                {/* ================================================= */}
                {/* MOTIVATION                                       */}
                {/* ================================================= */}

                <section className="relative my-5 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/[0.10] via-violet-500/[0.05] to-transparent">

                    <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />

                    <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

                        <div className="flex items-center gap-4">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Sparkles size={20} />
                            </div>

                            <div>

                                <p className="text-base font-bold">
                                    Small changes. Big focus.
                                </p>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    A personalized experience helps
                                    you stay consistent.
                                </p>

                            </div>

                        </div>


                        <div className="hidden text-right sm:block">

                            <p className="text-xs italic text-muted-foreground">
                                “Discipline today,
                                <br />
                                progress tomorrow.”
                            </p>

                        </div>

                    </div>

                </section>


                {/* ================================================= */}
                {/* LOGOUT                                            */}
                {/* ================================================= */}

                <section className="overflow-hidden rounded-2xl border border-red-400/20 bg-red-400/[0.025]">

                    <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

                        <div className="flex items-center gap-4">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-400/10 text-red-400">
                                <LogOut size={19} />
                            </div>


                            <div>

                                <h2 className="text-base font-bold">
                                    Logout
                                </h2>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    Sign out of your CodeSync account.
                                </p>

                            </div>

                        </div>


                        <button
                            type="button"
                            onClick={() =>
                                setLogoutOpen(true)
                            }
                            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-400/5 px-5 text-xs font-bold text-red-400 transition-all hover:bg-red-400/10 hover:border-red-400/50"
                        >
                            <LogOut size={14} />
                            Logout
                        </button>

                    </div>

                </section>


                {/* Footer */}
                <div className="py-8 text-center">

                    <p className="text-[10px] tracking-wide text-muted-foreground">
                        CodeSync
                        <span className="mx-2 opacity-40">
                            •
                        </span>
                        Track your journey. Build your future.
                    </p>

                </div>

            </div>


            {/* ===================================================== */}
            {/* LOGOUT CONFIRMATION                                  */}
            {/* ===================================================== */}

            {logoutOpen && (
                <LogoutModal
                    onCancel={() =>
                        setLogoutOpen(false)
                    }
                    onConfirm={handleLogout}
                />
            )}

        </div>
    )
}


/* ============================================================= */
/* SECTION HEADING                                               */
/* ============================================================= */

function SectionHeading({
    icon: Icon,
    iconClass,
    bgClass,
    title,
    description,
}) {
    return (
        <div className="flex items-center gap-3 border-b border-border p-5">

            <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${bgClass} ${iconClass}`}
            >
                <Icon size={19} />
            </div>


            <div>

                <h2 className="text-base font-bold">
                    {title}
                </h2>

                <p className="mt-0.5 text-xs text-muted-foreground">
                    {description}
                </p>

            </div>

        </div>
    )
}


/* ============================================================= */
/* NOTIFICATION ROW                                              */
/* ============================================================= */

function NotificationRow({
    icon: Icon,
    iconClass,
    title,
    description,
    enabled,
    onToggle,
    disabled = false,
}) {
    return (
        <div className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-secondary/30">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">

                <Icon
                    size={17}
                    className={iconClass}
                />

            </div>


            <div className="min-w-0 flex-1">

                <p className="text-sm font-semibold">
                    {title}
                </p>

                <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                    {description}
                </p>

            </div>


            <Toggle
                enabled={enabled}
                onClick={onToggle}
                disabled={disabled}
            />

        </div>
    )
}


/* ============================================================= */
/* TOGGLE                                                        */
/* ============================================================= */

function Toggle({
    enabled,
    onClick,
    disabled = false,
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={
                enabled
                    ? "Disable notification"
                    : "Enable notification"
            }
            className={`relative h-6 w-11 shrink-0 rounded-full p-1 transition-all ${disabled
                ? "cursor-not-allowed opacity-60"
                : ""
                } ${enabled
                    ? "bg-primary"
                    : "bg-slate-700"
                }`}
        >

            <span
                className={`block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${enabled
                    ? "translate-x-5"
                    : "translate-x-0"
                    }`}
            />

        </button>
    )
}


/* ============================================================= */
/* THEME OPTION                                                  */
/* ============================================================= */

function ThemeOption({
    icon: Icon,
    title,
    active,
    onClick,
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border p-4 transition-all ${active
                ? "border-primary bg-primary/[0.08] text-primary shadow-[0_0_25px_rgba(99,102,241,0.08)]"
                : "border-border bg-secondary text-muted-foreground hover:border-slate-600 hover:text-foreground"
                }`}
        >

            {active && (
                <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white">
                    <Check size={9} />
                </span>
            )}

            <Icon size={19} />

            <span className="text-xs font-semibold">
                {title}
            </span>

        </button>
    )
}


/* ============================================================= */
/* ACCENT BUTTON                                                 */
/* ============================================================= */

function AccentButton({
    color,
    active,
    onClick,
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={`Use ${color.name} accent`}
            title={color.name}
            className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all ${active
                ? "ring-2 ring-white ring-offset-2 ring-offset-card"
                : "hover:scale-110"
                }`}
            style={{
                backgroundColor: color.value,
            }}
        >
            {active && (
                <Check
                    size={16}
                    strokeWidth={3}
                    className="text-white"
                />
            )}
        </button>
    )
}


/* ============================================================= */
/* LOGOUT MODAL                                                  */
/* ============================================================= */

function LogoutModal({
    onCancel,
    onConfirm,
}) {
    return (
        <div
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
            onMouseDown={onCancel}
        >

            <div
                className="w-full max-w-[420px] overflow-hidden rounded-2xl border border-border bg-[#0d131f] shadow-[0_30px_100px_rgba(0,0,0,0.65)]"
                onMouseDown={(e) =>
                    e.stopPropagation()
                }
            >

                <div className="flex items-start justify-between border-b border-border p-5">

                    <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-400/10 text-red-400">
                            <AlertTriangle size={18} />
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
                        onClick={onCancel}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                        <X size={16} />
                    </button>

                </div>


                <div className="p-5">

                    <div className="rounded-xl border border-border bg-secondary/50 p-4">

                        <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
                                AK
                            </div>

                            <div>

                                <p className="text-sm font-semibold">
                                    Aman Kumar
                                </p>

                                <p className="font-mono text-[10px] text-muted-foreground">
                                    @amankumar_1305
                                </p>

                            </div>

                        </div>

                    </div>


                    <div className="mt-5 flex gap-3">

                        <button
                            type="button"
                            onClick={onCancel}
                            className="h-11 flex-1 rounded-xl border border-border bg-secondary text-xs font-semibold text-muted-foreground transition-all hover:text-foreground"
                        >
                            Cancel
                        </button>


                        <button
                            type="button"
                            onClick={onConfirm}
                            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 text-xs font-bold text-white transition-all hover:bg-red-600"
                        >
                            <LogOut size={14} />
                            Logout
                        </button>

                    </div>

                </div>

            </div>

        </div>
    )
}


/* ============================================================= */
/* THEME HELPERS                                                 */
/* ============================================================= */

function applyAccent(accentId) {
    const selected =
        ACCENT_COLORS.find(
            (color) => color.id === accentId
        ) || ACCENT_COLORS[0]

    const root =
        document.documentElement

    root.style.setProperty(
        "--primary",
        selected.value
    )

    root.style.setProperty(
        "--accent",
        selected.value
    )

    root.style.setProperty(
        "--ring",
        selected.value
    )

    /*
     * RGB value used by some future
     * translucent UI effects.
     */
    const rgb = hexToRgb(selected.value)

    if (rgb) {
        root.style.setProperty(
            "--primary-rgb",
            `${rgb.r}, ${rgb.g}, ${rgb.b}`
        )
    }
}


function applyTheme(theme) {
    const root =
        document.documentElement

    const actualTheme =
        theme === "system"
            ? window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches
                ? "dark"
                : "light"
            : theme

    root.dataset.theme = actualTheme

    if (actualTheme === "light") {
        root.style.setProperty(
            "--background",
            "#f5f7fb"
        )

        root.style.setProperty(
            "--foreground",
            "#111827"
        )

        root.style.setProperty(
            "--card",
            "#ffffff"
        )

        root.style.setProperty(
            "--card-foreground",
            "#111827"
        )

        root.style.setProperty(
            "--secondary",
            "#f1f3f8"
        )

        root.style.setProperty(
            "--secondary-foreground",
            "#111827"
        )

        root.style.setProperty(
            "--muted",
            "#e8ebf2"
        )

        root.style.setProperty(
            "--muted-foreground",
            "#64748b"
        )

        root.style.setProperty(
            "--border",
            "#dce1eb"
        )
    } else {
        root.style.setProperty(
            "--background",
            "#0b0f19"
        )

        root.style.setProperty(
            "--foreground",
            "#eeeef0"
        )

        root.style.setProperty(
            "--card",
            "#121722"
        )

        root.style.setProperty(
            "--card-foreground",
            "#eeeef0"
        )

        root.style.setProperty(
            "--secondary",
            "#101521"
        )

        root.style.setProperty(
            "--secondary-foreground",
            "#eeeef0"
        )

        root.style.setProperty(
            "--muted",
            "#1a2130"
        )

        root.style.setProperty(
            "--muted-foreground",
            "#7d8495"
        )

        root.style.setProperty(
            "--border",
            "#20283a"
        )
    }
}


function hexToRgb(hex) {
    const clean = hex.replace(
        "#",
        ""
    )

    if (clean.length !== 6) {
        return null
    }

    return {
        r: parseInt(
            clean.substring(0, 2),
            16
        ),
        g: parseInt(
            clean.substring(2, 4),
            16
        ),
        b: parseInt(
            clean.substring(4, 6),
            16
        ),
    }
}


export default Settings