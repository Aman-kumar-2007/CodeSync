const express = require("express")
const crypto = require("crypto")

const supabase = require("../config/supabase")
const requireAuth = require("../middleware/auth.middleware")

const {
    getCodeforcesUser,
} = require("../services/verification/codeforces")

const {
    getLeetCodeUser,
} = require("../services/verification/leetcode")

const {
    getGfgUser,
} = require("../services/verification/gfg")

const {
    generateVerificationCode,
    hashVerificationCode,
    containsVerificationCode,
} = require("../services/verification/codeforces")

const {
    generateVerificationCode: generateLeetCodeVerificationCode,
    hashVerificationCode: hashLeetCodeVerificationCode,
    containsVerificationCode: containsLeetCodeVerificationCode,
} = require("../services/verification/leetcode")

const {
    generateVerificationCode: generateGfgVerificationCode,
    hashVerificationCode: hashGfgVerificationCode,
    containsVerificationCode: containsGfgVerificationCode,
} = require("../services/verification/gfg")

const {
    getGitHubAuthorizationUrl,
    exchangeCodeForToken,
    getGitHubUser,
} = require("../services/verification/github")

const {
    getCombinedDailyActivity,
} = require("../services/dailyActivity.service")

const router = express.Router()


// =====================================================
// CODEFORCES VERIFICATION
// =====================================================

// Start Codeforces verification
router.post(
    "/codeforces/start",
    requireAuth,
    async (req, res) => {
        try {
            const { username } = req.body
            const userId = req.userId

            if (!username?.trim()) {
                return res.status(400).json({
                    error: "Codeforces handle is required.",
                })
            }

            const handle = username.trim()

            // Check Codeforces account
            const codeforcesUser =
                await getCodeforcesUser(handle)

            if (!codeforcesUser) {
                return res.status(404).json({
                    error: "Codeforces account not found.",
                })
            }

            // Generate verification code
            const verificationCode =
                generateVerificationCode()

            const verificationCodeHash =
                hashVerificationCode(
                    verificationCode
                )

            const expiresAt = new Date(
                Date.now() + 15 * 60 * 1000
            ).toISOString()

            // Save pending verification
            const { error } = await supabase
                .from("platform_accounts")
                .upsert(
                    {
                        user_id: userId,
                        platform: "CODEFORCES",
                        username: codeforcesUser.handle,
                        profile_url:
                            `https://codeforces.com/profile/${encodeURIComponent(
                                codeforcesUser.handle
                            )}`,
                        verification_status: "PENDING",
                        verification_code_hash:
                            verificationCodeHash,
                        verification_expires_at:
                            expiresAt,
                    },
                    {
                        onConflict: "user_id,platform",
                    }
                )

            if (error) {
                console.error(
                    "Codeforces verification save error:",
                    error
                )

                return res.status(500).json({
                    error: "Unable to start verification.",
                })
            }

            return res.json({
                success: true,
                username: codeforcesUser.handle,
                verificationCode,
                expiresInMinutes: 15,
                instructions:
                    "Add this code to your Codeforces Organization field, then click Verify Account.",
            })
        } catch (error) {
            console.error(
                "Codeforces start error:",
                error
            )

            return res.status(500).json({
                error: "Something went wrong.",
            })
        }
    }
)


