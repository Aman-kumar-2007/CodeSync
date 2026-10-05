const CACHE_PREFIX = "codesync_cache_"

export function getCachedData(key, maxAge = 10 * 60 * 1000) {
    try {
        const raw = localStorage.getItem(
            CACHE_PREFIX + key
        )

        if (!raw) return null

        const cached = JSON.parse(raw)

        if (
            !cached?.timestamp ||
            Date.now() - cached.timestamp > maxAge
        ) {
            localStorage.removeItem(
                CACHE_PREFIX + key
            )
            return null
        }

        return cached.data
    } catch (error) {
        console.warn("Cache read failed:", error)
        return null
    }
}

export function setCachedData(key, data) {
    try {
        localStorage.setItem(
            CACHE_PREFIX + key,
            JSON.stringify({
                timestamp: Date.now(),
                data,
            })
        )
    } catch (error) {
        console.warn("Cache write failed:", error)
    }
}

export function clearCachedData(key) {
    try {
        localStorage.removeItem(
            CACHE_PREFIX + key
        )
    } catch (error) {
        console.warn("Cache clear failed:", error)
    }
}

export function clearCacheByPrefix(prefix) {
    try {
        const fullPrefix = CACHE_PREFIX + prefix

        Object.keys(localStorage).forEach((key) => {
            if (key.startsWith(fullPrefix)) {
                localStorage.removeItem(key)
            }
        })
    } catch (error) {
        console.warn(
            "Cache prefix clear failed:",
            error
        )
    }
}


export function invalidateUserCaches() {
    clearCachedData("analytics")
    clearCachedData("leaderboard")
    clearCachedData("student-profile")
    clearCachedData("contests")
}