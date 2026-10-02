import { useEffect, useState } from "react"
import { Routes, Route } from "react-router"

import AuthPage from "./components/AuthPage"
import ProfileSetup from "./components/ProfileSetup"
import Layout from "./components/Layout"

import DashboardHeader from "./components/DashboardHeader"
import QuickStats from "./components/QuickStats"
import PlatformCards from "./components/PlatformCards"
import RatingProgress from "./components/RatingSection"
import CodingHeatmap from "./components/CodingHeatmap"

import Leaderboard from "./components/Leaderboard"
import StudentProfile from "./components/StudentProfile"
import Contests from "./components/Contests"
import Analytics from "./components/Analytics"
import Settings from "./components/Settings"
import Notifications from "./components/Notifications"
import PublicStudentProfile from "./components/PublicStudentProfile"

import { supabase } from "./lib/supabase"

const API_BASE_URL = "https://codesync-su2x.onrender.com"

function App() {
    const [currentPage, setCurrentPage] = useState("login")
    const [activePage, setActivePage] = useState("Dashboard")

    const [profile, setProfile] = useState(null)
    const [profileLoading, setProfileLoading] = useState(true)

    /* ========================================================= */
    /* CACHE KEY                                                 */
    /* ========================================================= */

    const getProfileCacheKey = (userId) => {
        return `codesync_profile_${userId}`
    }

    /* ========================================================= */
    /* LOAD INSTANT PROFILE                                      */
    /* ========================================================= */

    const loadInstantProfile = async (user) => {
        if (!user?.id) return null

        const cacheKey = getProfileCacheKey(user.id)

        /* ----------------------------------------------------- */
        /* 1. LOCAL STORAGE CACHE                               */
        /* ----------------------------------------------------- */

        try {
            const cachedProfile =
                localStorage.getItem(cacheKey)

            if (cachedProfile) {
                const parsedProfile =
                    JSON.parse(cachedProfile)

                if (parsedProfile) {
                    setProfile(parsedProfile)
                }
            }
        } catch (error) {
            console.warn(
                "Profile cache read failed:",
                error
            )
        }

        /* ----------------------------------------------------- */
        /* 2. AUTH USER METADATA                                 */
        /* ----------------------------------------------------- */

        const metadata = user.user_metadata || {}

        const metadataName =
            metadata.full_name ||
            metadata.fullName ||
            metadata.name ||
            null

        if (metadataName) {
            setProfile((previous) => ({
                ...(previous || {}),
                userId: user.id,
                name: metadataName,
                username:
                    previous?.username ||
                    null,
            }))
        }

        /* ----------------------------------------------------- */
        /* 3. SMALL DIRECT PROFILE QUERY                        */
        /* ----------------------------------------------------- */

        try {
            const {
                data: studentProfile,
                error,
            } = await supabase
                .from("student_profiles")
                .select(
                    "full_name, branch, profile_image"
                )
                .eq("user_id", user.id)
                .maybeSingle()

            if (error) {
                console.warn(
                    "Instant profile query failed:",
                    error.message
                )

                return
            }

            if (!studentProfile) {
                return
            }

            const instantProfile = {
                ...(profile || {}),
                userId: user.id,
                name:
                    studentProfile.full_name ||
                    metadataName ||
                    "Student",
                avatar:
                    studentProfile.profile_image ||
                    null,
                branch:
                    studentProfile.branch ||
                    null,
            }

            setProfile((previous) => ({
                ...(previous || {}),
                ...instantProfile,
            }))

            /* Cache only the small profile data */
            try {
                localStorage.setItem(
                    cacheKey,
                    JSON.stringify(instantProfile)
                )
            } catch (error) {
                console.warn(
                    "Profile cache write failed:",
                    error
                )
            }
        } catch (error) {
            console.warn(
                "Instant profile loading failed:",
                error
            )
        }
    }

    /* ========================================================= */
    /* AUTHENTICATED USER                                       */
    /* ========================================================= */

    const handleAuthenticatedUser = async (session) => {
        if (!session?.user) {
            setCurrentPage("login")
            setProfile(null)
            return
        }

        /*
         * IMPORTANT:
         * Load name/profile immediately.
         * Do NOT wait for the heavy dashboard API.
         */
        loadInstantProfile(session.user)

        const { data, error } = await supabase
            .from("users")
            .select("profile_setup_completed")
            .eq("id", session.user.id)
            .single()

        if (error) {
            console.error(
                "Profile status error:",
                error
            )
            return
        }

        if (data.profile_setup_completed) {
            setCurrentPage("app")
        } else {
            setCurrentPage("setup")
        }
    }

    /* ========================================================= */
    /* FETCH FULL DASHBOARD PROFILE                              */
    /* ========================================================= */

    useEffect(() => {
        if (currentPage !== "app") {
            return
        }

        const fetchProfile = async () => {
            /*
             * Sidebar already has cached/minimal profile.
             * This loading state is ONLY for dashboard content.
             */
            setProfileLoading(true)

            try {
                const {
                    data: {
                        session,
                    },
                } = await supabase.auth.getSession()

                if (!session?.access_token) {
                    return
                }

                const response = await fetch(
                    `${API_BASE_URL}/api/profile/me`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${session.access_token}`,
                        },
                    }
                )

                const result =
                    await response.json()

                if (
                    !response.ok ||
                    !result.success
                ) {
                    throw new Error(
                        result.message ||
                        "Failed to load dashboard profile."
                    )
                }

                const data =
                    result.data || {}

                const ranking =
                    data.ranking || {}

                const streak =
                    data.streak || {}

                const normalizedProfile = {
                    ...(data.profile || {}),

                    rank:
                        ranking.rank ?? null,

                    score:
                        ranking.score ?? 0,

                    solved:
                        ranking.solved ?? 0,

                    currentStreak:
                        streak.current ?? 0,

                    maxStreak:
                        streak.max ?? 0,

                    platforms:
                        data.platforms || {},

                    topics:
                        data.topics || [],

                    contests:
                        data.contests || 0,

                    activity:
                        data.activity || [],
                }

                /* ------------------------------------------------ */
                /* UPDATE PROFILE                                   */
                /* ------------------------------------------------ */

                setProfile(normalizedProfile)

                /* ------------------------------------------------ */
                /* UPDATE CACHE                                     */
                /* ------------------------------------------------ */

                if (session.user?.id) {
                    try {
                        localStorage.setItem(
                            getProfileCacheKey(
                                session.user.id
                            ),
                            JSON.stringify(
                                normalizedProfile
                            )
                        )
                    } catch (error) {
                        console.warn(
                            "Profile cache update failed:",
                            error
                        )
                    }
                }
            } catch (error) {
                console.error(
                    "Dashboard profile error:",
                    error
                )
            } finally {
                setProfileLoading(false)
            }
        }

        fetchProfile()
    }, [currentPage])

    /* ========================================================= */
    /* AUTH INITIALIZATION                                      */
    /* ========================================================= */

    useEffect(() => {
        const initializeAuth = async () => {
            const {
                data: {
                    session,
                },
            } = await supabase.auth.getSession()

            if (session) {
                await handleAuthenticatedUser(
                    session
                )
            } else {
                setProfileLoading(false)
            }
        }

        initializeAuth()

        const {
            data: {
                subscription,
            },
        } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (session) {
                    /*
                     * No need to block rendering.
                     */
                    handleAuthenticatedUser(
                        session
                    )
                } else if (
                    event === "SIGNED_OUT"
                ) {
                    setCurrentPage("login")
                    setActivePage("Dashboard")
                    setProfile(null)
                    setProfileLoading(false)
                }
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    /* ========================================================= */
    /* LOGIN                                                     */
    /* ========================================================= */

    const handleLogin = async () => {
        const {
            data: {
                session,
            },
        } = await supabase.auth.getSession()

        await handleAuthenticatedUser(
            session
        )
    }

    /* ========================================================= */
    /* PROFILE SETUP                                             */
    /* ========================================================= */

    const handleSetupComplete = () => {
        setCurrentPage("app")
    }

    /* ========================================================= */
    /* LOGOUT                                                    */
    /* ========================================================= */

    const handleLogout = async () => {
        try {
            const {
                data: {
                    session,
                },
            } = await supabase.auth.getSession()

            if (session?.user?.id) {
                try {
                    localStorage.removeItem(
                        getProfileCacheKey(
                            session.user.id
                        )
                    )
                } catch (error) {
                    console.warn(
                        "Profile cache cleanup failed:",
                        error
                    )
                }
            }

            await supabase.auth.signOut()

            setCurrentPage("login")
            setActivePage("Dashboard")
            setProfile(null)
        } catch (error) {
            console.error(
                "Logout error:",
                error
            )
        }
    }

    /* ========================================================= */
    /* AUTH PAGES                                                */
    /* ========================================================= */

    if (currentPage === "login") {
        return (
            <AuthPage
                onLogin={handleLogin}
            />
        )
    }

    if (currentPage === "setup") {
        return (
            <ProfileSetup
                onComplete={
                    handleSetupComplete
                }
            />
        )
    }

    /* ========================================================= */
    /* DASHBOARD LOADING                                         */
    /* ========================================================= */

    function DashboardLoading() {
        return (
            <div className="min-h-screen bg-background animate-pulse">
                <div className="space-y-8 p-8">

                    {/* Profile Header */}

                    <div className="h-[185px] rounded-2xl border border-border bg-card p-8">

                        <div className="h-8 w-72 rounded bg-muted" />

                        <div className="mt-3 h-5 w-48 rounded bg-muted" />

                        <div className="mt-10 flex gap-4">
                            <div className="h-4 w-16 rounded bg-muted" />
                            <div className="h-4 w-24 rounded bg-muted" />
                            <div className="h-4 w-20 rounded bg-muted" />
                        </div>

                    </div>

                    {/* Quick Stats */}

                    <div className="flex flex-wrap gap-3">

                        {[1, 2, 3, 4].map(
                            (item) => (
                                <div
                                    key={item}
                                    className="h-[44px] w-[220px] rounded-full border border-border bg-card"
                                />
                            )
                        )}

                    </div>

                    {/* Platform Cards */}

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

                        {[1, 2, 3].map(
                            (item) => (
                                <div
                                    key={item}
                                    className="h-[230px] rounded-2xl border border-border bg-card p-6"
                                >

                                    <div className="flex items-center justify-between">

                                        <div className="flex items-center gap-3">

                                            <div className="h-11 w-11 rounded-xl bg-muted" />

                                            <div className="h-5 w-28 rounded bg-muted" />

                                        </div>

                                        <div className="h-4 w-24 rounded bg-muted" />

                                    </div>

                                    <div className="mt-8 flex justify-between">

                                        <div>

                                            <div className="h-10 w-20 rounded bg-muted" />

                                            <div className="mt-3 h-3 w-28 rounded bg-muted" />

                                        </div>

                                        <div className="w-[140px] space-y-3">

                                            <div className="h-2 rounded bg-muted" />

                                            <div className="h-2 rounded bg-muted" />

                                            <div className="h-2 rounded bg-muted" />

                                        </div>

                                    </div>

                                </div>
                            )
                        )}

                    </div>

                    {/* Rating Progress */}

                    <div>

                        <div className="h-6 w-48 rounded bg-muted" />

                        <div className="mt-3 h-4 w-72 rounded bg-muted" />

                        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">

                            {[1, 2].map(
                                (item) => (
                                    <div
                                        key={item}
                                        className="h-[330px] rounded-2xl border border-border bg-card p-6"
                                    >

                                        <div className="flex items-center justify-between">

                                            <div className="flex items-center gap-3">

                                                <div className="h-11 w-11 rounded-xl bg-muted" />

                                                <div>

                                                    <div className="h-5 w-24 rounded bg-muted" />

                                                    <div className="mt-2 h-3 w-20 rounded bg-muted" />

                                                </div>

                                            </div>

                                            <div className="h-8 w-20 rounded bg-muted" />

                                        </div>

                                        <div className="mt-8 h-[210px] rounded-xl bg-muted/40" />

                                    </div>
                                )
                            )}

                        </div>

                    </div>

                </div>
            </div>
        )
    }

    /* ========================================================= */
    /* APP                                                       */
    /* ========================================================= */

    return (
        <Routes>

            {/* ================================================= */}
            {/* PUBLIC STUDENT PROFILE                            */}
            {/* ================================================= */}

            <Route
                path="/student/:username"
                element={
                    <PublicStudentProfile />
                }
            />

            {/* ================================================= */}
            {/* MAIN CODESYNC APP                                 */}
            {/* ================================================= */}

            <Route
                path="*"
                element={
                    <Layout
                        activePage={
                            activePage
                        }
                        setActivePage={
                            setActivePage
                        }
                        profile={profile}
                        onLogout={
                            handleLogout
                        }
                    >

                        {/* ========================= */}
                        {/* DASHBOARD                 */}
                        {/* ========================= */}

                        {activePage === "Dashboard" && (
                            <>
                                {profileLoading ? (
                                    <DashboardLoading />
                                ) : (
                                    <>
                                        <DashboardHeader
                                            profile={profile}
                                            setActivePage={setActivePage}
                                        />

                                        <QuickStats
                                            profile={profile}
                                        />

                                        <PlatformCards
                                            profile={profile}
                                        />

                                        <RatingProgress />

                                        <CodingHeatmap />
                                    </>
                                )}
                            </>
                        )}

                        {/* ========================= */}
                        {/* LEADERBOARD               */}
                        {/* ========================= */}

                        {activePage ===
                            "Leaderboard" && (
                                <Leaderboard />
                            )}

                        {/* ========================= */}
                        {/* STUDENT PROFILE           */}
                        {/* ========================= */}

                        {activePage ===
                            "Student Profile" && (
                                <StudentProfile />
                            )}

                        {/* ========================= */}
                        {/* CONTESTS                  */}
                        {/* ========================= */}

                        {activePage ===
                            "Contests" && (
                                <Contests />
                            )}

                        {/* ========================= */}
                        {/* ANALYTICS                 */}
                        {/* ========================= */}

                        {activePage ===
                            "Analytics" && (
                                <Analytics />
                            )}

                        {/* ========================= */}
                        {/* SETTINGS                  */}
                        {/* ========================= */}

                        {activePage ===
                            "Settings" && (
                                <Settings
                                    profile={
                                        profile
                                    }
                                    onViewProfile={() =>
                                        setActivePage(
                                            "Student Profile"
                                        )
                                    }
                                    onLogout={
                                        handleLogout
                                    }
                                />
                            )}

                        {/* ========================= */}
                        {/* NOTIFICATIONS             */}
                        {/* ========================= */}

                        {activePage ===
                            "Notifications" && (
                                <Notifications />
                            )}

                    </Layout>
                }
            />

        </Routes>
    )
}

export default App