// Verify Codeforces account
router.post(
    "/codeforces/verify",
    requireAuth,
    async (req, res) => {
        try {
            const userId = req.userId

            if (!userId) {
                return res.status(400).json({
                    error: "User ID is required.",
                })
            }

            // Get pending account
            const {
                data: account,
                error: accountError,
            } = await supabase
                .from("platform_accounts")
                .select("*")
                .eq("user_id", userId)
                .eq("platform", "CODEFORCES")
                .single()

            if (accountError || !account) {
                return res.status(404).json({
                    error:
                        "Codeforces verification request not found.",
                })
            }

            // Already verified
            if (
                account.verification_status ===
                "VERIFIED"
            ) {
                return res.json({
                    success: true,
                    status: "VERIFIED",
                    username: account.username,
                    message:
                        "Codeforces account is already verified.",
                })
            }

            // Check expiry
            if (
                account.verification_expires_at &&
                new Date(
                    account.verification_expires_at
                ) < new Date()
            ) {
                await supabase
                    .from("platform_accounts")
                    .update({
                        verification_status: "FAILED",
                    })
                    .eq("id", account.id)

                return res.status(400).json({
                    error:
                        "Verification code has expired. Please generate a new code.",
                })
            }

            // Fetch latest Codeforces profile
            const codeforcesUser =
                await getCodeforcesUser(
                    account.username
                )

            if (!codeforcesUser) {
                return res.status(404).json({
                    error:
                        "Codeforces account could not be found.",
                })
            }

            // Check organization for verification code
            const verified =
                containsVerificationCode(
                    codeforcesUser.organization,
                    account.verification_code_hash
                )

            if (!verified) {
                return res.status(400).json({
                    success: false,
                    status: "PENDING",
                    error:
                        "Verification code was not found in the Codeforces Organization field.",
                })
            }

            // Mark verified
            const {
                data: updatedAccount,
                error: updateError,
            } = await supabase
                .from("platform_accounts")
                .update({
                    verification_status: "VERIFIED",
                    verified_at:
                        new Date().toISOString(),
                    verification_code_hash: null,
                    verification_expires_at: null,
                })
                .eq("id", account.id)
                .select()
                .single()

            if (updateError) {
                console.error(
                    "Codeforces verification update error:",
                    updateError
                )

                return res.status(500).json({
                    error:
                        "Account was verified but could not be saved.",
                })
            }

            return res.json({
                success: true,
                status: "VERIFIED",
                username:
                    updatedAccount.username,
                profileUrl:
                    updatedAccount.profile_url,
                message:
                    "Codeforces account verified successfully.",
            })
        } catch (error) {
            console.error(
                "Codeforces verify error:",
                error
            )

            return res.status(500).json({
                error: "Something went wrong.",
            })
        }
    }
)


// =====================================================
// LEETCODE VERIFICATION
// =====================================================

// Start LeetCode verification
router.post(
    "/leetcode/start",
    requireAuth,
    async (req, res) => {
        try {
            const { username } = req.body
            const userId = req.userId

            if (!username?.trim()) {
                return res.status(400).json({
                    error: "LeetCode username is required.",
                })
            }

            const handle = username.trim()

            // Check LeetCode account
            const leetcodeUser =
                await getLeetCodeUser(handle)

            if (!leetcodeUser) {
                return res.status(404).json({
                    error: "LeetCode account not found.",
                })
            }

            // Generate verification code
            const verificationCode =
                generateLeetCodeVerificationCode()

            const verificationCodeHash =
                hashLeetCodeVerificationCode(
                    verificationCode
                )

            const expiresAt = new Date(
                Date.now() + 15 * 60 * 1000
            ).toISOString()

            // Save pending verification
            const { error } = await supabase
                .from("platform_accounts")
                .upsert(
                    {
                        user_id: userId,
                        platform: "LEETCODE",
                        username:
                            leetcodeUser.username,
                        profile_url:
                            `https://leetcode.com/u/${encodeURIComponent(
                                leetcodeUser.username
                            )}/`,
                        verification_status: "PENDING",
                        verification_code_hash:
                            verificationCodeHash,
                        verification_expires_at:
                            expiresAt,
                    },
                    {
                        onConflict: "user_id,platform",
                    }
                )

            if (error) {
                console.error(
                    "LeetCode verification save error:",
                    error
                )

                return res.status(500).json({
                    error: "Unable to start verification.",
                })
            }

            return res.json({
                success: true,
                username:
                    leetcodeUser.username,
                verificationCode,
                expiresInMinutes: 15,
                instructions:
                    "Add this code to your LeetCode Summary/About section, then click Verify Account.",
            })
        } catch (error) {
            console.error(
                "LeetCode start error:",
                error
            )

            return res.status(500).json({
                error: "Something went wrong.",
            })
        }
    }
)


