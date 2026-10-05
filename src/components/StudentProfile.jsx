import {
    useEffect,
    useState,
} from "react"

import {
    Code2,
    Pencil,
    GraduationCap,
    Building2,
    Flame,
    Trophy,
    Zap,
    ExternalLink,
    Link2,
    Check,
    X,
    Save,
    ShieldCheck,
    User,
    AtSign,
    Camera,
    Loader2,
    AlertCircle,
    BriefcaseBusiness,
    Globe2,
    Trash2,
} from "lucide-react"

import { supabase } from "../lib/supabase"
import { getCachedData, setCachedData } from "../utils/pageCache"


const API_BASE_URL = "https://codesync-su2x.onrender.com"


/* ============================================================= */
/* HELPERS                                                       */
/* ============================================================= */

const getInitials = (name = "Student") => {
    return name
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
}


const normalizePlatform = (platform) => {
    if (!platform) return ""

    return platform
        .toString()
        .trim()
        .toUpperCase()
}


const normalizeSocial = (platform) => {
    if (!platform) return ""

    return platform
        .toString()
        .trim()
        .toUpperCase()
}


/* ============================================================= */
/* PROFILE LOADING                                               */
/* ============================================================= */

function ProfileLoading() {
    return (
        <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-background">
            <div className="flex flex-col items-center">

                {/* Spinner */}
                <div className="relative flex h-14 w-14 items-center justify-center">

                    <div className="absolute inset-0 rounded-full border-2 border-primary/10" />

                    <div className="h-14 w-14 animate-spin rounded-full border-2 border-transparent border-t-primary border-r-primary/40" />

                    <div className="absolute h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_18px_rgba(99,102,241,0.9)]" />

                </div>

                {/* Text */}
                <p className="mt-5 text-sm font-semibold text-foreground">
                    Loading profile
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                    Fetching your CodeSync data...
                </p>

            </div>
        </div>
    )
}
/* ============================================================= */
/* MAIN COMPONENT                                                */
/* ============================================================= */

