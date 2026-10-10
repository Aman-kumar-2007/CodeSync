import { useEffect, useMemo, useState } from "react"
import { supabase } from "../lib/supabase"
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"

import {
    Activity,
    Award,
    BarChart3,
    Code2,
    Flame,
    Trophy,
    ExternalLink,
} from "lucide-react"

import TopicProgress from "./TopicProgress"


import {
    getCachedData,
    setCachedData,
} from "../utils/pageCache"

const PERIODS = ["Weekly", "Monthly", "Yearly"]

function AnalyticsLoading() {
    return (
        <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-background">
            <div className="flex flex-col items-center">

                <div className="relative flex h-14 w-14 items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-primary/10" />

                    <div className="h-14 w-14 animate-spin rounded-full border-2 border-transparent border-t-primary border-r-primary/40" />

                    <div className="absolute h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_18px_rgba(99,102,241,0.9)]" />
                </div>

                <p className="mt-5 text-sm font-semibold text-foreground">
                    Loading analytics
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                    Fetching your CodeSync data...
                </p>

            </div>
        </div>
    )
}

/* =========================================================
   STAT CARD
   ========================================================= */

function StatCard({
    icon: Icon,
    label,
    value,
    subtitle,
    iconClass,
}) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:bg-secondary/40">
            <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-primary/5 blur-2xl transition-all duration-300 group-hover:bg-primary/10" />

            <div className="relative">
                <div className="flex items-start justify-between">
                    <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconClass}`}
                    >
                        <Icon size={17} />
                    </div>

                    <Activity
                        size={13}
                        className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    />
                </div>

                <p className="mt-4 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {label}
                </p>

                <p className="mt-1 font-mono text-2xl font-bold tracking-tight">
                    {value}
                </p>

                <p className="mt-1 text-[9px] text-emerald-400">
                    {subtitle}
                </p>
            </div>
        </div>
    )
}

/* =========================================================
   COMMON CARD
   ========================================================= */

function AnalyticsCard({ children, className = "" }) {
    return (
        <div
            className={`relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/20 ${className}`}
        >
            <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-primary/[0.025] blur-3xl" />

            <div className="relative">
                {children}
            </div>
        </div>
    )
}

/* =========================================================
   PERIOD SELECTOR
   ========================================================= */

function PeriodSelector({ value, onChange }) {
    return (
        <div className="flex items-center rounded-lg border border-border bg-secondary p-1">
            {PERIODS.map((period) => {
                const active = value === period

                return (
                    <button
                        key={period}
                        onClick={() => onChange(period)}
                        className={`rounded-md px-2.5 py-1.5 text-[9px] font-semibold transition-all duration-200 ${active
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {period}
                    </button>
                )
            })}
        </div>
    )
}

/* =========================================================
   CUSTOM TOOLTIP
   ========================================================= */

function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null

    return (
        <div className="rounded-xl border border-slate-700 bg-[#121722] px-3 py-2 text-white shadow-xl">
            <p className="mb-1.5 text-[9px] font-semibold text-slate-300">
                {label}
            </p>

            {payload.map((item) => (
                <div
                    key={item.dataKey}
                    className="flex items-center justify-between gap-5"
                >
                    <span className="text-[9px] text-slate-300">
                        {item.name || item.dataKey}
                    </span>

                    <span
                        className="font-mono text-[10px] font-semibold"
                        style={{ color: item.color }}
                    >
                        {item.value}
                    </span>
                </div>
            ))}
        </div>
    )
}

/* =========================================================
   ACTIVITY CHART
   ========================================================= */

