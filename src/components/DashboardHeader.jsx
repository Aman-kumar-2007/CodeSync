import {
    Pencil,
    GraduationCap,
    RefreshCw,
} from "lucide-react"
import { useState } from "react"
import { supabase } from "../lib/supabase"

const API_BASE_URL = "https://codesync-su2x.onrender.com"

function DashboardHeader({
    profile,
    setActivePage,
}) {

    const [syncing, setSyncing] = useState(false)

    const handleSync = async () => {
        try {
            setSyncing(true)

            const {
                data: { session },
            } = await supabase.auth.getSession()

            const response = await fetch(
                `${API_BASE_URL}/api/platform-sync/sync`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                        "Content-Type": "application/json",
                    },
                }
            )

            if (!response.ok) {
                throw new Error("Sync failed")
            }

            alert("Platform data synced successfully.")
            window.location.reload()
        } catch (error) {
            console.error("Manual sync error:", error)
            alert("Sync failed. Please try again.")
        } finally {
            setSyncing(false)
        }
    }

    const getGreeting = () => {
        const hour = new Date().getHours()

        if (hour < 12) {
            return "Good morning"
        }

        if (hour < 17) {
            return "Good afternoon"
        }

        if (hour < 21) {
            return "Good evening"
        }

        return "Good night"
    }

    const name =
        profile?.name ||
        profile?.full_name ||
        "Student"

    const branch =
        profile?.branch ||
        "CSE"

    return (
        <section className="px-8 pb-6 pt-7">
            <div
                className="
                    relative
                    h-[150px]
                    overflow-hidden
                    rounded-2xl
                    border
                    border-primary/20
                    bg-card
                "
            >
                {/* Glow */}

                <div
                    className="
                        pointer-events-none
                        absolute
                        -right-20
                        -top-24
                        h-64
                        w-64
                        rounded-full
                        bg-primary/20
                        blur-3xl
                    "
                />

                <div
                    className="
                        pointer-events-none
                        absolute
                        bottom-[-90px]
                        left-[48%]
                        h-[180px]
                        w-[320px]
                        rounded-[50%]
                        bg-indigo-500/10
                        blur-2xl
                    "
                />

                <div className="relative flex h-full items-center justify-between px-7">
                    {/* Left */}

                    <div className="flex h-full flex-col justify-between py-5">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                {getGreeting()}, {name}.
                            </h1>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Keep solving, keep growing!
                            </p>
                        </div>

                        {/* Branch */}

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <GraduationCap
                                size={15}
                                className="text-primary"
                            />

                            <span>
                                {branch}
                            </span>
                        </div>
                    </div>

                    {/* Quote */}

                    <div className="absolute right-[180px] top-1/2 hidden -translate-y-1/2 text-center lg:block">
                        <p className="max-w-[230px] text-sm font-medium leading-6 text-foreground/80">
                            “Discipline today,
                            <br />
                            better results tomorrow.”
                        </p>
                    </div>

                    <div className="absolute right-6 top-5 flex gap-2">

                        <button
                            type="button"
                            onClick={handleSync}
                            disabled={syncing}
                            className="
                            flex items-center gap-2
            rounded-lg
            border border-primary/50
            bg-primary/5
            px-4 py-2.5
            text-xs font-semibold
            text-foreground
            transition-colors
            hover:bg-primary/10
            disabled:opacity-50
        "
                        >
                            <RefreshCw
                                size={14}
                                className={syncing ? "animate-spin" : ""}
                            />

                            {syncing ? "Syncing..." : "Sync"}
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setActivePage("Student Profile")
                            }
                            className="
            flex items-center gap-2
            rounded-lg
            border border-primary/50
            bg-primary/5
            px-4 py-2.5
            text-xs font-semibold
            text-foreground
            transition-colors
            hover:bg-primary/10
        "
                        >
                            <Pencil size={14} />
                            Edit Profile
                        </button>

                    </div>
                </div>
            </div>
        </section>
    )
}

export default DashboardHeader