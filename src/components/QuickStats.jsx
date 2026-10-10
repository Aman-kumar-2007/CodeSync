import {
    Code2,
    Trophy,
    Flame,
    Medal,
    CalendarDays,
} from "lucide-react"

function QuickStats({ profile }) {
    const platforms = profile?.platforms || {}

    const problemsSolved =
        profile?.solved ?? 0

    const currentStreak =
        profile?.currentStreak ?? 0

    const rank =
        profile?.rank ?? null

    const cfRating =
        platforms.CODEFORCES?.rating ?? null

    const activeDays = new Set(
        (profile?.activity || [])
            .filter((item) => {
                return (
                    (item.problemCount ?? 0) > 0 ||
                    (item.submissionCount ?? 0) > 0 ||
                    (item.contributionCount ?? 0) > 0
                )
            })
            .map((item) => item.activityDate)
    ).size

    const stats = [
        {
            label: "Problems Solved",
            value: problemsSolved,
            icon: Code2,
        },
        {
            label: "Streak",
            value: `${currentStreak}d`,
            icon: Flame,
        },
        {
            label: "National Rank",
            value: rank ? `#${rank}` : "—",
            icon: Medal,
        },
        {
            label: "CF Rating",
            value: cfRating ?? "—",
            icon: Trophy,
        },
    ]

    return (
        <section className="px-8">
            <div className="dashboard-quick-stats flex flex-wrap gap-3">
                {stats.map((stat) => {
                    const Icon = stat.icon

                    return (
                        <div
                            key={stat.label}
                            className="flex h-[44px] items-center gap-2 rounded-full border border-border bg-card px-5"
                        >
                            <Icon
                                size={14}
                                strokeWidth={1.8}
                                className="text-muted-foreground"
                            />

                            <span className="text-sm text-muted-foreground">
                                {stat.label}
                            </span>

                            <span className="font-mono text-sm font-bold text-foreground">
                                {stat.value}
                            </span>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}

export default QuickStats