const express = require("express")

const requireAuth = require("../middleware/auth.middleware")
const {
    syncUserPlatforms,
} = require("../services/platformSync.service")

const router = express.Router()

// =====================================================
// FIRST SYNC FOR NEW USER
// =====================================================

router.post(
    "/first-sync",
    requireAuth,
    async (req, res) => {
        const userId = req.userId

        if (!userId) {
            return res.status(401).json({
                error: "User authentication required.",
            })
        }

        // Respond immediately.
        // Sync continues in the background.
        res.status(202).json({
            success: true,
            message:
                "Initial platform sync started.",
        })

        try {
            console.log(
                `[Platform Sync] Initial sync started for user ${userId}`
            )

            const result =
                await syncUserPlatforms(userId)

            console.log(
                `[Platform Sync] Initial sync completed for user ${userId}`,
                result
            )
        } catch (error) {
            console.error(
                `[Platform Sync] Initial sync failed for user ${userId}:`,
                error
            )
        }
    }
)

// =====================================================
// MANUAL SYNC FOR EXISTING USER
// =====================================================

router.post(
    "/sync",
    requireAuth,
    async (req, res) => {
        const userId = req.userId

        if (!userId) {
            return res.status(401).json({
                error: "User authentication required.",
            })
        }

        try {
            const result = await syncUserPlatforms(userId)

            return res.status(200).json({
                success: true,
                message: "Platform sync completed.",
                result,
            })
        } catch (error) {
            console.error(
                "[Platform Sync] Manual sync failed:",
                error
            )

            return res.status(500).json({
                success: false,
                error: "Platform sync failed.",
            })
        }
    }
)

module.exports = router