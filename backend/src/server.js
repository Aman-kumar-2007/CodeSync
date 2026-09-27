const express = require("express")
const cors = require("cors")
require("dotenv").config()

const supabase = require("./config/supabase")

const verificationRoutes =
    require("./routes/verification.routes")

const analyticsRoutes =
    require("./routes/analytics.routes")

const leaderboardRoutes =
    require("./routes/leaderboard.routes")

const studentProfileRoutes =
    require("./routes/studentProfile.routes")

const profileRoutes =
    require("./routes/profile.routes")

const contestRoutes =
    require("./routes/contest.routes")

const preferencesRoutes =
    require("./routes/preferences.routes")

const notificationRoutes =
    require("./routes/notification.routes")

const authRoutes =
    require("./routes/auth.routes")

const platformSyncRoutes =
    require("./routes/platformSync.routes")

const {
    startPlatformSyncJob,
} = require("./jobs/platformSync.job")

const app = express()

const allowedOrigins = [
    "http://localhost:5173",
    "https://code-sync-kappa-green.vercel.app",
]

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error("Not allowed by CORS"))
        }
    },
    methods: [
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "OPTIONS",
    ],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
    ],
}

app.use(cors(corsOptions))

app.use(express.json())


// =====================================================
// HEALTH
// =====================================================

app.get("/", (req, res) => {
    res.json({
        message: "CodeSync Backend Running",
    })
})

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        backend: "connected",
        supabase: "configured",
    })
})


// =====================================================
// ROUTES
// =====================================================

app.use(
    "/api/verification",
    verificationRoutes
)

app.use(
    "/api/analytics",
    analyticsRoutes
)

app.use(
    "/api/leaderboard",
    leaderboardRoutes
)

app.use(
    "/api/students",
    studentProfileRoutes
)

app.use(
    "/api/profile",
    profileRoutes
)

app.use(
    "/api/contests",
    contestRoutes
)

app.use(
    "/api/preferences",
    preferencesRoutes
)

app.use(
    "/api/notifications",
    notificationRoutes
)

app.use(
    "/api/auth",
    authRoutes
)

// NEW
app.use(
    "/api/platform-sync",
    platformSyncRoutes
)


// =====================================================
// SERVER
// =====================================================

const PORT =
    process.env.PORT || 5001

app.listen(PORT, () => {
    console.log(
        `CodeSync Backend running on port ${PORT}`
    )

    // Start ONLY the 6-hour scheduler.
    // Do NOT run a global sync on server startup.
    startPlatformSyncJob()
})