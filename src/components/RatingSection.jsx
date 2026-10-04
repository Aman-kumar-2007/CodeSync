import { useMemo } from "react"

import {
    TrendingUp,
    Trophy,
} from "lucide-react"

import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts"

function RatingTooltip({
    active,
    payload,
    label,
    color,
}) {
    if (!active || !payload?.length) {
        return null
    }

    return (
        <div className="rounded-lg border border-border bg-[#171b27] px-3 py-2 shadow-xl">
            <p className="text-[10px] text-muted-foreground">
                {label}
            </p>

            <p
                className="mt-1 font-mono text-xs font-semibold"
                style={{ color }}
            >
                Rating: {payload[0].value ?? "—"}
            </p>
        </div>
    )
}

function RatingCard({
    platform,
    data,
    currentRating,
    maxRating,
    color,
    icon,
}) {
    const validData = data.filter(
        (item) =>
            item.rating != null
    )

    const ratingIncrease =
        validData.length > 1 &&
        currentRating != null
            ? currentRating -
              validData[0].rating
            : null

    return (
        <div className="rounded-2xl border border-border bg-card p-5">

            {/* Header */}
            <div className="flex items-start justify-between">

                <div className="flex items-center gap-3">

                    <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{
                            backgroundColor: `${color}18`,
                            color,
                        }}
                    >
                        {icon}
                    </div>

                    <div>
                        <h3 className="text-sm font-bold">
                            {platform}
                        </h3>

                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                            Rating History
                        </p>
                    </div>

                </div>

                <div className="text-right">

                    <p
                        className="font-mono text-xl font-bold"
                        style={{ color }}
                    >
                        {currentRating ?? "—"}
                    </p>

                    <p className="text-[9px] text-muted-foreground">
                        Current Rating
                    </p>

                </div>

            </div>

            {/* Chart */}
            <div className="mt-5 h-[190px]">

                {validData.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                        No rating history available
                    </div>
                ) : (
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >
                        <LineChart
                            data={data}
                            margin={{
                                top: 10,
                                right: 4,
                                left: -20,
                                bottom: 0,
                            }}
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#252833"
                                vertical={false}
                            />

                            <XAxis
                                dataKey="label"
                                tick={{
                                    fill: "#6b6b7b",
                                    fontSize: 10,
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
                                    fill: "#6b6b7b",
                                    fontSize: 9,
                                }}
                                axisLine={false}
                                tickLine={false}
                            />

                            <Tooltip
                                cursor={{
                                    stroke: "#3a3d49",
                                    strokeDasharray:
                                        "4 4",
                                }}
                                content={(props) => (
                                    <RatingTooltip
                                        {...props}
                                        color={color}
                                    />
                                )}
                            />

                            <Line
                                type="monotone"
                                dataKey="rating"
                                stroke={color}
                                strokeWidth={2.5}
                                dot={{
                                    r: 3.5,
                                    fill: color,
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

            {/* Footer */}
            <div className="mt-3 flex items-center justify-between border-t border-border pt-4">

                <div>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                        Max Rating
                    </p>

                    <p className="mt-1 font-mono text-sm font-semibold">
                        {maxRating ?? "—"}
                    </p>
                </div>

                {ratingIncrease != null && (
                    <div
                        className={`flex items-center gap-1.5 text-xs font-medium ${
                            ratingIncrease >= 0
                                ? "text-emerald-400"
                                : "text-red-400"
                        }`}
                    >
                        <TrendingUp
                            size={13}
                        />

                        <span>
                            {ratingIncrease >= 0
                                ? "+"
                                : ""}
                            {ratingIncrease}
                        </span>
                    </div>
                )}

            </div>

        </div>
    )
}

function RatingProgress({
    analytics,
    loading = false,
    error = "",
}) {
    const ratingData =
        analytics?.rating || {}

    /*
        Dashboard currently shows the
        monthly rating history.
    */

    const leetcodeData =
        useMemo(() => {
            return (
                ratingData.monthly || []
            ).map((item) => ({
                label: item.label,
                rating:
                    item.leetcode,
            }))
        }, [ratingData.monthly])

    const codeforcesData =
        useMemo(() => {
            return (
                ratingData.monthly || []
            ).map((item) => ({
                label: item.label,
                rating:
                    item.codeforces,
            }))
        }, [ratingData.monthly])

    const leetcodePlatform =
        (
            analytics?.platforms || []
        ).find(
            (platform) =>
                platform.platform ===
                "LEETCODE"
        )

    const codeforcesPlatform =
        (
            analytics?.platforms || []
        ).find(
            (platform) =>
                platform.platform ===
                "CODEFORCES"
        )

    if (loading) {
        return (
            <section className="px-8 pt-7">

                <div className="mb-4">

                    <div className="flex items-center gap-2">
                        <div className="h-[18px] w-[18px] rounded bg-muted animate-pulse" />

                        <div className="h-5 w-40 rounded bg-muted animate-pulse" />
                    </div>

                    <div className="mt-2 h-3 w-72 rounded bg-muted animate-pulse" />

                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

                    {[1, 2].map((item) => (
                        <div
                            key={item}
                            className="h-[330px] rounded-2xl border border-border bg-card p-5 animate-pulse"
                        >
                            <div className="flex justify-between">

                                <div className="flex items-center gap-3">

                                    <div className="h-10 w-10 rounded-xl bg-muted" />

                                    <div>
                                        <div className="h-4 w-24 rounded bg-muted" />

                                        <div className="mt-2 h-2.5 w-20 rounded bg-muted" />
                                    </div>

                                </div>

                                <div className="h-7 w-16 rounded bg-muted" />

                            </div>

                            <div className="mt-6 h-[190px] rounded-xl bg-muted/40" />

                            <div className="mt-4 flex justify-between border-t border-border pt-4">

                                <div>
                                    <div className="h-2.5 w-20 rounded bg-muted" />
                                    <div className="mt-2 h-4 w-12 rounded bg-muted" />
                                </div>

                                <div className="h-4 w-14 rounded bg-muted" />

                            </div>

                        </div>
                    ))}

                </div>

            </section>
        )
    }

    if (error) {
        return (
            <section className="px-8 pt-7">

                <div className="mb-4">

                    <div className="flex items-center gap-2">

                        <TrendingUp
                            size={18}
                            className="text-primary"
                        />

                        <h2 className="text-lg font-bold">
                            Rating Progress
                        </h2>

                    </div>

                    <p className="mt-1 text-xs text-muted-foreground">
                        Track your competitive programming performance over time.
                    </p>

                </div>

                <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                    {error}
                </div>

            </section>
        )
    }

    return (
        <section className="px-8 pt-7">

            {/* Section Header */}
            <div className="mb-4">

                <div className="flex items-center gap-2">

                    <TrendingUp
                        size={18}
                        className="text-primary"
                    />

                    <h2 className="text-lg font-bold">
                        Rating Progress
                    </h2>

                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                    Track your competitive programming performance over time.
                </p>

            </div>

            {/* Rating Cards */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

                <RatingCard
                    platform="LeetCode"
                    data={leetcodeData}
                    currentRating={
                        leetcodePlatform?.currentRating ??
                        null
                    }
                    maxRating={
                        leetcodePlatform?.maxRating ??
                        null
                    }
                    color="#f59e0b"
                    icon={
                        <TrendingUp size={20} />
                    }
                />

                <RatingCard
                    platform="Codeforces"
                    data={codeforcesData}
                    currentRating={
                        codeforcesPlatform?.currentRating ??
                        null
                    }
                    maxRating={
                        codeforcesPlatform?.maxRating ??
                        null
                    }
                    color="#2196f3"
                    icon={
                        <Trophy size={20} />
                    }
                />

            </div>

        </section>
    )
}

export default RatingProgress