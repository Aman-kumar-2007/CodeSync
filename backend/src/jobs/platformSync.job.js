const supabase = require("../config/supabase")
const {
    syncUserPlatforms,
} = require("../services/platformSync.service")

const SYNC_INTERVAL = 6 * 60 * 60 * 1000 // 6 hours

let syncRunning = false

const runPlatformSync = async () => {
    if (syncRunning) {
        console.log(
            "[Platform Sync] Previous sync is still running. Skipping."
        )
        return
    }

    syncRunning = true

    console.log(
        "[Platform Sync] Background sync started..."
    )

    try {
        const {
            data: users,
            error,
        } = await supabase
            .from("platform_accounts")
            .select("user_id")
            .eq(
                "verification_status",
                "VERIFIED"
            )

        if (error) {
            throw new Error(
                `Failed to load users: ${error.message}`
            )
        }

        const userIds = [
            ...new Set(
                (users || []).map(
                    (item) => item.user_id
                )
            ),
        ]

        console.log(
            `[Platform Sync] Users to sync: ${userIds.length}`
        )

        const results = await Promise.allSettled(
            userIds.map((userId) =>
                syncUserPlatforms(userId)
            )
        )

        let successful = 0
        let failed = 0

        results.forEach((result) => {
            if (result.status === "fulfilled") {
                successful++
            } else {
                failed++

                console.error(
                    "[Platform Sync] User sync failed:",
                    result.reason
                )
            }
        })

        console.log(
            `[Platform Sync] Completed. Success: ${successful}, Failed: ${failed}`
        )
    } catch (error) {
        console.error(
            "[Platform Sync] Fatal error:",
            error
        )
    } finally {
        syncRunning = false
    }
}

const startPlatformSyncJob = () => {
    console.log(
        "[Platform Sync] Scheduler started."
    )

    console.log(
        "[Platform Sync] Next sync in 6 hours."
    )

    // IMPORTANT:
    // Do NOT run sync immediately when backend starts.
    // Existing cached DB data should be used by the frontend.

    setInterval(
        runPlatformSync,
        SYNC_INTERVAL
    )
}

module.exports = {
    startPlatformSyncJob,
    runPlatformSync,
}