const supabase = require("../config/supabase")

const {
    getLeaderboard,
} = require("./leaderboard.service")

const {
    getAnalyticsSummary,
} = require("./analytics.service")

const {
    getCombinedDailyActivity,
} = require("./dailyActivity.service")


const PROFILE_BUCKET = "profile-images"

const ALLOWED_IMAGE_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024


/* ============================================================= */
/* GET PUBLIC STUDENT PROFILE                                   */
/* ============================================================= */

const getStudentProfile = async (username) => {
    if (!username?.trim()) {
        const error = new Error(
            "Username is required."
        )

        error.statusCode = 400

        throw error
    }


    // =====================================================
    // USER
    // =====================================================

    const {
        data: user,
        error: userError,
    } = await supabase
        .from("users")
        .select("id, username")
        .ilike(
            "username",
            username.trim()
        )
        .maybeSingle()

    if (userError) {
        throw new Error(
            `Failed to load user: ${userError.message}`
        )
    }

    if (!user) {
        const error = new Error(
            "Student not found."
        )

        error.statusCode = 404

        throw error
    }


    const userId = user.id


    // =====================================================
    // STUDENT PROFILE
    // =====================================================

    const {
        data: profile,
        error: profileError,
    } = await supabase
        .from("student_profiles")
        .select(
            `
            user_id,
            full_name,
            profile_image,
            branch
            `
        )
        .eq("user_id", userId)
        .maybeSingle()

    if (profileError) {
        throw new Error(
            `Failed to load student profile: ${profileError.message}`
        )
    }


    // =====================================================
    // VERIFIED PLATFORM ACCOUNTS
    // =====================================================

    const {
        data: accounts,
        error: accountsError,
    } = await supabase
        .from("platform_accounts")
        .select(
            `
            id,
            platform,
            username,
            profile_url,
            verification_status
            `
        )
        .eq("user_id", userId)
        .eq(
            "verification_status",
            "VERIFIED"
        )

    if (accountsError) {
        throw new Error(
            `Failed to load platform accounts: ${accountsError.message}`
        )
    }


    // =====================================================
    // PLATFORM STATS
    // =====================================================

    const accountIds =
        (accounts || []).map(
            (account) => account.id
        )

    let platformStats = []

    if (accountIds.length > 0) {
        const {
            data,
            error: statsError,
        } = await supabase
            .from("platform_stats")
            .select(
                `
                platform_account_id,
    problems_solved,
    basic_solved,
    easy_solved,
    medium_solved,
    hard_solved,
    current_rating,
    max_rating,
    contest_count,
    contributions,
    repository_count
                `
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

        platformStats = data || []
    }


    const statsMap = new Map(
        platformStats.map((stats) => [
            stats.platform_account_id,
            stats,
        ])
    )


    const platforms = {}


    for (const account of accounts || []) {
        const stats =
            statsMap.get(account.id) || {}

        platforms[account.platform] = {
            username:
                account.username,

            profileUrl:
                account.profile_url,

            solved:
                stats.problems_solved || 0,

            basicSolved:
                stats.basic_solved || 0,

            easySolved:
                stats.easy_solved || 0,

            mediumSolved:
                stats.medium_solved || 0,

            hardSolved:
                stats.hard_solved || 0,

            rating:
                stats.current_rating ?? null,

            maxRating:
                stats.max_rating ?? null,

            contests:
                stats.contest_count || 0,

            contributions:
                stats.contributions || 0,

            repositories:
                stats.repository_count || 0,
        }
    }


    // =====================================================
    // SOCIAL ACCOUNTS
    // =====================================================

    const {
        data: socialAccounts,
        error: socialError,
    } = await supabase
        .from("social_accounts")
        .select(
            "platform, username, profile_url"
        )
        .eq("user_id", userId)

    let social = {}

    if (socialError) {
        console.warn(
            "Social accounts could not be loaded:",
            socialError.message
        )
    } else {
        for (const account of socialAccounts || []) {
            social[account.platform] = {
                username:
                    account.username,

                profileUrl:
                    account.profile_url,
            }
        }
    }


    // =====================================================
    // LEADERBOARD
    // =====================================================

    const leaderboardData =
        await getLeaderboard(userId)


    const leaderboardStudent =
        leaderboardData.leaderboard.find(
            (student) =>
                student.userId === userId
        )


    // =====================================================
    // ANALYTICS
    // =====================================================

    const analytics =
        await getAnalyticsSummary(userId)

    const {
        data: studentAnalytics,
        error: studentAnalyticsError,
    } = await supabase
        .from("student_analytics")
        .select(
            "current_streak, max_streak"
        )
        .eq("user_id", userId)
        .maybeSingle()

    if (studentAnalyticsError) {
        console.warn(
            "Student analytics could not be loaded:",
            studentAnalyticsError.message
        )
    }
    // =====================================================
    // CODING ACTIVITY / HEATMAP
    // =====================================================

    const activity =
        await getCombinedDailyActivity(
            userId
        )


    // =====================================================
    // FINAL RESPONSE
    // =====================================================

    return {
        profile: {
            userId,

            username:
                user.username,

            name:
                profile?.full_name ||
                "Student",

            avatar:
                profile?.profile_image ||
                null,

            branch:
                profile?.branch ||
                null,
        },


        ranking: {
            rank:
                leaderboardStudent?.rank ||
                null,

            score:
                leaderboardStudent?.score ||
                0,

            solved:
                leaderboardStudent?.solved ||
                0,
        },


        streak: {
            current:
                studentAnalytics?.current_streak ??
                analytics?.summary?.streak ??
                0,

            max:
                studentAnalytics?.max_streak ??
                0,
        },


        platforms,

        social,

        topics:
            analytics?.topicProgress ||
            [],

        contests:
            analytics?.summary
                ?.totalContests ||
            0,

        lastActiveAt:
            analytics?.summary
                ?.lastActiveAt ||
            null,

        activity,
    }
}


/* ============================================================= */
/* GET MY PROFILE                                                */
/* ============================================================= */

const getMyProfile = async (userId) => {
    if (!userId) {
        const error = new Error(
            "User ID is required."
        )

        error.statusCode = 400

        throw error
    }


    const {
        data: user,
        error,
    } = await supabase
        .from("users")
        .select("username")
        .eq("id", userId)
        .single()

    if (error) {
        throw new Error(
            `Failed to load current user: ${error.message}`
        )
    }


    return getStudentProfile(
        user.username
    )
}


/* ============================================================= */
/* UPDATE MY PROFILE                                             */
/* ============================================================= */

const updateMyProfile = async (userId, { fullName }) => {
    if (!userId) {
        const error = new Error("User ID is required.")
        error.statusCode = 400
        throw error
    }

    const name = fullName?.trim()

    if (!name) {
        const error = new Error("Full name is required.")
        error.statusCode = 400
        throw error
    }

    const { error } = await supabase
        .from("student_profiles")
        .upsert(
            {
                user_id: userId,
                full_name: name,
                branch: "CSE",
            },
            {
                onConflict: "user_id",
            }
        )

    if (error) {
        throw new Error(
            `Failed to save student profile: ${error.message}`
        )
    }

    return getMyProfile(userId)
}


/* ============================================================= */
/* UPLOAD PROFILE PHOTO                                         */
/* ============================================================= */

const uploadProfilePhoto = async (
    userId,
    file
) => {
    if (!userId) {
        const error = new Error(
            "User ID is required."
        )

        error.statusCode = 400

        throw error
    }


    if (!file) {
        const error = new Error(
            "Profile photo is required."
        )

        error.statusCode = 400

        throw error
    }


    // -----------------------------------------------------
    // Validate MIME type
    // -----------------------------------------------------

    const extension =
        ALLOWED_IMAGE_TYPES[file.mimetype]

    if (!extension) {
        const error = new Error(
            "Only JPG, PNG and WEBP images are allowed."
        )

        error.statusCode = 400

        throw error
    }


    // -----------------------------------------------------
    // Validate file size
    // -----------------------------------------------------

    if (file.size > MAX_IMAGE_SIZE) {
        const error = new Error(
            "Profile photo must be smaller than 5MB."
        )

        error.statusCode = 400

        throw error
    }


    // -----------------------------------------------------
    // Remove previous possible profile images
    // -----------------------------------------------------

    const possibleOldFiles = [
        `${userId}/profile.jpg`,
        `${userId}/profile.png`,
        `${userId}/profile.webp`,
    ]


    const {
        error: removeError,
    } = await supabase
        .storage
        .from(PROFILE_BUCKET)
        .remove(possibleOldFiles)


    if (removeError) {
        console.warn(
            "Previous profile image could not be removed:",
            removeError.message
        )
    }


    // -----------------------------------------------------
    // Upload new image
    // -----------------------------------------------------

    const filePath =
        `${userId}/profile.${extension}`


    const {
        error: uploadError,
    } = await supabase
        .storage
        .from(PROFILE_BUCKET)
        .upload(
            filePath,
            file.buffer,
            {
                contentType:
                    file.mimetype,

                cacheControl:
                    "3600",

                upsert:
                    true,
            }
        )


    if (uploadError) {
        throw new Error(
            `Failed to upload profile photo: ${uploadError.message}`
        )
    }


    // -----------------------------------------------------
    // Get public URL
    // -----------------------------------------------------

    const {
        data: publicUrlData,
    } = supabase
        .storage
        .from(PROFILE_BUCKET)
        .getPublicUrl(filePath)


    const profileImage =
        publicUrlData?.publicUrl


    if (!profileImage) {
        throw new Error(
            "Failed to generate profile image URL."
        )
    }


    // -----------------------------------------------------
    // Save URL in student_profiles
    // -----------------------------------------------------

    const {
        error: profileUpdateError,
    } = await supabase
        .from("student_profiles")
        .update({
            profile_image:
                profileImage,
        })
        .eq(
            "user_id",
            userId
        )


    if (profileUpdateError) {
        throw new Error(
            `Failed to save profile image: ${profileUpdateError.message}`
        )
    }


    return {
        success: true,
        avatar: profileImage,
    }
}


/* ============================================================= */
/* SAVE SOCIAL ACCOUNT                                          */
/* ============================================================= */

const saveSocialAccount = async (
    userId,
    {
        platform,
        username,
    }
) => {
    if (!userId) {
        throw new Error(
            "User ID is required."
        )
    }


    const cleanPlatform =
        platform
            ?.trim()
            .toUpperCase()


    const cleanUsername =
        username
            ?.trim()
            .replace(/^@/, "")


    if (!cleanPlatform) {
        throw new Error(
            "Social platform is required."
        )
    }


    if (!cleanUsername) {
        throw new Error(
            "Social username is required."
        )
    }


    const buildUrl = {
        LINKEDIN: (value) =>
            `https://www.linkedin.com/in/${encodeURIComponent(value)}`,

        X: (value) =>
            `https://x.com/${encodeURIComponent(value)}`,

        INSTAGRAM: (value) =>
            `https://www.instagram.com/${encodeURIComponent(value)}`,

        YOUTUBE: (value) =>
            `https://youtube.com/@${encodeURIComponent(value)}`,
    }


    const profileUrl =
        buildUrl[cleanPlatform]?.(
            cleanUsername
        )


    if (!profileUrl) {
        throw new Error(
            "Unsupported social platform."
        )
    }


    const {
        error,
    } = await supabase
        .from("social_accounts")
        .upsert(
            {
                user_id:
                    userId,

                platform:
                    cleanPlatform,

                username:
                    cleanUsername,

                profile_url:
                    profileUrl,
            },
            {
                onConflict:
                    "user_id,platform",
            }
        )


    if (error) {
        throw new Error(
            `Failed to save social account: ${error.message}`
        )
    }


    return getMyProfile(userId)
}


/* ============================================================= */
/* REMOVE SOCIAL ACCOUNT                                        */
/* ============================================================= */

const removeSocialAccount = async (
    userId,
    platform
) => {
    if (!userId) {
        throw new Error(
            "User ID is required."
        )
    }


    const cleanPlatform =
        platform
            ?.trim()
            .toUpperCase()


    if (!cleanPlatform) {
        throw new Error(
            "Social platform is required."
        )
    }


    const {
        error,
    } = await supabase
        .from("social_accounts")
        .delete()
        .eq(
            "user_id",
            userId
        )
        .eq(
            "platform",
            cleanPlatform
        )


    if (error) {
        throw new Error(
            `Failed to remove social account: ${error.message}`
        )
    }


    return getMyProfile(userId)
}


/* ============================================================= */
/* EXPORTS                                                       */
/* ============================================================= */

module.exports = {
    getStudentProfile,
    getMyProfile,
    updateMyProfile,
    uploadProfilePhoto,
    saveSocialAccount,
    removeSocialAccount,
}