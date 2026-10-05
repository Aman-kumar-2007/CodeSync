import { useEffect, useState } from "react"
import { Link } from "react-router"
import { supabase } from "../lib/supabase"

import {
    Medal,
    Search,
    ChevronLeft,
    ChevronRight,
    Flame,
    Crown,
} from "lucide-react"

// =====================================================
// HELPERS
// =====================================================

function getInitials(name) {
    return (
        name
            ?.split(" ")
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "ST"
    )
}

import {
    getCachedData,
    setCachedData,
} from "../utils/pageCache"

// =====================================================
// PODIUM CARD
// =====================================================

function PodiumCard({ student, position }) {
    if (!student) return null

    const isFirst = position === 1

    const rankStyles = {
        1: {
            border: "border-amber-400/50",
            icon: "border-amber-400/40 bg-amber-400/10 text-amber-400",
            avatar:
                "border-amber-400/70 bg-amber-400/10 text-amber-300",
            badge: "bg-amber-400 text-[#15110a]",
            score:
                "border-amber-400/20 bg-amber-400/[0.06]",
            scoreText: "text-amber-300",
            glow:
                "shadow-[0_12px_50px_rgba(245,158,11,0.10)]",
            accent: "bg-amber-400",
        },

        2: {
            border: "border-slate-400/35",
            icon:
                "border-slate-400/30 bg-slate-400/10 text-slate-300",
            avatar:
                "border-slate-400/50 bg-slate-400/[0.08] text-slate-200",
            badge: "bg-slate-300 text-[#11151c]",
            score:
                "border-slate-400/15 bg-slate-400/[0.04]",
            scoreText: "text-slate-200",
            glow:
                "shadow-[0_12px_40px_rgba(148,163,184,0.06)]",
            accent: "bg-slate-400",
        },

        3: {
            border: "border-orange-500/35",
            icon:
                "border-orange-500/30 bg-orange-500/10 text-orange-400",
            avatar:
                "border-orange-500/50 bg-orange-500/[0.08] text-orange-300",
            badge: "bg-orange-500 text-[#170d08]",
            score:
                "border-orange-500/15 bg-orange-500/[0.04]",
            scoreText: "text-orange-300",
            glow:
                "shadow-[0_12px_40px_rgba(249,115,22,0.06)]",
            accent: "bg-orange-500",
        },
    }

    const style = rankStyles[position]

    const initials = getInitials(student.name)

    return (
        <div
            className={`
                group relative flex flex-col items-center
                rounded-2xl border bg-card px-5 text-center
                transition-all duration-300 hover:-translate-y-2
                ${style.border}
                ${style.glow}
                ${isFirst
                    ? "min-h-[390px] py-6"
                    : "min-h-[360px] py-5"
                }
            `}
        >
            {/* Accent */}
            <div
                className={`
                    absolute left-1/2 top-0 h-[2px]
                    -translate-x-1/2 rounded-full
                    transition-all duration-300
                    group-hover:w-28
                    ${isFirst ? "w-20" : "w-14"}
                    ${style.accent}
                `}
            />

            {/* Rank Icon */}
            <div
                className={`
                    absolute -top-5 flex h-10 w-10
                    items-center justify-center rounded-xl
                    border bg-card shadow-lg
                    transition-all duration-300
                    group-hover:-translate-y-1
                    ${style.icon}
                `}
            >
                {isFirst ? (
                    <Crown size={19} />
                ) : (
                    <Medal size={19} />
                )}
            </div>

            {/* Avatar */}
            <div className="relative mt-9">
                <div
                    className={`
                        flex items-center justify-center
                        overflow-hidden rounded-full border-2
                        font-bold transition-all duration-300
                        group-hover:scale-105 group-hover:shadow-lg
                        ${isFirst
                            ? "h-28 w-28 text-3xl"
                            : "h-24 w-24 text-2xl"
                        }
                        ${style.avatar}
                    `}
                >
                    {student.avatar || student.profile_image ? (
                        <img
                            src={student.avatar || student.profile_image}
                            alt={student.name || "Student"}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                                e.currentTarget.style.display = "none"
                                e.currentTarget.parentElement
                                    .querySelector(
                                        "[data-initials]"
                                    )
                                    ?.classList.remove("hidden")
                            }}
                        />
                    ) : null}

                    <span
                        data-initials
                        className={
                            student.avatar
                                ? "hidden"
                                : "flex h-full w-full items-center justify-center"
                        }
                    >
                        {initials}
                    </span>
                </div>

                {/* Rank Badge */}
                <div
                    className={`
                        absolute -bottom-1 -right-2
                        flex h-8 w-8 items-center justify-center
                        rounded-full border-2 border-card
                        font-mono text-xs font-bold shadow-lg
                        transition-transform duration-300
                        group-hover:scale-110
                        ${style.badge}
                    `}
                >
                    {position}
                </div>
            </div>

            {/* Name */}
            <h3 className="mt-5 max-w-full truncate px-3 text-base font-bold">
                {student.name || "Student"}
            </h3>

            {/* Username */}
            {student.username && (
                <Link
                    to={`/student/${student.username}`}
                    className="
                        mt-1 max-w-full truncate
                        text-[10px] text-muted-foreground
                        transition-colors hover:text-primary
                    "
                >
                    @{student.username}
                </Link>
            )}

            {/* Score */}
            <div
                className={`
                    mx-auto mt-5 w-full max-w-[250px]
                    rounded-xl border px-4 py-3
                    transition-all duration-300
                    group-hover:-translate-y-1
                    ${style.score}
                `}
            >
                <p
                    className="
                        text-[9px] font-semibold uppercase
                        tracking-[0.16em] text-muted-foreground
                    "
                >
                    CodeSync Score
                </p>

                <p
                    className={`
                        mt-1 font-mono text-xl font-bold
                        transition-transform duration-300
                        group-hover:scale-[1.03]
                        ${style.scoreText}
                    `}
                >
                    {Number(student.score || 0).toFixed(1)}
                </p>

                <p className="mt-1 text-[9px] text-muted-foreground">
                    Based on coding performance
                </p>
            </div>

            {/* Stats */}
            <div
                className="
                    mt-3 flex w-full max-w-[250px]
                    items-center justify-center gap-2
                "
            >
                <div
                    className="
                        flex flex-1 flex-col items-center
                        rounded-lg border border-border
                        bg-secondary/50 px-2 py-2
                    "
                >
                    <span
                        className="
                            text-[8px] font-semibold uppercase
                            tracking-wider text-muted-foreground
                        "
                    >
                        Solved
                    </span>

                    <span className="mt-0.5 font-mono text-xs font-semibold">
                        {student.solved || 0}
                    </span>
                </div>

                <div
                    className="
                        flex flex-1 flex-col items-center
                        rounded-lg border border-border
                        bg-secondary/50 px-2 py-2
                    "
                >
                    <span
                        className="
                            text-[8px] font-semibold uppercase
                            tracking-wider text-muted-foreground
                        "
                    >
                        Max Streak
                    </span>

                    <span
                        className="
                            mt-0.5 flex items-center gap-1
                            font-mono text-xs font-semibold
                        "
                    >
                        <Flame size={10} />
                        {student.maxStreak || 0}d
                    </span>
                </div>
            </div>
        </div>
    )
}