function ActivityChart({ activity }) {
    const [period, setPeriod] = useState("Weekly")

    const data = useMemo(() => {
        if (!activity) return []

        return activity[period.toLowerCase()] || []
    }, [activity, period])

    const total = useMemo(() => {
        return data.reduce(
            (sum, item) => sum + (item.submissions || 0),
            0
        )
    }, [data])

    return (
        <AnalyticsCard>
            <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="h-5 w-1 rounded-full bg-emerald-400" />

                        <h2 className="text-sm font-bold">
                            Problem Submission Activity
                        </h2>
                    </div>

                    <p className="mt-1 text-[9px] text-muted-foreground">
                        Problems submitted over time
                    </p>
                </div>

                <PeriodSelector
                    value={period}
                    onChange={setPeriod}
                />
            </div>

            <div className="mb-4 flex items-end justify-between">
                <div>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                        Total in selected period
                    </p>

                    <p className="mt-1 font-mono text-lg font-bold text-emerald-400">
                        {total}
                    </p>
                </div>

                <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Submissions
                </div>
            </div>

            <div className="h-[270px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{
                            top: 5,
                            right: 5,
                            left: -20,
                            bottom: 0,
                        }}
                    >
                        <CartesianGrid
                            stroke="#20283a"
                            strokeDasharray="3 3"
                            vertical={false}
                        />

                        <XAxis
                            dataKey="label"
                            tick={{
                                fill: "#7d8495",
                                fontSize: 9,
                            }}
                            axisLine={false}
                            tickLine={false}
                        />

                        <YAxis
                            allowDecimals={false}
                            tick={{
                                fill: "#7d8495",
                                fontSize: 9,
                            }}
                            axisLine={false}
                            tickLine={false}
                        />

                        <Tooltip
                            content={<ChartTooltip />}
                            cursor={false}
                        />

                        <Bar
                            dataKey="submissions"
                            name="Submissions"
                            fill="#34d399"
                            radius={[5, 5, 0, 0]}
                            maxBarSize={30}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </AnalyticsCard>
    )
}
/* =========================================================
   RATING CHART
   ========================================================= */

