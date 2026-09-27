import { useEffect, useRef, useState } from "react"
import {
    Code2,
    User,
    LockKeyhole,
    Eye,
    EyeOff,
    Check,
    ArrowRight,
    ShieldCheck,
    ExternalLink,
    GitBranch,
    Trophy,
    Copy,
    RefreshCw,
    X,
} from "lucide-react"
import { supabase } from "../lib/supabase"

const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5001"

const platformMap = {
    leetcode: "leetcode",
    codeforces: "codeforces",
    gfg: "gfg",
}

function ProfileSetup({ onComplete }) {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false)

    const githubPollRef = useRef(null)

    const [formData, setFormData] = useState({
        username: "",
        password: "",
        confirmPassword: "",
        leetcode: "",
        codeforces: "",
        gfg: "",
        github: "",
    })

    const [verification, setVerification] = useState({
        leetcode: {
            status: "idle",
            code: "",
        },
        codeforces: {
            status: "idle",
            code: "",
        },
        gfg: {
            status: "idle",
            code: "",
        },
        github: {
            status: "idle",
            code: "",
        },
    })

    useEffect(() => {
        return () => {
            if (githubPollRef.current) {
                clearInterval(githubPollRef.current)
            }
        }
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const getAccessToken = async () => {
        const {
            data: { session },
            error,
        } = await supabase.auth.getSession()

        if (error || !session?.access_token) {
            alert("Your session has expired. Please login again.")
            return null
        }

        return session.access_token
    }

    const handleVerifyClick = async (platform) => {
        const username = formData[platform]?.trim()

        if (!username) {
            return
        }

        const token = await getAccessToken()

        if (!token) {
            return
        }

        try {
            setVerification((prev) => ({
                ...prev,
                [platform]: {
                    ...prev[platform],
                    status: "loading",
                    code: "",
                },
            }))

            const response = await fetch(
                `${API_BASE_URL}/api/verification/${platformMap[platform]}/start`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        username,
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    data.message ||
                    "Unable to start verification."
                )
            }

            if (!data.verificationCode) {
                throw new Error(
                    "Verification code was not generated."
                )
            }

            setVerification((prev) => ({
                ...prev,
                [platform]: {
                    status: "pending",
                    code: data.verificationCode,
                },
            }))
        } catch (error) {
            console.error(
                `${platform} verification start error:`,
                error
            )

            setVerification((prev) => ({
                ...prev,
                [platform]: {
                    status: "idle",
                    code: "",
                },
            }))

            alert(error.message)
        }
    }

    const handleVerifyAccount = async (platform) => {
        const token = await getAccessToken()

        if (!token) {
            return
        }

        try {
            setVerification((prev) => ({
                ...prev,
                [platform]: {
                    ...prev[platform],
                    status: "loading",
                },
            }))

            const response = await fetch(
                `${API_BASE_URL}/api/verification/${platformMap[platform]}/verify`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({}),
                }
            )

            const data = await response.json()

            if (!response.ok || data.success !== true) {
                throw new Error(
                    data.error ||
                    data.message ||
                    "Verification failed."
                )
            }

            if (data.status !== "VERIFIED") {
                throw new Error(
                    "Account could not be verified."
                )
            }

            setVerification((prev) => ({
                ...prev,
                [platform]: {
                    status: "verified",
                    code: "",
                },
            }))
        } catch (error) {
            console.error(
                `${platform} verification error:`,
                error
            )

            setVerification((prev) => ({
                ...prev,
                [platform]: {
                    ...prev[platform],
                    status: "pending",
                },
            }))

            alert(error.message)
        }
    }

    const handleDisconnect = (platform) => {
        if (
            platform === "github" &&
            githubPollRef.current
        ) {
            clearInterval(githubPollRef.current)
            githubPollRef.current = null
        }

        setVerification((prev) => ({
            ...prev,
            [platform]: {
                status: "idle",
                code: "",
            },
        }))

        if (platform !== "github") {
            setFormData((prev) => ({
                ...prev,
                [platform]: "",
            }))
        }
    }

    const checkGithubVerification = async (userId) => {
        const {
            data,
            error,
        } = await supabase
            .from("platform_accounts")
            .select("username, verification_status")
            .eq("user_id", userId)
            .eq("platform", "GITHUB")
            .maybeSingle()

        if (error) {
            console.error(
                "GitHub verification check error:",
                error
            )

            return false
        }

        if (
            data?.verification_status === "VERIFIED"
        ) {
            setFormData((prev) => ({
                ...prev,
                github: data.username || "",
            }))

            setVerification((prev) => ({
                ...prev,
                github: {
                    status: "verified",
                    code: "",
                },
            }))

            return true
        }

        return false
    }

    const handleGithubConnect = async () => {
        try {
            const token = await getAccessToken()

            if (!token) {
                return
            }

            const response = await fetch(
                `${API_BASE_URL}/api/verification/github/start`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Unable to start GitHub verification."
                )
            }

            const popup = window.open(
                data.authorizationUrl,
                "githubOAuth",
                "width=600,height=700"
            )

            if (!popup) {
                alert(
                    "Popup was blocked. Please allow popups for CodeSync."
                )
                return
            }

            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) {
                return
            }

            const pollInterval = setInterval(async () => {
                try {
                    const verified =
                        await checkGithubVerification(user.id)

                    if (verified) {
                        clearInterval(pollInterval)
                        setGithubConnected(true)
                        setGithubVerified(true)
                    }
                } catch (error) {
                    console.error(
                        "GitHub verification check error:",
                        error
                    )
                }
            }, 2000)

            setTimeout(() => {
                clearInterval(pollInterval)
            }, 120000)
        } catch (error) {
            console.error(
                "GitHub connect error:",
                error
            )

            alert(
                error.message ||
                "Unable to connect GitHub."
            )
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match.")
            return
        }

        if (formData.password.length < 8) {
            alert("Password must be at least 8 characters.")
            return
        }

        if (formData.username.trim().length < 3) {
            alert("Username must be at least 3 characters.")
            return
        }

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
            alert("Your session has expired. Please login again.")
            return
        }

        const platformNames = {
            leetcode: "LeetCode",
            codeforces: "Codeforces",
            gfg: "GeeksforGeeks",
            github: "GitHub",
        }

        const platforms = [
            "leetcode",
            "codeforces",
            "gfg",
            "github",
        ]

        for (const platform of platforms) {
            const username =
                formData[platform]?.trim()

            if (
                username &&
                verification[platform].status !== "verified"
            ) {
                alert(
                    `${platformNames[platform]} account is not verified. Please verify it or remove the username.`
                )

                return
            }
        }

        if (
            Object.values(verification).some(
                (item) => item.status === "loading"
            )
        ) {
            alert(
                "Please wait for account verification to finish."
            )

            return
        }

        // -----------------------------------------
        // Get name from Google/Supabase metadata
        // -----------------------------------------

        const metadata = user.user_metadata || {}

        const fullName =
            metadata.full_name ||
            metadata.fullName ||
            metadata.name ||
            user.email?.split("@")[0] ||
            "Student"

        // -----------------------------------------
        // Update password
        // -----------------------------------------

        const { error: passwordError } =
            await supabase.auth.updateUser({
                password: formData.password,
            })

        if (passwordError) {
            alert(passwordError.message)
            return
        }

        // -----------------------------------------
        // Create/update student profile
        // -----------------------------------------

        const { error: studentProfileError } =
            await supabase
                .from("student_profiles")
                .upsert(
                    {
                        user_id: user.id,
                        full_name: fullName,
                        branch: "CSE",
                    },
                    {
                        onConflict: "user_id",
                    }
                )

        if (studentProfileError) {
            console.error(
                "Student profile save error:",
                studentProfileError
            )

            alert(
                studentProfileError.message ||
                "Failed to save student profile."
            )

            return
        }

        // -----------------------------------------
        // Update public.users
        // -----------------------------------------

        const { error: profileError } =
            await supabase
                .from("users")
                .update({
                    username:
                        formData.username.trim(),
                    profile_setup_completed: true,
                })
                .eq("id", user.id)

        if (profileError) {
            console.error(
                "Profile update error:",
                profileError
            )

            alert(profileError.message)
            return
        }

        // -----------------------------------------
        // FIRST PLATFORM SYNC
        // -----------------------------------------

        try {
            const {
                data: {
                    session,
                },
            } =
                await supabase.auth.getSession()

            if (session?.access_token) {
                fetch(
                    `${API_BASE_URL}/api/platform-sync/first-sync`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                            Authorization:
                                `Bearer ${session.access_token}`,
                        },
                    }
                ).catch((error) => {
                    console.error(
                        "Initial platform sync request failed:",
                        error
                    )
                })
            } else {
                console.warn(
                    "No active session found. Initial sync was not triggered."
                )
            }
        } catch (error) {
            console.error(
                "Initial platform sync trigger error:",
                error
            )
        }

        // -----------------------------------------
        // Complete Setup
        // -----------------------------------------

        alert(
            "Account setup completed successfully."
        )

        if (onComplete) {
            onComplete()
        }
    }

    const verifiedCount = Object.values(
        verification
    ).filter(
        (platform) =>
            platform.status === "verified"
    ).length

    return (
        <div className="min-h-screen overflow-hidden bg-[#070b14] text-foreground">
            <div className="relative min-h-screen">

                {/* Background Grid */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.12]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(99,102,241,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.18) 1px, transparent 1px)",
                        backgroundSize: "48px 48px",
                    }}
                />

                {/* Background Glow */}
                <div className="pointer-events-none absolute left-[-180px] top-[-180px] h-[500px] w-[500px] rounded-full bg-indigo-600/[0.10] blur-[130px]" />

                <div className="pointer-events-none absolute bottom-[-200px] right-[-120px] h-[500px] w-[500px] rounded-full bg-violet-600/[0.10] blur-[130px]" />

                {/* Main */}
                <div className="relative mx-auto flex min-h-screen max-w-[1050px] items-center justify-center px-5 py-10">
                    <div className="w-full">

                        {/* Brand */}
                        <div className="mb-7 text-center">
                            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white shadow-[0_0_30px_rgba(99,102,241,0.25)]">
                                <Code2 size={21} />
                            </div>

                            <h1 className="mt-3 text-xl font-bold">
                                Code
                                <span className="text-primary">
                                    Sync
                                </span>
                            </h1>

                            <p className="mt-1 text-[10px] text-muted-foreground">
                                YOUR CODING JOURNEY
                            </p>
                        </div>

                        {/* Card */}
                        <div className="relative overflow-hidden rounded-[24px] border border-indigo-400/25 bg-[#0b101b]/95 p-6 shadow-[0_25px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8">

                            <div className="pointer-events-none absolute left-1/2 top-[-180px] h-[300px] w-[450px] -translate-x-1/2 rounded-full bg-primary/[0.08] blur-[100px]" />

                            <div className="relative">

                                {/* Header */}
                                <div className="mb-8 flex flex-col items-center text-center">
                                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.06] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-violet-400">
                                        <ShieldCheck size={12} />
                                        One-time setup
                                    </div>

                                    <h2 className="text-[28px] font-bold tracking-tight">
                                        Complete your profile
                                    </h2>

                                    <p className="mt-2 max-w-[560px] text-xs leading-5 text-muted-foreground">
                                        Create your CodeSync identity and
                                        verify the coding accounts you want
                                        to connect.
                                    </p>
                                </div>

                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-7"
                                >

                                    {/* ACCOUNT */}
                                    <section>
                                        <SectionTitle
                                            number="01"
                                            title="Create your CodeSync account"
                                            description="This username and password will be used for future logins."
                                        />

                                        <div className="mt-4 grid gap-4 md:grid-cols-2">

                                            <InputField
                                                label="Username"
                                                icon={User}
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                placeholder="your_username"
                                                prefix="@"
                                            />

                                            <PasswordField
                                                label="Create Password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="Create a password"
                                                showPassword={showPassword}
                                                setShowPassword={
                                                    setShowPassword
                                                }
                                            />

                                            <div className="md:col-span-2">
                                                <PasswordField
                                                    label="Confirm Password"
                                                    name="confirmPassword"
                                                    value={
                                                        formData.confirmPassword
                                                    }
                                                    onChange={handleChange}
                                                    placeholder="Confirm your password"
                                                    showPassword={
                                                        showConfirmPassword
                                                    }
                                                    setShowPassword={
                                                        setShowConfirmPassword
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </section>

                                    {/* PLATFORMS */}
                                    <section>
                                        <div className="flex items-start justify-between gap-4">
                                            <SectionTitle
                                                number="02"
                                                title="Verify your coding accounts"
                                                description="Connect accounts you own to sync your coding activity."
                                            />

                                            <div className="shrink-0 rounded-lg border border-border bg-secondary px-3 py-1.5">
                                                <span className="font-mono text-[9px] text-muted-foreground">
                                                    {verifiedCount}/4 verified
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid gap-3 md:grid-cols-2">

                                            <PlatformCard
                                                name="LeetCode"
                                                label="LeetCode username"
                                                placeholder="leetcode_username"
                                                icon={Code2}
                                                iconClass="text-amber-400"
                                                value={
                                                    formData.leetcode
                                                }
                                                onChange={handleChange}
                                                inputName="leetcode"
                                                verification={
                                                    verification.leetcode
                                                }
                                                onVerify={() =>
                                                    handleVerifyClick(
                                                        "leetcode"
                                                    )
                                                }
                                                onVerified={() =>
                                                    handleVerifyAccount(
                                                        "leetcode"
                                                    )
                                                }
                                                onDisconnect={() =>
                                                    handleDisconnect(
                                                        "leetcode"
                                                    )
                                                }
                                            />

                                            <PlatformCard
                                                name="Codeforces"
                                                label="Codeforces handle"
                                                placeholder="codeforces_handle"
                                                icon={Trophy}
                                                iconClass="text-blue-400"
                                                value={
                                                    formData.codeforces
                                                }
                                                onChange={handleChange}
                                                inputName="codeforces"
                                                verification={
                                                    verification.codeforces
                                                }
                                                onVerify={() =>
                                                    handleVerifyClick(
                                                        "codeforces"
                                                    )
                                                }
                                                onVerified={() =>
                                                    handleVerifyAccount(
                                                        "codeforces"
                                                    )
                                                }
                                                onDisconnect={() =>
                                                    handleDisconnect(
                                                        "codeforces"
                                                    )
                                                }
                                            />

                                            <PlatformCard
                                                name="GeeksforGeeks"
                                                label="GFG username"
                                                placeholder="gfg_username"
                                                icon={Code2}
                                                iconClass="text-green-400"
                                                value={
                                                    formData.gfg
                                                }
                                                onChange={handleChange}
                                                inputName="gfg"
                                                verification={
                                                    verification.gfg
                                                }
                                                onVerify={() =>
                                                    handleVerifyClick(
                                                        "gfg"
                                                    )
                                                }
                                                onVerified={() =>
                                                    handleVerifyAccount(
                                                        "gfg"
                                                    )
                                                }
                                                onDisconnect={() =>
                                                    handleDisconnect(
                                                        "gfg"
                                                    )
                                                }
                                            />

                                            <PlatformCard
                                                name="GitHub"
                                                label="Connect through GitHub OAuth"
                                                placeholder="GitHub username"
                                                icon={GitBranch}
                                                iconClass="text-slate-200"
                                                value={
                                                    formData.github
                                                }
                                                onChange={handleChange}
                                                inputName="github"
                                                verification={
                                                    verification.github
                                                }
                                                isGithub
                                                onVerify={
                                                    handleGithubConnect
                                                }
                                                onDisconnect={() =>
                                                    handleDisconnect(
                                                        "github"
                                                    )
                                                }
                                            />

                                        </div>

                                        <p className="mt-3 flex items-center gap-1.5 text-[9px] text-muted-foreground">
                                            <ShieldCheck
                                                size={11}
                                                className="text-emerald-400"
                                            />
                                            Verification prevents users from
                                            claiming someone else's account.
                                        </p>
                                    </section>

                                    {/* COMPLETE */}
                                    <div className="border-t border-border pt-6">

                                        <button
                                            type="submit"
                                            className="group flex h-[52px] w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-semibold text-white shadow-[0_10px_35px_rgba(99,102,241,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:from-indigo-400 hover:to-violet-400 hover:shadow-[0_14px_40px_rgba(99,102,241,0.30)]"
                                        >
                                            Complete Setup

                                            <ArrowRight
                                                size={17}
                                                className="transition-transform duration-200 group-hover:translate-x-1"
                                            />
                                        </button>

                                        <p className="mt-3 text-center text-[9px] text-muted-foreground">
                                            You can connect or change platforms
                                            later from Settings.
                                        </p>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <p className="mt-5 text-center text-[9px] text-muted-foreground">
                            CodeSync • Track your journey. Build your future.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ========================================================= */
/* SECTION TITLE                                             */
/* ========================================================= */

function SectionTitle({
    number,
    title,
    description,
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-mono text-[9px] font-bold text-primary">
                {number}
            </div>

            <div>
                <h3 className="text-sm font-bold">
                    {title}
                </h3>

                <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {description}
                </p>
            </div>
        </div>
    )
}

/* ========================================================= */
/* INPUT                                                     */
/* ========================================================= */

function InputField({
    label,
    icon: Icon,
    name,
    value,
    onChange,
    placeholder,
    prefix,
}) {
    return (
        <div>
            <label className="mb-1.5 block text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                {label}
            </label>

            <div className="flex h-[48px] items-center gap-3 rounded-xl border border-border bg-[#101622] px-4 transition-all focus-within:border-violet-500/50">

                {prefix ? (
                    <span className="text-xs font-medium text-slate-500">
                        {prefix}
                    </span>
                ) : (
                    <Icon
                        size={16}
                        className="shrink-0 text-slate-500"
                    />
                )}

                <input
                    type="text"
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required
                    className="w-full bg-transparent text-xs text-foreground outline-none placeholder:text-slate-600"
                />
            </div>
        </div>
    )
}

/* ========================================================= */
/* PASSWORD                                                  */
/* ========================================================= */

function PasswordField({
    label,
    name,
    value,
    onChange,
    placeholder,
    showPassword,
    setShowPassword,
}) {
    return (
        <div>
            <label className="mb-1.5 block text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                {label}
            </label>

            <div className="flex h-[48px] items-center gap-3 rounded-xl border border-border bg-[#101622] px-4 transition-all focus-within:border-violet-500/50">

                <LockKeyhole
                    size={16}
                    className="shrink-0 text-slate-500"
                />

                <input
                    type={
                        showPassword
                            ? "text"
                            : "password"
                    }
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required
                    className="w-full bg-transparent text-xs text-foreground outline-none placeholder:text-slate-600"
                />

                <button
                    type="button"
                    onClick={() =>
                        setShowPassword(
                            (prev) => !prev
                        )
                    }
                    className="text-slate-500 transition-colors hover:text-slate-300"
                >
                    {showPassword ? (
                        <EyeOff size={16} />
                    ) : (
                        <Eye size={16} />
                    )}
                </button>
            </div>
        </div>
    )
}

/* ========================================================= */
/* PLATFORM CARD                                             */
/* ========================================================= */

function PlatformCard({
    name,
    label,
    placeholder,
    icon: Icon,
    iconClass,
    value,
    onChange,
    inputName,
    verification,
    onVerify,
    onVerified,
    onDisconnect,
    isGithub = false,
}) {
    const isPending =
        verification.status === "pending"

    const isLoading =
        verification.status === "loading"

    const isVerified =
        verification.status === "verified"

    return (
        <div
            className={`rounded-xl border p-4 transition-all duration-200 ${isVerified
                ? "border-emerald-400/25 bg-emerald-400/[0.025]"
                : "border-border bg-[#0d131f] hover:border-primary/20"
                }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">

                    <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.03] ${iconClass}`}
                    >
                        <Icon size={17} />
                    </div>

                    <div className="min-w-0">
                        <p className="text-xs font-semibold">
                            {name}
                        </p>

                        <p className="truncate text-[9px] text-muted-foreground">
                            {label}
                        </p>
                    </div>
                </div>

                {isVerified && (
                    <div className="flex shrink-0 items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[8px] font-semibold text-emerald-400">
                        <Check size={10} />
                        Verified
                    </div>
                )}
            </div>

            {/* Verified */}
            {isVerified ? (
                <div className="mt-4 flex items-center justify-between rounded-lg border border-emerald-400/10 bg-emerald-400/[0.04] px-3 py-2.5">

                    <div>
                        <p className="text-[9px] text-muted-foreground">
                            Connected account
                        </p>

                        <p className="mt-0.5 text-xs font-semibold text-foreground">
                            {isGithub
                                ? `@${value || "GitHub account"}`
                                : `@${value}`}
                        </p>
                    </div>

                    <span className="text-[8px] text-muted-foreground">
                        Connected
                    </span>
                </div>

            ) : isPending || isLoading ? (

                /* Verification Instructions */
                <div className="mt-4 rounded-lg border border-violet-400/15 bg-violet-400/[0.035] p-3">

                    <div className="flex items-start justify-between gap-3">

                        <div>
                            <p className="text-[10px] font-semibold text-violet-300">
                                {isLoading
                                    ? "Checking..."
                                    : "Verify ownership"}
                            </p>

                            <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
                                {isGithub
                                    ? "Complete GitHub authorization to connect your account."
                                    : "Add this verification code to your public profile, then click verify."}
                            </p>
                        </div>

                        {!isGithub && (
                            <button
                                type="button"
                                onClick={onVerify}
                                disabled={isLoading}
                                className="text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                                title="Generate new code"
                            >
                                <RefreshCw size={13} />
                            </button>
                        )}
                    </div>

                    {!isGithub && (
                        <>
                            {/* Code */}
                            <div className="mt-3 flex items-center justify-between rounded-lg border border-border bg-[#0b101b] px-3 py-2">

                                <span className="font-mono text-xs font-bold tracking-wider text-violet-300">
                                    {verification.code}
                                </span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigator.clipboard?.writeText(
                                            verification.code
                                        )
                                    }
                                    disabled={!verification.code}
                                    className="flex items-center gap-1 text-[8px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                                >
                                    <Copy size={10} />
                                    Copy
                                </button>
                            </div>

                            <div className="mt-3 flex gap-2">

                                <button
                                    type="button"
                                    onClick={onVerified}
                                    disabled={isLoading}
                                    className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-500/10 text-[9px] font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        "Checking..."
                                    ) : (
                                        <>
                                            <Check size={11} />
                                            Verify Account
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={onDisconnect}
                                    disabled={isLoading}
                                    className="flex h-8 items-center justify-center rounded-lg border border-border px-3 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-40"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        </>
                    )}

                    {isGithub && (
                        <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-[#0b101b] px-3 py-2">

                            <RefreshCw
                                size={12}
                                className="animate-spin text-violet-300"
                            />

                            <span className="text-[9px] text-muted-foreground">
                                Waiting for GitHub authorization...
                            </span>
                        </div>
                    )}
                </div>

            ) : (

                /* Input */
                <div className="mt-3 flex gap-2">

                    {!isGithub && (
                        <input
                            type="text"
                            name={inputName}
                            value={value}
                            onChange={onChange}
                            placeholder={placeholder}
                            className="h-9 min-w-0 flex-1 rounded-lg border border-border bg-[#101622] px-3 text-[10px] text-foreground outline-none placeholder:text-slate-600 focus:border-violet-500/50"
                        />
                    )}

                    {isGithub && (
                        <div className="flex h-9 min-w-0 flex-1 items-center rounded-lg border border-border bg-[#101622] px-3 text-[9px] text-muted-foreground">
                            Secure OAuth connection
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={onVerify}
                        disabled={
                            !isGithub && !value
                        }
                        className={`flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[9px] font-semibold transition-all ${isGithub || value
                            ? "bg-primary/10 text-primary hover:bg-primary/15"
                            : "cursor-not-allowed bg-secondary text-muted-foreground"
                            }`}
                    >
                        {isGithub ? (
                            <>
                                Connect
                                <ExternalLink size={10} />
                            </>
                        ) : (
                            <>
                                Verify
                                <ShieldCheck size={10} />
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    )
}

export default ProfileSetup