import { useEffect, useRef, useState } from "react"
import { supabase } from "../lib/supabase"

import {
  Search,
  Bell,
  Command,
  Menu,
  X,
  Trophy,
  Zap,
  Medal,
  ArrowRight,
  LayoutDashboard,
  UserRound,
  BarChart3,
  Settings,
  Check,
} from "lucide-react"


const searchablePages = [
  {
    name: "Dashboard",
    description: "View your coding overview",
    icon: LayoutDashboard,
  },
  {
    name: "Leaderboard",
    description: "View student rankings",
    icon: Medal,
  },
  {
    name: "Student Profile",
    description: "View your coding profile",
    icon: UserRound,
  },
  {
    name: "Contests",
    description: "Upcoming and past contests",
    icon: Trophy,
  },
  {
    name: "Analytics",
    description: "View your coding analytics",
    icon: BarChart3,
  },
  {
    name: "Settings",
    description: "Manage your preferences",
    icon: Settings,
  },
]


function Topbar({
  activePage,
  setActivePage,
  sidebarCollapsed,
  onMenuClick,
}) {
  const [searchOpen, setSearchOpen] =
    useState(false)

  const [notificationOpen, setNotificationOpen] =
    useState(false)

  const [notifications, setNotifications] =
    useState([])

  const [notificationsLoading, setNotificationsLoading] =
    useState(false)

  const [searchQuery, setSearchQuery] =
    useState("")

  const searchRef = useRef(null)


  /* ========================================================= */
  /* PAGE INFORMATION                                          */
  /* ========================================================= */

  const pageInfo = {
    Dashboard: {
      section: "Dashboard",
      title: "Overview",
    },

    Leaderboard: {
      section: "Leaderboard",
      title: "Student Rankings",
    },

    "Student Profile": {
      section: "Student Profile",
      title: "Your Coding Profile",
    },

    Contests: {
      section: "Contests",
      title: "Upcoming & Past Contests",
    },

    Analytics: {
      section: "Analytics",
      title: "Coding Performance",
    },

    Settings: {
      section: "Settings",
      title: "Preferences",
    },

    Notifications: {
      section: "Notifications",
      title: "All Notifications",
    },
  }


  const currentPage =
    pageInfo[activePage] ||
    pageInfo.Dashboard


  /* ========================================================= */
  /* SEARCH RESULTS                                            */
  /* ========================================================= */

  const filteredResults =
    searchQuery.trim() === ""
      ? searchablePages
      : searchablePages.filter(
        (item) =>
          item.name
            .toLowerCase()
            .includes(
              searchQuery
                .toLowerCase()
            ) ||
          item.description
            .toLowerCase()
            .includes(
              searchQuery
                .toLowerCase()
            )
      )


  /* ========================================================= */
  /* KEYBOARD SHORTCUT                                         */
  /* ========================================================= */

  useEffect(() => {
    const handleKeyDown = (event) => {

      if (
        (event.metaKey ||
          event.ctrlKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault()

        setSearchOpen(true)
        setNotificationOpen(false)
      }


      if (event.key === "Escape") {
        setSearchOpen(false)
        setNotificationOpen(false)
        setSearchQuery("")
      }
    }


    window.addEventListener(
      "keydown",
      handleKeyDown
    )


    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      )
    }
  }, [])


  /* ========================================================= */
  /* SEARCH FOCUS                                              */
  /* ========================================================= */

  useEffect(() => {

    if (searchOpen) {
      setTimeout(() => {
        searchRef.current?.focus()
      }, 50)
    }

  }, [searchOpen])


  /* ========================================================= */
  /* NOTIFICATIONS                                              */
  /* ========================================================= */

  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true)

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        return
      }

      const response = await fetch(
        "https://codesync-su2x.onrender.com/api/notifications",
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
          "Failed to load notifications."
        )
      }

      setNotifications(
        result.data?.notifications || []
      )
    } catch (error) {
      console.error(
        "Topbar notifications error:",
        error
      )
    } finally {
      setNotificationsLoading(false)
    }
  }


  useEffect(() => {
    fetchNotifications()
  }, [])


  const unreadNotificationCount =
    notifications.filter(
      (notification) =>
        !notification.isRead
    ).length


  const markNotificationAsRead = async (
    recipientId
  ) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        return
      }

      const response = await fetch(
        `https://codesync-su2x.onrender.com/api/notifications/${recipientId}/read`,
        {
          method: "PUT",
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
          "Failed to mark notification as read."
        )
      }

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === recipientId
            ? {
              ...notification,
              isRead: true,
              readAt:
                result.data?.read_at ||
                new Date().toISOString(),
            }
            : notification
        )
      )
    } catch (error) {
      console.error(
        "Topbar mark notification error:",
        error
      )
    }
  }


  const getNotificationIcon = (type) => {
    switch (type) {
      case "CONTEST":
        return {
          icon: Trophy,
          iconClass: "text-amber-400",
          bgClass: "bg-amber-400/10",
        }

      case "LEADERBOARD":
        return {
          icon: Medal,
          iconClass: "text-blue-400",
          bgClass: "bg-blue-400/10",
        }

      case "STREAK":
        return {
          icon: Zap,
          iconClass: "text-violet-400",
          bgClass: "bg-violet-400/10",
        }

      default:
        return {
          icon: Bell,
          iconClass: "text-primary",
          bgClass: "bg-primary/10",
        }
    }
  }


  const formatNotificationTime = (date) => {
    if (!date) return ""

    const createdAt = new Date(date)
    const diffMinutes = Math.floor(
      Math.max(
        0,
        Date.now() - createdAt.getTime()
      ) / (1000 * 60)
    )

    if (diffMinutes < 1) return "Just now"
    if (diffMinutes < 60) {
      return `${diffMinutes}m`
    }

    const diffHours = Math.floor(
      diffMinutes / 60
    )

    if (diffHours < 24) {
      return `${diffHours}h`
    }

    const diffDays = Math.floor(
      diffHours / 24
    )

    if (diffDays < 7) {
      return `${diffDays}d`
    }

    return createdAt.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
      }
    )
  }


  /* ========================================================= */
  /* NAVIGATE                                                   */
  /* ========================================================= */

  const navigateTo = (page) => {

    if (setActivePage) {
      setActivePage(page)
    }

    setSearchOpen(false)
    setNotificationOpen(false)
    setSearchQuery("")
  }


  return (
    <>
      {/* ================================================= */}
      {/* TOPBAR                                             */}
      {/* ================================================= */}

      <header className={`fixed left-0 right-0 top-0 z-50 h-[72px] border-b border-border bg-background/95 backdrop-blur-xl ${sidebarCollapsed ? "md:left-[76px]" : "md:left-[240px]"}`}>

        <div className="flex h-full items-center justify-between gap-2 px-3 sm:px-7">

          {/* LEFT */}
          <div className="flex min-w-0 items-center gap-3">

            <button
              type="button"
              onClick={onMenuClick}
              aria-label="Open navigation menu"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-sm hover:bg-secondary hover:text-foreground md:hidden"
            >
              <Menu size={19} />
            </button>


            <div className="min-w-0">

              <div className="flex items-center gap-2">

                <span className="text-xs font-medium text-muted-foreground">
                  CodeSync
                </span>

                <span className="text-[10px] text-muted-foreground/40">
                  /
                </span>

                <span className="truncate text-xs font-semibold text-primary">
                  {currentPage.section}
                </span>

              </div>


              <h2 className="mt-0.5 truncate text-base font-bold tracking-tight text-foreground">
                {currentPage.title}
              </h2>

            </div>

          </div>


          {/* RIGHT */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">

            {/* SEARCH */}
            <button
              type="button"
              onClick={() => {
                setSearchOpen(true)
                setNotificationOpen(
                  false
                )
              }}
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-secondary/70 px-0 sm:w-auto sm:justify-start sm:px-3 text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/[0.04] hover:text-foreground sm:min-w-[190px]"
            >

              <Search
                size={16}
                className="group-hover:text-primary"
              />

              <span className="hidden flex-1 text-left text-xs sm:block">
                Search anything...
              </span>

              <span className="ml-auto hidden items-center gap-1 rounded-md border border-border bg-background px-1.5 py-1 font-mono text-[9px] sm:flex">
                <Command size={9} />
                K
              </span>

            </button>


            {/* NOTIFICATION */}
            <div className="relative">

              <button
                type="button"
                onClick={() => {
                  setNotificationOpen(
                    (prev) =>
                      !prev
                  )

                  setSearchOpen(false)
                }}
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${notificationOpen
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border bg-secondary/70 text-muted-foreground hover:border-primary/30 hover:bg-primary/[0.04] hover:text-foreground"
                  }`}
              >

                <Bell
                  size={17}
                  strokeWidth={1.8}
                />

                {unreadNotificationCount > 0 && (
                  <span className="absolute right-2.5 top-2 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                )}

              </button>


              {/* NOTIFICATION DROPDOWN */}
              {notificationOpen && (

                <div className="absolute right-0 top-12 w-[min(350px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-border bg-card shadow-[0_20px_70px_rgba(0,0,0,0.35)]">

                  <div className="flex items-center justify-between border-b border-border px-4 py-3.5">

                    <div>
                      <p className="text-sm font-bold">
                        Notifications
                      </p>

                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        Your latest updates
                      </p>
                    </div>

                    <span className="rounded-full bg-primary/10 px-2 py-1 text-[9px] font-bold text-primary">
                      {unreadNotificationCount} New
                    </span>

                  </div>


                  <div className="divide-y divide-border max-h-[310px] overflow-y-auto">
                    {notificationsLoading ? (
                      <div className="px-4 py-8 text-center">
                        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-transparent border-t-primary border-r-primary/40" />
                        <p className="mt-3 text-xs text-muted-foreground">
                          Loading notifications...
                        </p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Bell
                          size={22}
                          className="mx-auto text-muted-foreground/50"
                        />
                        <p className="mt-3 text-xs font-semibold">
                          No notifications
                        </p>
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          You&apos;re all caught up.
                        </p>
                      </div>
                    ) : (
                      notifications
                        .slice(0, 5)
                        .map((notification) => {
                          const {
                            icon: Icon,
                            iconClass,
                            bgClass,
                          } = getNotificationIcon(
                            notification.type
                          )

                          return (
                            <NotificationItem
                              key={notification.id}
                              icon={Icon}
                              iconClass={iconClass}
                              bgClass={bgClass}
                              title={notification.title}
                              description={notification.description}
                              time={formatNotificationTime(
                                notification.createdAt
                              )}
                              unread={
                                !notification.isRead
                              }
                              onClick={() => {
                                if (
                                  !notification.isRead
                                ) {
                                  markNotificationAsRead(
                                    notification.id
                                  )
                                }
                              }}
                            />
                          )
                        })
                    )}
                  </div>


                  {/* VIEW ALL */}
                  <button
                    type="button"
                    onClick={() =>
                      navigateTo(
                        "Notifications"
                      )
                    }
                    className="group flex w-full items-center justify-center gap-2 border-t border-border px-4 py-3.5 text-xs font-semibold text-muted-foreground transition-all hover:bg-secondary hover:text-primary"
                  >
                    View all notifications

                    <ArrowRight
                      size={13}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </button>

                </div>
              )}

            </div>

          </div>

        </div>

      </header>


      {/* ================================================= */}
      {/* SEARCH MODAL                                       */}
      {/* ================================================= */}

      {searchOpen && (

        <div
          className="fixed inset-0 z-[200] flex items-start justify-center bg-black/60 px-4 pt-[100px] backdrop-blur-sm"
          onMouseDown={() =>
            setSearchOpen(false)
          }
        >

          <div
            className="w-full max-w-[620px] overflow-hidden rounded-2xl border border-border bg-card shadow-[0_30px_100px_rgba(0,0,0,0.55)]"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
          >

            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-4">

              <Search
                size={19}
                className="shrink-0 text-primary"
              />

              <input
                ref={searchRef}
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(
                    e.target.value
                  )
                }
                type="text"
                placeholder="Search pages..."
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />


              {searchQuery && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchQuery(
                      ""
                    )
                  }
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <X size={14} />
                </button>
              )}


              <button
                type="button"
                onClick={() => {
                  setSearchOpen(
                    false
                  )
                  setSearchQuery("")
                }}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X size={15} />
              </button>

            </div>


            {/* RESULTS */}
            <div className="max-h-[400px] overflow-y-auto p-3">

              <p className="px-2 pb-2 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                {searchQuery
                  ? "Search Results"
                  : "Quick Navigation"}
              </p>


              {filteredResults.length > 0 ? (

                filteredResults.map(
                  (item) => (
                    <SearchResult
                      key={
                        item.name
                      }
                      item={item}
                      active={
                        activePage ===
                        item.name
                      }
                      onClick={() =>
                        navigateTo(
                          item.name
                        )
                      }
                    />
                  )
                )

              ) : (

                <div className="px-4 py-10 text-center">

                  <Search
                    size={24}
                    className="mx-auto text-muted-foreground/40"
                  />

                  <p className="mt-3 text-sm font-semibold">
                    No results found
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Try searching for a page or feature.
                  </p>

                </div>

              )}

            </div>


            {/* FOOTER */}
            <div className="flex items-center justify-between border-t border-border bg-secondary/30 px-4 py-3">

              <span className="text-[10px] text-muted-foreground">
                Press{" "}
                <span className="font-mono text-foreground">
                  ESC
                </span>{" "}
                to close
              </span>

              <span className="text-[10px] text-muted-foreground">
                CodeSync Search
              </span>

            </div>

          </div>

        </div>
      )}

    </>
  )
}


/* ============================================================= */
/* SEARCH RESULT                                                */
/* ============================================================= */

function SearchResult({
  item,
  active,
  onClick,
}) {
  const Icon = item.icon

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all ${active
        ? "bg-primary/10"
        : "hover:bg-secondary"
        }`}
    >

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon size={16} />
      </div>


      <div className="min-w-0 flex-1">

        <p className="text-xs font-semibold">
          {item.name}
        </p>

        <p className="mt-0.5 text-[10px] text-muted-foreground">
          {item.description}
        </p>

      </div>


      {active ? (
        <Check
          size={14}
          className="text-primary"
        />
      ) : (
        <ArrowRight
          size={14}
          className="text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
        />
      )}

    </button>
  )
}


/* ============================================================= */
/* NOTIFICATION ITEM                                             */
/* ============================================================= */

function NotificationItem({
  icon: Icon,
  iconClass,
  bgClass,
  title,
  description,
  time,
  unread,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full gap-3 px-4 py-3.5 text-left transition-colors hover:bg-secondary/40 ${unread ? "bg-primary/[0.025]" : ""
        }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bgClass}`}
      >
        <Icon
          size={16}
          className={iconClass}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-xs font-semibold">
              {title}
            </p>

            {unread && (
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            )}
          </div>

          <span className="shrink-0 text-[9px] text-muted-foreground">
            {time}
          </span>
        </div>

        <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
          {description}
        </p>
      </div>
    </button>
  )
}


export default Topbar