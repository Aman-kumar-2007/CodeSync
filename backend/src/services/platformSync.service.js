const supabase = require("../config/supabase")

const {
    saveCodeforcesStats,
    saveLeetCodeStats,
    saveGfgStats,
    saveGithubStats,
} = require("./platformStats.service")

const {
    saveCodeforcesProblemActivity,
    getCodeforcesSolvedProblems,
} = require("./platforms/codeforces.service")

const {
    getLeetCodeTopicStats,
} = require("./platforms/leetcode.service")

const {
    getGfgTopicStats,
} = require("./platforms/gfg.service")

const {
    getTopicProgress,
} = require("./topicProgress.service")


const syncUserPlatforms = async (userId) => {

    // =====================================================
    // GET VERIFIED PLATFORM ACCOUNTS
    // =====================================================

    const {
        data: accounts,
        error: accountsError,
    } = await supabase
        .from("platform_accounts")
        .select("id, platform, username")
        .eq("user_id", userId)
        .eq("verification_status", "VERIFIED")

    if (accountsError) {
        throw new Error(
            `Failed to load platform accounts: ${accountsError.message}`
        )
    }

    if (!accounts || accounts.length === 0) {
        return {
            synced: [],
            failed: [],
        }
    }


    // =====================================================
    // PLATFORM SYNC
    // =====================================================

    const syncTasks = accounts.map(async (account) => {

        try {

            switch (account.platform) {

                // =========================================
                // CODEFORCES
                // =========================================

                case "CODEFORCES": {

                    await Promise.all([
                        saveCodeforcesStats(userId),

                        saveCodeforcesProblemActivity(
                            userId,
                            account.username
                        ),
                    ])

                    return {
                        status: "fulfilled",
                        platform: account.platform,
                        username: account.username,
                    }
                }


                // =========================================
                // LEETCODE
                // =========================================

                case "LEETCODE": {

                    await saveLeetCodeStats(userId)

                    return {
                        status: "fulfilled",
                        platform: account.platform,
                        username: account.username,
                    }
                }


                // =========================================
                // GFG
                // =========================================

                case "GFG": {

                    await saveGfgStats(userId)

                    return {
                        status: "fulfilled",
                        platform: account.platform,
                        username: account.username,
                    }
                }


                // =========================================
                // GITHUB
                // =========================================

                case "GITHUB": {

                    await saveGithubStats(userId)

                    return {
                        status: "fulfilled",
                        platform: account.platform,
                        username: account.username,
                    }
                }


                // =========================================
                // UNKNOWN PLATFORM
                // =========================================

                default:

                    return {
                        status: "rejected",
                        platform: account.platform,
                        username: account.username,
                        error: `Unsupported platform: ${account.platform}`,
                    }
            }

        } catch (error) {

            console.error(
                `${account.platform} sync error:`,
                error
            )

            return {
                status: "rejected",
                platform: account.platform,
                username: account.username,
                error: error.message,
            }
        }
    })


    const results = await Promise.all(syncTasks)


    // =====================================================
    // TOPIC DATA SYNC
    // Runs ONLY during background sync
    // =====================================================

    try {

        const topicPlatformData = {
            leetcode: [],
            codeforces: [],
            gfg: [],
        }


        const topicTasks = accounts.map(
            async (account) => {

                try {

                    // -----------------------------
                    // LEETCODE
                    // -----------------------------

                    if (
                        account.platform ===
                        "LEETCODE"
                    ) {

                        return {
                            platform: "leetcode",

                            data:
                                await getLeetCodeTopicStats(
                                    account.username
                                ),
                        }
                    }


                    // -----------------------------
                    // CODEFORCES
                    // -----------------------------

                    if (
                        account.platform ===
                        "CODEFORCES"
                    ) {

                        return {
                            platform: "codeforces",

                            data:
                                await getCodeforcesSolvedProblems(
                                    account.username
                                ),
                        }
                    }


                    // -----------------------------
                    // GFG
                    // -----------------------------

                    if (
                        account.platform ===
                        "GFG"
                    ) {

                        return {
                            platform: "gfg",

                            data:
                                await getGfgTopicStats(
                                    account.username
                                ),
                        }
                    }


                    return null

                } catch (error) {

                    console.warn(
                        `[Topic Sync] ${account.platform} failed for ${account.username}:`,
                        error.message
                    )

                    return null
                }
            }
        )


        const topicResults =
            await Promise.all(topicTasks)


        for (const result of topicResults) {

            if (!result) {
                continue
            }

            topicPlatformData[
                result.platform
            ] = result.data || []
        }


        // =================================================
        // CALCULATE FINAL 12 TOPIC PROGRESS
        // =================================================

        const topicProgress =
            await getTopicProgress(
                userId,
                topicPlatformData
            )


        // =================================================
        // SAVE TOPIC CACHE
        // =================================================

        const {
            error: topicSaveError,
        } = await supabase
            .from("student_analytics")
            .upsert(
                {
                    user_id: userId,

                    topic_progress:
                        topicProgress,

                    updated_at:
                        new Date().toISOString(),
                },
                {
                    onConflict: "user_id",
                }
            )


        if (topicSaveError) {

            console.error(
                `[Topic Sync] Failed to save topic progress for ${userId}:`,
                topicSaveError.message
            )

        } else {

            console.log(
                `[Topic Sync] Topic progress cached for ${userId}`
            )
        }

    } catch (error) {

        // Topic sync failure should NOT
        // make the entire platform sync fail.

        console.error(
            `[Topic Sync] Failed for ${userId}:`,
            error.message
        )
    }


    // =====================================================
    // FINAL RESULT
    // =====================================================

    const synced = results
        .filter(
            (result) =>
                result.status === "fulfilled"
        )
        .map(
            (result) => ({
                platform: result.platform,
                username: result.username,
            })
        )


    const failed = results
        .filter(
            (result) =>
                result.status === "rejected"
        )
        .map(
            (result) => ({
                platform: result.platform,
                username: result.username,
                error: result.error,
            })
        )


    return {
        synced,
        failed,
    }
}


module.exports = {
    syncUserPlatforms,
}