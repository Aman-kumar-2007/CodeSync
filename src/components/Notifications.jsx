import { useEffect, useState } from "react"
import {
    Bell,
    Trophy,
    Medal,
    Zap,
    CheckCheck,
    Clock3,
    Trash2,
} from "lucide-react"
import { supabase } from "../lib/supabase"


const getNotificationIcon = (type) => {
    switch (type) {
        case "CONTEST":
            return {
                icon: Trophy,
                iconClass: "text-amber-400",
                bgClass: "bg-amber-400/10",
            }

        case "LEADERBOARD":
            return {
                icon: Medal,
                iconClass: "text-blue-400",
                bgClass: "bg-blue-400/10",
            }

        case "STREAK":
            return {
                icon: Zap,
                iconClass: "text-violet-400",
                bgClass: "bg-violet-400/10",
            }

        default:
            return {
                icon: Bell,
                iconClass: "text-primary",
                bgClass: "bg-primary/10",
            }
    }
}


const formatNotificationTime = (date) => {
    if (!date) return ""

    const createdAt = new Date(date)
    const now = new Date()
    const diffMinutes = Math.floor(
        Math.max(
            0,
            now.getTime() - createdAt.getTime()
        ) / (1000 * 60)
    )

    if (diffMinutes < 1) return "Just now"
    if (diffMinutes < 60) return `${diffMinutes}m ago`

    const diffHours = Math.floor(
        diffMinutes / 60
    )

    if (diffHours < 24) return `${diffHours}h ago`

    const diffDays = Math.floor(
        diffHours / 24
    )

    if (diffDays < 7) return `${diffDays}d ago`

    return createdAt.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric",
        }
    )
}