function StudentProfile() {

    const [profile, setProfile] = useState(null)

    const [email, setEmail] = useState("")

    const [loading, setLoading] = useState(true)

    const [error, setError] = useState("")

    const [editOpen, setEditOpen] = useState(false)

    const [editForm, setEditForm] = useState({
        name: "",
    })

    const [savingProfile, setSavingProfile] =
        useState(false)

    const [uploadingPhoto, setUploadingPhoto] =
        useState(false)

    const [socialAccounts, setSocialAccounts] =
        useState({})

    const [connectModal, setConnectModal] =
        useState(null)

    const [connectValue, setConnectValue] =
        useState("")

    const [savingSocial, setSavingSocial] =
        useState(false)

    const [platformAction, setPlatformAction] =
        useState("")

    const [platformModal, setPlatformModal] =
        useState(null)

    const [platformUsername, setPlatformUsername] =
        useState("")

    const [platformVerification, setPlatformVerification] =
        useState(null)

    const [platformSaving, setPlatformSaving] =
        useState(false)


    /* ========================================================= */
    /* FETCH PROFILE                                             */
    /* ========================================================= */

    const fetchProfile = async () => {

        // Show cached profile immediately, then refresh in background.
        let cached = null

        try {
            const {
                data: { session },
            } = await supabase.auth.getSession()

            if (!session?.access_token) {
                throw new Error(
                    "Authentication session not found."
                )
            }

            const cacheKey = `student_profile_${session.user.id}`
            cached = getCachedData(
                cacheKey,
                10 * 60 * 1000
            )

            if (cached) {
                setProfile(cached.profile || null)
                setSocialAccounts(cached.social || {})
                setEditForm({
                    name: cached.profile?.name || "",
                })
                setEmail(
                    cached.email ||
                    session.user?.email ||
                    ""
                )
                setLoading(false)
            } else {
                setLoading(true)
            }

            setError("")

            const response = await fetch(
                `${API_BASE_URL}/api/profile/me`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${session.access_token}`,
                    },
                }
            )

            const result = await response.json()

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ||
                    "Failed to load profile."
                )
            }

            const data = result.data || {}
            const profileData = data.profile || {}
            const ranking = data.ranking || {}
            const streak = data.streak || {}
            const platforms = data.platforms || {}

            const normalizedProfile = {
                ...profileData,
                rank: ranking.rank ?? null,
                score: ranking.score ?? 0,
                solved: ranking.solved ?? 0,
                currentStreak: streak.current ?? 0,
                maxStreak: streak.max ?? 0,
                platforms,
                topics: data.topics || [],
                contests: data.contests || 0,
                activity: data.activity || [],
            }

            const social = data.social || {}
            const email = session.user?.email || ""

            setProfile(normalizedProfile)
            setSocialAccounts(social)
            setEditForm({
                name: normalizedProfile.name || "",
            })
            setEmail(email)

            // Persist the fresh profile for instant display after refresh/navigation.
            setCachedData(cacheKey, {
                profile: normalizedProfile,
                social,
                email,
            })

        } catch (error) {
            console.error(
                "Student profile fetch error:",
                error
            )

            // Keep cached UI if background refresh fails.
            if (!cached) {
                setError(
                    error.message ||
                    "Failed to load profile."
                )
            }
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        fetchProfile()
    }, [])


    /* ========================================================= */
    /* EDIT PROFILE                                              */
    /* ========================================================= */

    const openEditProfile = () => {

        if (!profile) return

        setEditForm({
            name:
                profile.name || "",
        })

        setEditOpen(true)
    }


    const handleProfileChange = (event) => {

        const {
            name,
            value,
        } = event.target


        setEditForm((prev) => ({
            ...prev,
            [name]: value,
        }))
    }


    const saveProfile = async (event) => {

        event.preventDefault()


        const fullName =
            editForm.name.trim()


        if (!fullName) {
            return
        }


        try {

            setSavingProfile(true)
            setError("")


            const {
                data: {
                    session,
                },
            } = await supabase.auth.getSession()


            if (!session?.access_token) {
                throw new Error(
                    "Authentication session not found."
                )
            }


            const response =
                await fetch(
                    `${API_BASE_URL}/api/profile/me`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${session.access_token}`,
                        },

                        body: JSON.stringify({
                            fullName,
                        }),
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
                    "Failed to update profile."
                )
            }


            const data =
                result.data || {}


            const profileData =
                data.profile || {}

            const ranking =
                data.ranking || {}

            const streak =
                data.streak || {}


            setProfile((prev) => ({
                ...prev,

                ...profileData,

                rank:
                    ranking.rank ??
                    prev.rank ??
                    null,

                score:
                    ranking.score ??
                    prev.score ??
                    0,

                solved:
                    ranking.solved ??
                    prev.solved ??
                    0,

                currentStreak:
                    streak.current ??
                    prev.currentStreak ??
                    0,

                maxStreak:
                    streak.max ??
                    prev.maxStreak ??
                    0,

                platforms:
                    data.platforms ??
                    prev.platforms ??
                    {},

                topics:
                    data.topics ??
                    prev.topics ??
                    [],

                contests:
                    data.contests ??
                    prev.contests ??
                    0,

                activity:
                    data.activity ??
                    prev.activity ??
                    [],
            }))


            if (data.social) {
                setSocialAccounts(
                    data.social
                )
            }


            setEditOpen(false)

        } catch (error) {

            console.error(
                "Profile update error:",
                error
            )

            setError(
                error.message ||
                "Failed to update profile."
            )

        } finally {

            setSavingProfile(false)

        }
    }


    /* ========================================================= */
    /* PROFILE PHOTO                                             */
    /* ========================================================= */

    const handlePhotoUpload = async (
        event
    ) => {

        const file =
            event.target.files?.[0]


        event.target.value = ""


        if (!file) {
            return
        }


        if (
            ![
                "image/jpeg",
                "image/png",
                "image/webp",
            ].includes(file.type)
        ) {

            setError(
                "Only JPG, PNG and WEBP images are allowed."
            )

            return
        }


        if (
            file.size >
            5 * 1024 * 1024
        ) {

            setError(
                "Profile photo must be smaller than 5MB."
            )

            return
        }


        try {

            setUploadingPhoto(true)
            setError("")


            const {
                data: {
                    session,
                },
            } = await supabase.auth.getSession()


            if (!session?.access_token) {
                throw new Error(
                    "Authentication session not found."
                )
            }


            const formData =
                new FormData()


            formData.append(
                "photo",
                file
            )


            const response =
                await fetch(
                    `${API_BASE_URL}/api/profile/me/photo`,
                    {
                        method: "POST",

                        headers: {
                            Authorization:
                                `Bearer ${session.access_token}`,
                        },

                        body: formData,
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
                    "Failed to upload profile photo."
                )
            }


            const avatar =
                result.data?.avatar


            if (avatar) {

                setProfile((prev) => ({
                    ...prev,
                    avatar,
                }))

            }

        } catch (error) {

            console.error(
                "Profile photo upload error:",
                error
            )

            setError(
                error.message ||
                "Failed to upload profile photo."
            )

        } finally {

            setUploadingPhoto(false)

        }
    }


    /* ========================================================= */
    /* PROFILE PHOTO REMOVE                                      */
    /* ========================================================= */

    const handleRemovePhoto = async () => {
        if (!profile?.avatar) return

        if (!window.confirm("Remove your profile photo?")) {
            return
        }

        try {
            setUploadingPhoto(true)
            setError("")

            const {
                data: { session },
            } = await supabase.auth.getSession()

            if (!session?.access_token) {
                throw new Error("Authentication session not found.")
            }

            const response = await fetch(
                `${API_BASE_URL}/api/profile/me/photo`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                    },
                }
            )

            const result = await response.json()

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Failed to remove profile photo."
                )
            }

            setProfile((prev) => ({
                ...prev,
                avatar: null,
            }))
        } catch (error) {
            console.error("Profile photo remove error:", error)
            setError(error.message || "Failed to remove profile photo.")
        } finally {
            setUploadingPhoto(false)
        }
    }


    /* ========================================================= */
    /* CODING PLATFORM CONNECT / DISCONNECT                      */
    /* ========================================================= */

    const closePlatformModal = () => {
        if (platformSaving) return

        setPlatformModal(null)
        setPlatformUsername("")
        setPlatformVerification(null)
    }

    const handlePlatformDisconnect = async (platformId) => {
        if (!window.confirm(`Disconnect your ${platformId} account?`)) {
            return
        }

        try {
            setPlatformAction(platformId)
            setError("")

            const {
                data: { session },
            } = await supabase.auth.getSession()

            if (!session?.access_token) {
                throw new Error("Authentication session not found.")
            }

            const response = await fetch(
                `${API_BASE_URL}/api/profile/me/platform/${platformId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                    },
                }
            )

            const result = await response.json()

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || result.error ||
                    "Failed to disconnect platform."
                )
            }

            await fetchProfile()
        } catch (error) {
            console.error("Platform disconnect error:", error)
            setError(error.message || "Failed to disconnect platform.")
        } finally {
            setPlatformAction("")
        }
    }

    const handlePlatformConnect = async (platform) => {
        try {
            setError("")

            const {
                data: { session },
            } = await supabase.auth.getSession()

            if (!session?.access_token) {
                throw new Error("Authentication session not found.")
            }

            if (platform.id === "GITHUB") {
                const response = await fetch(
                    `${API_BASE_URL}/api/verification/github/start`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    }
                )

                const result = await response.json()

                if (!response.ok || !result.authorizationUrl) {
                    throw new Error(
                        result.error || "Unable to start GitHub connection."
                    )
                }

                const popup = window.open(
                    result.authorizationUrl,
                    "codesync-github",
                    "width=600,height=700,resizable=yes,scrollbars=yes"
                )

                if (!popup) {
                    throw new Error("Please allow popups to connect GitHub.")
                }

                const startedAt = Date.now()
                const timer = setInterval(async () => {
                    if (popup.closed || Date.now() - startedAt > 120000) {
                        clearInterval(timer)
                        await fetchProfile()
                        return
                    }

                    try {
                        const profileResponse = await fetch(
                            `${API_BASE_URL}/api/profile/me`,
                            {
                                headers: {
                                    Authorization: `Bearer ${session.access_token}`,
                                },
                            }
                        )

                        const profileResult = await profileResponse.json()
                        const github =
                            profileResult?.data?.platforms?.GITHUB

                        if (github?.username) {
                            clearInterval(timer)
                            if (!popup.closed) popup.close()
                            setProfile((prev) => ({
                                ...prev,
                                platforms: profileResult.data.platforms || {},
                            }))
                        }
                    } catch {
                        // Keep polling until timeout or popup close.
                    }
                }, 2000)

                return
            }

            setPlatformModal(platform)
            setPlatformUsername("")
            setPlatformVerification(null)
        } catch (error) {
            console.error("Platform connect error:", error)
            setError(error.message || "Failed to connect platform.")
        }
    }

    const startPlatformVerification = async (event) => {
        event.preventDefault()

        if (!platformModal || !platformUsername.trim()) return

        try {
            setPlatformSaving(true)
            setError("")

            const {
                data: { session },
            } = await supabase.auth.getSession()

            if (!session?.access_token) {
                throw new Error("Authentication session not found.")
            }

            const response = await fetch(
                `${API_BASE_URL}/api/verification/${platformModal.id.toLowerCase()}/start`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({
                        username: platformUsername.trim(),
                    }),
                }
            )

            const result = await response.json()

            if (!response.ok || !result.success) {
                throw new Error(
                    result.error || "Unable to start verification."
                )
            }

            setPlatformVerification({
                code: result.verificationCode,
                instructions: result.instructions,
            })
        } catch (error) {
            console.error("Platform verification start error:", error)
            setError(error.message || "Unable to start verification.")
        } finally {
            setPlatformSaving(false)
        }
    }

    const verifyPlatformConnection = async () => {
        if (!platformModal) return

        try {
            setPlatformSaving(true)
            setError("")

            const {
                data: { session },
            } = await supabase.auth.getSession()

            if (!session?.access_token) {
                throw new Error("Authentication session not found.")
            }

            const response = await fetch(
                `${API_BASE_URL}/api/verification/${platformModal.id.toLowerCase()}/verify`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                    },
                }
            )

            const result = await response.json()

            if (!response.ok || result.status !== "VERIFIED") {
                throw new Error(
                    result.error || "Verification failed. Please try again."
                )
            }

            closePlatformModal()
            await fetchProfile()
        } catch (error) {
            console.error("Platform verification error:", error)
            setError(error.message || "Verification failed.")
        } finally {
            setPlatformSaving(false)
        }
    }


    /* ========================================================= */
    /* SOCIAL CONNECT                                            */
    /* ========================================================= */

    const openSocialConnect = (
        platform
    ) => {

        setConnectModal(
            platform
        )


        const key =
            normalizeSocial(
                platform.id
            )


        setConnectValue(
            socialAccounts[key]
                ?.username ||
            ""
        )
    }


    const closeSocialModal = () => {

        if (savingSocial) {
            return
        }


        setConnectModal(null)
        setConnectValue("")
    }


    const saveSocialConnection = async (
        event
    ) => {

        event.preventDefault()


        if (!connectModal) {
            return
        }


        const username =
            connectValue
                .trim()
                .replace(/^@/, "")


        if (!username) {
            return
        }


        try {

            setSavingSocial(true)
            setError("")


            const {
                data: {
                    session,
                },
            } = await supabase.auth.getSession()


            if (!session?.access_token) {
                throw new Error(
                    "Authentication session not found."
                )
            }


            const response =
                await fetch(
                    `${API_BASE_URL}/api/profile/me/social`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${session.access_token}`,
                        },

                        body: JSON.stringify({
                            platform:
                                connectModal.id,

                            username,
                        }),
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
                    "Failed to save social account."
                )
            }


            setSocialAccounts(
                result.data?.social ||
                {}
            )


            setConnectModal(null)
            setConnectValue("")

        } catch (error) {

            console.error(
                "Social account error:",
                error
            )

            setError(
                error.message ||
                "Failed to save social account."
            )

        } finally {

            setSavingSocial(false)

        }
    }


    const disconnectSocial = async (
        platformId
    ) => {

        try {

            const {
                data: {
                    session,
                },
            } = await supabase.auth.getSession()


            if (!session?.access_token) {
                throw new Error(
                    "Authentication session not found."
                )
            }


            const response =
                await fetch(
                    `${API_BASE_URL}/api/profile/me/social/${platformId}`,
                    {
                        method: "DELETE",

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
                    "Failed to remove social account."
                )
            }


            setSocialAccounts(
                result.data?.social ||
                {}
            )

        } catch (error) {

            console.error(
                "Remove social account error:",
                error
            )

            setError(
                error.message ||
                "Failed to remove social account."
            )
        }
    }


    /* ========================================================= */
    /* LOADING                                                    */
    /* ========================================================= */

    if (loading) {
        return <ProfileLoading />
    }


    /* ========================================================= */
    /* ERROR                                                      */
    /* ========================================================= */

    if (error && !profile) {

        return (
            <div className="min-h-[calc(100vh-72px)] bg-background px-4 py-5 text-foreground sm:px-6 lg:px-7">

                <div className="mx-auto flex min-h-[500px] max-w-[1400px] items-center justify-center">

                    <div className="w-full max-w-md rounded-2xl border border-red-400/20 bg-card p-7 text-center">

                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-400/10 text-red-400">
                            <AlertCircle size={22} />
                        </div>


                        <h2 className="mt-4 text-lg font-bold">
                            Unable to load profile
                        </h2>


                        <p className="mt-2 text-sm text-muted-foreground">
                            {error}
                        </p>


                        <button
                            type="button"
                            onClick={fetchProfile}
                            className="mt-5 h-10 rounded-xl bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
                        >
                            Try Again
                        </button>

                    </div>

                </div>

            </div>
        )
    }


    if (!profile) {
        return null
    }


    /* ========================================================= */
    /* PLATFORM CONFIG                                           */
    /* ========================================================= */

    const platformConfig = [
        {
            id: "LEETCODE",
            name: "LeetCode",
            icon: Code2,
            iconClass: "text-amber-400",
            bgClass: "bg-amber-400/10",
            buildUrl: (username) =>
                `https://leetcode.com/${username}/`,
        },

        {
            id: "CODEFORCES",
            name: "Codeforces",
            icon: Trophy,
            iconClass: "text-blue-400",
            bgClass: "bg-blue-400/10",
            buildUrl: (username) =>
                `https://codeforces.com/profile/${username}`,
        },

        {
            id: "GFG",
            name: "GeeksforGeeks",
            icon: Code2,
            iconClass: "text-emerald-400",
            bgClass: "bg-emerald-400/10",
            buildUrl: (username) =>
                `https://www.geeksforgeeks.org/user/${username}/`,
        },

        {
            id: "GITHUB",
            name: "GitHub",
            icon: Code2,
            iconClass: "text-slate-200",
            bgClass: "bg-slate-400/10",
            buildUrl: (username) =>
                `https://github.com/${username}`,
        },
    ]


    const socialPlatforms = [
        {
            id: "LINKEDIN",
            name: "LinkedIn",
            icon: BriefcaseBusiness,
            iconClass: "text-blue-400",
            bgClass: "bg-blue-400/10",
            placeholder:
                "linkedin username",
        },

        {
            id: "X",
            name: "Twitter / X",
            icon: AtSign,
            iconClass: "text-slate-200",
            bgClass: "bg-slate-400/10",
            placeholder:
                "x username",
        },

        {
            id: "INSTAGRAM",
            name: "Instagram",
            icon: Globe2,
            iconClass: "text-pink-400",
            bgClass: "bg-pink-400/10",
            placeholder:
                "instagram username",
        },

        {
            id: "YOUTUBE",
            name: "YouTube",
            icon: Code2,
            iconClass: "text-red-400",
            bgClass: "bg-red-400/10",
            placeholder:
                "channel username",
        },
    ]


    /* ========================================================= */
    /* RENDER                                                     */
    /* ========================================================= */

    return (
        <div className="min-h-[calc(100vh-72px)] bg-background px-4 py-5 text-foreground sm:px-6 lg:px-7">

            <div className="mx-auto max-w-[1400px]">


                {/* ================================================= */}
                {/* ERROR BANNER                                      */}
                {/* ================================================= */}

                {error && (
                    <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-400/20 bg-red-400/[0.05] px-4 py-3 text-sm text-red-300">

                        <AlertCircle size={16} />

                        <span>
                            {error}
                        </span>


                        <button
                            type="button"
                            onClick={() =>
                                setError("")
                            }
                            className="ml-auto text-red-300/70 hover:text-red-300"
                        >
                            <X size={15} />
                        </button>

                    </div>
                )}


                {/* ================================================= */}
                {/* PROFILE HEADER                                    */}
                {/* ================================================= */}

                <section className="relative mb-5 overflow-hidden rounded-2xl border border-border bg-card">

                    <div className="pointer-events-none absolute -left-20 -top-32 h-80 w-80 rounded-full bg-primary/[0.10] blur-[100px]" />

                    <div className="pointer-events-none absolute -bottom-40 right-0 h-80 w-80 rounded-full bg-violet-500/[0.06] blur-[100px]" />


                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.08]"
                        style={{
                            backgroundImage:
                                "linear-gradient(rgba(99,102,241,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.25) 1px, transparent 1px)",
                            backgroundSize:
                                "42px 42px",
                        }}
                    />


                    <div className="relative flex flex-col gap-7 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">


                        {/* PROFILE IDENTITY */}

                        <div className="flex items-center gap-5 sm:gap-7">

                            {/* AVATAR */}

                            <div className="relative shrink-0">

                                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-primary/60 bg-gradient-to-br from-indigo-500 to-violet-600 text-3xl font-extrabold text-white shadow-[0_0_45px_rgba(99,102,241,0.20)] sm:h-28 sm:w-28 sm:text-4xl">

                                    {profile.avatar ? (
                                        <img
                                            src={
                                                profile.avatar
                                            }
                                            alt={
                                                profile.name
                                            }
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        getInitials(
                                            profile.name
                                        )
                                    )}

                                </div>


                                <button
                                    type="button"
                                    onClick={
                                        openEditProfile
                                    }
                                    className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-primary text-white shadow-lg transition-all hover:bg-indigo-500"
                                    title="Edit profile"
                                >
                                    <Pencil size={13} />
                                </button>

                            </div>


                            {/* DETAILS */}

                            <div className="min-w-0">

                                <div className="flex flex-wrap items-center gap-3">

                                    <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                                        {profile.name}
                                    </h1>


                                    <span className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-primary">

                                        <ShieldCheck
                                            size={11}
                                        />

                                        Verified

                                    </span>

                                </div>


                                <p className="mt-1.5 flex items-center gap-1.5 font-mono text-sm text-muted-foreground">

                                    <AtSign size={14} />

                                    {profile.username}

                                </p>


                                {/* ONLY BRANCH */}
                                {profile.branch && (
                                    <div className="mt-5 flex flex-wrap items-center gap-2.5">

                                        <InfoBadge
                                            icon={
                                                Building2
                                            }
                                            text={
                                                profile.branch
                                            }
                                        />

                                    </div>
                                )}

                            </div>

                        </div>


                        {/* EDIT BUTTON */}

                        <button
                            type="button"
                            onClick={
                                openEditProfile
                            }
                            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-5 text-sm font-semibold text-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                        >

                            <Pencil size={15} />

                            Edit Profile

                        </button>

                    </div>

                </section>


                {/* ================================================= */}
                {/* OVERVIEW                                          */}
                {/* ================================================= */}

                <section className="mb-5 rounded-2xl border border-border bg-card p-5 sm:p-6">

                    <div className="mb-6">

                        <div className="flex items-center gap-3">

                            <div className="h-6 w-1 rounded-full bg-primary" />

                            <h2 className="text-lg font-bold">
                                Overview
                            </h2>

                        </div>


                        <p className="mt-1.5 text-sm text-muted-foreground">
                            Your coding journey at a glance
                        </p>

                    </div>


                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                        <OverviewCard
                            icon={Trophy}
                            iconClass="text-amber-400"
                            bgClass="bg-amber-400/10"
                            label="Global Rank"
                            value={
                                profile.rank
                                    ? `#${profile.rank}`
                                    : "—"
                            }
                            footer="CodeSync ranking"
                            footerClass="text-emerald-400"
                        />


                        <OverviewCard
                            icon={Zap}
                            iconClass="text-violet-400"
                            bgClass="bg-violet-400/10"
                            label="Score"
                            value={
                                profile.score ?? 0
                            }
                            footer="Leaderboard score"
                            footerClass="text-muted-foreground"
                        />


                        <OverviewCard
                            icon={Flame}
                            iconClass="text-orange-400"
                            bgClass="bg-orange-400/10"
                            label="Max Streak"
                            value={`${profile.maxStreak ?? 0} days`}
                            footer="All time"
                            footerClass="text-muted-foreground"
                        />


                        <OverviewCard
                            icon={Code2}
                            iconClass="text-cyan-400"
                            bgClass="bg-cyan-400/10"
                            label="Problems Solved"
                            value={
                                profile.solved ?? 0
                            }
                            footer={`Current streak: ${profile.currentStreak ?? 0} days`}
                            footerClass="text-emerald-400"
                        />

                    </div>

                </section>


                {/* ================================================= */}
                {/* CONNECTED CODING ACCOUNTS                       */}
                {/* ================================================= */}

                <section className="mb-5 rounded-2xl border border-border bg-card p-5 sm:p-6">

                    <SectionHeader
                        icon={Code2}
                        title="Connected Coding Accounts"
                        description="Your verified coding profiles"
                    />


                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                        {platformConfig.map(
                            (platform) => {

                                const Icon =
                                    platform.icon


                                const platformKey =
                                    normalizePlatform(
                                        platform.id
                                    )


                                const account =
                                    profile.platforms?.[
                                    platformKey
                                    ]


                                return (
                                    <CodingAccountCard
                                        key={
                                            platform.id
                                        }
                                        platform={
                                            platform
                                        }
                                        account={
                                            account
                                        }
                                        Icon={
                                            Icon
                                        }
                                        onConnect={() =>
                                            handlePlatformConnect(platform)
                                        }
                                        onDisconnect={() =>
                                            handlePlatformDisconnect(platform.id)
                                        }
                                        platformAction={platformAction}
                                    />
                                )
                            }
                        )}

                    </div>

                </section>


                {/* ================================================= */}
                {/* SOCIAL MEDIA                                      */}
                {/* ================================================= */}

                <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">

                    <SectionHeader
                        icon={Link2}
                        title="Social Media Connect"
                        description="Connect your social profiles — completely optional"
                        purple
                    />


                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                        {socialPlatforms.map(
                            (platform) => {

                                const Icon =
                                    platform.icon


                                const social =
                                    socialAccounts[
                                    normalizeSocial(
                                        platform.id
                                    )
                                    ]


                                const connected =
                                    Boolean(
                                        social?.username
                                    )


                                return (
                                    <SocialCard
                                        key={
                                            platform.id
                                        }
                                        platform={
                                            platform
                                        }
                                        Icon={
                                            Icon
                                        }
                                        username={
                                            social?.username
                                        }
                                        connected={
                                            connected
                                        }
                                        onConnect={() =>
                                            openSocialConnect(
                                                platform
                                            )
                                        }
                                        onDisconnect={() =>
                                            disconnectSocial(
                                                platform.id
                                            )
                                        }
                                    />
                                )
                            }
                        )}

                    </div>

                </section>


                {/* FOOTER */}

                <div className="py-8 text-center">

                    <p className="text-[10px] tracking-wide text-muted-foreground">

                        CodeSync

                        <span className="mx-2 opacity-40">
                            •
                        </span>

                        Track your journey. Build your future.

                    </p>

                </div>

            </div>


            {/* ===================================================== */}
            {/* EDIT PROFILE MODAL                                   */}
            {/* ===================================================== */}

            {editOpen && (

                <ModalOverlay
                    onClose={() => {

                        if (
                            !savingProfile &&
                            !uploadingPhoto
                        ) {
                            setEditOpen(false)
                        }

                    }}
                >

                    <form
                        onSubmit={
                            saveProfile
                        }
                        className="w-full max-w-[560px]"
                    >

                        <div className="flex items-start justify-between border-b border-border px-6 py-5">

                            <div>

                                <div className="flex items-center gap-2.5">

                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <Pencil size={16} />
                                    </div>


                                    <div>

                                        <h3 className="text-lg font-bold">
                                            Edit Profile
                                        </h3>

                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            Update your profile information
                                        </p>

                                    </div>

                                </div>

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    setEditOpen(false)
                                }
                                disabled={
                                    savingProfile ||
                                    uploadingPhoto
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <X size={17} />
                            </button>

                        </div>


                        <div className="space-y-6 p-6">


                            {/* PROFILE PHOTO */}

                            <div className="flex flex-col items-center">

                                <div className="relative">

                                    <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-primary/40 bg-gradient-to-br from-indigo-500 to-violet-600 text-3xl font-extrabold text-white shadow-[0_0_35px_rgba(99,102,241,0.20)]">

                                        {profile.avatar ? (
                                            <img
                                                src={
                                                    profile.avatar
                                                }
                                                alt="Profile"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            getInitials(
                                                profile.name
                                            )
                                        )}


                                        {uploadingPhoto && (
                                            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60">

                                                <Loader2
                                                    size={22}
                                                    className="animate-spin"
                                                />

                                            </div>
                                        )}

                                    </div>


                                    <label
                                        htmlFor="profile-photo"
                                        className={`absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0d131f] bg-primary text-white shadow-lg ${uploadingPhoto
                                            ? "cursor-not-allowed opacity-60"
                                            : "cursor-pointer hover:bg-indigo-500"
                                            }`}
                                    >

                                        <Camera size={13} />

                                    </label>


                                    {profile.avatar && (
                                        <button
                                            type="button"
                                            onClick={handleRemovePhoto}
                                            disabled={uploadingPhoto}
                                            className="absolute bottom-0 left-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0d131f] bg-red-500 text-white shadow-lg transition hover:bg-red-400 disabled:opacity-50"
                                            title="Remove photo"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    )}

                                    <input
                                        id="profile-photo"
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        className="hidden"
                                        disabled={
                                            uploadingPhoto
                                        }
                                        onChange={
                                            handlePhotoUpload
                                        }
                                    />

                                </div>


                                <p className="mt-3 text-xs font-medium text-foreground">
                                    Profile Photo
                                </p>


                                <p className="mt-1 text-[10px] text-muted-foreground">
                                    JPG, PNG or WEBP · Max 5MB
                                </p>

                            </div>


                            {/* EDITABLE */}

                            <div>

                                <div className="mb-3 flex items-center gap-2">

                                    <div className="h-4 w-1 rounded-full bg-primary" />

                                    <p className="text-xs font-bold uppercase tracking-wider text-foreground">
                                        Editable Information
                                    </p>

                                </div>


                                <div className="rounded-xl border border-primary/20 bg-primary/[0.025] p-4">

                                    <ModalInput
                                        label="Full Name"
                                        name="name"
                                        value={
                                            editForm.name
                                        }
                                        onChange={
                                            handleProfileChange
                                        }
                                        icon={User}
                                        editable
                                    />

                                </div>

                            </div>


                            {/* ACCOUNT */}

                            <div>

                                <div className="mb-3 flex items-center gap-2">

                                    <div className="h-4 w-1 rounded-full bg-slate-600" />

                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        Account Information
                                    </p>

                                </div>


                                <div className="space-y-3">

                                    <ModalInput
                                        label="Username"
                                        value={
                                            profile.username
                                        }
                                        icon={
                                            AtSign
                                        }
                                        disabled
                                    />


                                    <ModalInput
                                        label="Email"
                                        value={
                                            email ||
                                            "Protected account email"
                                        }
                                        icon={
                                            Globe2
                                        }
                                        disabled
                                    />

                                </div>

                            </div>


                            {/* INSTITUTE */}

                            <div>

                                <div className="mb-3 flex items-center gap-2">

                                    <div className="h-4 w-1 rounded-full bg-slate-600" />

                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        Institute Information
                                    </p>

                                </div>


                                <ModalInput
                                    label="Branch"
                                    value={
                                        profile.branch ||
                                        "—"
                                    }
                                    icon={
                                        Building2
                                    }
                                    disabled
                                />

                            </div>


                            {/* NOTICE */}

                            <div className="flex items-start gap-3 rounded-xl border border-border bg-secondary/50 p-3.5">

                                <ShieldCheck
                                    size={16}
                                    className="mt-0.5 shrink-0 text-primary"
                                />


                                <div>

                                    <p className="text-xs font-semibold text-foreground">
                                        Account details are protected
                                    </p>


                                    <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                                        Username, email and institute information are managed through your CodeSync account.
                                    </p>

                                </div>

                            </div>


                            {/* ACTIONS */}

                            <div className="flex gap-3 border-t border-border pt-5">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setEditOpen(false)
                                    }
                                    disabled={
                                        savingProfile ||
                                        uploadingPhoto
                                    }
                                    className="h-11 flex-1 rounded-xl border border-border bg-secondary text-sm font-semibold text-muted-foreground transition-all hover:border-slate-600 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    disabled={
                                        savingProfile ||
                                        uploadingPhoto ||
                                        !editForm.name.trim()
                                    }
                                    className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white shadow-[0_8px_25px_rgba(99,102,241,0.18)] transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                                >

                                    {savingProfile ? (
                                        <>
                                            <Loader2
                                                size={15}
                                                className="animate-spin"
                                            />

                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={15} />

                                            Save Changes
                                        </>
                                    )}

                                </button>

                            </div>

                        </div>

                    </form>

                </ModalOverlay>
            )}


            {/* ===================================================== */}
            {/* CODING PLATFORM CONNECT MODAL                        */}
            {/* ===================================================== */}

            {platformModal && (
                <ModalOverlay onClose={closePlatformModal}>
                    <div className="w-full">
                        <ModalHeader
                            title={`Connect ${platformModal.name}`}
                            description={
                                platformVerification
                                    ? "Complete the verification steps, then verify your account."
                                    : `Connect your ${platformModal.name} account to CodeSync.`
                            }
                            onClose={closePlatformModal}
                        />

                        <div className="p-6">
                            {!platformVerification ? (
                                <form onSubmit={startPlatformVerification}>
                                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Username
                                    </label>

                                    <div className="flex h-12 items-center rounded-xl border border-border bg-[#101622] px-4">
                                        <span className="font-mono text-sm text-slate-500">@</span>
                                        <input
                                            autoFocus
                                            value={platformUsername}
                                            onChange={(event) =>
                                                setPlatformUsername(event.target.value)
                                            }
                                            disabled={platformSaving}
                                            placeholder={`${platformModal.name} username`}
                                            className="w-full bg-transparent px-2 text-sm text-foreground outline-none placeholder:text-slate-600"
                                        />
                                    </div>

                                    <div className="mt-6 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={closePlatformModal}
                                            disabled={platformSaving}
                                            className="h-11 flex-1 rounded-xl border border-border bg-secondary text-sm font-semibold text-muted-foreground hover:text-foreground disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={platformSaving || !platformUsername.trim()}
                                            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                                        >
                                            {platformSaving ? (
                                                <Loader2 size={15} className="animate-spin" />
                                            ) : (
                                                "Generate Code"
                                            )}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div>
                                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center">
                                        <p className="text-xs font-semibold text-muted-foreground">
                                            Verification Code
                                        </p>
                                        <p className="mt-2 font-mono text-2xl font-extrabold tracking-[0.2em] text-primary">
                                            {platformVerification.code}
                                        </p>
                                    </div>

                                    <p className="mt-4 text-sm leading-6 text-muted-foreground">
                                        {platformVerification.instructions}
                                    </p>

                                    <div className="mt-6 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={closePlatformModal}
                                            disabled={platformSaving}
                                            className="h-11 flex-1 rounded-xl border border-border bg-secondary text-sm font-semibold text-muted-foreground hover:text-foreground disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="button"
                                            onClick={verifyPlatformConnection}
                                            disabled={platformSaving}
                                            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                                        >
                                            {platformSaving ? (
                                                <Loader2 size={15} className="animate-spin" />
                                            ) : (
                                                <ShieldCheck size={15} />
                                            )}
                                            Verify Account
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </ModalOverlay>
            )}

            {/* ===================================================== */}
            {/* SOCIAL MODAL                                         */}
            {/* ===================================================== */}

            {connectModal && (

                <ModalOverlay
                    onClose={
                        closeSocialModal
                    }
                >

                    <form
                        onSubmit={saveSocialConnection}
                        className="w-full"
                    >

                        <ModalHeader
                            title={`Connect ${connectModal.name}`}
                            description={`Add your ${connectModal.name} profile to CodeSync.`}
                            onClose={
                                closeSocialModal
                            }
                        />


                        <div className="p-6">

                            <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Username
                            </label>


                            <div className="flex h-12 items-center gap-2 rounded-xl border border-border bg-[#101622] px-4 focus-within:border-primary/50">

                                <span className="font-mono text-sm text-slate-500">
                                    @
                                </span>


                                <input
                                    autoFocus
                                    type="text"
                                    value={
                                        connectValue
                                    }
                                    onChange={(event) =>
                                        setConnectValue(
                                            event.target.value
                                        )
                                    }
                                    placeholder={
                                        connectModal.placeholder
                                    }
                                    disabled={
                                        savingSocial
                                    }
                                    className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-slate-600"
                                />

                            </div>


                            <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">

                                <ShieldCheck
                                    size={13}
                                    className="text-emerald-400"
                                />

                                Your social profile is optional.

                            </p>


                            <div className="mt-6 flex gap-3">

                                <button
                                    type="button"
                                    onClick={
                                        closeSocialModal
                                    }
                                    disabled={
                                        savingSocial
                                    }
                                    className="h-11 flex-1 rounded-xl border border-border bg-secondary text-sm font-semibold text-muted-foreground hover:text-foreground disabled:opacity-50"
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    disabled={
                                        savingSocial ||
                                        !connectValue.trim()
                                    }
                                    className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground"
                                >

                                    {savingSocial ? (
                                        <>
                                            <Loader2
                                                size={15}
                                                className="animate-spin"
                                            />

                                            Saving...
                                        </>
                                    ) : (
                                        "Connect"
                                    )}

                                </button>

                            </div>

                        </div>

                    </form>

                </ModalOverlay>
            )}

        </div>
    )
}