function RatingChart({ rating }) {
    const [period, setPeriod] = useState("Monthly")

    const data = useMemo(() => {
        if (!rating) return []

        const selectedData =
            rating[period.toLowerCase()] || []

        return selectedData
    }, [rating, period])

    return (
        <AnalyticsCard>
            <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="h-5 w-1 rounded-full bg-blue-400" />

                        <h2 className="text-sm font-bold">
                            Rating Progress
                        </h2>
                    </div>

                    <p className="mt-1 text-[9px] text-muted-foreground">
                        Rating growth across platforms
                    </p>
                </div>

                <PeriodSelector
                    value={period}
                    onChange={setPeriod}
                />
            </div>

            <div className="mb-4 flex items-center gap-5">
                <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-400" />

                    <span className="text-[9px] text-muted-foreground">
                        Codeforces
                    </span>
                </div>

                <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-orange-400" />

                    <span className="text-[9px] text-muted-foreground">
                        LeetCode
                    </span>
                </div>
            </div>

            <div className="h-[270px]">
                {data.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-sm text-muted-foreground">
                            No rating data available
                        </p>
                    </div>
                ) : (
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >
                        <LineChart
                            data={data}
                            margin={{
                                top: 5,
                                right: 5,
                                left: -20,
                                bottom: 0,
                            }}
                        >
                            <CartesianGrid
                                stroke="#20283a"
                                strokeDasharray="3 3"
                                vertical={false}
                            />

                            <XAxis
                                dataKey="label"
                                tick={{
                                    fill: "#7d8495",
                                    fontSize: 9,
                                }}
                                axisLine={false}
                                tickLine={false}
                            />

                            <YAxis
                                domain={[
                                    "dataMin - 100",
                                    "dataMax + 100",
                                ]}
                                tick={{
                                    fill: "#7d8495",
                                    fontSize: 9,
                                }}
                                axisLine={false}
                                tickLine={false}
                            />

                            <Tooltip
                                content={<ChartTooltip />}
                            />

                            <Line
                                type="monotone"
                                dataKey="codeforces"
                                name="Codeforces"
                                stroke="#38bdf8"
                                strokeWidth={2.5}
                                dot={{
                                    r: 3,
                                    fill: "#38bdf8",
                                    strokeWidth: 0,
                                }}
                                activeDot={{
                                    r: 5,
                                }}
                                connectNulls
                            />

                            <Line
                                type="monotone"
                                dataKey="leetcode"
                                name="LeetCode"
                                stroke="#fb923c"
                                strokeWidth={2.5}
                                dot={{
                                    r: 3,
                                    fill: "#fb923c",
                                    strokeWidth: 0,
                                }}
                                activeDot={{
                                    r: 5,
                                }}
                                connectNulls
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </AnalyticsCard>
    )
}
/* =========================================================
   PLATFORM BREAKDOWN
   ========================================================= */

function PlatformBreakdown({ platforms }) {
    const platformMap = new Map(
        (platforms || []).map((platform) => [
            platform.platform,
            platform,
        ])
    )

    const platformData = [
        {
            key: "LEETCODE",
            name: "LeetCode",
            icon: Code2,
            color: "#f59e0b",
        },
        {
            key: "CODEFORCES",
            name: "Codeforces",
            icon: Trophy,
            color: "#2196f3",
        },
        {
            key: "GITHUB",
            name: "GitHub",
            icon: Activity,
            color: "#10b981",
        },
        {
            key: "GFG",
            name: "GeeksforGeeks",
            icon: Code2,
            color: "#22c55e",
        },
    ]

    return (
        <div className="lg:col-span-3">
            <div className="mb-4">
                <div className="flex items-center gap-2">
                    <div className="h-5 w-1 rounded-full bg-purple-400" />

                    <h2 className="text-sm font-bold">
                        Platform Overview
                    </h2>
                </div>

                <p className="mt-1 text-[9px] text-muted-foreground">
                    Your coding activity across platforms
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {platformData.map((platform) => {
                    const Icon = platform.icon
                    const data = platformMap.get(platform.key)

                    return (
                        <div
                            key={platform.key}
                            className="group relative min-h-[245px] overflow-hidden rounded-2xl border bg-card p-5 transition-all duration-300 hover:-translate-y-1"
                            style={{
                                borderColor: `${platform.color}55`,
                            }}
                        >
                            <div
                                className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full blur-3xl opacity-10 transition-opacity duration-300 group-hover:opacity-20"
                                style={{
                                    backgroundColor: platform.color,
                                }}
                            />

                            <div className="relative flex h-full flex-col">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="flex h-12 w-12 items-center justify-center rounded-xl"
                                            style={{
                                                backgroundColor: `${platform.color}18`,
                                                color: platform.color,
                                            }}
                                        >
                                            <Icon size={24} />
                                        </div>

                                        <h3
                                            className="text-lg font-bold"
                                            style={{
                                                color: platform.color,
                                            }}
                                        >
                                            {platform.name}
                                        </h3>
                                    </div>

                                    <button
                                        className="flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-70"
                                        style={{
                                            color: platform.color,
                                        }}
                                    >
                                        View Profile
                                        <ExternalLink size={15} />
                                    </button>
                                </div>

                                {/* LeetCode */}
                                {platform.key === "LEETCODE" && (
                                    <div className="mt-auto grid grid-cols-[0.8fr_1.2fr] items-end gap-6">
                                        <div>
                                            <p className="font-mono text-5xl font-bold tracking-tight">
                                                {data?.problemsSolved ?? 0}
                                            </p>

                                            <p className="mt-2 text-sm text-muted-foreground">
                                                Problems Solved
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <DifficultyBar
                                                label="Easy"
                                                value={data?.easySolved ?? 0}
                                                color="#10b981"
                                            />

                                            <DifficultyBar
                                                label="Medium"
                                                value={data?.mediumSolved ?? 0}
                                                color="#f59e0b"
                                            />

                                            <DifficultyBar
                                                label="Hard"
                                                value={data?.hardSolved ?? 0}
                                                color="#fb7185"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Codeforces */}
                                {platform.key === "CODEFORCES" && (
                                    <div className="mt-auto">
                                        <div className="grid grid-cols-2 gap-6 mt-5">
                                            <div>
                                                <p className="font-mono text-5xl font-bold tracking-tight">
                                                    {data?.problemsSolved ?? 0}
                                                </p>

                                                <p className="mt-2 text-sm text-muted-foreground">
                                                    Problems Solved
                                                </p>
                                            </div>

                                            <div>
                                                <p
                                                    className="font-mono text-5xl font-bold tracking-tight"
                                                    style={{
                                                        color: platform.color,
                                                    }}
                                                >
                                                    {data?.currentRating ?? "—"}
                                                </p>

                                                <p className="mt-2 text-sm text-muted-foreground">
                                                    Current Rating
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-6 grid grid-cols-2 border-t border-border pt-4">
                                            <div>
                                                <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                                                    Max Rating
                                                </p>

                                                <p className="mt-1 font-mono text-lg font-semibold">
                                                    {data?.maxRating ?? "—"}
                                                </p>
                                            </div>

                                            <div className="border-l border-border pl-6">
                                                <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                                                    Contests
                                                </p>

                                                <p className="mt-1 font-mono text-lg font-semibold">
                                                    {data?.contests ?? 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* GitHub */}
                                {platform.key === "GITHUB" && (
                                    <div className="mt-auto">
                                        <div className="flex items-end justify-between gap-5">
                                            <div>
                                                <p className="font-mono text-5xl font-bold tracking-tight">
                                                    {data?.contributions ?? 0}
                                                </p>

                                                <p className="mt-2 text-sm text-muted-foreground">
                                                    Contributions
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                                            <span className="text-sm text-muted-foreground">
                                                Total Repositories
                                            </span>

                                            <span className="font-mono text-lg font-semibold">
                                                {data?.repositories ?? 0}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* GFG */}
                                {platform.key === "GFG" && (
                                    <div className="mt-auto grid grid-cols-[0.8fr_1.2fr] items-end gap-6">
                                        <div>
                                            <p className="font-mono text-5xl font-bold tracking-tight">
                                                {data?.problemsSolved ?? 0}
                                            </p>

                                            <p className="mt-2 text-sm text-muted-foreground">
                                                Problems Solved
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <DifficultyBar
                                                label="Basic"
                                                value={data?.basicSolved ?? 0}
                                                color="#22c55e"
                                            />

                                            <DifficultyBar
                                                label="Easy"
                                                value={data?.easySolved ?? 0}
                                                color="#34d399"
                                            />

                                            <DifficultyBar
                                                label="Medium"
                                                value={data?.mediumSolved ?? 0}
                                                color="#f59e0b"
                                            />

                                            <DifficultyBar
                                                label="Hard"
                                                value={data?.hardSolved ?? 0}
                                                color="#fb7185"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

function DifficultyBar({ label, value, color }) {
    const percentage = Math.min((value / 250) * 100, 100)

    return (
        <div>
            <div className="mb-1.5 flex items-center justify-between">
                <span
                    className="text-xs font-medium"
                    style={{ color }}
                >
                    {label}
                </span>

                <span className="font-mono text-[10px] text-muted-foreground">
                    {value}
                </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                        width: `${percentage}%`,
                        backgroundColor: color,
                    }}
                />
            </div>
        </div>
    )
}

/* =========================================================
   DIFFICULTY DISTRIBUTION
   ========================================================= */

function DifficultyDistribution({ difficultyData }) {
    const total = difficultyData.reduce(
        (sum, difficulty) => sum + difficulty.value,
        0
    )

    return (
        <AnalyticsCard>
            <div className="mb-6">
                <div className="flex items-center gap-2">
                    <div className="h-5 w-1 rounded-full bg-amber-400" />

                    <h2 className="text-sm font-bold">
                        Difficulty Distribution
                    </h2>
                </div>

                <p className="mt-1 text-[9px] text-muted-foreground">
                    Your problem-solving difficulty mix
                </p>
            </div>

            <div className="space-y-5">
                {difficultyData.map((difficulty) => {
                    const percentage =
                        total > 0
                            ? (difficulty.value / total) * 100
                            : 0

                    return (
                        <div key={difficulty.name}>
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-[10px] font-medium">
                                    {difficulty.name}
                                </span>

                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-[10px] font-semibold">
                                        {difficulty.value}
                                    </span>

                                    <span className="text-[9px] text-muted-foreground">
                                        {percentage.toFixed(1)}%
                                    </span>
                                </div>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-secondary">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ${difficulty.color}`}
                                    style={{
                                        width: `${percentage}%`,
                                    }}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
                    Total Problems
                </span>

                <span className="font-mono text-sm font-bold">
                    {total}
                </span>
            </div>
        </AnalyticsCard>
    )
}

/* =========================================================
   MAIN ANALYTICS PAGE
   ========================================================= */

function Analytics() {
    const [analytics, setAnalytics] = useState(null)
    const [globalRank, setGlobalRank] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const difficultyData = [
        {
            name: "Basic",
            value: analytics?.difficulty?.basic ?? 0,
            color: "bg-emerald-400",
        },
        {
            name: "Easy",
            value: analytics?.difficulty?.easy ?? 0,
            color: "bg-green-400",
        },
        {
            name: "Medium",
            value: analytics?.difficulty?.medium ?? 0,
            color: "bg-amber-400",
        },
        {
            name: "Hard",
            value: analytics?.difficulty?.hard ?? 0,
            color: "bg-rose-400",
        },
    ]

    useEffect(() => {
        let cancelled = false

        const fetchAnalytics = async () => {
            const cached = getCachedData(
                "analytics",
                10 * 60 * 1000
            )

            // Show cached data immediately
            if (cached) {
                setAnalytics(cached.analytics)
                setGlobalRank(cached.globalRank)
                setLoading(false)
            } else {
                setLoading(true)
            }

            try {
                setError("")

                const {
                    data: { session },
                } = await supabase.auth.getSession()

                if (!session?.access_token) {
                    throw new Error(
                        "Authentication session not found."
                    )
                }

                const headers = {
                    Authorization: `Bearer ${session.access_token}`,
                }

                const [
                    analyticsResponse,
                    profileResponse,
                ] = await Promise.all([
                    fetch(
                        "https://codesync-su2x.onrender.com/api/analytics",
                        { headers }
                    ),

                    fetch(
                        "https://codesync-su2x.onrender.com/api/profile/me",
                        { headers }
                    ),
                ])

                const [
                    analyticsResult,
                    profileResult,
                ] = await Promise.all([
                    analyticsResponse.json(),
                    profileResponse.json(),
                ])

                if (
                    !profileResponse.ok ||
                    !profileResult.success
                ) {
                    throw new Error(
                        profileResult.message ||
                        "Failed to load profile."
                    )
                }

                const analyticsData =
                    analyticsResult.data

                const profileData =
                    profileResult.data

                const finalAnalytics = {
                    ...analyticsData,

                    summary: {
                        ...analyticsData.summary,

                        streak:
                            profileData?.streak?.current ??
                            analyticsData?.summary?.streak ??
                            0,
                    },
                }

                const finalGlobalRank = {
                    rank:
                        profileData?.ranking?.rank ??
                        null,
                    total: null,
                }

                if (!cancelled) {
                    setAnalytics(finalAnalytics)
                    setGlobalRank(finalGlobalRank)

                    // Save fresh data
                    setCachedData("analytics", {
                        analytics: finalAnalytics,
                        globalRank: finalGlobalRank,
                    })
                }
            } catch (error) {
                console.error(
                    "Analytics fetch error:",
                    error
                )

                // Don't destroy cached UI if background refresh fails
                if (!cached && !cancelled) {
                    setError(error.message)
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        fetchAnalytics()

        return () => {
            cancelled = true
        }
    }, [])


    if (loading) {
        return <AnalyticsLoading />
    }

    if (error) {
        return (
            <section className="w-full min-w-0 px-4 pb-6 pt-5 sm:px-6 sm:pb-8 sm:pt-6 lg:px-8 lg:pb-10 lg:pt-7">
                <div className="flex min-h-[400px] items-center justify-center text-sm text-red-400">
                    {error}
                </div>
            </section>
        )
    }

    return (
        <section className="w-full min-w-0 px-4 pb-6 pt-5 sm:px-6 sm:pb-8 sm:pt-6 lg:px-8 lg:pb-10 lg:pt-7">
            {/* Header */}
            <div className="relative mb-6 overflow-hidden rounded-2xl border border-border bg-card px-6 py-5">
                <div className="absolute left-0 top-0 h-full w-[2px] bg-primary" />

                <div className="absolute -right-24 -top-32 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

                <div className="absolute bottom-0 left-[35%] h-16 w-16 rounded-full bg-indigo-500/[0.04] blur-2xl" />

                <div className="relative flex items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                                <BarChart3 size={19} />
                            </div>

                            <div>
                                <h1 className="text-xl font-bold tracking-tight">
                                    Coding{" "}
                                    <span className="text-primary">
                                        Analytics
                                    </span>
                                </h1>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    Understand your progress and improve
                                    your problem solving.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="hidden items-center gap-6 md:flex">
                        <div className="text-right">
                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                                Total Problems
                            </p>

                            <p className="font-mono text-lg font-bold">
                                {analytics?.summary?.totalProblemsSolved ??
                                    0}
                            </p>
                        </div>

                        <div className="h-8 w-px bg-border" />

                        <div className="text-right">
                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                                This Month
                            </p>

                            <p className="font-mono text-lg font-bold text-emerald-400">
                                {analytics?.growth?.problemsSolved?.current ?? 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-5">

                {/* Problems Solved */}
                <StatCard
                    icon={Code2}
                    label="Problems Solved"
                    value={
                        analytics?.summary?.totalProblemsSolved ?? 0
                    }
                    subtitle={
                        analytics?.growth?.problemsSolved
                            ? `${analytics.growth.problemsSolved.current ?? 0} solved this month`
                            : "No monthly data"
                    }
                    iconClass="bg-emerald-500/10 text-emerald-400"
                />

                {/* Contests */}
                <StatCard
                    icon={Trophy}
                    label="Contests"
                    value={
                        analytics?.summary?.totalContests ?? 0
                    }
                    subtitle={
                        analytics?.growth?.contests
                            ? `${analytics.growth.contests.current ?? 0} contests this month`
                            : "No monthly data"
                    }
                    iconClass="bg-amber-500/10 text-amber-400"
                />

                {/* Current Rating */}
                <StatCard
                    icon={BarChart3}
                    label="Current Rating"
                    value={
                        analytics?.summary?.currentRating ?? "—"
                    }
                    subtitle={
                        analytics?.growth?.codeforcesRating?.change != null
                            ? `${analytics.growth.codeforcesRating.change >= 0
                                ? "+"
                                : ""
                            }${analytics.growth.codeforcesRating.change} this month`
                            : "No previous rating"
                    }
                    iconClass="bg-blue-500/10 text-blue-400"
                />

                {/* Global Rank */}
                <StatCard
                    icon={Award}
                    label="Global Rank"
                    value={
                        globalRank?.rank
                            ? `#${globalRank.rank}`
                            : "—"
                    }
                    subtitle={
                        globalRank?.rank
                            ? "CodeSync ranking"
                            : "Not ranked yet"
                    }
                    iconClass="bg-purple-500/10 text-purple-400"
                />

                {/* Streak */}
                <StatCard
                    icon={Flame}
                    label="Streak"
                    value={`${analytics?.summary?.streak ?? 0} days`}
                    subtitle="Keep the momentum"
                    iconClass="bg-orange-500/10 text-orange-400"
                />

            </div>

            <div className="mb-5">
                <PlatformBreakdown
                    platforms={analytics?.platforms}
                />
            </div>

            <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
                <DifficultyDistribution
                    difficultyData={difficultyData}
                />

                <ActivityChart activity={analytics?.activity} />

                <RatingChart rating={analytics?.rating} />

                <TopicProgress
                    data={analytics?.topicProgress || []}
                />
            </div>
        </section>
    )
}

export default Analytics