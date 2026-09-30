const express = require("express")
const multer = require("multer")

const requireAuth = require("../middleware/auth.middleware")

const {
    getStudentProfile,
    getMyProfile,
    updateMyProfile,
    uploadProfilePhoto,
    removeProfilePhoto,
    saveSocialAccount,
    removeSocialAccount,
} = require("../services/studentProfile.service")

const router = express.Router()


/* ============================================================= */
/* MULTER CONFIGURATION                                          */
/* ============================================================= */

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 5 * 1024 * 1024,
    },

    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ]

        if (!allowedTypes.includes(file.mimetype)) {
            return cb(
                new Error(
                    "Only JPG, PNG and WEBP images are allowed."
                )
            )
        }

        cb(null, true)
    },
})


/* ============================================================= */
/* MY PROFILE                                                    */
/* IMPORTANT: /me MUST COME BEFORE /:username                    */
/* ============================================================= */

/*
    GET /api/profile/me
*/

router.get(
    "/me",
    requireAuth,
    async (req, res) => {
        try {
            const data =
                await getMyProfile(
                    req.userId
                )

            return res.json({
                success: true,
                data,
            })
        } catch (error) {
            console.error(
                "My profile error:",
                error
            )

            return res.status(
                error.statusCode || 500
            ).json({
                success: false,
                message:
                    error.message ||
                    "Failed to load profile.",
            })
        }
    }
)


/* ============================================================= */
/* UPDATE MY PROFILE                                             */
/* ============================================================= */

/*
    PUT /api/profile/me
*/

router.put(
    "/me",
    requireAuth,
    async (req, res) => {
        try {
            const data =
                await updateMyProfile(
                    req.userId,
                    {
                        fullName:
                            req.body.fullName,
                    }
                )

            return res.json({
                success: true,
                data,
            })
        } catch (error) {
            console.error(
                "Update profile error:",
                error
            )

            return res.status(
                error.statusCode || 500
            ).json({
                success: false,
                message:
                    error.message ||
                    "Failed to update profile.",
            })
        }
    }
)


/* ============================================================= */
/* UPLOAD PROFILE PHOTO                                          */
/* ============================================================= */

/*
    POST /api/profile/me/photo

    Form field:
    photo
*/

router.post(
    "/me/photo",
    requireAuth,
    upload.single("photo"),
    async (req, res) => {
        try {
            const data =
                await uploadProfilePhoto(
                    req.userId,
                    req.file
                )

            return res.json({
                success: true,
                data,
            })
        } catch (error) {
            console.error(
                "Profile photo upload error:",
                error
            )

            return res.status(
                error.statusCode || 500
            ).json({
                success: false,
                message:
                    error.message ||
                    "Failed to upload profile photo.",
            })
        }
    }
)


/* ============================================================= */
/* REMOVE PROFILE PHOTO                                          */
/* ============================================================= */

/*
    DELETE /api/profile/me/photo
*/

router.delete(
    "/me/photo",
    requireAuth,
    async (req, res) => {
        try {
            const data =
                await removeProfilePhoto(
                    req.userId
                )

            return res.json({
                success: true,
                data,
            })
        } catch (error) {
            console.error(
                "Profile photo remove error:",
                error
            )

            return res.status(
                error.statusCode || 500
            ).json({
                success: false,
                message:
                    error.message ||
                    "Failed to remove profile photo.",
            })
        }
    }
)


/* ============================================================= */
/* SAVE SOCIAL ACCOUNT                                           */
/* ============================================================= */

/*
    POST /api/profile/me/social
*/

router.post(
    "/me/social",
    requireAuth,
    async (req, res) => {
        try {
            const data =
                await saveSocialAccount(
                    req.userId,
                    {
                        platform:
                            req.body.platform,

                        username:
                            req.body.username,
                    }
                )

            return res.json({
                success: true,
                data,
            })
        } catch (error) {
            console.error(
                "Save social account error:",
                error
            )

            return res.status(
                error.statusCode || 500
            ).json({
                success: false,
                message:
                    error.message ||
                    "Failed to save social account.",
            })
        }
    }
)


/* ============================================================= */
/* REMOVE SOCIAL ACCOUNT                                         */
/* ============================================================= */

/*
    DELETE /api/profile/me/social/:platform
*/

router.delete(
    "/me/social/:platform",
    requireAuth,
    async (req, res) => {
        try {
            const data =
                await removeSocialAccount(
                    req.userId,
                    req.params.platform
                )

            return res.json({
                success: true,
                data,
            })
        } catch (error) {
            console.error(
                "Remove social account error:",
                error
            )

            return res.status(
                error.statusCode || 500
            ).json({
                success: false,
                message:
                    error.message ||
                    "Failed to remove social account.",
            })
        }
    }
)


/* ============================================================= */
/* PUBLIC STUDENT PROFILE                                       */
/* IMPORTANT: KEEP THIS LAST                                    */
/* ============================================================= */

/*
    GET /api/profile/:username

    Example:
    /api/profile/aman
*/

router.get(
    "/:username",
    async (req, res) => {
        try {
            const data =
                await getStudentProfile(
                    req.params.username
                )

            return res.json({
                success: true,
                data,
            })
        } catch (error) {
            console.error(
                "Public student profile error:",
                error
            )

            return res.status(
                error.statusCode || 500
            ).json({
                success: false,
                message:
                    error.message ||
                    "Failed to load student profile.",
            })
        }
    }
)


/* ============================================================= */
/* MULTER ERROR HANDLER                                          */
/* ============================================================= */

router.use(
    (error, req, res, next) => {

        if (
            error instanceof multer.MulterError
        ) {
            if (
                error.code ===
                "LIMIT_FILE_SIZE"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Profile photo must be smaller than 5MB.",
                })
            }
        }


        if (error) {
            return res.status(400).json({
                success: false,
                message:
                    error.message ||
                    "File upload failed.",
            })
        }


        next()
    }
)


module.exports = router