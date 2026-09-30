import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import { supabase } from "../lib/supabase"

import {
    Medal,
    Search,
    ChevronLeft,
    ChevronRight,
    Flame,
    Crown,
    Trophy,
    TrendingUp,
    Users,
    Zap,
} from "lucide-react"

// =====================================================
// AVATAR
// =====================================================

function Avatar({
    student,
    size = "normal",
    className = "",
}) {
    const [imageError, setImageError] =
        useState(false)

    const initials =
        student?.name
            ?.split(" ")
            .filter(Boolean)
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "ST"

    const sizes = {
        small: "h-9 w-9 text-[10px]",
        normal: "h-16 w-16 text-lg",
        large: "h-28 w-28 text-3xl",
        xlarge: "h-32 w-32 text-4xl",
    }

    const showImage =
        student?.avatar &&
        !imageError

    return (
        <div
            className={`
                relative
                flex
                shrink-0
                items-center
                justify-center
                overflow-hidden
                rounded-full
                bg-secondary
                font-bold
                text-foreground
                ${sizes[size] || sizes.normal}
                ${className}
            `}
        >
            {showImage ? (
                <img
                    src={student.avatar}
                    alt={student.name || "Student"}
                    className="h-full w-full object-cover"
                    onError={() =>
                        setImageError(true)
                    }
                />
            ) : (
                initials
            )}
        </div>
    )
}

// =====================================================
// PODIUM CARD
// =====================================================

