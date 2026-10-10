import { useState } from "react"
import { ArrowLeft, Code2, Eye, EyeOff, LockKeyhole, CheckCircle2 } from "lucide-react"
import { supabase } from "../lib/supabase"

export default function ResetPassword({ onBackToLogin, onPasswordUpdated }) {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError("")

        if (password.length < 8) {
            setError("Password must be at least 8 characters long.")
            return
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.")
            return
        }

        setSaving(true)
        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession()
            if (sessionError) throw sessionError
            if (!session) {
                throw new Error("This reset link is invalid or expired. Request a new password reset email.")
            }

            const { error: updateError } = await supabase.auth.updateUser({ password })
            if (updateError) throw updateError

            setSuccess(true)
        } catch (err) {
            console.error("Password update failed:", err)
            setError(err.message || "Could not update password. Request a new reset link and try again.")
        } finally {
            setSaving(false)
        }
    }

    return (
        <main data-auth-page className="flex min-h-screen items-center justify-center bg-[#f5f7fb] px-4 py-10 text-[#111827]">
            <div className="w-full max-w-md rounded-3xl border border-[#e1e7f0] bg-white p-7 shadow-[0_20px_70px_rgba(15,23,42,0.09)] sm:p-9">
                <div className="mb-6 flex justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600"><Code2 size={24} /></div>
                </div>
                {success ? (
                    <div className="text-center">
                        <CheckCircle2 className="mx-auto mb-4 text-emerald-600" size={42} />
                        <h1 className="text-2xl font-bold text-slate-900">Password updated</h1>
                        <p className="mt-3 text-sm leading-6 text-slate-600">Your password has been changed. Sign in with your new password.</p>
                        <button onClick={onPasswordUpdated || onBackToLogin} className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 font-semibold text-white hover:brightness-105"><ArrowLeft size={16} /> Back to Sign In</button>
                    </div>
                ) : (
                    <>
                        <h1 className="text-center text-2xl font-bold text-slate-900">Set a new password</h1>
                        <p className="mt-2 text-center text-sm text-slate-600">Choose a strong password for your CodeSync account.</p>
                        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                            <div>
                                <label htmlFor="new-password" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600">New password</label>
                                <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 focus-within:border-indigo-400">
                                    <LockKeyhole size={17} className="text-slate-500" />
                                    <input id="new-password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} autoComplete="new-password" required placeholder="At least 8 characters" className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" />
                                    <button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "Hide password" : "Show password"} className="text-slate-500">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="confirm-password" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600">Confirm password</label>
                                <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 focus-within:border-indigo-400">
                                    <LockKeyhole size={17} className="text-slate-500" />
                                    <input id="confirm-password" type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" required placeholder="Re-enter new password" className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" />
                                    <button type="button" onClick={() => setShowConfirm(v => !v)} aria-label={showConfirm ? "Hide password" : "Show password"} className="text-slate-500">{showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                                </div>
                            </div>
                            {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                            <button type="submit" disabled={saving} className="flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-sm font-semibold text-white transition hover:brightness-105 disabled:opacity-60">{saving ? "Updating password..." : "Update Password"}</button>
                        </form>
                        <button onClick={onBackToLogin} className="mt-5 flex w-full items-center justify-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600"><ArrowLeft size={16} /> Back to Sign In</button>
                    </>
                )}
            </div>
        </main>
    )
}
