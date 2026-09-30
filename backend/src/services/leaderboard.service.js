const supabase = require("../config/supabase")

const getLeaderboard = async (currentUserId) => {
    // =====================================================
    // VERIFIED PLATFORM ACCOUNTS
    // =====================================================

    const {
        data: accounts,
        error: accountsError,
    } = await supabase
        .from("platform_accounts")
        .select("id, user_id, platform")
        .eq("verification_status", "VERIFIED")

    if (accountsError) {
        throw new Error(
            `Failed to load platform accounts: ${accountsError.message}`
        )
    }

    if (!accounts || accounts.length === 0) {
        return {
            leaderboard: [],
            currentUserRank: null,
        }
    }

    // =====================================================
    // UNIQUE USERS
    // =====================================================

    const userIds = [
        ...new Set(
            accounts.map(
                (account) => account.user_id
            )
        ),
    ]

    // =====================================================
    // USERS
    // =====================================================

    const {
        data: users,
        error: usersError,
    } = await supabase
        .from("users")
        .select("id, username")
        .in("id", userIds)

    if (usersError) {
        throw new Error(
            `Failed to load users: ${usersError.message}`
        )
    }

    // =====================================================
    // STUDENT PROFILES
    // IMPORTANT: profile_image INCLUDED
    // =====================================================

    const {
        data: profiles,
        error: profilesError,
    } = await supabase
        .from("student_profiles")
        .select(
            "user_id, full_name, profile_image, branch"
        )
        .in("user_id", userIds)

    if (profilesError) {
        throw new Error(
            `Failed to load student profiles: ${profilesError.message}`
        )
    }

    // =====================================================
    // PLATFORM STATS
    // =====================================================

    const accountIds = accounts.map(
        (account) => account.id
    )

    const {
        data: platformStats,
        error: statsError,
    } = await supabase
        .from("platform_stats")
        .select(
            "platform_account_id, problems_solved, current_rating"
        )
        .in(
            "platform_account_id",
            accountIds
        )

    if (statsError) {
        throw new Error(
            `Failed to load platform stats: ${statsError.message}`
        )
    }

    // =====================================================
    // STUDENT ANALYTICS
    // =====================================================

    const {
        data: studentAnalytics,
        error: analyticsError,
    } = await supabase
        .from("student_analytics")
        .select("user_id, max_streak")
        .in("user_id", userIds)

    if (analyticsError) {
        throw new Error(
            `Failed to load student analytics: ${analyticsError.message}`
        )
    }

    // =====================================================
    // ACCOUNT ID -> USER ID
    // =====================================================

    const accountUserMap = new Map(
        accounts.map((account) => [
            account.id,
            account.user_id,
        ])
    )

    // =====================================================
    // PLATFORM STATS BY USER
    // =====================================================

    const statsByUser = new Map()

    for (const stat of platformStats || []) {
        const userId =
            accountUserMap.get(
                stat.platform_account_id
            )

        if (!userId) continue

        const account = accounts.find(
            (item) =>
                item.id ===
                stat.platform_account_id
        )

        if (!account) continue

        if (!statsByUser.has(userId)) {
            statsByUser.set(userId, {
                leetcodeSolved: 0,
                gfgSolved: 0,
                codeforcesSolved: 0,
                codeforcesRating: 0,
            })
        }

        const userStats =
            statsByUser.get(userId)

        // LeetCode
        if (
            account.platform ===
            "LEETCODE"
        ) {
            userStats.leetcodeSolved =
                stat.problems_solved || 0
        }

        // GFG
        if (
            account.platform ===
            "GFG"
        ) {
            userStats.gfgSolved =
                stat.problems_solved || 0
        }

        // Codeforces
        if (
            account.platform ===
            "CODEFORCES"
        ) {
            userStats.codeforcesSolved =
                stat.problems_solved || 0

            userStats.codeforcesRating =
                stat.current_rating || 0
        }
    }

    // =====================================================
    // MAPS
    // =====================================================

    const userMap = new Map(
        (users || []).map((user) => [
            user.id,
            user,
        ])
    )

    const profileMap = new Map(
        (profiles || []).map((profile) => [
            profile.user_id,
            profile,
        ])
    )

    const analyticsMap = new Map(
        (studentAnalytics || []).map(
            (analytics) => [
                analytics.user_id,
                analytics,
            ]
        )
    )

    if (currentUserId && !userIds.includes(currentUserId)) {
        userIds.push(currentUserId)
    }

    // =====================================================
    // BUILD LEADERBOARD
    // =====================================================

    const leaderboard = userIds.map(
        (userId) => {
            const user =
                userMap.get(userId)

            const profile =
                profileMap.get(userId)

            const userStats =
                statsByUser.get(userId) || {
                    leetcodeSolved: 0,
                    gfgSolved: 0,
                    codeforcesSolved: 0,
                    codeforcesRating: 0,
                }

            // =================================================
            // SCORE
            // =================================================

            const score =
                userStats.leetcodeSolved * 2 +
                userStats.gfgSolved * 1.5 +
                userStats.codeforcesSolved +
                Math.max(
                    0,
                    userStats.codeforcesRating - 800
                ) * 0.5

            // =================================================
            // TOTAL SOLVED
            // =================================================

            const solved =
                userStats.leetcodeSolved +
                userStats.gfgSolved +
                userStats.codeforcesSolved

            // =================================================
            // MAX STREAK
            // =================================================

            const maxStreak =
                analyticsMap.get(userId)
                    ?.max_streak || 0

            // =================================================
            // FINAL STUDENT
            // =================================================

            return {
                userId,

                name:
                    profile?.full_name ||
                    "Student",

                username:
                    user?.username ||
                    null,

                // THIS WAS MISSING BEFORE
                avatar:
                    profile?.profile_image ||
                    null,

                score,

                solved,

                maxStreak,
            }
        }
    )

    // =====================================================
    // SORT
    // =====================================================

    leaderboard.sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score
        }

        if (b.solved !== a.solved) {
            return b.solved - a.solved
        }

        return a.name.localeCompare(
            b.name
        )
    })

    // =====================================================
    // ADD RANK
    // =====================================================

    const rankedLeaderboard =
        leaderboard.map(
            (student, index) => ({
                rank: index + 1,
                ...student,
            })
        )

    // =====================================================
    // CURRENT USER
    // =====================================================

    const currentUser =
        rankedLeaderboard.find(
            (student) =>
                student.userId ===
                currentUserId
        )

    // =====================================================
    // RESPONSE
    // =====================================================

    return {
        leaderboard:
            rankedLeaderboard,

        currentUserRank:
            currentUser?.rank || null,
    }
}

module.exports = {
    getLeaderboard,
}