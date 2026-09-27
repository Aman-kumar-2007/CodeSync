import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router"

import {
    ArrowLeft,
    ArrowUpRight,
    AtSign,
    BarChart3,
    BriefcaseBusiness,
    CalendarDays,
    Camera,
    CheckCircle2,
    Code2,
    ExternalLink,
    Flame,
    GraduationCap,
    Hash,
    Medal,
    Trophy,
    UserRound,
    Zap,
} from "lucide-react"

import { supabase } from "../lib/supabase"
import CodingHeatmap from "./CodingHeatmap"


const PublicStudentProfile = () => {
    const { username } = useParams()
    const navigate = useNavigate()

    const [student, setStudent] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")


    // =====================================================
    // FETCH SELECTED STUDENT
    // =====================================================

    useEffect(() => {
        const fetchStudentProfile = async () => {
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

                const response = await fetch(
                    `https://codesync-su2x.onrender.com/api/students/${encodeURIComponent(
                        username
                    )}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${session.access_token}`,
                        },
                    }
                )

                const result =
                    await response.json()

                if (!response.ok) {
                    throw new Error(
                        result.message ||
                        "Failed to load student profile."
                    )
                }

                setStudent(result)
            } catch (error) {
                console.error(
                    "Student profile error:",
                    error
                )

                setError(
                    error.message ||
                    "Failed to load student profile."
                )
            } finally {
                setLoading(false)
            }
        }

        if (username) {
            fetchStudentProfile()
        }
    }, [username])


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
                <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--border)] border-t-indigo-500" />

                    Loading student profile...
                </div>
            </div>
        )
    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error || !student) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
                <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-2xl">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
                        <UserRound
                            size={24}
                            className="text-red-400"
                        />
                    </div>

                    <h2 className="mt-5 text-xl font-semibold">
                        Student profile unavailable
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                        {error ||
                            "The requested student profile could not be found."}
                    </p>

                    <button
                        onClick={() =>
                            navigate(-1)
                        }
                        className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-5 py-3 text-sm font-medium transition-all hover:border-[var(--accent)] hover:text-[var(--foreground)]"
                    >
                        <ArrowLeft size={17} />

                        Back to Leaderboard
                    </button>
                </div>
            </div>
        )
    }


    const profile =
        student.profile || {}

    const ranking =
        student.ranking || {}

    const streak =
        student.streak || {}

    const platforms =
        student.platforms || {}

    const social =
        student.social || {}


    // =====================================================
    // INITIALS
    // =====================================================

    const initials = (profile.name || "Student")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase()


    // =====================================================
    // PLATFORM HELPERS
    // =====================================================

    const getPlatform = (
        uppercase,
        lowercase
    ) => {
        return (
            platforms[uppercase] ||
            platforms[lowercase] ||
            {}
        )
    }


    const leetcode =
        getPlatform(
            "LEETCODE",
            "leetcode"
        )

    const codeforces =
        getPlatform(
            "CODEFORCES",
            "codeforces"
        )

    const gfg =
        getPlatform(
            "GFG",
            "gfg"
        )

    const github =
        getPlatform(
            "GITHUB",
            "github"
        )


    const platformCards = [
        {
            name: "LeetCode",

            username:
                leetcode.username,

            solved:
                leetcode.solved || 0,

            secondaryLabel:
                "Rating",

            secondaryValue:
                leetcode.rating ??
                "—",

            profileUrl:
                leetcode.profileUrl,

            icon: Code2,

            accent:
                "text-orange-400",

            bg:
                "bg-orange-500/10",

            border:
                "border-orange-500/20",
        },

        {
            name: "Codeforces",

            username:
                codeforces.username,

            solved:
                codeforces.solved || 0,

            secondaryLabel:
                "Rating",

            secondaryValue:
                codeforces.rating ??
                "—",

            profileUrl:
                codeforces.profileUrl,

            icon: Hash,

            accent:
                "text-blue-400",

            bg:
                "bg-blue-500/10",

            border:
                "border-blue-500/20",
        },

        {
            name: "GeeksforGeeks",

            username:
                gfg.username,

            solved:
                gfg.solved || 0,

            secondaryLabel:
                "Problems",

            secondaryValue:
                gfg.solved || 0,

            profileUrl:
                gfg.profileUrl,

            icon: GraduationCap,

            accent:
                "text-emerald-400",

            bg:
                "bg-emerald-500/10",

            border:
                "border-emerald-500/20",
        },

        {
            name: "GitHub",

            username:
                github.username,

            solved:
                github.repositories || 0,

            secondaryLabel:
                "Contributions",

            secondaryValue:
                github.contributions || 0,

            profileUrl:
                github.profileUrl,

            icon: Code2,

            accent:
                "text-purple-400",

            bg:
                "bg-purple-500/10",

            border:
                "border-purple-500/20",
        },
    ]


    // =====================================================
    // SOCIAL HELPERS
    // =====================================================

    const getSocial = (...keys) => {
        for (const key of keys) {
            if (social[key]) {
                return social[key]
            }
        }

        return null
    }


    const githubSocial =
        getSocial(
            "GITHUB",
            "github"
        )

    const linkedin =
        getSocial(
            "LINKEDIN",
            "linkedin"
        )

    const twitter =
        getSocial(
            "X",
            "TWITTER",
            "twitter"
        )

    const instagram =
        getSocial(
            "INSTAGRAM",
            "instagram"
        )


    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">

            <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">

                {/* ================================================= */}
                {/* TOP BAR                                           */}
                {/* ================================================= */}

                <div className="mb-6 flex items-center justify-between">

                    <button
                        onClick={() =>
                            navigate(-1)
                        }
                        className="group inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-[var(--muted-foreground)] transition-all hover:border-[var(--accent)] hover:text-[var(--foreground)]"
                    >
                        <ArrowLeft
                            size={16}
                            className="transition-transform group-hover:-translate-x-0.5"
                        />

                        Back to Leaderboard
                    </button>


                    <div className="hidden items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs text-[var(--muted-foreground)] sm:flex">

                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                        CodeSync Profile
                    </div>

                </div>


                {/* ================================================= */}
                {/* HERO                                               */}
                {/* ================================================= */}

                <section className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-2xl">

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/[0.08] via-transparent to-purple-500/[0.06]" />

                    <div className="pointer-events-none absolute -right-32 -top-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

                    <div className="pointer-events-none absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />


                    <div className="relative p-6 sm:p-8 lg:p-10">

                        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

                            {/* IDENTITY */}

                            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

                                <div className="relative shrink-0">

                                    <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-3xl font-bold text-white shadow-2xl shadow-indigo-500/20 sm:h-32 sm:w-32 sm:text-4xl">

                                        {profile.avatar ? (
                                            <img
                                                src={
                                                    profile.avatar
                                                }
                                                alt={
                                                    profile.name
                                                }
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            initials
                                        )}

                                    </div>


                                    <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-xl border-4 border-[var(--card)] bg-emerald-500">

                                        <CheckCircle2
                                            size={14}
                                            className="text-white"
                                        />

                                    </div>

                                </div>


                                <div className="min-w-0">

                                    <div className="flex flex-wrap items-center gap-3">

                                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                            {profile.name ||
                                                "Student"}
                                        </h1>


                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">

                                            <CheckCircle2
                                                size={12}
                                            />

                                            Verified

                                        </span>

                                    </div>


                                    <p className="mt-2 font-mono text-sm text-[var(--muted-foreground)]">
                                        @{profile.username}
                                    </p>


                                    <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
                                        Building, solving and learning one problem at a time.
                                    </p>


                                    <div className="mt-5 flex flex-wrap gap-2">

                                        <InfoPill
                                            icon={
                                                GraduationCap
                                            }
                                            text={`${profile.college ||
                                                "PW IOI"
                                                } · ${profile.branch ||
                                                "Computer Science"
                                                }`}
                                        />


                                        {profile.batch && (
                                            <InfoPill
                                                icon={
                                                    CalendarDays
                                                }
                                                text={`Batch ${profile.batch}`}
                                            />
                                        )}

                                    </div>


                                    {/* SOCIALS ONLY IF CONNECTED */}

                                    {(githubSocial ||
                                        linkedin ||
                                        twitter ||
                                        instagram) && (

                                            <div className="mt-5 flex flex-wrap gap-2">

                                                {githubSocial && (
                                                    <SocialButton
                                                        icon={
                                                            Code2
                                                        }
                                                        label="GitHub"
                                                        data={
                                                            githubSocial
                                                        }
                                                    />
                                                )}


                                                {linkedin && (
                                                    <SocialButton
                                                        icon={
                                                            BriefcaseBusiness
                                                        }
                                                        label="LinkedIn"
                                                        data={
                                                            linkedin
                                                        }
                                                    />
                                                )}


                                                {twitter && (
                                                    <SocialButton
                                                        icon={
                                                            AtSign
                                                        }
                                                        label="X"
                                                        data={
                                                            twitter
                                                        }
                                                    />
                                                )}


                                                {instagram && (
                                                    <SocialButton
                                                        icon={
                                                            Camera
                                                        }
                                                        label="Instagram"
                                                        data={
                                                            instagram
                                                        }
                                                    />
                                                )}

                                            </div>

                                        )}

                                </div>

                            </div>


                            {/* RANK */}

                            <div className="relative min-w-[220px] overflow-hidden rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.06] p-6 text-center">

                                <div className="relative">

                                    <div className="mb-3 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">

                                        <Medal
                                            size={15}
                                            className="text-indigo-400"
                                        />

                                        Global Rank
                                    </div>


                                    <div className="font-mono text-5xl font-bold tracking-tight text-indigo-400">

                                        {ranking.rank
                                            ? `#${ranking.rank}`
                                            : "—"}

                                    </div>


                                    <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                                        CodeSync Leaderboard
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>


                {/* ================================================= */}
                {/* QUICK STATS                                       */}
                {/* ================================================= */}

                <section className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">

                    <StatCard
                        icon={Trophy}
                        label="CodeSync Score"
                        value={Number(
                            ranking.score ||
                            0
                        ).toLocaleString()}
                        iconClass="text-indigo-400"
                        iconBg="bg-indigo-500/10"
                    />


                    <StatCard
                        icon={Code2}
                        label="Problems Solved"
                        value={Number(
                            ranking.solved ||
                            0
                        ).toLocaleString()}
                        iconClass="text-blue-400"
                        iconBg="bg-blue-500/10"
                    />


                    <StatCard
                        icon={Flame}
                        label="Max Streak"
                        value={`${Number(
                            streak.max ||
                            0
                        )} days`}
                        iconClass="text-orange-400"
                        iconBg="bg-orange-500/10"
                    />


                    <StatCard
                        icon={Zap}
                        label="Current Streak"
                        value={`${Number(
                            streak.current ||
                            0
                        )} days`}
                        iconClass="text-purple-400"
                        iconBg="bg-purple-500/10"
                    />

                </section>


                {/* ================================================= */}
                {/* CODING PLATFORMS                                  */}
                {/* ================================================= */}

                <section className="mt-8">

                    <SectionHeader
                        icon={BarChart3}
                        title="Coding Platforms"
                        description="Connected platforms and current statistics"
                    />


                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                        {platformCards.map(
                            (platform) => {

                                const Icon =
                                    platform.icon

                                const connected =
                                    Boolean(
                                        platform.username
                                    )

                                return (
                                    <div
                                        key={
                                            platform.name
                                        }
                                        className={`group relative overflow-hidden rounded-2xl border ${platform.border} bg-[var(--card)] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
                                    >

                                        <div className="relative">

                                            <div className="flex items-start justify-between">

                                                <div
                                                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${platform.bg}`}
                                                >

                                                    <Icon
                                                        size={
                                                            21
                                                        }
                                                        className={
                                                            platform.accent
                                                        }
                                                    />

                                                </div>


                                                {platform.profileUrl && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            window.open(
                                                                platform.profileUrl,
                                                                "_blank",
                                                                "noopener,noreferrer"
                                                            )
                                                        }
                                                        className="rounded-lg p-2 text-[var(--muted-foreground)] opacity-0 transition-all group-hover:opacity-100 hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                                                        title={`Open ${platform.name}`}
                                                    >

                                                        <ExternalLink
                                                            size={
                                                                15
                                                            }
                                                        />

                                                    </button>
                                                )}

                                            </div>


                                            <h3 className="mt-5 font-semibold">
                                                {
                                                    platform.name
                                                }
                                            </h3>


                                            <p className="mt-1 truncate font-mono text-xs text-[var(--muted-foreground)]">

                                                {connected
                                                    ? `@${platform.username}`
                                                    : "Not connected"}

                                            </p>


                                            <div className="mt-5 grid grid-cols-2 gap-3">

                                                <PlatformMetric
                                                    label={
                                                        platform.name ===
                                                            "GitHub"
                                                            ? "Repos"
                                                            : "Solved"
                                                    }
                                                    value={
                                                        platform.solved
                                                    }
                                                />


                                                <PlatformMetric
                                                    label={
                                                        platform.secondaryLabel
                                                    }
                                                    value={
                                                        platform.secondaryValue
                                                    }
                                                />

                                            </div>

                                        </div>

                                    </div>
                                )
                            }
                        )}

                    </div>

                </section>


                {/* ================================================= */}
                {/* EXISTING CODING HEATMAP                           */}
                {/* ================================================= */}

                <section className="mt-8">

                    <CodingHeatmap
                        activityData={student.activity || []}
                    />

                </section>


                {/* ================================================= */}
                {/* FOOTER                                            */}
                {/* ================================================= */}

                <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-4 text-xs text-[var(--muted-foreground)] sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-2">

                        <UserRound
                            size={14}
                        />

                        CodeSync student profile

                    </div>


                    <div className="flex items-center gap-2">

                        <CalendarDays
                            size={14}
                        />

                        Public profile

                    </div>

                </div>

            </div>
        </div>
    )
}


