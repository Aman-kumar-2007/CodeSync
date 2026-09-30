const supabase = require("../config/supabase")

const {
    getCodeforcesStats,
    saveCodeforcesDailyActivity,
} = require("./platforms/codeforces.service")

const {
    getLeetCodeStats,
    getLeetCodeContestStats,
    getLeetCodeCalendar,
} = require("./platforms/leetcode.service")

const {
    getGfgStats,
    saveGfgDailyActivity,
} = require("./platforms/gfg.service")

const {
    getGithubStats,
    getGithubContributions,
    saveGithubDailyActivity,
} = require("./platforms/github.service")

const { saveDailyActivity } = require("./dailyActivity.service")

const {
    saveCodeforcesRatingHistory,
    saveLeetCodeRatingHistory,
} = require("./ratingHistory.service")


const saveCodeforcesStats = async (userId) => {
    const {
        data: platformAccount,
        error: accountError,
    } = await supabase
        .from("platform_accounts")
        .select("id, username")
        .eq("user_id", userId)
        .eq("platform", "CODEFORCES")
        .eq("verification_status", "VERIFIED")
        .single()

    if (accountError || !platformAccount) {
        throw new Error(
            "Verified Codeforces account not found."
        )
    }

    // Fetch latest Codeforces data
    const stats = await getCodeforcesStats(
        platformAccount.username
    )

    await saveCodeforcesRatingHistory(
        userId,
        stats.ratingHistory
    )

    await saveCodeforcesDailyActivity(
        userId,
        platformAccount.username
    )

    // Save latest snapshot
    const {
        data,
        error: statsError,
    } = await supabase
        .from("platform_stats")
        .upsert(
            {
                platform_account_id:
                    platformAccount.id,

                problems_solved:
                    stats.problemsSolved,

                contest_count:
                    stats.contestsParticipated,

                current_rating:
                    stats.currentRating,

                max_rating:
                    stats.maxRating,

                contributions: 0,
                repository_count: 0,

                recorded_at:
                    new Date().toISOString(),

                updated_at:
                    new Date().toISOString(),
            },
            {
                onConflict:
                    "platform_account_id",
            }
        )
        .select()
        .single()

    if (statsError) {
        throw new Error(
            `Failed to save Codeforces stats: ${statsError.message}`
        )
    }

    return data
}


const saveLeetCodeStats = async (userId) => {
    const {
        data: platformAccount,
        error: accountError,
    } = await supabase
        .from("platform_accounts")
        .select("id, username")
        .eq("user_id", userId)
        .eq("platform", "LEETCODE")
        .eq("verification_status", "VERIFIED")
        .single()

    if (accountError || !platformAccount) {
        throw new Error(
            "Verified LeetCode account not found."
        )
    }

    const stats = await getLeetCodeStats(
        platformAccount.username
    )

    const { data: previousStats, error: previousStatsError } =
        await supabase
            .from("platform_stats")
            .select("problems_solved")
            .eq("platform_account_id", platformAccount.id)
            .maybeSingle()

    if (previousStatsError) {
        throw new Error(
            `Failed to load previous LeetCode stats: ${previousStatsError.message}`
        )
    }

    const previousSolved = previousStats?.problems_solved ?? stats.problemsSolved

    const newProblemsSolved = previousStats
        ? Math.max(
            0,
            stats.problemsSolved - previousSolved
        )
        : 0

    const calendar = await getLeetCodeCalendar(
        platformAccount.username
    )

    // -----------------------------------------
    // Aggregate LeetCode submissions by date
    // -----------------------------------------

    const dailyActivityMap = new Map()

    for (const activity of calendar.activities || []) {
        const date = activity.date
        const submissionCount =
            Number(activity.submissionCount) || 0

        if (!dailyActivityMap.has(date)) {
            dailyActivityMap.set(date, {
                date,
                problemCount: 0,
                submissionCount: 0,
            })
        }

        dailyActivityMap.get(date).submissionCount +=
            submissionCount
    }

    const dailyActivities = Array.from(
        dailyActivityMap.values()
    )

    console.log(
        "LeetCode daily activity:",
        dailyActivities.find(
            (day) =>
                day.date ===
                new Date().toLocaleDateString(
                    "en-CA",
                    {
                        timeZone: "Asia/Kolkata",
                    }
                )
        )
    )

    await saveDailyActivity(
        userId,
        "LEETCODE",
        dailyActivities
    )

    const contestStats =
        await getLeetCodeContestStats(
            platformAccount.username
        )

    await saveLeetCodeRatingHistory(
        userId,
        contestStats.history
    )

    const rating =
        contestStats.ranking?.rating != null
            ? Math.round(contestStats.ranking.rating)
            : null

    const contestCount =
        contestStats.ranking?.attendedContestsCount || 0

    const ratings = contestStats.history
        .filter(
            (contest) =>
                contest.attended &&
                typeof contest.rating === "number"
        )
        .map((contest) => contest.rating)

    const maxRating =
        ratings.length > 0
            ? Math.round(Math.max(...ratings))
            : rating

    const {
        data,
        error: statsError,
    } = await supabase
        .from("platform_stats")
        .upsert(
            {
                platform_account_id:
                    platformAccount.id,

                problems_solved:
                    stats.problemsSolved,

                basic_solved: 0,

                easy_solved:
                    stats.easySolved,

                medium_solved:
                    stats.mediumSolved,

                hard_solved:
                    stats.hardSolved,

                contest_count:
                    contestCount,

                contributions: 0,

                repository_count: 0,

                current_rating:
                    rating,

                max_rating:
                    maxRating,

                recorded_at:
                    new Date().toISOString(),

                updated_at:
                    new Date().toISOString(),
            },
            {
                onConflict:
                    "platform_account_id",
            }
        )
        .select()
        .single()

    if (statsError) {
        throw new Error(
            `Failed to save LeetCode stats: ${statsError.message}`
        )
    }

    return data
}