function PodiumCard({
    student,
    position,
}) {
    if (!student) return null

    const isFirst = position === 1

    const styles = {
        1: {
            border:
                "border-amber-400/50",
            glow:
                "shadow-[0_20px_70px_rgba(245,158,11,0.13)]",
            accent:
                "bg-amber-400",
            avatar:
                "border-amber-400",
            number:
                "bg-amber-400 text-black",
            score:
                "border-amber-400/20 bg-amber-400/[0.06]",
            scoreText:
                "text-amber-300",
            icon:
                "text-amber-400",
        },

        2: {
            border:
                "border-slate-400/35",
            glow:
                "shadow-[0_15px_50px_rgba(148,163,184,0.07)]",
            accent:
                "bg-slate-400",
            avatar:
                "border-slate-400",
            number:
                "bg-slate-300 text-slate-900",
            score:
                "border-slate-400/20 bg-slate-400/[0.04]",
            scoreText:
                "text-slate-200",
            icon:
                "text-slate-300",
        },

        3: {
            border:
                "border-orange-500/35",
            glow:
                "shadow-[0_15px_50px_rgba(249,115,22,0.07)]",
            accent:
                "bg-orange-500",
            avatar:
                "border-orange-500",
            number:
                "bg-orange-500 text-black",
            score:
                "border-orange-500/20 bg-orange-500/[0.04]",
            scoreText:
                "text-orange-300",
            icon:
                "text-orange-400",
        },
    }

    const style =
        styles[position]

    return (
        <div
            className={`
                group
                relative
                flex
                flex-col
                items-center
                overflow-visible
                rounded-[26px]
                border
                bg-card
                px-6
                text-center
                transition-all
                duration-300
                hover:-translate-y-2
                ${style.border}
                ${style.glow}
                ${isFirst
                    ? "min-h-[440px] py-8"
                    : "min-h-[400px] py-7"
                }
            `}
        >
            {/* Top line */}

            <div
                className={`
                    absolute
                    left-1/2
                    top-0
                    h-[2px]
                    -translate-x-1/2
                    rounded-full
                    transition-all
                    duration-300
                    group-hover:w-32
                    ${isFirst
                        ? "w-24"
                        : "w-16"
                    }
                    ${style.accent}
                `}
            />

            {/* Rank icon */}

            <div
                className="
                    absolute
                    -top-5
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-border
                    bg-card
                    shadow-xl
                "
            >
                {isFirst ? (
                    <Crown
                        size={21}
                        className={
                            style.icon
                        }
                    />
                ) : (
                    <Medal
                        size={21}
                        className={
                            style.icon
                        }
                    />
                )}
            </div>

            {/* Avatar */}

            <div className="relative mt-8">
                <div
                    className={`
                        rounded-full
                        border-[3px]
                        p-1
                        transition-all
                        duration-300
                        group-hover:scale-105
                        ${isFirst
                            ? "border-amber-400/70"
                            : position === 2
                                ? "border-slate-400/60"
                                : "border-orange-500/60"
                        }
                    `}
                >
                    <Avatar
                        student={student}
                        size={
                            isFirst
                                ? "xlarge"
                                : "large"
                        }
                    />
                </div>

                {/* Rank */}

                <div
                    className={`
                        absolute
                        -bottom-1
                        -right-2
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-full
                        border-2
                        border-card
                        font-mono
                        text-xs
                        font-bold
                        shadow-lg
                        ${style.number}
                    `}
                >
                    {position}
                </div>
            </div>

            {/* Name */}

            <h3 className="mt-5 max-w-full truncate px-3 text-lg font-bold">
                {student.name}
            </h3>

            {/* Username */}

            {student.username && (
                <Link
                    to={`/student/${student.username}`}
                    className="
                        mt-1
                        max-w-full
                        truncate
                        text-xs
                        text-muted-foreground
                        transition-colors
                        hover:text-primary
                    "
                >
                    @{student.username}
                </Link>
            )}

            {/* Score */}

            <div
                className={`
                    mt-6
                    w-full
                    max-w-[280px]
                    rounded-2xl
                    border
                    px-5
                    py-4
                    transition-all
                    duration-300
                    group-hover:-translate-y-1
                    ${style.score}
                `}
            >
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    CodeSync Score
                </p>

                <p
                    className={`
                        mt-1
                        font-mono
                        text-2xl
                        font-bold
                        ${style.scoreText}
                    `}
                >
                    {Number(
                        student.score || 0
                    ).toFixed(1)}
                </p>

                <p className="mt-1 text-[10px] text-muted-foreground">
                    Coding performance score
                </p>
            </div>

            {/* Stats */}

            <div className="mt-3 flex w-full max-w-[280px] gap-2">
                <div
                    className="
                        flex
                        flex-1
                        flex-col
                        items-center
                        rounded-xl
                        border
                        border-border
                        bg-secondary/40
                        px-3
                        py-3
                    "
                >
                    <span className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Solved
                    </span>

                    <span className="mt-1 font-mono text-sm font-semibold">
                        {student.solved || 0}
                    </span>
                </div>

                <div
                    className="
                        flex
                        flex-1
                        flex-col
                        items-center
                        rounded-xl
                        border
                        border-border
                        bg-secondary/40
                        px-3
                        py-3
                    "
                >
                    <span className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Max Streak
                    </span>

                    <span className="mt-1 flex items-center gap-1 font-mono text-sm font-semibold">
                        <Flame
                            size={12}
                        />

                        {student.maxStreak ||
                            0}
                        d
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
    const [students, setStudents] =
        useState([])

    const [searchQuery, setSearchQuery] =
        useState("")

    const [loading, setLoading] =
        useState(true)

    const [error, setError] =
        useState("")

    const [currentUserId, setCurrentUserId] =
        useState(null)

    const [currentPage, setCurrentPage] =
        useState(1)

    const STUDENTS_PER_PAGE = 10

    // =================================================
    // FETCH
    // =================================================

    useEffect(() => {
        let mounted = true

        const fetchLeaderboard =
            async () => {
                try {
                    setLoading(true)
                    setError("")

                    const {
                        data: {
                            session,
                        },
                    } =
                        await supabase.auth.getSession()

                    if (
                        !session?.access_token
                    ) {
                        throw new Error(
                            "Authentication session not found"
                        )
                    }

                    if (mounted) {
                        setCurrentUserId(
                            session.user.id
                        )
                    }

                    const response =
                        await fetch(
                            "https://codesync-su2x.onrender.com/api/leaderboard",
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${session.access_token}`,
                                },
                            }
                        )

                    const result =
                        await response.json()

                    if (
                        !response.ok ||
                        !result.success
                    ) {
                        throw new Error(
                            result.message ||
                            "Failed to fetch leaderboard"
                        )
                    }

                    if (mounted) {
                        setStudents(
                            result.data
                                ?.leaderboard ||
                            []
                        )
                    }
                } catch (err) {
                    console.error(
                        "Leaderboard fetch error:",
                        err
                    )

                    if (mounted) {
                        setError(
                            err.message
                        )
                    }
                } finally {
                    if (mounted) {
                        setLoading(false)
                    }
                }
            }

        fetchLeaderboard()

        return () => {
            mounted = false
        }
    }, [])

    // =================================================
    // FILTER
    // =================================================

    const filteredStudents =
        useMemo(() => {
            const query =
                searchQuery
                    .trim()
                    .toLowerCase()

            if (!query) {
                return students
            }

            return students.filter(
                (student) =>
                    student.name
                        ?.toLowerCase()
                        .includes(query) ||
                    student.username
                        ?.toLowerCase()
                        .includes(query)
            )
        }, [
            students,
            searchQuery,
        ])

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

    const paginatedStudents =
        filteredStudents.slice(
            startIndex,
            startIndex +
            STUDENTS_PER_PAGE
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
    }, [
        currentPage,
        totalPages,
    ])

    // =================================================
    // TOP STUDENTS
    // =================================================

    const topStudents =
        filteredStudents.slice(0, 3)

    // =================================================
    // PAGE NUMBERS
    // =================================================

    const pageNumbers = useMemo(() => {
        if (totalPages <= 5) {
            return Array.from(
                {
                    length: totalPages,
                },
                (_, i) => i + 1
            )
        }

        const pages = new Set([
            1,
            totalPages,
            currentPage,
            currentPage - 1,
            currentPage + 1,
        ])

        return Array.from(pages)
            .filter(
                (page) =>
                    page >= 1 &&
                    page <= totalPages
            )
            .sort((a, b) => a - b)
    }, [
        totalPages,
        currentPage,
    ])

    // =================================================
    // RENDER
    // =================================================

    return (
        <section className="min-h-full px-6 pb-12 pt-7 lg:px-8">
            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <div
                className="
                    relative
                    mb-8
                    overflow-hidden
                    rounded-[24px]
                    border
                    border-border
                    bg-card
                    px-6
                    py-6
                "
            >
                {/* Glow */}

                <div
                    className="
                        pointer-events-none
                        absolute
                        -right-20
                        -top-24
                        h-64
                        w-64
                        rounded-full
                        bg-primary/10
                        blur-3xl
                    "
                />

                <div
                    className="
                        absolute
                        left-0
                        top-0
                        h-full
                        w-[3px]
                        bg-primary
                    "
                />

                <div className="relative">
                    <div className="flex items-center gap-3">
                        <div
                            className="
                                flex
                                h-11
                                w-11
                                items-center
                                justify-center
                                rounded-xl
                                bg-primary/10
                                text-primary
                            "
                        >
                            <Trophy
                                size={21}
                            />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold">
                                Student{" "}
                                <span className="text-primary">
                                    Leaderboard
                                </span>
                            </h1>

                            <p className="mt-1 text-xs text-muted-foreground">
                                Compete, improve and
                                climb the CodeSync
                                rankings.
                            </p>
                        </div>
                    </div>

                    {/* Search */}

                    <div
                        className="
                            group
                            mt-6
                            flex
                            h-11
                            w-full
                            max-w-[600px]
                            items-center
                            gap-3
                            rounded-xl
                            border
                            border-border
                            bg-secondary/60
                            px-4
                            transition-all
                            focus-within:border-primary/50
                            focus-within:bg-secondary
                        "
                    >
                        <Search
                            size={16}
                            className="
                                text-muted-foreground
                                transition-colors
                                group-focus-within:text-primary
                            "
                        />

                        <input
                            type="text"
                            value={
                                searchQuery
                            }
                            onChange={(e) =>
                                setSearchQuery(
                                    e.target
                                        .value
                                )
                            }
                            placeholder="Search by name or username..."
                            className="
                                w-full
                                bg-transparent
                                text-sm
                                text-foreground
                                outline-none
                                placeholder:text-muted-foreground
                            "
                        />
                    </div>
                </div>
            </div>

            {/* ================================================= */}
            {/* QUICK INFO */}
            {/* ================================================= */}

            {!loading &&
                !error &&
                students.length > 0 && (
                    <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Users
                                    size={16}
                                />
                            </div>

                            <div>
                                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                                    Students
                                </p>

                                <p className="font-mono text-sm font-bold">
                                    {
                                        students.length
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400">
                                <Crown
                                    size={16}
                                />
                            </div>

                            <div>
                                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                                    #1 Student
                                </p>

                                <p className="max-w-[180px] truncate text-sm font-bold">
                                    {
                                        students[0]
                                            ?.name
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400">
                                <Zap
                                    size={16}
                                />
                            </div>

                            <div>
                                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                                    Top Score
                                </p>

                                <p className="font-mono text-sm font-bold">
                                    {Number(
                                        students[0]
                                            ?.score ||
                                        0
                                    ).toFixed(
                                        1
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

            {/* ================================================= */}
            {/* LOADING */}
            {/* ================================================= */}

            {loading ? (
                <div
                    className="
                        flex
                        min-h-[400px]
                        items-center
                        justify-center
                        rounded-[24px]
                        border
                        border-border
                        bg-card
                    "
                >
                    <div className="flex flex-col items-center">
                        <div
                            className="
                                h-9
                                w-9
                                animate-spin
                                rounded-full
                                border-2
                                border-border
                                border-t-primary
                            "
                        />

                        <p className="mt-4 text-xs text-muted-foreground">
                            Loading leaderboard...
                        </p>
                    </div>
                </div>
            ) : error ? (
                <div
                    className="
                        flex
                        min-h-[350px]
                        flex-col
                        items-center
                        justify-center
                        rounded-[24px]
                        border
                        border-border
                        bg-card
                        px-6
                    "
                >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                        <Search
                            size={22}
                        />
                    </div>

                    <p className="mt-4 text-sm font-semibold">
                        Failed to load leaderboard
                    </p>

                    <p className="mt-1 max-w-md text-center text-xs text-muted-foreground">
                        {error}
                    </p>
                </div>
            ) : (
                <>
                    {/* ================================================= */}
                    {/* PODIUM */}
                    {/* ================================================= */}

                    {topStudents.length > 0 && (
                        <div className="mb-10 grid grid-cols-1 items-end gap-5 md:grid-cols-3">
                            {/* SECOND */}

                            {topStudents[1] && (
                                <PodiumCard
                                    student={
                                        topStudents[1]
                                    }
                                    position={2}
                                />
                            )}

                            {/* FIRST */}

                            {topStudents[0] && (
                                <PodiumCard
                                    student={
                                        topStudents[0]
                                    }
                                    position={1}
                                />
                            )}

                            {/* THIRD */}

                            {topStudents[2] && (
                                <PodiumCard
                                    student={
                                        topStudents[2]
                                    }
                                    position={3}
                                />
                            )}
                        </div>
                    )}

                    {/* ================================================= */}
                    {/* TABLE */}
                    {/* ================================================= */}

                    <div
                        className="
                            overflow-hidden
                            rounded-[24px]
                            border
                            border-border
                            bg-card
                        "
                    >
                        {/* HEADER */}

                        <div
                            className="
                                hidden
                                grid-cols-[70px_1fr_140px_130px_150px]
                                items-center
                                border-b
                                border-border
                                bg-secondary/30
                                px-6
                                py-4
                                md:grid
                            "
                        >
                            <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Rank
                            </span>

                            <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Student
                            </span>

                            <span className="text-right text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Score
                            </span>

                            <span className="text-right text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Solved
                            </span>

                            <span className="text-right text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Max Streak
                            </span>
                        </div>

                        {/* ROWS */}

                        {paginatedStudents.length > 0 ? (
                            paginatedStudents.map(
                                (student) => {
                                    const isCurrentUser =
                                        student.userId ===
                                        currentUserId

                                    return (
                                        <div
                                            key={
                                                student.userId
                                            }
                                            className={`
                                                group
                                                grid
                                                grid-cols-1
                                                gap-4
                                                border-b
                                                border-border
                                                px-5
                                                py-4
                                                transition-all
                                                last:border-b-0
                                                md:grid-cols-[70px_1fr_140px_130px_150px]
                                                md:items-center
                                                md:px-6
                                                ${isCurrentUser
                                                    ? "bg-primary/[0.06]"
                                                    : "hover:bg-secondary/30"
                                                }
                                            `}
                                        >
                                            {/* Rank */}

                                            <div className="flex items-center justify-between md:block">
                                                <span
                                                    className={`
                                                        font-mono
                                                        text-sm
                                                        font-bold
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
                                                    #
                                                    {
                                                        student.rank
                                                    }
                                                </span>

                                                {isCurrentUser && (
                                                    <span className="rounded-full bg-primary/10 px-2 py-1 text-[8px] font-semibold text-primary md:hidden">
                                                        YOU
                                                    </span>
                                                )}
                                            </div>

                                            {/* Student */}

                                            <div className="flex min-w-0 items-center gap-3">
                                                <Avatar
                                                    student={
                                                        student
                                                    }
                                                    size="normal"
                                                    className="
                                                        border
                                                        border-border
                                                        transition-transform
                                                        group-hover:scale-105
                                                    "
                                                />

                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="truncate text-sm font-semibold">
                                                            {
                                                                student.name
                                                            }
                                                        </p>

                                                        {isCurrentUser && (
                                                            <span className="hidden rounded-full bg-primary/10 px-2 py-0.5 text-[8px] font-semibold text-primary md:inline-flex">
                                                                YOU
                                                            </span>
                                                        )}
                                                    </div>

                                                    {student.username && (
                                                        <Link
                                                            to={`/student/${student.username}`}
                                                            className="mt-1 block truncate text-[10px] text-muted-foreground hover:text-primary"
                                                        >
                                                            @
                                                            {
                                                                student.username
                                                            }
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Score */}

                                            <div className="flex items-center justify-between md:block md:text-right">
                                                <span className="text-[9px] uppercase tracking-wider text-muted-foreground md:hidden">
                                                    Score
                                                </span>

                                                <span
                                                    className={`
                                                        font-mono
                                                        text-sm
                                                        font-bold
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
                                                    ).toFixed(
                                                        1
                                                    )}
                                                </span>
                                            </div>

                                            {/* Solved */}

                                            <div className="flex items-center justify-between md:block md:text-right">
                                                <span className="text-[9px] uppercase tracking-wider text-muted-foreground md:hidden">
                                                    Solved
                                                </span>

                                                <span className="font-mono text-sm font-semibold">
                                                    {
                                                        student.solved
                                                    }
                                                </span>
                                            </div>

                                            {/* Streak */}

                                            <div className="flex items-center justify-between md:justify-end">
                                                <span className="text-[9px] uppercase tracking-wider text-muted-foreground md:hidden">
                                                    Max Streak
                                                </span>

                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-[10px] font-medium text-muted-foreground">
                                                    <Flame
                                                        size={
                                                            11
                                                        }
                                                    />

                                                    {
                                                        student.maxStreak
                                                    }

                                                    days
                                                </span>
                                            </div>
                                        </div>
                                    )
                                }
                            )
                        ) : (
                            <div className="flex min-h-[220px] items-center justify-center">
                                <div className="text-center">
                                    <Search
                                        size={24}
                                        className="mx-auto text-muted-foreground"
                                    />

                                    <p className="mt-3 text-sm font-semibold">
                                        No students found
                                    </p>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Try another
                                        name or
                                        username.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* ================================================= */}
                        {/* FOOTER */}
                        {/* ================================================= */}

                        <div className="flex flex-col gap-4 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-[10px] text-muted-foreground">
                                Showing{" "}
                                <span className="font-semibold text-foreground">
                                    {filteredStudents.length ===
                                        0
                                        ? 0
                                        : startIndex +
                                        1}
                                    {filteredStudents.length >
                                        0 &&
                                        `-${Math.min(
                                            startIndex +
                                            STUDENTS_PER_PAGE,
                                            filteredStudents.length
                                        )}`}
                                </span>{" "}
                                of{" "}
                                <span className="font-semibold text-foreground">
                                    {
                                        filteredStudents.length
                                    }
                                </span>{" "}
                                students
                            </p>

                            {totalPages >
                                1 && (
                                    <div className="flex items-center gap-1">
                                        {/* PREVIOUS */}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCurrentPage(
                                                    (
                                                        page
                                                    ) =>
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
                                            flex
                                            h-8
                                            w-8
                                            items-center
                                            justify-center
                                            rounded-lg
                                            border
                                            border-border
                                            text-muted-foreground
                                            transition-all
                                            hover:border-primary/50
                                            hover:text-primary
                                            disabled:cursor-not-allowed
                                            disabled:opacity-40
                                        "
                                        >
                                            <ChevronLeft
                                                size={
                                                    14
                                                }
                                            />
                                        </button>

                                        {/* PAGES */}

                                        {pageNumbers.map(
                                            (
                                                page,
                                                index
                                            ) => {
                                                const previous =
                                                    pageNumbers[
                                                    index -
                                                    1
                                                    ]

                                                const ellipsis =
                                                    previous &&
                                                    page -
                                                    previous >
                                                    1

                                                return (
                                                    <div
                                                        key={
                                                            page
                                                        }
                                                        className="flex items-center"
                                                    >
                                                        {ellipsis && (
                                                            <span className="px-2 text-xs text-muted-foreground">
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
                                                            h-8
                                                            w-8
                                                            items-center
                                                            justify-center
                                                            rounded-lg
                                                            border
                                                            text-xs
                                                            font-semibold
                                                            transition-all
                                                            ${currentPage ===
                                                                    page
                                                                    ? "border-primary bg-primary/10 text-primary"
                                                                    : "border-border text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
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

                                        {/* NEXT */}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCurrentPage(
                                                    (
                                                        page
                                                    ) =>
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
                                            flex
                                            h-8
                                            w-8
                                            items-center
                                            justify-center
                                            rounded-lg
                                            border
                                            border-border
                                            text-muted-foreground
                                            transition-all
                                            hover:border-primary/50
                                            hover:text-primary
                                            disabled:cursor-not-allowed
                                            disabled:opacity-40
                                        "
                                        >
                                            <ChevronRight
                                                size={
                                                    14
                                                }
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