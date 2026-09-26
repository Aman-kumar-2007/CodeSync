const express = require("express")
const cors = require("cors")
require("dotenv").config()

const supabase = require("./config/supabase")
const verificationRoutes = require("./routes/verification.routes")
const analyticsRoutes = require("./routes/analytics.routes")
const leaderboardRoutes = require("./routes/leaderboard.routes")
const studentProfileRoutes = require("./routes/studentProfile.routes")
const profileRoutes = require("./routes/profile.routes")
const contestRoutes = require("./routes/contest.routes")
const preferencesRoutes = require("./routes/preferences.routes")
const notificationRoutes =
    require("./routes/notification.routes")
const authRoutes = require("./routes/auth.routes")

const {
    startPlatformSyncJob,
    runPlatformSync,
} = require("./jobs/platformSync.job")

runPlatformSync()

const app = express()

const corsOptions = {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}

app.use(cors(corsOptions))
app.use(express.json())

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

app.use("/api/verification", verificationRoutes)

const PORT = process.env.PORT || 5001

app.listen(PORT, () => {
    console.log(
        `CodeSync Backend running on port ${PORT}`
    )
    startPlatformSyncJob()
})

app.use("/api/analytics", analyticsRoutes)

app.use("/api/leaderboard", leaderboardRoutes)

app.use("/api/students", studentProfileRoutes)

app.use("/api/profile", profileRoutes)

app.use("/api/contests", contestRoutes)

app.use(
    "/api/preferences",
    preferencesRoutes
)

app.use(
    "/api/notifications",
    notificationRoutes
)

app.use("/api/auth", authRoutes)