/* ============================================================= */
/* INFO BADGE                                                    */
/* ============================================================= */

function InfoBadge({
    icon: Icon,
    text,
}) {
    return (
        <span className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-3.5 py-2 text-xs font-semibold text-muted-foreground">

            <Icon size={14} />

            {text}

        </span>
    )
}


/* ============================================================= */
/* SECTION HEADER                                                */
/* ============================================================= */

function SectionHeader({
    icon: Icon,
    title,
    description,
    purple = false,
}) {
    return (
        <div className="flex items-center gap-3">

            <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${purple
                    ? "bg-violet-500/10 text-violet-400"
                    : "bg-primary/10 text-primary"
                    }`}
            >
                <Icon size={19} />
            </div>


            <div>

                <h2 className="text-lg font-bold">
                    {title}
                </h2>


                <p className="mt-0.5 text-sm text-muted-foreground">
                    {description}
                </p>

            </div>

        </div>
    )
}


/* ============================================================= */
/* OVERVIEW CARD                                                 */
/* ============================================================= */

function OverviewCard({
    icon: Icon,
    iconClass,
    bgClass,
    label,
    value,
    footer,
    footerClass,
}) {
    return (
        <div className="group rounded-xl border border-border bg-[#0d131f] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20">

            <div className="flex items-start justify-between">

                <div>

                    <p className="text-sm font-medium text-muted-foreground">
                        {label}
                    </p>


                    <p className="mt-2.5 text-2xl font-extrabold tracking-tight">
                        {value}
                    </p>

                </div>


                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${bgClass} ${iconClass}`}
                >
                    <Icon size={20} />
                </div>

            </div>


            <p
                className={`mt-4 text-xs font-semibold ${footerClass}`}
            >
                {footer}
            </p>

        </div>
    )
}