// Verify LeetCode account
router.post(
    "/leetcode/verify",
    requireAuth,
    async (req, res) => {
        try {
            const userId = req.userId

            if (!userId) {
                return res.status(400).json({
                    error: "User ID is required.",
                })
            }

            // Get pending account
            const {
                data: account,
                error: accountError,
            } = await supabase
                .from("platform_accounts")
                .select("*")
                .eq("user_id", userId)
                .eq("platform", "LEETCODE")
                .single()

            if (accountError || !account) {
                return res.status(404).json({
                    error:
                        "LeetCode verification request not found.",
                })
            }

            // Already verified
            if (
                account.verification_status ===
                "VERIFIED"
            ) {
                return res.json({
                    success: true,
                    status: "VERIFIED",
                    username: account.username,
                    message:
                        "LeetCode account is already verified.",
                })
            }

            // Check expiry
            if (
                account.verification_expires_at &&
                new Date(
                    account.verification_expires_at
                ) < new Date()
            ) {
                await supabase
                    .from("platform_accounts")
                    .update({
                        verification_status: "FAILED",
                    })
                    .eq("id", account.id)

                return res.status(400).json({
                    error:
                        "Verification code has expired. Please generate a new code.",
                })
            }

            // Fetch latest LeetCode profile
            const leetcodeUser =
                await getLeetCodeUser(
                    account.username
                )

            if (!leetcodeUser) {
                return res.status(404).json({
                    error:
                        "LeetCode account could not be found.",
                })
            }

            // Check About/Summary section
            const verified =
                containsLeetCodeVerificationCode(
                    leetcodeUser.profile?.aboutMe,
                    account.verification_code_hash
                )

            if (!verified) {
                return res.status(400).json({
                    success: false,
                    status: "PENDING",
                    error:
                        "Verification code was not found in the LeetCode Summary/About section.",
                })
            }

            // Mark verified
            const {
                data: updatedAccount,
                error: updateError,
            } = await supabase
                .from("platform_accounts")
                .update({
                    verification_status: "VERIFIED",
                    verified_at:
                        new Date().toISOString(),
                    verification_code_hash: null,
                    verification_expires_at: null,
                })
                .eq("id", account.id)
                .select()
                .single()

            if (updateError) {
                console.error(
                    "LeetCode verification update error:",
                    updateError
                )

                return res.status(500).json({
                    error:
                        "Account was verified but could not be saved.",
                })
            }

            return res.json({
                success: true,
                status: "VERIFIED",
                username:
                    updatedAccount.username,
                profileUrl:
                    updatedAccount.profile_url,
                message:
                    "LeetCode account verified successfully.",
            })
        } catch (error) {
            console.error(
                "LeetCode verify error:",
                error
            )

            return res.status(500).json({
                error: "Something went wrong.",
            })
        }
    }
)


// =====================================================
// GEEKSFORGEEKS VERIFICATION
// =====================================================

// Start GFG verification
router.post(
    "/gfg/start",
    requireAuth,
    async (req, res) => {
        try {
            const { username } = req.body
            const userId = req.userId

            if (!username?.trim()) {
                return res.status(400).json({
                    error: "GFG username is required.",
                })
            }

            const handle = username.trim()

            // Check GFG account
            const gfgUser =
                await getGfgUser(handle)

            if (!gfgUser) {
                return res.status(404).json({
                    error: "GFG account not found.",
                })
            }

            // Generate verification code
            const verificationCode =
                generateGfgVerificationCode()

            const verificationCodeHash =
                hashGfgVerificationCode(
                    verificationCode
                )

            const expiresAt = new Date(
                Date.now() + 15 * 60 * 1000
            ).toISOString()

            // Save pending verification
            const { error } = await supabase
                .from("platform_accounts")
                .upsert(
                    {
                        user_id: userId,
                        platform: "GFG",
                        username: gfgUser.username,
                        profile_url:
                            gfgUser.profileUrl,
                        verification_status: "PENDING",
                        verification_code_hash:
                            verificationCodeHash,
                        verification_expires_at:
                            expiresAt,
                    },
                    {
                        onConflict: "user_id,platform",
                    }
                )

            if (error) {
                console.error(
                    "GFG verification save error:",
                    error
                )

                return res.status(500).json({
                    error: "Unable to start verification.",
                })
            }

            return res.json({
                success: true,
                username: gfgUser.username,
                verificationCode,
                expiresInMinutes: 15,
                instructions:
                    "Add this code to your GFG About Me section, then click Verify Account.",
            })
        } catch (error) {
            console.error(
                "GFG start error:",
                error
            )

            return res.status(500).json({
                error: "Something went wrong.",
            })
        }
    }
)