/* ============================================================= */
/* STAT CARD                                                       */
/* ============================================================= */

const StatCard = ({
    icon: Icon,
    label,
    value,
    iconClass,
    iconBg,
}) => {
    return (
        <div className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--accent)]/30">

            <div className="flex items-start justify-between gap-3">

                <div>

                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--muted-foreground)]">
                        {label}
                    </p>


                    <p className="mt-2 font-mono text-2xl font-bold tracking-tight">
                        {value}
                    </p>

                </div>


                <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}
                >

                    <Icon
                        size={19}
                        className={
                            iconClass
                        }
                    />

                </div>

            </div>

        </div>
    )
}


/* ============================================================= */
/* PLATFORM METRIC                                                */
/* ============================================================= */

const PlatformMetric = ({
    label,
    value,
}) => {
    return (
        <div className="rounded-xl bg-[var(--secondary)] p-3">

            <p className="text-[10px] text-[var(--muted-foreground)]">
                {label}
            </p>


            <p className="mt-1 font-mono text-base font-bold">
                {value ?? "—"}
            </p>

        </div>
    )
}


/* ============================================================= */
/* INFO PILL                                                       */
/* ============================================================= */

const InfoPill = ({
    icon: Icon,
    text,
}) => {
    return (
        <span className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 text-xs text-[var(--muted-foreground)]">

            <Icon size={14} />

            {text}

        </span>
    )
}