/* ============================================================= */
/* CODING ACCOUNT CARD                                          */
/* ============================================================= */

function CodingAccountCard({
    platform,
    account,
    Icon,
    onConnect,
    onDisconnect,
    platformAction,
}) {
    const connected = Boolean(account?.username)

    return (
        <div className="rounded-xl border border-border bg-[#0d131f] p-5 transition-all duration-200 hover:border-primary/25">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${platform.bgClass} ${platform.iconClass}`}>
                        <Icon size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-bold">{platform.name}</p>
                        <div className="mt-1.5 flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${connected ? "bg-emerald-400" : "bg-slate-600"}`} />
                            <span className={`text-xs font-medium ${connected ? "text-emerald-400" : "text-muted-foreground"}`}>
                                {connected ? "Connected" : "Not connected"}
                            </span>
                        </div>
                    </div>
                </div>

                {connected && <Check size={16} className="text-emerald-400" />}
            </div>

            {connected ? (
                <>
                    <div className="mt-5 flex items-center justify-between">
                        <span className="font-mono text-xs text-muted-foreground">
                            @{account.username}
                        </span>
                        <a
                            href={account.profileUrl || platform.buildUrl(account.username)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-muted-foreground transition-colors hover:text-foreground"
                            title={`Open ${platform.name}`}
                        >
                            <ExternalLink size={16} />
                        </a>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="rounded-lg border border-border bg-secondary/40 p-2.5">
                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                                {platform.id === "GITHUB" ? "Contributions" : "Solved"}
                            </p>
                            <p className="mt-1 text-sm font-bold">
                                {platform.id === "GITHUB" ? account.contributions ?? 0 : account.solved ?? 0}
                            </p>
                        </div>

                        {account.rating !== null && account.rating !== undefined && (
                            <div className="rounded-lg border border-border bg-secondary/40 p-2.5">
                                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Rating</p>
                                <p className="mt-1 text-sm font-bold">{account.rating}</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={onDisconnect}
                            disabled={platformAction === platform.id}
                            className="flex h-9 items-center justify-center gap-2 rounded-lg border border-red-400/20 bg-red-400/5 text-xs font-semibold text-red-400 transition hover:bg-red-400/10 disabled:opacity-50"
                        >
                            {platformAction === platform.id ? (
                                <Loader2 size={13} className="animate-spin" />
                            ) : (
                                <Trash2 size={13} />
                            )}
                            Disconnect
                        </button>

                        <button
                            type="button"
                            onClick={onConnect}
                            disabled={platformAction === platform.id}
                            className="flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-secondary text-xs font-semibold text-muted-foreground transition hover:border-primary/30 hover:text-primary disabled:opacity-50"
                        >
                            <Link2 size={13} />
                            Reconnect
                        </button>
                    </div>
                </>
            ) : (
                <button
                    type="button"
                    onClick={onConnect}
                    className="mt-5 flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-border bg-secondary text-xs font-semibold text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                >
                    <Link2 size={13} />
                    Connect
                </button>
            )}
        </div>
    )
}


/* ============================================================= */
/* SOCIAL CARD                                                   */
/* ============================================================= */

function SocialCard({
    platform,
    Icon,
    username,
    connected,
    onConnect,
    onDisconnect,
}) {

    return (
        <div
            className={`rounded-xl border p-5 transition-all ${connected
                ? "border-emerald-400/20 bg-emerald-400/[0.025]"
                : "border-border bg-[#0d131f]"
                }`}
        >

            <div className="flex items-center gap-3">

                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${platform.bgClass} ${platform.iconClass}`}
                >
                    <Icon size={20} />
                </div>


                <div>

                    <p className="text-sm font-bold">
                        {platform.name}
                    </p>


                    <div className="mt-1.5 flex items-center gap-2">

                        <span
                            className={`h-2 w-2 rounded-full ${connected
                                ? "bg-emerald-400"
                                : "bg-slate-600"
                                }`}
                        />


                        <span
                            className={`text-xs ${connected
                                ? "text-emerald-400"
                                : "text-muted-foreground"
                                }`}
                        >
                            {connected
                                ? "Connected"
                                : "Not connected"}
                        </span>

                    </div>

                </div>

            </div>


            {connected ? (

                <div className="mt-5 flex items-center justify-between">

                    <span className="font-mono text-xs text-muted-foreground">
                        @{username}
                    </span>


                    <button
                        type="button"
                        onClick={
                            onDisconnect
                        }
                        className="text-xs font-medium text-muted-foreground transition-colors hover:text-red-400"
                    >
                        Remove
                    </button>

                </div>

            ) : (

                <button
                    type="button"
                    onClick={
                        onConnect
                    }
                    className="mt-5 flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-border bg-secondary text-xs font-semibold text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                >

                    <Link2 size={13} />

                    Connect

                </button>

            )}

        </div>
    )
}


/* ============================================================= */
/* MODAL OVERLAY                                                 */
/* ============================================================= */

function ModalOverlay({
    children,
    onClose,
}) {
    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
            onMouseDown={onClose}
        >

            <div
                className="relative max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-2xl border border-border bg-[#0d131f] shadow-[0_30px_100px_rgba(0,0,0,0.6)]"
                onMouseDown={(event) =>
                    event.stopPropagation()
                }
            >
                {children}
            </div>

        </div>
    )
}


/* ============================================================= */
/* MODAL HEADER                                                  */
/* ============================================================= */

function ModalHeader({
    title,
    description,
    onClose,
}) {
    return (
        <div className="flex items-start justify-between border-b border-border p-6">

            <div>

                <h3 className="text-lg font-bold">
                    {title}
                </h3>


                <p className="mt-1.5 text-sm text-muted-foreground">
                    {description}
                </p>

            </div>


            <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
                <X size={16} />
            </button>

        </div>
    )
}


/* ============================================================= */
/* MODAL INPUT                                                   */
/* ============================================================= */

function ModalInput({
    label,
    name,
    value,
    onChange,
    icon: Icon,
    disabled = false,
    editable = false,
}) {
    return (
        <div>

            <div className="mb-2 flex items-center justify-between">

                <label
                    className={`text-[10px] font-bold uppercase tracking-wider ${disabled
                        ? "text-slate-500"
                        : "text-slate-400"
                        }`}
                >
                    {label}
                </label>


                {editable && (
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-primary">
                        Editable
                    </span>
                )}


                {disabled && (
                    <span className="text-[9px] text-slate-600">
                        Locked
                    </span>
                )}

            </div>


            <div
                className={`flex h-11 items-center gap-3 rounded-xl border px-3.5 ${disabled
                    ? "cursor-not-allowed border-border bg-[#0a0f18] opacity-60"
                    : "border-border bg-[#101622] focus-within:border-primary/50"
                    }`}
            >

                {Icon && (
                    <Icon
                        size={16}
                        className={
                            disabled
                                ? "shrink-0 text-slate-600"
                                : "shrink-0 text-slate-500"
                        }
                    />
                )}


                <input
                    type="text"
                    name={name}
                    value={value || ""}
                    onChange={onChange}
                    disabled={disabled}
                    className={`w-full bg-transparent text-sm outline-none ${disabled
                        ? "cursor-not-allowed text-slate-500"
                        : "text-foreground"
                        }`}
                />


                {disabled && (
                    <ShieldCheck
                        size={14}
                        className="shrink-0 text-slate-600"
                    />
                )}

            </div>

        </div>
    )
}


export default StudentProfile