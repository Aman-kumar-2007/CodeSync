const supabase = require("../config/supabase")

const {
    syncUserPlatforms,
} = require("../services/platformSync.service")

const SYNC_INTERVAL = 6 * 60 * 60 * 1000 // 6 hours
const USERS_PER_BATCH = 3

let syncRunning = false
let schedulerStarted = false

const runPlatformSync = async () => {
    if (syncRunning) {
        console.log(
            "[Platform Sync] A sync is already running. Skipping."
        )
        return
    }

    syncRunning = true

    console.log(
        "[Platform Sync] Background sync started."
    )

    let successful = 0
    let partial = 0
    let failed = 0

    try {
        const {
            data: accounts,
            error,
        } = await supabase
            .from("platform_accounts")
            .select("user_id")
            .eq("verification_status", "VERIFIED")

        if (error) {
            throw new Error(
                `Failed to load platform accounts: ${error.message}`
            )
        }

        const userIds = [
            ...new Set(
                (accounts || [])
                    .map((account) => account.user_id)
                    .filter(Boolean)
            ),
        ]

        console.log(
            `[Platform Sync] Users queued: ${userIds.length}`
        )

        // Process a few users at a time to reduce API rate limits.
        for (
            let i = 0;
            i < userIds.length;
            i += USERS_PER_BATCH
        ) {
            const batch = userIds.slice(
                i,
                i + USERS_PER_BATCH
            )

            const results = await Promise.allSettled(
                batch.map((userId) =>
                    syncUserPlatforms(userId)
                )
            )

            results.forEach((result, index) => {
                const userId = batch[index]

                if (result.status === "rejected") {
                    failed++

                    console.error(
                        `[Platform Sync] User ${userId} failed:`,
                        result.reason
                    )

                    return
                }

                const syncResult = result.value || {}
                const platformFailures =
                    syncResult.failed || []

                if (platformFailures.length > 0) {
                    partial++

                    console.warn(
                        `[Platform Sync] User ${userId} partially synced:`,
                        platformFailures
                    )
                } else {
                    successful++
                }
            })
        }

        console.log(
            `[Platform Sync] Finished. ` +
            `Successful: ${successful}, ` +
            `Partial: ${partial}, ` +
            `Failed: ${failed}`
        )
    } catch (error) {
        console.error(
            "[Platform Sync] Background job failed:",
            error
        )
    } finally {
        syncRunning = false
    }
}

const startPlatformSyncJob = () => {
    // Prevent accidental duplicate schedulers.
    if (schedulerStarted) return

    schedulerStarted = true

    console.log(
        "[Platform Sync] Scheduler started. Interval: 6 hours."
    )

    // Run once immediately after backend startup.
    void runPlatformSync()

    // Continue syncing every 6 hours.
    setInterval(() => {
        void runPlatformSync()
    }, SYNC_INTERVAL)
}

module.exports = {
    startPlatformSyncJob,
    runPlatformSync,
}