/* ============================================================= */
/* SOCIAL BUTTON                                                   */
/* ============================================================= */

const SocialButton = ({
    icon: Icon,
    label,
    data,
}) => {

    const profileUrl =
        data?.profileUrl ||
        data?.profile_url ||
        null


    return (
        <button
            type="button"
            disabled={!profileUrl}
            onClick={() => {

                if (profileUrl) {
                    window.open(
                        profileUrl,
                        "_blank",
                        "noopener,noreferrer"
                    )
                }

            }}
            className="group inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 text-xs font-medium text-[var(--muted-foreground)] transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/10 hover:text-[var(--foreground)] disabled:cursor-default"
        >

            <Icon
                size={14}
                className="transition-transform group-hover:scale-110"
            />

            {label}

            {profileUrl && (
                <ArrowUpRight
                    size={11}
                />
            )}

        </button>
    )
}


/* ============================================================= */
/* SECTION HEADER                                                  */
/* ============================================================= */

const SectionHeader = ({
    icon: Icon,
    title,
    description,
}) => {
    return (
        <div className="mb-5 flex items-start gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10">

                <Icon
                    size={18}
                    className="text-indigo-400"
                />

            </div>


            <div>

                <h2 className="text-xl font-bold tracking-tight">
                    {title}
                </h2>


                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {description}
                </p>

            </div>

        </div>
    )
}


export default PublicStudentProfile