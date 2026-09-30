const { saveDailyActivity } = require("../dailyActivity.service")

const GITHUB_API = "https://api.github.com"

/* =========================================================
   GitHub API Request
   ========================================================= */

async function githubRequest(endpoint, accessToken) {
    if (!accessToken) {
        throw new Error(
            "GitHub access token is missing. Please reconnect GitHub."
        )
    }

    const response = await fetch(
        `${GITHUB_API}${endpoint}`,
        {
            headers: {
                Accept:
                    "application/vnd.github+json",
                Authorization:
                    `Bearer ${accessToken}`,
                "X-GitHub-Api-Version":
                    "2022-11-28",
                "User-Agent":
                    "CodeSync/1.0",
            },
        }
    )

    if (!response.ok) {
        const errorText =
            await response.text()

        if (response.status === 401) {
            throw new Error(
                "GitHub access token is invalid or expired. Please reconnect GitHub."
            )
        }

        if (response.status === 403) {
            throw new Error(
                `GitHub API rate limit exceeded or access denied. ${errorText}`
            )
        }

        throw new Error(
            `GitHub API error: ${response.status} ${errorText}`
        )
    }

    return response.json()
}


/* =========================================================
   GitHub User
   ========================================================= */

const getGithubUser = async (
    accessToken
) => {
    return await githubRequest(
        "/user",
        accessToken
    )
}


/* =========================================================
   GitHub Repositories
   ========================================================= */

const getGithubRepositories = async (
    accessToken
) => {
    const repositories = []

    let page = 1

    while (true) {
        const data =
            await githubRequest(
                `/user/repos?per_page=100&page=${page}&type=all`,
                accessToken
            )

        repositories.push(...data)

        if (data.length < 100) {
            break
        }

        page++
    }

    return repositories
}


/* =========================================================
   GitHub Pull Requests
   ========================================================= */

const getGithubPullRequests = async (
    username,
    accessToken
) => {
    const query =
        encodeURIComponent(
            `is:pr author:${username}`
        )

    const data =
        await githubRequest(
            `/search/issues?q=${query}&per_page=1`,
            accessToken
        )

    return data.total_count || 0
}


/* =========================================================
   GitHub Stats
   ========================================================= */

const getGithubStats = async (
    username,
    accessToken
) => {
    if (!accessToken) {
        throw new Error(
            "GitHub access token missing while fetching stats."
        )
    }

    const user =
        await getGithubUser(
            accessToken
        )

    const repositories =
        await getGithubRepositories(
            accessToken
        )

    const pullRequests =
        await getGithubPullRequests(
            username,
            accessToken
        )

    return {
        username:
            user.login,

        profileUrl:
            user.html_url,

        name:
            user.name || null,

        publicRepositories:
            user.public_repos || 0,

        repositories:
            repositories.length,

        pullRequests,

        followers:
            user.followers || 0,

        following:
            user.following || 0,
    }
}


/* =========================================================
   GitHub Contributions
   ========================================================= */

const getGithubContributions = async (
    username
) => {
    const response =
        await fetch(
            `https://github.com/users/${encodeURIComponent(
                username
            )}/contributions`,
            {
                headers: {
                    "User-Agent":
                        "CodeSync/1.0",
                    Accept:
                        "text/html",
                },
            }
        )

    if (!response.ok) {
        throw new Error(
            `GitHub contributions HTTP error: ${response.status}`
        )
    }

    const html =
        await response.text()

    const contributions = []

    const cellRegex =
        /<td\b[^>]*data-date="([^"]+)"[^>]*id="([^"]+)"[^>]*>[\s\S]*?<\/td>/gi

    let match

    while (
        (match =
            cellRegex.exec(html)) !==
        null
    ) {
        const date = match[1]
        const cellId = match[2]

        const escapedId =
            cellId.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            )

        const tooltipRegex =
            new RegExp(
                `<tool-tip[^>]*for="${escapedId}"[^>]*>([\\s\\S]*?)<\\/tool-tip>`,
                "i"
            )

        const tooltipMatch =
            html.match(
                tooltipRegex
            )

        let count = 0

        if (tooltipMatch) {
            const tooltipText =
                tooltipMatch[1]
                    .replace(
                        /<[^>]*>/g,
                        ""
                    )
                    .trim()

            const countMatch =
                tooltipText.match(
                    /(\d[\d,]*)\s+contributions?/i
                )

            if (countMatch) {
                count = Number(
                    countMatch[1].replace(
                        /,/g,
                        ""
                    )
                )
            }
        }

        contributions.push({
            date,
            count,
        })
    }

    const uniqueContributions =
        Array.from(
            new Map(
                contributions.map(
                    (item) => [
                        item.date,
                        item,
                    ]
                )
            ).values()
        )

    uniqueContributions.sort(
        (a, b) =>
            a.date.localeCompare(
                b.date
            )
    )

    const totalContributions =
        uniqueContributions.reduce(
            (total, day) =>
                total + day.count,
            0
        )

    return {
        username,
        contributions:
            uniqueContributions,
        totalContributions,
    }
}


/* =========================================================
   Save GitHub Daily Activity
   ========================================================= */

const saveGithubDailyActivity =
    async (
        userId,
        username
    ) => {
        const data =
            await getGithubContributions(
                username
            )

        const activities =
            data.contributions.map(
                (day) => ({
                    date:
                        day.date,
                    contributionCount:
                        day.count,
                })
            )

        const result =
            await saveDailyActivity(
                userId,
                "GITHUB",
                activities
            )

        return {
            ...result,
            totalContributions:
                data.totalContributions,
        }
    }


module.exports = {
    getGithubUser,
    getGithubRepositories,
    getGithubPullRequests,
    getGithubStats,
    getGithubContributions,
    saveGithubDailyActivity,
}