function Notifications() {
    const [notifications, setNotifications] =
        useState([])

    const [loading, setLoading] =
        useState(true)

    const [actionLoading, setActionLoading] =
        useState(false)

    const [error, setError] =
        useState("")


    const unreadCount =
        notifications.filter(
            (notification) =>
                !notification.isRead
        ).length


    const getAccessToken = async () => {
        const {
            data: { session },
        } = await supabase.auth.getSession()

        if (!session?.access_token) {
            throw new Error(
                "Authentication session not found."
            )
        }

        return session.access_token
    }


    const fetchNotifications = async () => {
        try {
            setLoading(true)
            setError("")

            const token =
                await getAccessToken()

            const response = await fetch(
                "https://codesync-su2x.onrender.com/api/notifications",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            const result =
                await response.json()

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ||
                    "Failed to load notifications."
                )
            }

            setNotifications(
                result.data?.notifications || []
            )
        } catch (error) {
            console.error(
                "Notifications fetch error:",
                error
            )

            setError(
                error.message ||
                "Failed to load notifications."
            )
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        fetchNotifications()
    }, [])


    const markAsRead = async (
        recipientId
    ) => {
        try {
            const token =
                await getAccessToken()

            const response = await fetch(
                `https://codesync-su2x.onrender.com/api/notifications/${recipientId}/read`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            const result =
                await response.json()

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ||
                    "Failed to mark notification as read."
                )
            }

            setNotifications((prev) =>
                prev.map((notification) =>
                    notification.id === recipientId
                        ? {
                            ...notification,
                            isRead: true,
                            readAt:
                                result.data?.read_at ||
                                new Date().toISOString(),
                        }
                        : notification
                )
            )
        } catch (error) {
            console.error(
                "Mark notification read error:",
                error
            )

            setError(
                error.message ||
                "Failed to update notification."
            )
        }
    }


    const markAllAsRead = async () => {
        if (unreadCount === 0) return

        try {
            setActionLoading(true)
            setError("")

            const token =
                await getAccessToken()

            const response = await fetch(
                "https://codesync-su2x.onrender.com/api/notifications/read-all",
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            const result =
                await response.json()

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ||
                    "Failed to mark notifications as read."
                )
            }

            setNotifications((prev) =>
                prev.map((notification) => ({
                    ...notification,
                    isRead: true,
                    readAt:
                        notification.readAt ||
                        new Date().toISOString(),
                }))
            )
        } catch (error) {
            console.error(
                "Mark all notifications error:",
                error
            )

            setError(
                error.message ||
                "Failed to update notifications."
            )
        } finally {
            setActionLoading(false)
        }
    }


    const clearAll = async () => {
        if (notifications.length === 0) return

        try {
            setActionLoading(true)
            setError("")

            const token =
                await getAccessToken()

            const response = await fetch(
                "https://codesync-su2x.onrender.com/api/notifications",
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            const result =
                await response.json()

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ||
                    "Failed to clear notifications."
                )
            }

            setNotifications([])
        } catch (error) {
            console.error(
                "Clear notifications error:",
                error
            )

            setError(
                error.message ||
                "Failed to clear notifications."
            )
        } finally {
            setActionLoading(false)
        }
    }


    if (loading) {
        return (
            <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-background">
                <div className="flex flex-col items-center text-center">
                    <div className="relative flex h-20 w-20 items-center justify-center">
                        <div className="h-14 w-14 animate-spin rounded-full border-2 border-transparent border-t-primary border-r-primary/40" />
                        <div className="absolute h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_15px_rgba(99,102,241,0.8)]" />
                    </div>
                    <p className="mt-5 text-sm font-semibold">
                        Loading notifications
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Fetching your latest updates...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-[calc(100vh-72px)] bg-background px-4 py-5 text-foreground sm:px-6 lg:px-7">

            <div className="mx-auto max-w-[1000px]">

                {/* Header */}
                <section className="mb-5 overflow-hidden rounded-2xl border border-border bg-card">

                    <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-center gap-4">

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Bell size={21} />
                            </div>

                            <div>

                                <h1 className="text-2xl font-extrabold">
                                    Notifications
                                </h1>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Stay updated with your CodeSync activity.
                                </p>

                            </div>

                        </div>


                        <button
                            type="button"
                            onClick={markAllAsRead}
                            disabled={
                                actionLoading ||
                                unreadCount === 0
                            }
                            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-4 text-xs font-semibold text-muted-foreground transition-all hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <CheckCheck size={14} />
                            Mark all as read
                        </button>

                    </div>

                </section>


                {error && (
                    <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-400">
                        {error}
                    </div>
                )}

                {/* Notification list */}
                <section className="overflow-hidden rounded-2xl border border-border bg-card">

                    <div className="flex items-center justify-between border-b border-border px-5 py-4">

                        <div>

                            <p className="text-sm font-bold">
                                Recent Notifications
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                                Your latest CodeSync updates
                            </p>

                        </div>


                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[9px] font-bold text-primary">
                            {unreadCount} Unread
                        </span>

                    </div>


                    <div className="divide-y divide-border">

                        {notifications.length === 0 ? (
                            <div className="px-5 py-14 text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                                    <Bell size={20} />
                                </div>

                                <p className="mt-4 text-sm font-semibold">
                                    No notifications
                                </p>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    You&apos;re all caught up.
                                </p>
                            </div>
                        ) : (
                            notifications.map(
                                (notification) => {
                                    const {
                                        icon: Icon,
                                        iconClass,
                                        bgClass,
                                    } = getNotificationIcon(
                                        notification.type
                                    )

                                    return (
                                        <button
                                            key={
                                                notification.id
                                            }
                                            type="button"
                                            onClick={() => {
                                                if (
                                                    !notification.isRead
                                                ) {
                                                    markAsRead(
                                                        notification.id
                                                    )
                                                }
                                            }}
                                            className={`flex w-full gap-4 px-5 py-5 text-left transition-all hover:bg-secondary/40 ${!notification.isRead
                                                    ? "bg-primary/[0.025]"
                                                    : ""
                                                }`}
                                        >
                                            <div
                                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bgClass}`}
                                            >
                                                <Icon
                                                    size={19}
                                                    className={iconClass}
                                                />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-bold">
                                                            {notification.title}
                                                        </p>

                                                        {!notification.isRead && (
                                                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                        )}
                                                    </div>

                                                    <span className="flex shrink-0 items-center gap-1 text-[10px] text-muted-foreground">
                                                        <Clock3 size={11} />
                                                        {formatNotificationTime(
                                                            notification.createdAt
                                                        )}
                                                    </span>
                                                </div>

                                                <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                                                    {notification.description}
                                                </p>
                                            </div>
                                        </button>
                                    )
                                }
                            )
                        )}
                    </div>


                    {/* Bottom */}
                    <div className="flex items-center justify-between border-t border-border bg-secondary/20 px-5 py-4">

                        <p className="text-[10px] text-muted-foreground">
                            Notifications are based on your preferences.
                        </p>


                        <button
                            type="button"
                            onClick={clearAll}
                            disabled={
                                actionLoading ||
                                notifications.length === 0
                            }
                            className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Trash2 size={12} />
                            Clear all
                        </button>

                    </div>

                </section>

            </div>

        </div>
    )
}


export default Notifications