// Verify GFG account
router.post(
    "/gfg/verify",
    requireAuth,
    async (req, res) => {
        try {
            const userId = req.userId

            if (!userId) {
                return res.status(400).json({
                    error: "User ID is required.",
                })
            }

            // Get pending account
            const {
                data: account,
                error: accountError,
            } = await supabase
                .from("platform_accounts")
                .select("*")
                .eq("user_id", userId)
                .eq("platform", "GFG")
                .single()

            if (accountError || !account) {
                return res.status(404).json({
                    error:
                        "GFG verification request not found.",
                })
            }

            // Already verified
            if (
                account.verification_status ===
                "VERIFIED"
            ) {
                return res.json({
                    success: true,
                    status: "VERIFIED",
                    username: account.username,
                    profileUrl:
                        account.profile_url,
                    message:
                        "GFG account is already verified.",
                })
            }

            // Check expiry
            if (
                account.verification_expires_at &&
                new Date(
                    account.verification_expires_at
                ) < new Date()
            ) {
                await supabase
                    .from("platform_accounts")
                    .update({
                        verification_status: "FAILED",
                    })
                    .eq("id", account.id)

                return res.status(400).json({
                    error:
                        "Verification code has expired. Please generate a new code.",
                })
            }

            // Fetch latest GFG profile
            const gfgUser =
                await getGfgUser(
                    account.username
                )

            if (!gfgUser) {
                return res.status(404).json({
                    error:
                        "GFG account could not be found.",
                })
            }

            // Check profile for verification code
            const verified =
                containsGfgVerificationCode(
                    gfgUser.html,
                    account.verification_code_hash
                )

            if (!verified) {
                return res.status(400).json({
                    success: false,
                    status: "PENDING",
                    error:
                        "Verification code was not found on the GFG profile.",
                })
            }

            // Mark verified
            const {
                data: updatedAccount,
                error: updateError,
            } = await supabase
                .from("platform_accounts")
                .update({
                    verification_status: "VERIFIED",
                    verified_at:
                        new Date().toISOString(),
                    verification_code_hash: null,
                    verification_expires_at: null,
                })
                .eq("id", account.id)
                .select()
                .single()

            if (updateError) {
                console.error(
                    "GFG verification update error:",
                    updateError
                )

                return res.status(500).json({
                    error:
                        "Account was verified but could not be saved.",
                })
            }

            return res.json({
                success: true,
                status: "VERIFIED",
                username:
                    updatedAccount.username,
                profileUrl:
                    updatedAccount.profile_url,
                message:
                    "GFG account verified successfully.",
            })
        } catch (error) {
            console.error(
                "GFG verify error:",
                error
            )

            return res.status(500).json({
                error: "Something went wrong.",
            })
        }
    }
)


// =====================================================
// GITHUB OAUTH
// =====================================================

// Start GitHub OAuth
router.post(
    "/github/start",
    requireAuth,
    async (req, res) => {
        try {
            const userId = req.userId

            if (!userId) {
                return res.status(400).json({
                    error: "User ID is required.",
                })
            }

            // Generate OAuth state
            const state =
                crypto.randomBytes(32).toString("hex")

            const authorizationUrl =
                getGitHubAuthorizationUrl(state)

            // Temporary in-memory OAuth state storage
            global.githubOAuthStates =
                global.githubOAuthStates || new Map()

            global.githubOAuthStates.set(
                state,
                {
                    userId,
                    expiresAt:
                        Date.now() +
                        10 * 60 * 1000,
                }
            )

            return res.json({
                success: true,
                authorizationUrl,
            })
        } catch (error) {
            console.error(
                "GitHub OAuth start error:",
                error
            )

            return res.status(500).json({
                error:
                    "Unable to start GitHub OAuth.",
            })
        }
    }
)

// GitHub OAuth callback
router.get(
    "/github/callback",
    async (req, res) => {
        try {
            const {
                code,
                state,
                error,
            } = req.query

            if (error) {
                return res.status(400).json({
                    error:
                        "GitHub authorization was cancelled.",
                })
            }

            if (!code || !state) {
                return res.status(400).json({
                    error:
                        "Missing GitHub authorization data.",
                })
            }

            const states =
                global.githubOAuthStates ||
                new Map()

            const stateData =
                states.get(state)

            if (!stateData) {
                return res.status(400).json({
                    error:
                        "Invalid or expired OAuth state.",
                })
            }

            // Remove state immediately
            states.delete(state)

            if (
                stateData.expiresAt <
                Date.now()
            ) {
                return res.status(400).json({
                    error:
                        "OAuth state has expired.",
                })
            }

            // Exchange code for access token
            const tokenData =
                await exchangeCodeForToken(
                    code
                )

            // Get authenticated GitHub user
            const githubUser =
                await getGitHubUser(
                    tokenData.access_token
                )

            // Save GitHub account
            const {
                error: saveError,
            } = await supabase
                .from("platform_accounts")
                .upsert(
                    {
                        user_id:
                            stateData.userId,
                        platform: "GITHUB",
                        username:
                            githubUser.login,
                        profile_url:
                            githubUser.html_url,
                        verification_status:
                            "VERIFIED",
                        verified_at:
                            new Date().toISOString(),
                        access_token:
                            tokenData.access_token,
                    },
                    {
                        onConflict:
                            "user_id,platform",
                    }
                )

            if (saveError) {
                console.error(
                    "GitHub account save error:",
                    saveError
                )

                return res.status(500).json({
                    error:
                        "GitHub was verified but could not be saved.",
                })
            }

            return res.send(`
                <html>
                    <head>
                        <title>CodeSync</title>
                    </head>

                    <body
                        style="
                            font-family: sans-serif;
                            padding: 40px;
                            background: #0b0f19;
                            color: #eeeef0;
                        "
                    >
                        <h2>
                            GitHub connected successfully.
                        </h2>

                        <p>
                            You can close this window
                            and return to CodeSync.
                        </p>
                    </body>
                </html>
            `)
        } catch (error) {
            console.error(
                "GitHub OAuth callback error:",
                error
            )

            return res.status(500).json({
                error:
                    "Something went wrong during GitHub authorization.",
            })
        }
    }
)


