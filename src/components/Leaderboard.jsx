import React from "react";
import {
  Trophy,
  Medal,
  Flame,
  Search,
  Code2,
  ExternalLink,
  Github,
} from "lucide-react";

const PLATFORM_CONFIG = {
  leetcode: {
    name: "LeetCode",
    icon: Code2,
    className: "text-orange-400 bg-orange-500/10",
  },
  codeforces: {
    name: "Codeforces",
    icon: Trophy,
    className: "text-blue-400 bg-blue-500/10",
  },
  github: {
    name: "GitHub",
    icon: Github,
    className: "text-emerald-400 bg-emerald-500/10",
  },
  gfg: {
    name: "GFG",
    icon: Code2,
    className: "text-green-400 bg-green-500/10",
  },
};

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((x) => x[0])
    .join("")
    .toUpperCase();
}

function formatScore(score) {
  return Number(score || 0).toFixed(1);
}

function PlatformBadge({ platform }) {
  const config = PLATFORM_CONFIG[platform?.toLowerCase()];

  if (!config) return null;

  const Icon = config.icon;

  return (
    <div
      className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] ${config.className}`}
    >
      <Icon size={12} />
      <span>{config.name}</span>
    </div>
  );
}

function ProfileImage({ student, size = "normal" }) {
  const image =
    student?.profile_image ||
    student?.profileImage ||
    student?.avatar_url ||
    student?.avatar ||
    null;

  const initials = getInitials(
    student?.fullname ||
      student?.full_name ||
      student?.name ||
      student?.username
  );

  const sizeClass =
    size === "large"
      ? "h-24 w-24 text-2xl"
      : size === "medium"
      ? "h-14 w-14 text-lg"
      : "h-10 w-10 text-sm";

  if (image) {
    return (
      <img
        src={image}
        alt=""
        className={`${sizeClass} rounded-full object-cover border border-slate-700`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} flex items-center justify-center rounded-full bg-slate-900 border border-slate-700 font-semibold text-slate-200`}
    >
      {initials}
    </div>
  );
}