const saveGfgStats = async (userId) => {
    const {
        data: platformAccount,
        error: accountError,
    } = await supabase
        .from("platform_accounts")
        .select("id, username")
        .eq("user_id", userId)
        .eq("platform", "GFG")
        .eq("verification_status", "VERIFIED")
        .single()

    if (accountError || !platformAccount) {
        throw new Error(
            "Verified GFG account not found."
        )
    }

    const stats = await getGfgStats(
        platformAccount.username
    )

    const { data: previousStats, error: previousStatsError } =
        await supabase
            .from("platform_stats")
            .select("problems_solved")
            .eq("platform_account_id", platformAccount.id)
            .maybeSingle()

    if (previousStatsError) {
        throw new Error(
            `Failed to load previous GFG stats: ${previousStatsError.message}`
        )
    }

    const previousSolved =
        previousStats?.problems_solved ?? stats.problemsSolved

    const newProblemsSolved = previousStats
        ? Math.max(
            0,
            stats.problemsSolved - previousSolved
        )
        : 0

    await saveDailyActivity(
        userId,
        "GFG",
        [
            {
                date: new Date().toISOString().split("T")[0],
                problemCount: newProblemsSolved,
                submissionCount: 0,
                contestCount: 0,
                contributionCount: 0,
            },
        ]
    )

    const {
        data,
        error: statsError,
    } = await supabase
        .from("platform_stats")
        .upsert(
            {
                platform_account_id:
                    platformAccount.id,

                problems_solved:
                    stats.problemsSolved,

                basic_solved:
                    stats.basicSolved,

                easy_solved:
                    stats.easySolved,

                medium_solved:
                    stats.mediumSolved,

                hard_solved:
                    stats.hardSolved,

                contest_count: 0,

                contributions: 0,

                repository_count: 0,

                current_rating: null,

                max_rating: null,

                recorded_at:
                    new Date().toISOString(),

                updated_at:
                    new Date().toISOString(),
            },
            {
                onConflict:
                    "platform_account_id",
            }
        )
        .select()
        .single()

    if (statsError) {
        throw new Error(
            `Failed to save GFG stats: ${statsError.message}`
        )
    }

    return data
}


const saveGithubStats = async (userId) => {
    const {
        data: platformAccount,
        error: accountError,
    } = await supabase
        .from("platform_accounts")
        .select("id, username")
        .eq("user_id", userId)
        .eq("platform", "GITHUB")
        .eq("verification_status", "VERIFIED")
        .single()

    if (accountError) {
        throw new Error(
            `GitHub account query failed: ${accountError.message}`
        )
    }

    const stats = await getGithubStats(
        platformAccount.username
    )

    const contributionData =
        await getGithubContributions(
            platformAccount.username
        )

    const {
        data,
        error: statsError,
    } = await supabase
        .from("platform_stats")
        .upsert(
            {
                platform_account_id:
                    platformAccount.id,

                problems_solved: 0,
                basic_solved: 0,
                easy_solved: 0,
                medium_solved: 0,
                hard_solved: 0,
                contest_count: 0,

                contributions:
                    contributionData.totalContributions,

                repository_count:
                    stats.repositories,

                current_rating: null,
                max_rating: null,

                recorded_at:
                    new Date().toISOString(),

                updated_at:
                    new Date().toISOString(),
            },
            {
                onConflict:
                    "platform_account_id",
            }
        )
        .select()
        .single()

    if (statsError) {
        throw new Error(
            `Failed to save GitHub stats: ${statsError.message}`
        )
    }

    const activities =
        contributionData.contributions.map(
            (day) => ({
                date: day.date,
                contributionCount:
                    day.count,
            })
        )

    await saveDailyActivity(
        userId,
        "GITHUB",
        activities
    )

    return data
}

module.exports = {
    saveCodeforcesStats,
    saveLeetCodeStats,
    saveGfgStats,
    saveGithubStats,
}