import { useEffect, useMemo, useState } from "react"
import { supabase } from "../lib/supabase"

import {
    Trophy,
    CalendarDays,
    Clock3,
    Code2,
    BarChart3,
    ChevronLeft,
    ChevronRight,
    Bell,
    ExternalLink,
    Timer,
    CircleDot,
    CheckCircle2,
    Search,
    ArrowUp,
    ArrowDown,
} from "lucide-react"


const API_BASE_URL = "https://codesync-su2x.onrender.com"

function normalizeContest(contest) {
    const start = new Date(contest.startTime)

    const date = `${start.getFullYear()}-${String(
        start.getMonth() + 1
    ).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`

    const time = `${String(start.getHours()).padStart(2, "0")}:${String(
        start.getMinutes()
    ).padStart(2, "0")}`

    const totalMinutes = Math.floor(
        (contest.duration || 0) / 60
    )

    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    const duration = `${hours}h ${minutes}m`

    return {
        id: contest.id || contest.externalContestId,
        name: contest.name,
        platform:
            contest.platform === "CODEFORCES"
                ? "Codeforces"
                : "LeetCode",
        date,
        time,
        duration,
        type: contest.isRated ? "Rated" : "Unrated",
        participants: contest.participantCount
            ? contest.participantCount.toLocaleString()
            : "—",
        accent:
            contest.platform === "CODEFORCES"
                ? "blue"
                : "orange",
        url: contest.url || "#",
        rank: contest.rank ?? null,
        ratingChange: contest.ratingChange ?? 0,
        rating: contest.ratingAfter ?? null,
    }
}

const platformOptions = [
    {
        label: "All Platforms",
        icon: Trophy,
    },
    {
        label: "LeetCode",
        icon: Code2,
    },
    {
        label: "Codeforces",
        icon: BarChart3,
    },
]

/* =========================================================
   HELPERS
   ========================================================= */

function formatDate(dateString) {
    const date = new Date(`${dateString}T00:00:00`)

    return date.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
    })
}

function formatTime(time) {
    const [hours, minutes] = time.split(":")
    const hour = Number(hours)

    const suffix = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12

    return `${displayHour}:${minutes} ${suffix} IST`
}

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay()
}

function getCountdown(date, time) {
    const target = new Date(`${date}T${time}:00`)
    const now = new Date()

    const difference = target.getTime() - now.getTime()

    if (difference <= 0) {
        return "Starting soon"
    }

    const totalMinutes = Math.floor(difference / (1000 * 60))
    const days = Math.floor(totalMinutes / (60 * 24))
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
    const minutes = totalMinutes % 60

    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`
    }

    return `${hours}h ${minutes}m`
}

/* =========================================================
   CONTEST LOADING
   ========================================================= */

function ContestLoading() {
    return (
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#0b0f19]">
            <div className="flex flex-col items-center text-center">
                <div className="relative flex h-20 w-20 items-center justify-center">
                    <div className="h-14 w-14 animate-spin rounded-full border-2 border-transparent border-t-primary border-r-primary/40" />

                    <div className="absolute h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_15px_rgba(99,102,241,0.8)]" />
                </div>

                <p className="mt-5 text-sm font-semibold text-foreground">
                    Loading contests
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                    Fetching upcoming and past contests...
                </p>
            </div>
        </div>
    )
}

function createGoogleCalendarUrl(contest) {
    const start = new Date(`${contest.date}T${contest.time}:00`)

    const durationMatch = contest.duration.match(/(\d+)h\s*(\d+)?m?/)
    const hours = Number(durationMatch?.[1] || 0)
    const minutes = Number(durationMatch?.[2] || 0)

    const end = new Date(
        start.getTime() + (hours * 60 + minutes) * 60 * 1000
    )

    const formatDate = (date) =>
        date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z")

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        contest.name
    )}&dates=${formatDate(start)}/${formatDate(end)}&details=${encodeURIComponent(
        `${contest.platform} contest`
    )}`
}


/* =========================================================
   PLATFORM ICON
   ========================================================= */

function PlatformIcon({ platform }) {
    if (platform === "LeetCode") {
        return (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-orange-500/20 bg-orange-500/10 text-orange-400">
                <Code2 size={19} />
            </div>
        )
    }

    return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
            <BarChart3 size={19} />
        </div>
    )
}