// =====================================================
// LEADERBOARD
// =====================================================

function Leaderboard() {
    const [students, setStudents] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [currentUserId, setCurrentUserId] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)

    const STUDENTS_PER_PAGE = 10

    // =================================================
    // FETCH LEADERBOARD
    // =================================================

    useEffect(() => {
        let cancelled = false

        const fetchLeaderboard = async () => {
            const cached = getCachedData(
                "leaderboard",
                10 * 60 * 1000
            )

            if (cached) {
                setStudents(cached.students)
                setCurrentUserId(cached.currentUserId)
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
                        "Authentication session not found"
                    )
                }

                if (!cancelled) {
                    setCurrentUserId(session.user.id)
                }

                const response = await fetch(
                    "https://codesync-su2x.onrender.com/api/leaderboard",
                    {
                        method: "GET",
                        headers: {
                            Authorization:
                                `Bearer ${session.access_token}`,
                            "Content-Type":
                                "application/json",
                        },
                    }
                )

                const result = await response.json()

                if (
                    !response.ok ||
                    !result.success
                ) {
                    throw new Error(
                        result.message ||
                        "Failed to fetch leaderboard"
                    )
                }

                const leaderboardData =
                    result.data?.leaderboard ??
                    result.leaderboard ??
                    []

                if (!cancelled) {
                    const studentsData =
                        Array.isArray(leaderboardData)
                            ? leaderboardData
                            : []

                    setStudents(studentsData)

                    setCachedData("leaderboard", {
                        students: studentsData,
                        currentUserId:
                            session.user.id,
                    })
                }
            } catch (error) {
                console.error(
                    "Leaderboard fetch error:",
                    error
                )

                if (!cached && !cancelled) {
                    setError(
                        error?.message ||
                        "Failed to load leaderboard"
                    )

                    setStudents([])
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        fetchLeaderboard()

        return () => {
            cancelled = true
        }
    }, [])

    // =================================================
    // SEARCH
    // =================================================

    const filteredStudents = students.filter(
        (student) => {
            const query =
                searchQuery.trim().toLowerCase()

            if (!query) return true

            return (
                student.name
                    ?.toLowerCase()
                    .includes(query) ||
                student.username
                    ?.toLowerCase()
                    .includes(query)
            )
        }
    )

    // =================================================
    // PAGINATION
    // =================================================

    const totalPages = Math.ceil(
        filteredStudents.length /
        STUDENTS_PER_PAGE
    )

    const startIndex =
        (currentPage - 1) *
        STUDENTS_PER_PAGE

    const endIndex =
        startIndex + STUDENTS_PER_PAGE

    const paginatedStudents =
        filteredStudents.slice(
            startIndex,
            endIndex
        )

    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery])

    useEffect(() => {
        if (
            totalPages > 0 &&
            currentPage > totalPages
        ) {
            setCurrentPage(totalPages)
        }

        if (
            totalPages === 0 &&
            currentPage !== 1
        ) {
            setCurrentPage(1)
        }
    }, [currentPage, totalPages])

    // =================================================
    // PODIUM
    // =================================================

    const topStudents =
        filteredStudents.slice(0, 3)

    // =================================================
    // PAGE NUMBERS
    // =================================================

    const getPageNumbers = () => {
        if (totalPages <= 5) {
            return Array.from(
                { length: totalPages },
                (_, index) => index + 1
            )
        }

        const pages = new Set()

        pages.add(1)
        pages.add(totalPages)
        pages.add(currentPage)
        pages.add(currentPage - 1)
        pages.add(currentPage + 1)

        return Array.from(pages)
            .filter(
                (page) =>
                    page >= 1 &&
                    page <= totalPages
            )
            .sort((a, b) => a - b)
    }

    const pageNumbers = getPageNumbers()

    // =================================================
    // RENDER
    // =================================================

    return (
        <section className="px-8 pb-10 pt-7">

            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <div
                className="
                    relative mb-7 overflow-visible
                    rounded-2xl border border-border
                    bg-card px-6 py-5
                "
            >
                <div
                    className="
                        absolute left-0 top-0 h-full
                        w-[2px] rounded-full bg-primary
                    "
                />

                <div className="flex items-start justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <div
                                className="
                                    flex h-8 w-8 items-center
                                    justify-center rounded-lg
                                    bg-primary/10 text-primary
                                "
                            >
                                <Medal size={17} />
                            </div>

                            <h1 className="text-xl font-bold">
                                Student{" "}
                                <span className="text-primary">
                                    Leaderboard
                                </span>
                            </h1>
                        </div>

                        <p className="mt-2 text-xs text-muted-foreground">
                            Compare coding performance
                            across the community.
                        </p>
                    </div>

                    {/* Search */}
                    <div
                        className="
                            flex h-10 w-full max-w-[400px]
                            items-center gap-2 rounded-lg
                            border border-border bg-secondary
                            px-3
                        "
                    >
                        <Search
                            size={15}
                            className="text-muted-foreground"
                        />

                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) =>
                                setSearchQuery(
                                    e.target.value
                                )
                            }
                            placeholder="Search by name or username..."
                            className="
                                w-full bg-transparent
                                text-xs text-foreground
                                outline-none
                                placeholder:text-muted-foreground
                            "
                        />
                    </div>
                </div>
            </div>

            {/* ================================================= */}
            {/* LOADING */}
            {/* ================================================= */}

            {loading ? (
                <div
                    className="
                        mb-7 flex min-h-[220px]
                        items-center justify-center
                        rounded-2xl border border-border
                        bg-card
                    "
                >
                    <div className="flex flex-col items-center">
                        <div
                            className="
                                h-8 w-8 animate-spin
                                rounded-full border-2
                                border-border border-t-primary
                            "
                        />

                        <p className="mt-4 text-xs text-muted-foreground">
                            Loading leaderboard...
                        </p>
                    </div>
                </div>
            ) : error ? (
                /* ================================================= */
                /* ERROR */
                /* ================================================= */

                <div
                    className="
                        mb-7 flex min-h-[220px]
                        flex-col items-center justify-center
                        rounded-2xl border border-destructive/30
                        bg-card px-6
                    "
                >
                    <div
                        className="
                            flex h-12 w-12
                            items-center justify-center
                            rounded-xl bg-destructive/10
                            text-destructive
                        "
                    >
                        <Search size={20} />
                    </div>

                    <p className="mt-4 text-sm font-semibold">
                        Failed to load leaderboard
                    </p>

                    <p
                        className="
                            mt-1 max-w-md text-center
                            text-xs text-muted-foreground
                        "
                    >
                        {error}
                    </p>
                </div>
            ) : (
                <>
                    {/* ================================================= */}
                    {/* PODIUM */}
                    {/* ================================================= */}

                    {topStudents.length > 0 ? (
                        <div
                            className="
                                mb-7 grid grid-cols-1
                                items-end gap-5
                                md:grid-cols-3
                            "
                        >
                            {/* 2nd */}
                            {topStudents[1] && (
                                <PodiumCard
                                    student={
                                        topStudents[1]
                                    }
                                    position={2}
                                />
                            )}

                            {/* 1st */}
                            {topStudents[0] && (
                                <PodiumCard
                                    student={
                                        topStudents[0]
                                    }
                                    position={1}
                                />
                            )}

                            {/* 3rd */}
                            {topStudents[2] && (
                                <PodiumCard
                                    student={
                                        topStudents[2]
                                    }
                                    position={3}
                                />
                            )}
                        </div>
                    ) : (
                        <div
                            className="
                                mb-7 flex min-h-[220px]
                                flex-col items-center
                                justify-center rounded-2xl
                                border border-border bg-card
                            "
                        >
                            <div
                                className="
                                    flex h-12 w-12
                                    items-center justify-center
                                    rounded-xl bg-muted
                                    text-muted-foreground
                                "
                            >
                                <Search size={20} />
                            </div>

                            <p className="mt-4 text-sm font-semibold">
                                No students found
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                                Try changing your search.
                            </p>
                        </div>
                    )}

                    {/* ================================================= */}
                    {/* TABLE */}
                    {/* ================================================= */}

                    <div
                        className="
                            overflow-hidden rounded-2xl
                            border border-border bg-card
                        "
                    >
                        {/* Header */}

                        <div
                            className="
                                grid
                                grid-cols-[55px_1fr_120px_120px_120px]
                                items-center
                                border-b border-border
                                bg-secondary/30
                                px-5 py-3
                            "
                        >
                            <span
                                className="
                                    text-[9px] font-semibold
                                    uppercase tracking-wider
                                    text-muted-foreground
                                "
                            >
                                #
                            </span>

                            <span
                                className="
                                    text-[9px] font-semibold
                                    uppercase tracking-wider
                                    text-muted-foreground
                                "
                            >
                                Student
                            </span>

                            <span
                                className="
                                    text-right text-[9px]
                                    font-semibold uppercase
                                    tracking-wider
                                    text-muted-foreground
                                "
                            >
                                Score
                            </span>

                            <span
                                className="
                                    text-right text-[9px]
                                    font-semibold uppercase
                                    tracking-wider
                                    text-muted-foreground
                                "
                            >
                                Solved
                            </span>

                            <span
                                className="
                                    text-right text-[9px]
                                    font-semibold uppercase
                                    tracking-wider
                                    text-muted-foreground
                                "
                            >
                                Max Streak
                            </span>
                        </div>

                        {/* Rows */}

                        {paginatedStudents.length > 0 ? (
                            paginatedStudents.map(
                                (student) => {
                                    const isCurrentUser =
                                        student.userId ===
                                        currentUserId

                                    const initials =
                                        getInitials(
                                            student.name
                                        )

                                    return (
                                        <div
                                            key={
                                                student.userId
                                            }
                                            className={`
                                                group grid
                                                grid-cols-[55px_1fr_120px_120px_120px]
                                                items-center
                                                border-b
                                                border-border
                                                px-5 py-3.5
                                                transition-all
                                                duration-200
                                                last:border-b-0
                                                ${isCurrentUser
                                                    ? "bg-primary/[0.06] hover:bg-primary/[0.10]"
                                                    : "hover:bg-secondary/40"
                                                }
                                            `}
                                        >
                                            {/* Rank */}

                                            <div>
                                                <span
                                                    className={`
                                                        font-mono
                                                        text-xs
                                                        font-semibold
                                                        ${student.rank ===
                                                            1
                                                            ? "text-amber-400"
                                                            : student.rank ===
                                                                2
                                                                ? "text-slate-300"
                                                                : student.rank ===
                                                                    3
                                                                    ? "text-orange-400"
                                                                    : "text-muted-foreground"
                                                        }
                                                    `}
                                                >
                                                    {student.rank}
                                                </span>
                                            </div>

                                            {/* Student */}

                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="
                                                        flex h-8 w-8
                                                        shrink-0
                                                        items-center
                                                        justify-center
                                                        overflow-hidden
                                                        rounded-full
                                                        bg-muted
                                                        text-[10px]
                                                        font-bold
                                                    "
                                                >
                                                    {student.avatar ? (
                                                        <img
                                                            src={
                                                                student.avatar
                                                            }
                                                            alt={
                                                                student.name ||
                                                                "Student"
                                                            }
                                                            className="
                                                                h-full
                                                                w-full
                                                                object-cover
                                                            "
                                                            onError={(
                                                                e
                                                            ) => {
                                                                e.currentTarget.style.display =
                                                                    "none"

                                                                e.currentTarget.parentElement.innerText =
                                                                    initials
                                                            }}
                                                        />
                                                    ) : (
                                                        initials
                                                    )}
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="truncate text-xs font-semibold">
                                                        {
                                                            student.name
                                                        }
                                                    </p>

                                                    {student.username && (
                                                        <Link
                                                            to={`/student/${student.username}`}
                                                            className="
                                                                mt-0.5
                                                                block
                                                                truncate
                                                                text-[9px]
                                                                text-muted-foreground
                                                                hover:text-primary
                                                            "
                                                        >
                                                            @
                                                            {
                                                                student.username
                                                            }
                                                        </Link>
                                                    )}

                                                    {isCurrentUser && (
                                                        <p className="mt-0.5 text-[9px] text-primary">
                                                            You
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Score */}

                                            <p
                                                className={`
                                                    text-right
                                                    font-mono
                                                    text-xs
                                                    font-semibold
                                                    ${student.rank ===
                                                        1
                                                        ? "text-amber-400"
                                                        : "text-foreground"
                                                    }
                                                `}
                                            >
                                                {Number(
                                                    student.score ||
                                                    0
                                                ).toFixed(1)}
                                            </p>

                                            {/* Solved */}

                                            <p
                                                className="
                                                    text-right
                                                    font-mono
                                                    text-xs
                                                    font-semibold
                                                "
                                            >
                                                {student.solved ||
                                                    0}
                                            </p>

                                            {/* Streak */}

                                            <div className="flex justify-end">
                                                <span
                                                    className="
                                                        inline-flex
                                                        items-center
                                                        gap-1.5
                                                        rounded-full
                                                        border
                                                        border-border
                                                        bg-secondary
                                                        px-2.5 py-1
                                                        text-[9px]
                                                        font-medium
                                                        text-muted-foreground
                                                    "
                                                >
                                                    <Flame
                                                        size={10}
                                                    />

                                                    {student.maxStreak ||
                                                        0}

                                                    days
                                                </span>
                                            </div>
                                        </div>
                                    )
                                }
                            )
                        ) : (
                            <div
                                className="
                                    flex min-h-[150px]
                                    items-center
                                    justify-center
                                "
                            >
                                <p className="text-xs text-muted-foreground">
                                    No matching students.
                                </p>
                            </div>
                        )}

                        {/* Footer */}

                        <div
                            className="
                                flex items-center
                                justify-between gap-4
                                px-5 py-4
                            "
                        >
                            <p className="text-[10px] text-muted-foreground">
                                Showing{" "}
                                <span className="font-medium text-foreground">
                                    {filteredStudents.length ===
                                        0
                                        ? 0
                                        : startIndex + 1}

                                    {filteredStudents.length >
                                        0 &&
                                        `-${Math.min(
                                            endIndex,
                                            filteredStudents.length
                                        )}`}
                                </span>{" "}
                                of{" "}
                                {filteredStudents.length}{" "}
                                students
                            </p>

                            {/* Pagination */}

                            {totalPages > 1 && (
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setCurrentPage(
                                                (page) =>
                                                    Math.max(
                                                        1,
                                                        page -
                                                        1
                                                    )
                                            )
                                        }
                                        disabled={
                                            currentPage ===
                                            1
                                        }
                                        className="
                                            flex h-8 w-8
                                            items-center
                                            justify-center
                                            rounded-lg border
                                            border-border
                                            text-muted-foreground
                                            hover:border-primary/50
                                            hover:text-primary
                                            disabled:cursor-not-allowed
                                            disabled:opacity-40
                                        "
                                    >
                                        <ChevronLeft
                                            size={14}
                                        />
                                    </button>

                                    {pageNumbers.map(
                                        (
                                            page,
                                            index
                                        ) => {
                                            const previousPage =
                                                pageNumbers[
                                                index -
                                                1
                                                ]

                                            const showEllipsis =
                                                previousPage &&
                                                page -
                                                previousPage >
                                                1

                                            return (
                                                <div
                                                    key={
                                                        page
                                                    }
                                                    className="
                                                        flex
                                                        items-center
                                                        gap-1
                                                    "
                                                >
                                                    {showEllipsis && (
                                                        <span className="px-1 text-xs text-muted-foreground">
                                                            ...
                                                        </span>
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setCurrentPage(
                                                                page
                                                            )
                                                        }
                                                        className={`
                                                            flex
                                                            h-8 w-8
                                                            items-center
                                                            justify-center
                                                            rounded-lg
                                                            border
                                                            text-xs
                                                            font-semibold
                                                            ${currentPage ===
                                                                page
                                                                ? "border-primary bg-primary/10 text-primary"
                                                                : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
                                                            }
                                                        `}
                                                    >
                                                        {
                                                            page
                                                        }
                                                    </button>
                                                </div>
                                            )
                                        }
                                    )}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setCurrentPage(
                                                (page) =>
                                                    Math.min(
                                                        totalPages,
                                                        page +
                                                        1
                                                    )
                                            )
                                        }
                                        disabled={
                                            currentPage ===
                                            totalPages
                                        }
                                        className="
                                            flex h-8 w-8
                                            items-center
                                            justify-center
                                            rounded-lg border
                                            border-border
                                            text-muted-foreground
                                            hover:border-primary/50
                                            hover:text-primary
                                            disabled:cursor-not-allowed
                                            disabled:opacity-40
                                        "
                                    >
                                        <ChevronRight
                                            size={14}
                                        />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </section>
    )
}

export default Leaderboard