// =====================================================
// COMBINED CODING ACTIVITY
// =====================================================

// Used by CodingHeatmap
router.get(
    "/activity",
    requireAuth,
    async (req, res) => {
        try {
            const data =
                await getCombinedDailyActivity(
                    req.userId
                )

            return res.json({
                success: true,
                data,
            })
        } catch (error) {
            console.error(
                "Daily activity error:",
                error
            )

            return res.status(500).json({
                success: false,
                message: error.message,
            })
        }
    }
)


/* ===================================================== */
/* DELETE VERIFIED PLATFORM ACCOUNT                      */
/* ===================================================== */

/*
    DELETE /api/verification/account/:platform

    Supported:
    LEETCODE
    CODEFORCES
    GFG
    GITHUB
*/

router.delete(
    "/account/:platform",
    requireAuth,
    async (req, res) => {
        try {
            const userId = req.userId

            const platform =
                req.params.platform
                    ?.trim()
                    .toUpperCase()

            const allowedPlatforms = [
                "LEETCODE",
                "CODEFORCES",
                "GFG",
                "GITHUB",
            ]

            if (
                !allowedPlatforms.includes(
                    platform
                )
            ) {
                return res.status(400).json({
                    success: false,
                    error:
                        "Invalid platform.",
                })
            }

            // Find account first
            const {
                data: account,
                error: accountError,
            } = await supabase
                .from("platform_accounts")
                .select("id")
                .eq("user_id", userId)
                .eq("platform", platform)
                .maybeSingle()

            if (accountError) {
                console.error(
                    "Platform account lookup error:",
                    accountError
                )

                return res.status(500).json({
                    success: false,
                    error:
                        "Unable to find platform account.",
                })
            }

            if (!account) {
                return res.json({
                    success: true,
                    message:
                        "Platform account is already disconnected.",
                })
            }

            // Remove platform stats first
            const {
                error: statsError,
            } = await supabase
                .from("platform_stats")
                .delete()
                .eq(
                    "platform_account_id",
                    account.id
                )

            if (statsError) {
                console.error(
                    "Platform stats delete error:",
                    statsError
                )

                return res.status(500).json({
                    success: false,
                    error:
                        "Unable to remove platform stats.",
                })
            }

            // Remove daily activity
            const {
                error: activityError,
            } = await supabase
                .from("daily_activity")
                .delete()
                .eq("user_id", userId)
                .eq("platform", platform)

            if (activityError) {
                console.warn(
                    "Daily activity delete warning:",
                    activityError.message
                )
            }

            // Finally remove platform account
            const {
                error: deleteError,
            } = await supabase
                .from("platform_accounts")
                .delete()
                .eq("id", account.id)
                .eq("user_id", userId)

            if (deleteError) {
                console.error(
                    "Platform account delete error:",
                    deleteError
                )

                return res.status(500).json({
                    success: false,
                    error:
                        "Unable to disconnect platform account.",
                })
            }

            return res.json({
                success: true,
                message:
                    `${platform} account disconnected successfully.`,
            })
        } catch (error) {
            console.error(
                "Platform disconnect error:",
                error
            )

            return res.status(500).json({
                success: false,
                error:
                    "Something went wrong while disconnecting the platform.",
            })
        }
    }
)

module.exports = router