/* =========================================================
   CONTEST CARD
   ========================================================= */

function ContestCard({ contest }) {
    const isLeetCode = contest.platform === "LeetCode"
    const [reminded, setReminded] = useState(false)

    return (
        <div
            className={`group relative overflow-hidden rounded-xl border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:bg-secondary/30 ${isLeetCode
                ? "border-orange-500/20 hover:border-orange-500/40"
                : "border-blue-500/20 hover:border-blue-500/40"
                }`}
        >
            {/* Platform accent */}
            <div
                className={`absolute left-0 top-0 h-full w-[3px] ${isLeetCode ? "bg-orange-500" : "bg-blue-500"
                    }`}
            />

            <div className="flex items-center gap-4 px-5 py-4">
                {/* Platform */}
                <PlatformIcon platform={contest.platform} />

                {/* Contest info */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-foreground">
                            {contest.name}
                        </h3>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                            className={`rounded-md px-2 py-1 text-[9px] font-semibold ${isLeetCode
                                ? "bg-orange-500/10 text-orange-400"
                                : "bg-blue-500/10 text-blue-400"
                                }`}
                        >
                            {contest.platform}
                        </span>

                    </div>
                </div>

                {/* Date */}
                <div className="hidden min-w-[150px] border-l border-border pl-5 lg:block">
                    <div className="flex items-center gap-2">
                        <CalendarDays
                            size={14}
                            className="text-primary"
                        />

                        <div>
                            <p className="text-[11px] font-medium text-foreground">
                                {formatDate(contest.date)}
                            </p>

                            <p className="mt-0.5 text-[9px] text-muted-foreground">
                                {formatTime(contest.time)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Countdown */}
                <div className="hidden min-w-[125px] xl:block">
                    <div className="rounded-lg border border-primary/15 bg-primary/[0.04] px-3 py-2">
                        <div className="flex items-center gap-1.5">
                            <Timer
                                size={12}
                                className="text-primary"
                            />

                            <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Starts in
                            </span>
                        </div>

                        <p className="mt-1 font-mono text-xs font-semibold text-primary">
                            {getCountdown(
                                contest.date,
                                contest.time
                            )}
                        </p>
                    </div>
                </div>

                {/* Action */}
                <div className="flex shrink-0 items-center gap-2">
                    <button
                        onClick={() => {
                            const calendarUrl = createGoogleCalendarUrl(contest)
                            window.open(calendarUrl, "_blank")
                            setReminded(true)
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground transition-all duration-200 hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                    >
                        {reminded ? (
                            <>
                                <CheckCircle2 size={15} />
                            </>
                        ) : (
                            <>
                                <Bell size={15} />
                            </>
                        )}
                    </button>

                    <button className="hidden h-9 items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 text-[10px] font-semibold text-foreground transition-all duration-200 hover:border-primary/40 hover:bg-primary/10 hover:text-primary sm:flex">
                        <a
                            href={contest.url}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            View
                        </a>
                        <ExternalLink size={11} />
                    </button>
                </div>
            </div>

            {/* Mobile date row */}
            <div className="flex items-center justify-between border-t border-border px-5 py-2.5 lg:hidden">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <CalendarDays size={11} />
                    {formatDate(contest.date)}
                    <span className="text-border">•</span>
                    {formatTime(contest.time)}
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-medium text-primary">
                    <Timer size={11} />
                    {getCountdown(
                        contest.date,
                        contest.time
                    )}
                </div>
            </div>
        </div>
    )
}

/* =========================================================
   CALENDAR
   ========================================================= */

function ContestCalendar({
    contests,
    selectedPlatform,
    selectedDate,
    setSelectedDate,
}) {
    const [currentMonth, setCurrentMonth] = useState(() => {
        const today = new Date()
        return new Date(today.getFullYear(), today.getMonth(), 1)
    })

    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const monthName = currentMonth.toLocaleDateString(
        "en-IN",
        {
            month: "long",
            year: "numeric",
        }
    )

    const filteredContests = useMemo(() => {
        return contests.filter(
            (contest) =>
                selectedPlatform === "All Platforms" ||
                contest.platform === selectedPlatform
        )
    }, [contests, selectedPlatform])

    const contestDates = new Map()

    filteredContests.forEach((contest) => {
        if (!contestDates.has(contest.date)) {
            contestDates.set(contest.date, [])
        }

        contestDates.get(contest.date).push(contest)
    })

    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)

    const calendarCells = []

    for (let i = 0; i < firstDay; i++) {
        calendarCells.push(null)
    }

    for (let day = 1; day <= daysInMonth; day++) {
        calendarCells.push(day)
    }

    function previousMonth() {
        setCurrentMonth(
            new Date(year, month - 1, 1)
        )
    }

    function nextMonth() {
        setCurrentMonth(
            new Date(year, month + 1, 1)
        )
    }

    function isToday(day) {
        const today = new Date()

        return (
            today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === day
        )
    }

    function getDateKey(day) {
        const monthNumber = String(month + 1).padStart(2, "0")
        const dayNumber = String(day).padStart(2, "0")

        return `${year}-${monthNumber}-${dayNumber}`
    }

    return (
        <div className="rounded-2xl border border-border bg-card p-5">
            {/* Calendar header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Contest Calendar
                    </p>

                    <h2 className="mt-1 text-sm font-bold">
                        {monthName}
                    </h2>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={previousMonth}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
                    >
                        <ChevronLeft size={14} />
                    </button>

                    <button
                        onClick={nextMonth}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
                    >
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>

            {/* Weekdays */}
            <div className="mt-5 grid grid-cols-7">
                {["S", "M", "T", "W", "T", "F", "S"].map(
                    (day, index) => (
                        <div
                            key={`${day}-${index}`}
                            className="flex h-7 items-center justify-center text-[9px] font-semibold text-muted-foreground"
                        >
                            {day}
                        </div>
                    )
                )}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-y-1">
                {calendarCells.map((day, index) => {
                    if (!day) {
                        return (
                            <div
                                key={`empty-${index}`}
                                className="h-10"
                            />
                        )
                    }

                    const dateKey = getDateKey(day)
                    const dayContests =
                        contestDates.get(dateKey) || []

                    const hasContest =
                        dayContests.length > 0

                    const isSelected =
                        selectedDate === dateKey

                    return (
                        <button
                            key={dateKey}
                            onClick={() =>
                                setSelectedDate(
                                    hasContest
                                        ? dateKey
                                        : null
                                )
                            }
                            className={`relative flex h-10 flex-col items-center justify-center rounded-lg transition-all duration-200 ${isSelected
                                ? "bg-primary/15 text-primary"
                                : "hover:bg-secondary"
                                }`}
                        >
                            <span
                                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium ${isToday(day)
                                    ? "border border-primary bg-primary/10 text-primary"
                                    : "text-muted-foreground"
                                    }`}
                            >
                                {day}
                            </span>

                            {/* Contest indicators */}
                            {hasContest && (
                                <span className="absolute bottom-1 flex items-center gap-0.5">
                                    {dayContests.some(
                                        (c) =>
                                            c.platform ===
                                            "LeetCode"
                                    ) && (
                                            <span className="h-1 w-1 rounded-full bg-orange-500" />
                                        )}

                                    {dayContests.some(
                                        (c) =>
                                            c.platform ===
                                            "Codeforces"
                                    ) && (
                                            <span className="h-1 w-1 rounded-full bg-blue-500" />
                                        )}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center gap-4 border-t border-border pt-4">
                <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                    <span className="text-[9px] text-muted-foreground">
                        LeetCode
                    </span>
                </div>

                <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span className="text-[9px] text-muted-foreground">
                        Codeforces
                    </span>
                </div>
            </div>
        </div>
    )
}

/* =========================================================
   ACTIVE PLATFORMS
   ========================================================= */

function ActivePlatforms({ contests }) {
    const leetcodeCount = contests.filter(
        (contest) => contest.platform === "LeetCode"
    ).length

    const codeforcesCount = contests.filter(
        (contest) => contest.platform === "Codeforces"
    ).length

    return (
        <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Trophy size={15} />
                </div>

                <div>
                    <p className="text-sm font-semibold">
                        Active Platforms
                    </p>

                    <p className="text-[9px] text-muted-foreground">
                        Upcoming contests
                    </p>
                </div>
            </div>

            <div className="mt-4 space-y-2">
                {/* LeetCode */}
                <div className="group flex items-center justify-between rounded-xl border border-border bg-secondary/50 p-3 transition-all hover:border-orange-500/30 hover:bg-orange-500/[0.03]">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
                            <Code2 size={17} />
                        </div>

                        <div>
                            <p className="text-xs font-semibold">
                                LeetCode
                            </p>

                            <p className="mt-0.5 text-[9px] text-muted-foreground">
                                {leetcodeCount} upcoming contests
                            </p>
                        </div>
                    </div>

                    <ChevronRight
                        size={14}
                        className="text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-orange-400"
                    />
                </div>

                {/* Codeforces */}
                <div className="group flex items-center justify-between rounded-xl border border-border bg-secondary/50 p-3 transition-all hover:border-blue-500/30 hover:bg-blue-500/[0.03]">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                            <BarChart3 size={17} />
                        </div>

                        <div>
                            <p className="text-xs font-semibold">
                                Codeforces
                            </p>

                            <p className="mt-0.5 text-[9px] text-muted-foreground">
                                {codeforcesCount} upcoming contests
                            </p>
                        </div>
                    </div>

                    <ChevronRight
                        size={14}
                        className="text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-blue-400"
                    />
                </div>
            </div>
        </div>
    )
}

/* =========================================================
   SELECTED DATE PANEL
   ========================================================= */

function SelectedDateContests({
    contests,
    selectedDate,
    selectedPlatform,
}) {
    if (!selectedDate) {
        return null
    }

    const selectedContests = contests.filter(
        (contest) =>
            contest.date === selectedDate &&
            (selectedPlatform === "All Platforms" ||
                contest.platform === selectedPlatform)
    )

    if (selectedContests.length === 0) {
        return null
    }

    return (
        <div className="mt-5 rounded-xl border border-primary/20 bg-primary/[0.03] p-4">
            <div className="mb-3 flex items-center gap-2">
                <CalendarDays
                    size={14}
                    className="text-primary"
                />

                <p className="text-xs font-semibold">
                    Contests on{" "}
                    {formatDate(selectedDate)}
                </p>
            </div>

            <div className="space-y-2">
                {selectedContests.map((contest) => (
                    <div
                        key={contest.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5"
                    >
                        <div className="flex items-center gap-2.5">
                            <CircleDot
                                size={12}
                                className={
                                    contest.platform ===
                                        "LeetCode"
                                        ? "text-orange-400"
                                        : "text-blue-400"
                                }
                            />

                            <div>
                                <p className="text-[10px] font-semibold">
                                    {contest.name}
                                </p>

                                <p className="mt-0.5 text-[9px] text-muted-foreground">
                                    {formatTime(
                                        contest.time
                                    )}
                                </p>
                            </div>
                        </div>

                        <ExternalLink
                            size={12}
                            className="text-muted-foreground"
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

/* =========================================================
   MAIN PAGE
   ========================================================= */

function Contests() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedPlatform, setSelectedPlatform] =
        useState("All Platforms")

    const [selectedView, setSelectedView] =
        useState("Upcoming")

    const [selectedDate, setSelectedDate] =
        useState(null)

    const [upcomingContests, setUpcomingContests] =
        useState([])

    const [pastContests, setPastContests] =
        useState([])

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const fetchContests = async () => {
            try {
                setLoading(true)
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

                const [upcomingResponse, pastResponse] =
                    await Promise.all([
                        fetch(
                            `${API_BASE_URL}/api/contests/upcoming`,
                            { headers }
                        ),
                        fetch(
                            `${API_BASE_URL}/api/contests/past`,
                            { headers }
                        ),
                    ])

                const upcomingResult =
                    await upcomingResponse.json()
                const pastResult =
                    await pastResponse.json()

                if (!upcomingResponse.ok || !upcomingResult.success) {
                    throw new Error(
                        upcomingResult.message ||
                        "Failed to load upcoming contests."
                    )
                }

                if (!pastResponse.ok || !pastResult.success) {
                    throw new Error(
                        pastResult.message ||
                        "Failed to load past contests."
                    )
                }

                setUpcomingContests(
                    (upcomingResult.data || []).map(normalizeContest)
                )

                setPastContests(
                    (pastResult.data || []).map(normalizeContest)
                )
            } catch (fetchError) {
                console.error(
                    "Contest fetch error:",
                    fetchError
                )

                setError(
                    fetchError.message ||
                    "Failed to load contests."
                )

                setUpcomingContests([])
                setPastContests([])
            } finally {
                setLoading(false)
            }
        }

        fetchContests()
    }, [])

    const filteredContests = useMemo(() => {
        return upcomingContests.filter(
            (contest) =>
                selectedPlatform === "All Platforms" ||
                contest.platform === selectedPlatform
        )
    }, [upcomingContests, selectedPlatform])

    const filteredPastContests = useMemo(() => {
        return pastContests.filter((contest) => {
            const matchesPlatform =
                selectedPlatform === "All Platforms" ||
                contest.platform === selectedPlatform

            const matchesSearch =
                contest.name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())

            return matchesPlatform && matchesSearch
        })
    }, [pastContests, selectedPlatform, searchQuery])

    const pastStats = useMemo(() => {
        if (filteredPastContests.length === 0) {
            return {
                total: 0,
                currentRating: null,
            }
        }

        return {
            total: filteredPastContests.length,
            currentRating:
                filteredPastContests[0]?.rating ?? null,
        }
    }, [filteredPastContests])


    if (loading) {
        return <ContestLoading />
    }

    if (error) {
        return (
            <section className="px-8 pb-10 pt-7">
                <div className="flex min-h-[400px] items-center justify-center">
                    <div className="max-w-md text-center">
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                            <Trophy size={18} />
                        </div>
                        <p className="mt-4 text-sm font-semibold">
                            Failed to load contests
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {error}
                        </p>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="px-8 pb-10 pt-7">
            {/* =================================================
                HEADER
               ================================================= */}

            <div className="relative mb-6 overflow-hidden rounded-2xl border border-border bg-card px-6 py-5">
                <div className="absolute left-0 top-0 h-full w-[2px] bg-primary" />

                <div className="absolute -right-24 -top-32 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

                <div className="absolute bottom-0 right-[25%] h-20 w-20 rounded-full bg-indigo-500/[0.04] blur-2xl" />

                <div className="relative flex items-center justify-between gap-8">
                    {/* Title */}
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                                <Trophy size={19} />
                            </div>

                            <div>
                                <h1 className="text-xl font-bold tracking-tight">
                                    Coding{" "}
                                    <span className="text-primary">
                                        Contests
                                    </span>
                                </h1>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    Compete, improve and climb the
                                    ranks.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Header stats */}
                    <div className="hidden items-center gap-7 md:flex">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <CalendarDays size={14} />
                            </div>

                            <div>
                                <p className="text-xs font-semibold">
                                    Upcoming
                                </p>

                                <p className="mt-0.5 text-[9px] text-muted-foreground">
                                    Never miss a contest
                                </p>
                            </div>
                        </div>

                        <div className="h-8 w-px bg-border" />

                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Clock3 size={14} />
                            </div>

                            <div>
                                <p className="text-xs font-semibold">
                                    Track performance
                                </p>

                                <p className="mt-0.5 text-[9px] text-muted-foreground">
                                    Analyze your results
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* =================================================
                FILTER BAR
               ================================================= */}

            <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div className="flex flex-wrap items-center gap-2">
                    {platformOptions.map((platform) => {
                        const Icon = platform.icon
                        const active =
                            selectedPlatform === platform.label

                        return (
                            <button
                                key={platform.label}
                                onClick={() => {
                                    setSelectedPlatform(
                                        platform.label
                                    )
                                    setSelectedDate(null)
                                }}
                                className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-medium transition-all duration-200 ${active
                                    ? "border-primary/50 bg-primary/10 text-primary shadow-sm"
                                    : "border-border bg-secondary text-muted-foreground hover:border-primary/30 hover:bg-muted hover:text-foreground"
                                    }`}
                            >
                                <Icon size={14} />
                                {platform.label}
                            </button>
                        )
                    })}
                </div>

                <div className="flex w-fit items-center rounded-lg border border-border bg-secondary p-1">
                    {["Upcoming", "Past"].map((view) => {
                        const active =
                            selectedView === view

                        return (
                            <button
                                key={view}
                                onClick={() =>
                                    setSelectedView(view)
                                }
                                className={`rounded-md px-4 py-1.5 text-xs font-medium transition-all duration-200 ${active
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {view}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* =================================================
                UPCOMING CONTENT
               ================================================= */}

            {selectedView === "Upcoming" ? (
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                    {/* LEFT */}
                    <div className="min-w-0">
                        <div className="mb-4 flex items-end justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <div className="h-5 w-1 rounded-full bg-primary" />

                                    <h2 className="text-sm font-bold">
                                        Upcoming Contests
                                    </h2>
                                </div>

                                <p className="mt-1 text-[10px] text-muted-foreground">
                                    Get ready for your next
                                    challenge.
                                </p>
                            </div>

                            <span className="rounded-full border border-border bg-secondary px-2.5 py-1 text-[9px] font-medium text-muted-foreground">
                                {filteredContests.length} contests
                            </span>
                        </div>

                        <div className="space-y-2.5">
                            {filteredContests.map(
                                (contest) => (
                                    <ContestCard
                                        key={contest.id}
                                        contest={contest}
                                    />
                                )
                            )}
                        </div>

                        {selectedDate && (
                            <SelectedDateContests
                                contests={upcomingContests}
                                selectedDate={selectedDate}
                                selectedPlatform={
                                    selectedPlatform
                                }
                            />
                        )}
                    </div>

                    {/* RIGHT */}
                    <div className="space-y-5">
                        <ContestCalendar
                            contests={upcomingContests}
                            selectedPlatform={
                                selectedPlatform
                            }
                            selectedDate={selectedDate}
                            setSelectedDate={
                                setSelectedDate
                            }
                        />

                        <ActivePlatforms
                            contests={filteredContests}
                        />

                        {/* Small info card */}
                        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5">
                            <div className="absolute -bottom-12 -right-12 h-28 w-28 rounded-full bg-primary/10 blur-2xl" />

                            <div className="relative">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Trophy size={16} />
                                </div>

                                <p className="mt-4 text-sm font-semibold">
                                    Small Contests,
                                    <br />
                                    Big Growth
                                </p>

                                <p className="mt-2 max-w-[220px] text-[10px] leading-5 text-muted-foreground">
                                    Every contest is an
                                    opportunity to improve
                                    your problem solving and
                                    ranking.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div>
                    {/* Past Header */}
                    <div className="mb-5 flex items-end justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-1 rounded-full bg-primary" />

                                <h2 className="text-sm font-bold">
                                    Past Contests
                                </h2>
                            </div>

                            <p className="mt-1 text-[10px] text-muted-foreground">
                                Review your previous contest performance.
                            </p>
                        </div>

                        <div className="flex h-9 items-center gap-2 rounded-lg border border-border bg-secondary px-3">
                            <Search
                                size={13}
                                className="text-muted-foreground"
                            />

                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                type="text"
                                placeholder="Search contests..."
                                className="w-[160px] bg-transparent text-xs outline-none placeholder:text-muted-foreground"
                            />
                        </div>
                    </div>

                    {/* Performance Stats */}
                    <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {/* Contests */}
                        <div className="rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Contests
                                </span>

                                <Trophy
                                    size={14}
                                    className="text-primary"
                                />
                            </div>

                            <p className="mt-2 font-mono text-xl font-bold">
                                {pastStats.total}
                            </p>

                            <p className="mt-1 text-[9px] text-muted-foreground">
                                Total participated
                            </p>
                        </div>

                        {/* Current Rating */}
                        <div className="rounded-xl border border-border bg-card p-4 transition-all hover:border-blue-400/30">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Current Rating
                                </span>

                                <BarChart3
                                    size={14}
                                    className="text-blue-400"
                                />
                            </div>

                            <p className="mt-2 font-mono text-xl font-bold">
                                {pastStats.currentRating ?? "—"}
                            </p>

                            <p className="mt-1 text-[9px] text-muted-foreground">
                                Current contest rating
                            </p>
                        </div>
                    </div>

                    {/* Past Contest Table */}
                    <div className="overflow-hidden rounded-2xl border border-border bg-card">
                        {/* Table Header */}
                        <div className="hidden grid-cols-[minmax(0,1.7fr)_120px_120px_130px_90px] items-center border-b border-border bg-secondary/30 px-5 py-3 lg:grid">
                            <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Contest
                            </span>

                            <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Platform
                            </span>

                            <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Date
                            </span>

                            <span className="text-right text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Rating Change
                            </span>

                            <span className="text-right text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Action
                            </span>
                        </div>

                        {filteredPastContests.map((contest) => {
                            const isLeetCode =
                                contest.platform === "LeetCode"

                            const isPositive =
                                contest.ratingChange >= 0

                            return (
                                <div
                                    key={contest.id}
                                    className="group border-b border-border px-5 py-4 transition-all duration-200 last:border-b-0 hover:bg-secondary/30"
                                >
                                    <div className="hidden grid-cols-[minmax(0,1.7fr)_120px_120px_130px_90px] items-center lg:grid">
                                        {/* Contest */}
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div
                                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isLeetCode
                                                    ? "bg-orange-500/10 text-orange-400"
                                                    : "bg-blue-500/10 text-blue-400"
                                                    }`}
                                            >
                                                {isLeetCode ? (
                                                    <Code2 size={16} />
                                                ) : (
                                                    <BarChart3 size={16} />
                                                )}
                                            </div>

                                            <div className="min-w-0">
                                                <p className="truncate text-xs font-semibold">
                                                    {contest.name}
                                                </p>


                                            </div>
                                        </div>

                                        {/* Platform */}
                                        <div>
                                            <span
                                                className={`inline-flex rounded-md px-2 py-1 text-[9px] font-semibold ${isLeetCode
                                                    ? "bg-orange-500/10 text-orange-400"
                                                    : "bg-blue-500/10 text-blue-400"
                                                    }`}
                                            >
                                                {contest.platform}
                                            </span>
                                        </div>

                                        {/* Date */}
                                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                            <CalendarDays size={11} />

                                            {formatDate(
                                                contest.date
                                            )}
                                        </div>

                                        {/* Rating */}
                                        <div className="flex justify-end">
                                            <div className="text-right">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 font-mono text-[10px] font-semibold ${isPositive
                                                        ? "bg-emerald-500/10 text-emerald-400"
                                                        : "bg-red-500/10 text-red-400"
                                                        }`}
                                                >
                                                    {isPositive ? (
                                                        <ArrowUp size={10} />
                                                    ) : (
                                                        <ArrowDown size={10} />
                                                    )}

                                                    {isPositive
                                                        ? "+"
                                                        : ""}
                                                    {
                                                        contest.ratingChange
                                                    }
                                                </span>

                                                <p className="mt-1 text-[8px] text-muted-foreground">
                                                    Rating{" "}
                                                    {contest.rating}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Action */}
                                        <div className="flex justify-end">
                                            <button className="flex h-8 items-center gap-1.5 rounded-lg border border-border bg-secondary px-2.5 text-[9px] font-semibold text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/10 hover:text-primary">
                                                <a
                                                    href={contest.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    View
                                                </a>
                                                <ExternalLink
                                                    size={10}
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Mobile */}
                                    <div className="flex items-center gap-3 lg:hidden">
                                        <div
                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isLeetCode
                                                ? "bg-orange-500/10 text-orange-400"
                                                : "bg-blue-500/10 text-blue-400"
                                                }`}
                                        >
                                            {isLeetCode ? (
                                                <Code2 size={16} />
                                            ) : (
                                                <BarChart3 size={16} />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-xs font-semibold">
                                                {contest.name}
                                            </p>

                                            <div className="mt-1 flex items-center gap-2">
                                                <span
                                                    className={`text-[9px] font-medium ${isLeetCode
                                                        ? "text-orange-400"
                                                        : "text-blue-400"
                                                        }`}
                                                >
                                                    {contest.platform}
                                                </span>

                                            </div>
                                        </div>

                                        <span
                                            className={`font-mono text-[10px] font-semibold ${isPositive
                                                ? "text-emerald-400"
                                                : "text-red-400"
                                                }`}
                                        >
                                            {isPositive ? "+" : ""}
                                            {contest.ratingChange}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}

                        {/* Footer */}
                        <div className="flex items-center justify-between px-5 py-4">
                            <p className="text-[10px] text-muted-foreground">
                                Showing{" "}
                                <span className="font-medium text-foreground">
                                    {filteredPastContests.length}
                                </span>{" "}
                                recent contests
                            </p>

                            <button className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-[9px] font-semibold text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/10 hover:text-primary" >
                                View All
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}

export default Contests