import {
    Code2,
    Trophy,
    GitBranch,
    ExternalLink,
} from "lucide-react"

function PlatformCards({ profile }) {
    const platforms = profile?.platforms || {}

    const leetcode =
        platforms.leetcode ||
        platforms.LEETCODE ||
        {}

    const codeforces =
        platforms.codeforces ||
        platforms.CODEFORCES ||
        {}

    const github =
        platforms.github ||
        platforms.GITHUB ||
        {}

    const easy =
        leetcode.easySolved ??
        leetcode.easy_solved ??
        0

    const medium =
        leetcode.mediumSolved ??
        leetcode.medium_solved ??
        0

    const hard =
        leetcode.hardSolved ??
        leetcode.hard_solved ??
        0

    const leetcodeTotal =
        leetcode.solved ??
        leetcode.problemsSolved ??
        leetcode.problems_solved ??
        0

    const maxDifficulty = Math.max(
        easy,
        medium,
        hard,
        1
    )

    const openProfile = (url) => {
        if (!url) return

        window.open(
            url,
            "_blank",
            "noopener,noreferrer"
        )
    }

    return (
        <section className="px-4 pt-5 sm:px-6 md:px-8 md:pt-7">
            <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-3">

                {/* ================================================= */}
                {/* LEETCODE                                         */}
                {/* ================================================= */}

                <div className="min-h-[230px] min-w-0 rounded-2xl border border-[#f59e0b]/30 bg-card p-4 sm:p-5">

                    <div className="flex items-center justify-between">

                        <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f59e0b]/15 text-[#f59e0b]">
                                <Code2
                                    size={24}
                                    strokeWidth={2}
                                />
                            </div>

                            <h3 className="text-lg font-bold text-[#f59e0b]">
                                LeetCode
                            </h3>

                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                openProfile(
                                    leetcode.profileUrl
                                )
                            }
                            disabled={
                                !leetcode.profileUrl
                            }
                            className="flex items-center gap-1.5 text-sm font-semibold text-[#c084fc] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            View Profile
                            <ExternalLink size={15} />
                        </button>

                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 sm:mt-7 sm:flex-nowrap sm:gap-6">

                        <div>

                            <p className="font-mono text-5xl font-bold">
                                {leetcodeTotal}
                            </p>

                            <p className="mt-2 text-sm text-muted-foreground">
                                Problems Solved
                            </p>

                        </div>

                        <div className="w-full max-w-[220px] space-y-3 sm:w-[140px] sm:flex-none">

                            <div>
                                <div className="mb-1.5 flex justify-between text-xs">
                                    <span className="text-emerald-400">
                                        Easy
                                    </span>

                                    <span className="font-mono">
                                        {easy}
                                    </span>
                                </div>

                                <div className="h-1.5 rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full bg-emerald-400"
                                        style={{
                                            width: `${(easy / maxDifficulty) * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="mb-1.5 flex justify-between text-xs">
                                    <span className="text-amber-400">
                                        Medium
                                    </span>

                                    <span className="font-mono">
                                        {medium}
                                    </span>
                                </div>

                                <div className="h-1.5 rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full bg-amber-400"
                                        style={{
                                            width: `${(medium / maxDifficulty) * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="mb-1.5 flex justify-between text-xs">
                                    <span className="text-red-400">
                                        Hard
                                    </span>

                                    <span className="font-mono">
                                        {hard}
                                    </span>
                                </div>

                                <div className="h-1.5 rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full bg-red-400"
                                        style={{
                                            width: `${(hard / maxDifficulty) * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>

                        </div>

                    </div>

                </div>

                {/* ================================================= */}
                {/* CODEFORCES                                       */}
                {/* ================================================= */}

                <div className="min-h-[230px] min-w-0 rounded-2xl border border-[#2196f3]/30 bg-card p-4 sm:p-5">

                    <div className="flex items-center justify-between">

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2196f3]/15 text-[#2196f3]">
                                <Trophy
                                    size={22}
                                    strokeWidth={2}
                                />
                            </div>

                            <h3 className="text-lg font-bold text-[#2196f3]">
                                Codeforces
                            </h3>

                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                openProfile(
                                    codeforces.profileUrl
                                )
                            }
                            disabled={
                                !codeforces.profileUrl
                            }
                            className="flex items-center gap-1.5 text-sm font-semibold text-[#2196f3] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            View Profile
                            <ExternalLink size={15} />
                        </button>

                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:gap-6">

                        <div>

                            <p className="font-mono text-3xl font-bold leading-none">
                                {codeforces.solved ??
                                    codeforces.problemsSolved ??
                                    0}
                            </p>

                            <p className="mt-2 text-xs text-muted-foreground">
                                Problems Solved
                            </p>

                        </div>

                        <div>

                            <p className="font-mono text-3xl font-bold leading-none text-[#2196f3]">
                                {codeforces.rating ??
                                    codeforces.currentRating ??
                                    "—"}
                            </p>

                            <p className="mt-2 text-xs text-muted-foreground">
                                Current Rating
                            </p>

                        </div>

                    </div>

                    <div className="relative mt-5 border-t border-border pt-3">

                        <div className="grid grid-cols-2">

                            <div>

                                <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Max Rating
                                </p>

                                <p className="mt-1 font-mono text-sm font-bold">
                                    {codeforces.maxRating ??
                                        "—"}
                                </p>

                            </div>

                            <div className="pl-6">

                                <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Contests
                                </p>

                                <p className="mt-1 font-mono text-sm font-bold">
                                    {codeforces.contests ??
                                        0}
                                </p>

                            </div>

                        </div>

                        <div className="absolute left-1/2 top-1/2 h-7 w-px -translate-x-1/2 -translate-y-1/2 bg-border" />

                    </div>

                </div>

                {/* ================================================= */}
                {/* GITHUB                                            */}
                {/* ================================================= */}

                <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-[auto_1fr] sm:items-end sm:gap-5">

                    {/* Contributions */}
                    <div className="min-w-0">
                        <p className="font-mono text-5xl font-bold leading-none sm:text-5xl">
                            {github.contributions ?? 0}
                        </p>

                        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                            Contributions
                        </p>
                    </div>

                    {/* Repository chart and count */}
                    <div className="min-w-0 w-full">
                        <div className="flex h-[80px] w-full items-end gap-1 overflow-hidden sm:max-w-full">

                            {[
                                18, 28, 42, 35, 55,
                                48, 62, 51, 44, 58,
                                68, 52, 72, 60, 78,
                                65, 82, 57, 70, 88,
                            ].map((height, index) => (
                                <div
                                    key={index}
                                    className="min-w-0 flex-1 rounded-t-sm bg-emerald-500/80"
                                    style={{ height: `${height}%` }}
                                />
                            ))}

                        </div>

                        <p className="mt-4 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-sm text-muted-foreground sm:text-base">
                            <span>Total Repositories</span>
                            <span className="font-mono font-bold text-foreground">
                                {github.repositories ?? 0}
                            </span>
                        </p>
                    </div>

                </div>

            </div>
        </section>
    )
}

export default PlatformCards