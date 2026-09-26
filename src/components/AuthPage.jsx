import { useState } from "react"
import {
    Code2,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    ArrowRight,
    ShieldCheck,
    Users,
    Trophy,
    BarChart3,
    Check,
} from "lucide-react"
import { supabase } from "../lib/supabase"

function AuthPage({ onLogin }) {
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(true)

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })

    const handleChange = (e) => {
        const { name, value } = e.target

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const identifier = formData.email.trim()

        if (!identifier) {
            alert("Email or username is required.")
            return
        }

        let email = identifier.toLowerCase()

        // If user entered username, resolve it to email
        if (!identifier.includes("@")) {
            try {
                const response = await fetch(
                    "http://localhost:5001/api/auth/resolve-username",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            username: identifier,
                        }),
                    }
                )

                const data = await response.json()

                if (!response.ok || !data.success) {
                    alert(
                        data.message ||
                        "Invalid username or password."
                    )
                    return
                }

                email = data.data.email
            } catch (error) {
                console.error(
                    "Username login error:",
                    error
                )

                alert(
                    "Unable to connect to the server. Please try again."
                )
                return
            }
        }

        const { error } =
            await supabase.auth.signInWithPassword({
                email,
                password: formData.password,
            })

        if (error) {
            alert(error.message)
            return
        }

        if (onLogin) {
            onLogin()
        }
    }

    const handleGoogleLogin = async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: window.location.origin,
            },
        });

        if (error) {
            console.error("OAuth error:", error);
        }
    }

    return (
        <div className="min-h-screen overflow-hidden bg-[#070b14] text-foreground">
            <div className="relative min-h-screen">

                {/* Background Grid */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.13]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(99,102,241,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.18) 1px, transparent 1px)",
                        backgroundSize: "48px 48px",
                    }}
                />

                {/* Background Glow */}
                <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-600/[0.10] blur-[130px]" />

                <div className="pointer-events-none absolute -bottom-40 left-[35%] h-[500px] w-[500px] rounded-full bg-violet-600/[0.10] blur-[130px]" />

                <div className="pointer-events-none absolute right-[-200px] top-[20%] h-[500px] w-[500px] rounded-full bg-blue-600/[0.07] blur-[130px]" />

                <div className="relative mx-auto flex min-h-screen max-w-[1600px]">

                    {/* ================================================= */}
                    {/* LEFT SIDE */}
                    {/* ================================================= */}

                    <div className="hidden w-[54%] flex-col px-10 py-5 lg:flex xl:px-16">

                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-[0_0_30px_rgba(99,102,241,0.25)]">
                                    <Code2 size={21} />
                                </div>

                                <div>
                                    <h1 className="text-lg font-bold">
                                        Code
                                        <span className="text-primary">
                                            Sync
                                        </span>
                                    </h1>

                                    <p className="text-[9px] tracking-wide text-muted-foreground">
                                        YOUR CODING JOURNEY
                                    </p>
                                </div>
                            </div>

                            <div className="text-[11px] text-muted-foreground">
                                Track
                                <span className="mx-2">•</span>
                                Compete
                                <span className="mx-2">•</span>
                                Grow
                            </div>
                        </div>

                        {/* Hero */}
                        <div className="mt-20 max-w-[680px]">
                            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/[0.07] px-3.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-violet-400">
                                <span className="mr-2 h-1.5 w-1.5 rounded-full bg-violet-400" />
                                All your coding progress. One platform.
                            </div>

                            <h2 className="mt-7 text-[54px] font-extrabold leading-[1.02] tracking-[-0.04em] xl:text-[62px]">
                                Code. Compete.
                                <br />

                                <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
                                    Grow Together.
                                </span>
                            </h2>

                            <p className="mt-7 max-w-[620px] text-[15px] leading-7 text-slate-300">
                                Track your progress across LeetCode,
                                Codeforces, GeeksforGeeks and GitHub.
                                Compete with peers, improve your skills,
                                and become a better problem solver with
                                a community that grows together.
                            </p>
                        </div>

                        {/* Platforms */}
                        <div className="mt-10 flex items-center gap-9">
                            <Platform
                                symbol="LC"
                                name="LeetCode"
                                className="text-amber-400"
                            />

                            <Platform
                                symbol="CF"
                                name="Codeforces"
                                className="text-blue-400"
                            />

                            <Platform
                                symbol="GFG"
                                name="GeeksforGeeks"
                                className="text-green-400"
                            />

                            <Platform
                                symbol="GH"
                                name="GitHub"
                                className="text-slate-200"
                            />

                            <div className="h-8 w-px bg-border" />

                            <span className="text-[10px] text-muted-foreground">
                                and more...
                            </span>
                        </div>

                        {/* Coding Visual */}
                        <div className="relative mt-12 min-h-[270px] max-w-[730px] overflow-hidden rounded-3xl border border-border bg-[#090e19]/90">

                            <div className="absolute right-[-80px] top-[-100px] h-[320px] w-[320px] rounded-full bg-primary/[0.10] blur-[90px]" />

                            {/* Code Editor */}
                            <div className="absolute bottom-[-10px] right-[-10px] h-[220px] w-[410px] rotate-[-2deg] rounded-xl border border-indigo-400/20 bg-[#0d1320] p-5 shadow-2xl">

                                <div className="mb-4 flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-red-400/60" />
                                    <span className="h-2 w-2 rounded-full bg-yellow-400/60" />
                                    <span className="h-2 w-2 rounded-full bg-green-400/60" />
                                </div>

                                <div className="space-y-2 font-mono text-[9px]">
                                    <CodeLine
                                        number="01"
                                        text="function solve(arr) {"
                                        className="text-violet-300"
                                    />

                                    <CodeLine
                                        number="02"
                                        text="  let answer = 0;"
                                        className="text-slate-300"
                                    />

                                    <CodeLine
                                        number="03"
                                        text="  for (const x of arr) {"
                                        className="text-blue-300"
                                    />

                                    <CodeLine
                                        number="04"
                                        text="    answer += process(x);"
                                        className="text-slate-300"
                                    />

                                    <CodeLine
                                        number="05"
                                        text="  }"
                                        className="text-blue-300"
                                    />

                                    <CodeLine
                                        number="06"
                                        text="  return answer;"
                                        className="text-emerald-300"
                                    />

                                    <CodeLine
                                        number="07"
                                        text="}"
                                        className="text-violet-300"
                                    />
                                </div>
                            </div>

                            {/* Quote */}
                            <div className="relative z-10 max-w-[330px] px-9 py-9">
                                <div className="text-3xl text-primary">
                                    "
                                </div>

                                <p className="mt-2 text-[23px] font-semibold leading-9 text-slate-200">
                                    Discipline today,
                                    <br />

                                    <span className="text-blue-400">
                                        extraordinary
                                    </span>{" "}
                                    tomorrow.
                                </p>

                                <div className="mt-5 h-[2px] w-10 rounded-full bg-primary" />
                            </div>
                        </div>

                        {/* Features */}
                        <div className="mt-auto flex items-center gap-8 pt-9">
                            <Feature
                                icon={BarChart3}
                                text="Track Progress"
                            />

                            <Feature
                                icon={Users}
                                text="Compete with Peers"
                            />

                            <Feature
                                icon={Trophy}
                                text="Build Your Profile"
                            />

                            <Feature
                                icon={Code2}
                                text="Be Job Ready"
                            />
                        </div>
                    </div>

                    {/* ================================================= */}
                    {/* RIGHT SIDE */}
                    {/* ================================================= */}

                    <div className="flex w-full items-center justify-center px-5 py-8 lg:w-[46%] lg:px-10">

                        <div className="w-full max-w-[500px]">

                            {/* Login Card */}
                            <div className="relative overflow-hidden rounded-[24px] border border-indigo-400/25 bg-[#0b101b]/95 p-6 shadow-[0_25px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8">

                                {/* Glow */}
                                <div className="pointer-events-none absolute left-1/2 top-[-160px] h-[280px] w-[420px] -translate-x-1/2 rounded-full bg-primary/[0.08] blur-[90px]" />

                                <div className="relative">

                                    {/* Header */}
                                    <div className="mb-4 text-center">
                                        <div className="mx-auto mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <Code2 size={21} />
                                        </div>

                                        <h2 className="text-[29px] font-bold tracking-tight">
                                            Welcome Back
                                        </h2>

                                        <p className="mt-2 text-xs text-muted-foreground">
                                            Sign in to continue your coding journey.
                                        </p>
                                    </div>

                                    <form
                                        onSubmit={handleSubmit}
                                        className="space-y-5"
                                    >

                                        {/* Email */}
                                        <InputField
                                            label="Email or Username"
                                            icon={Mail}
                                            type="text"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="you@example.com or username"
                                        />

                                        {/* Password */}
                                        <div>
                                            <div className="mb-2 flex items-center justify-between">
                                                <label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                                    Password
                                                </label>

                                                <button
                                                    type="button"
                                                    className="text-[10px] font-medium text-violet-400 transition-colors hover:text-violet-300"
                                                >
                                                    Forgot password?
                                                </button>
                                            </div>

                                            <div className="flex h-[54px] items-center gap-3 rounded-xl border border-border bg-[#101622] px-4 transition-all focus-within:border-violet-500/50 focus-within:bg-[#121927]">

                                                <LockKeyhole
                                                    size={17}
                                                    className="shrink-0 text-slate-500"
                                                />

                                                <input
                                                    type={
                                                        showPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    name="password"
                                                    value={
                                                        formData.password
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    placeholder="Enter your password"
                                                    required
                                                    className="w-full bg-transparent text-xs text-foreground outline-none placeholder:text-slate-600"
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowPassword(
                                                            (prev) =>
                                                                !prev
                                                        )
                                                    }
                                                    className="text-slate-500 transition-colors hover:text-slate-300"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff size={17} />
                                                    ) : (
                                                        <Eye size={17} />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Remember Me */}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setRememberMe(
                                                    (prev) => !prev
                                                )
                                            }
                                            className="flex items-center gap-2"
                                        >
                                            <span
                                                className={`flex h-[18px] w-[18px] items-center justify-center rounded-[4px] border transition-all ${rememberMe
                                                    ? "border-violet-400 bg-violet-500 text-white"
                                                    : "border-border bg-secondary"
                                                    }`}
                                            >
                                                {rememberMe && (
                                                    <Check
                                                        size={12}
                                                        strokeWidth={3}
                                                    />
                                                )}
                                            </span>

                                            <span className="text-[10px] text-slate-400">
                                                Remember me
                                            </span>
                                        </button>

                                        {/* Sign In */}
                                        <button
                                            type="submit"
                                            className="group flex h-[54px] w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-semibold text-white shadow-[0_10px_35px_rgba(99,102,241,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:from-indigo-400 hover:to-violet-400 hover:shadow-[0_14px_40px_rgba(99,102,241,0.30)]"
                                        >
                                            Sign In

                                            <ArrowRight
                                                size={17}
                                                className="transition-transform duration-200 group-hover:translate-x-1"
                                            />
                                        </button>
                                    </form>

                                    {/* Divider */}
                                    <div className="my-6 flex items-center gap-3">
                                        <div className="h-px flex-1 bg-border" />

                                        <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
                                            or continue with
                                        </span>

                                        <div className="h-px flex-1 bg-border" />
                                    </div>

                                    {/* Google */}
                                    <button
                                        type="button"
                                        onClick={handleGoogleLogin}
                                        className="flex h-[53px] w-full items-center justify-center gap-3 rounded-xl border border-border bg-[#101622] text-xs font-semibold text-slate-200 transition-all hover:border-slate-600 hover:bg-[#141b29]"
                                    >
                                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white font-bold text-[#4285F4]">
                                            G
                                        </span>

                                        Continue with Google
                                    </button>

                                    {/* Security */}
                                    <div className="mt-7 flex items-center justify-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400">
                                            <ShieldCheck size={18} />
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-medium text-slate-300">
                                                Secure & Private
                                            </p>

                                            <p className="mt-0.5 text-[9px] text-muted-foreground">
                                                Built for coders, by coders.
                                            </p>
                                        </div>
                                    </div>

                                    {/* No Signup */}
                                    <div className="mt-7 border-t border-border pt-6 text-center">
                                        <p className="text-[10px] text-muted-foreground">
                                            Don't have access?
                                            <span className="ml-1.5 font-semibold text-violet-400">
                                                Contact your administrator
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <p className="mt-5 text-center text-[9px] text-muted-foreground">
                                CodeSync • Track your journey. Build your future.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ========================================================= */
/* COMPONENTS                                                */
/* ========================================================= */

function Platform({ symbol, name, className }) {
    return (
        <div className="flex min-w-[70px] flex-col items-center gap-2">
            <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-[#0c121e] font-mono text-[10px] font-bold ${className}`}
            >
                {symbol}
            </div>

            <span className="text-[9px] text-muted-foreground">
                {name}
            </span>
        </div>
    )
}

function Feature({ icon: Icon, text }) {
    return (
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <Icon size={14} className="text-primary" />
            <span>{text}</span>
        </div>
    )
}

function CodeLine({ number, text, className }) {
    return (
        <div className="flex gap-4">
            <span className="w-4 text-right text-slate-700">
                {number}
            </span>

            <span className={className}>
                {text}
            </span>
        </div>
    )
}

function InputField({
    label,
    icon: Icon,
    type,
    name,
    value,
    onChange,
    placeholder,
}) {
    return (
        <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                {label}
            </label>

            <div className="flex h-[54px] items-center gap-3 rounded-xl border border-border bg-[#101622] px-4 transition-all focus-within:border-violet-500/50 focus-within:bg-[#121927]">
                <Icon
                    size={17}
                    className="shrink-0 text-slate-500"
                />

                <input
                    type={type}
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

export default AuthPage