function PodiumCard({ student, rank }) {
  if (!student) return null;

  const isFirst = rank === 1;
  const isSecond = rank === 2;
  const isThird = rank === 3;

  const name =
    student.fullname ||
    student.full_name ||
    student.name ||
    student.username ||
    "Student";

  const username = student.username
    ? `@${student.username.replace(/^@/, "")}`
    : "";

  const score = student.score ?? student.codesync_score ?? 0;

  const solved =
    student.solved ??
    student.total_solved ??
    student.problems_solved ??
    0;

  const streak =
    student.max_streak ??
    student.maxStreak ??
    student.streak ??
    0;

  const platforms =
    student.platforms ||
    student.connectedPlatforms ||
    [];

  const positionClass = isFirst
    ? "order-2 md:-translate-y-4"
    : isSecond
    ? "order-1"
    : "order-3";

  const borderClass = isFirst
    ? "border-yellow-500/60"
    : isSecond
    ? "border-slate-500/60"
    : "border-orange-600/50";

  const numberClass = isFirst
    ? "text-yellow-400"
    : isSecond
    ? "text-slate-300"
    : "text-orange-400";

  return (
    <div
      className={`relative w-full max-w-[340px] ${positionClass}`}
    >
      {/* Rank badge */}
      <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl border bg-[#111722] text-sm font-bold shadow-lg ${borderClass}`}
        >
          {isFirst ? (
            <Trophy size={18} className={numberClass} />
          ) : (
            <Medal size={18} className={numberClass} />
          )}
        </div>
      </div>

      {/* Card */}
      <div
        className={`rounded-2xl border bg-[#111722] px-5 pb-5 pt-9 shadow-xl ${borderClass}`}
      >
        {/* Rank */}
        <div
          className={`mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] ${numberClass}`}
        >
          #{rank}
        </div>

        {/* Profile */}
        <div className="flex flex-col items-center">
          <div
            className={`rounded-full border-2 p-1 ${
              isFirst
                ? "border-yellow-500"
                : isSecond
                ? "border-slate-500"
                : "border-orange-600"
            }`}
          >
            <ProfileImage student={student} size="large" />
          </div>

          <h3 className="mt-3 text-base font-semibold text-white">
            {name}
          </h3>

          {username && (
            <p className="mt-1 text-xs text-slate-500">
              {username}
            </p>
          )}
        </div>

        {/* Score */}
        <div
          className={`mt-5 rounded-xl border px-4 py-3 text-center ${
            isFirst
              ? "border-yellow-500/30 bg-yellow-500/5"
              : "border-slate-800 bg-slate-900/40"
          }`}
        >
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
            CodeSync Score
          </p>

          <p
            className={`mt-1 font-mono text-2xl font-bold ${
              isFirst ? "text-yellow-400" : "text-slate-100"
            }`}
          >
            {formatScore(score)}
          </p>
        </div>

        {/* Stats */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-center">
            <p className="text-[10px] uppercase tracking-wide text-slate-500">
              Solved
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-200">
              {solved}
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-center">
            <p className="text-[10px] uppercase tracking-wide text-slate-500">
              Max Streak
            </p>

            <p className="mt-1 flex items-center justify-center gap-1 text-sm font-semibold text-slate-200">
              <Flame size={13} />
              {streak}d
            </p>
          </div>
        </div>

        {/* Platforms */}
        {platforms?.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            {platforms.slice(0, 4).map((platform, index) => (
              <PlatformBadge
                key={`${platform}-${index}`}
                platform={
                  typeof platform === "string"
                    ? platform
                    : platform?.platform
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Small podium platform */}
      <div
        className={`mx-auto h-3 w-[78%] rounded-b-lg border-x border-b ${
          isFirst
            ? "border-yellow-500/50 bg-yellow-500/10"
            : isSecond
            ? "border-slate-500/40 bg-slate-500/10"
            : "border-orange-600/40 bg-orange-600/10"
        }`}
      />
    </div>
  );
}

export default function Leaderboard({
  students = [],
  loading = false,
}) {
  const [search, setSearch] = React.useState("");

  const filteredStudents = React.useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return students;

    return students.filter((student) => {
      const name =
        student?.fullname ||
        student?.full_name ||
        student?.name ||
        "";

      const username = student?.username || "";

      return (
        name.toLowerCase().includes(query) ||
        username.toLowerCase().includes(query)
      );
    });
  }, [students, search]);

  const rankedStudents = [...filteredStudents].sort(
    (a, b) =>
      Number(b?.score ?? b?.codesync_score ?? 0) -
      Number(a?.score ?? a?.codesync_score ?? 0)
  );

  const first = rankedStudents[0];
  const second = rankedStudents[1];
  const third = rankedStudents[2];

  return (
    <div className="min-h-full bg-[#080d16] px-4 py-6 md:px-6">
      <div className="mx-auto max-w-[1500px]">

        {/* Header */}
        <div className="rounded-2xl border border-slate-800 bg-[#111722] px-6 py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Medal size={18} />
                </div>

                <h1 className="text-xl font-semibold text-white">
                  Student <span className="text-indigo-400">Leaderboard</span>
                </h1>
              </div>

              <p className="mt-2 text-sm text-slate-500">
                Compare coding performance across the PW IOI community.
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-[320px]">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or username..."
                className="h-10 w-full rounded-lg border border-slate-800 bg-[#0d131e] pl-10 pr-3 text-sm text-slate-200 outline-none transition focus:border-indigo-500/50"
              />
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-16 text-center text-sm text-slate-500">
            Loading leaderboard...
          </div>
        )}

        {/* Empty */}
        {!loading && rankedStudents.length === 0 && (
          <div className="mt-8 rounded-2xl border border-slate-800 bg-[#111722] py-16 text-center">
            <p className="text-sm text-slate-500">
              No students found.
            </p>
          </div>
        )}

        {/* PODIUM */}
        {!loading && rankedStudents.length > 0 && (
          <div className="mt-14">

            <div className="flex flex-col items-center justify-center gap-8 md:flex-row md:items-end md:gap-6">
              {second && (
                <PodiumCard
                  student={second}
                  rank={2}
                />
              )}

              {first && (
                <PodiumCard
                  student={first}
                  rank={1}
                />
              )}

              {third && (
                <PodiumCard
                  student={third}
                  rank={3}
                />
              )}
            </div>

          </div>
        )}

        {/* TABLE */}
        {!loading && rankedStudents.length > 0 && (
          <div className="mt-10 overflow-hidden rounded-2xl border border-slate-800 bg-[#111722]">

            <div className="grid grid-cols-[70px_minmax(220px,1fr)_120px_100px_130px] items-center border-b border-slate-800 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              <span>Rank</span>
              <span>Student</span>
              <span className="text-right">Score</span>
              <span className="text-right">Solved</span>
              <span className="text-right">Max Streak</span>
            </div>

            {rankedStudents.map((student, index) => {
              const rank = index + 1;

              const name =
                student?.fullname ||
                student?.full_name ||
                student?.name ||
                student?.username ||
                "Student";

              const username = student?.username
                ? `@${student.username.replace(/^@/, "")}`
                : "";

              const score =
                student?.score ??
                student?.codesync_score ??
                0;

              const solved =
                student?.solved ??
                student?.total_solved ??
                student?.problems_solved ??
                0;

              const streak =
                student?.max_streak ??
                student?.maxStreak ??
                student?.streak ??
                0;

              return (
                <div
                  key={student?.id || student?.user_id || index}
                  className={`grid grid-cols-[70px_minmax(220px,1fr)_120px_100px_130px] items-center px-5 py-4 transition ${
                    rank === 1
                      ? "bg-indigo-500/[0.04]"
                      : "hover:bg-white/[0.02]"
                  } ${
                    index !== rankedStudents.length - 1
                      ? "border-b border-slate-800"
                      : ""
                  }`}
                >
                  {/* Rank */}
                  <span
                    className={`text-sm font-semibold ${
                      rank === 1
                        ? "text-yellow-400"
                        : rank === 2
                        ? "text-slate-300"
                        : rank === 3
                        ? "text-orange-400"
                        : "text-slate-500"
                    }`}
                  >
                    #{rank}
                  </span>

                  {/* Student */}
                  <div className="flex items-center gap-3">
                    <ProfileImage
                      student={student}
                      size="normal"
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-slate-200">
                          {name}
                        </p>

                        {student?.isCurrentUser && (
                          <span className="rounded bg-indigo-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-indigo-400">
                            YOU
                          </span>
                        )}
                      </div>

                      {username && (
                        <p className="mt-0.5 text-xs text-slate-500">
                          {username}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Score */}
                  <p
                    className={`text-right text-sm font-semibold ${
                      rank === 1
                        ? "text-yellow-400"
                        : "text-slate-300"
                    }`}
                  >
                    {formatScore(score)}
                  </p>

                  {/* Solved */}
                  <p className="text-right text-sm text-slate-300">
                    {solved}
                  </p>

                  {/* Streak */}
                  <div className="flex justify-end">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/50 px-2.5 py-1 text-xs text-slate-400">
                      <Flame size={12} />
                      {streak} days
                    </span>
                  </div>
                </div>
              );
            })}

            <div className="px-5 py-3 text-xs text-slate-500">
              Showing {rankedStudents.length}{" "}
              {rankedStudents.length === 1
                ? "student"
                : "students"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}