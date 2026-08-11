import React, { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  Command,
  Home,
  LogOut,
  Menu,
  Package,
  PlusCircle,
  Search,
  ShoppingCart,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useAppContext } from "../../context/Context";

const Navbar = ({ onMenuClick }) => {
  const { setTab, tab: activeTab } = useAppContext();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  const navItems = [
    { icon: Home, label: "Dashboard", index: 0 },
    { icon: Users, label: "Users", index: 1 },
    { icon: Package, label: "Products", index: 2 },
    { icon: ShoppingCart, label: "Orders", index: 3 },
    { icon: PlusCircle, label: "Add Product", index: 4 },
  ];

  const quickActions = [
    {
      label: "View Dashboard",
      description: "Store overview",
      icon: Home,
      index: 0,
    },
    {
      label: "Manage Products",
      description: "Catalogue & stock",
      icon: Package,
      index: 2,
    },
    {
      label: "Check Orders",
      description: "Paid & unpaid orders",
      icon: ShoppingCart,
      index: 3,
    },
    {
      label: "Add Product",
      description: "Create a listing",
      icon: PlusCircle,
      index: 4,
    },
    
  ];

  const notifications = [
    {
      title: "Order activity",
      text: "Check recent paid and unpaid orders.",
      icon: ShoppingCart,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      title: "Catalogue",
      text: "Review your latest product listings.",
      icon: Package,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
   
  ];

  const closeAll = () => {
    setProfileOpen(false);
    setNotificationOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }

      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);

        window.setTimeout(() => {
          searchInputRef.current?.focus();
        }, 50);
      }

      if (event.key === "Escape") {
        setSearchOpen(false);
        closeAll();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      window.setTimeout(() => {
        searchInputRef.current?.focus();
      }, 80);
    }
  }, [searchOpen]);

  const handleTab = (index) => {
    setTab(index);
    closeAll();
    setSearchOpen(false);
    setSearchQuery("");
  };

  const handleSearch = (event) => {
    if (event.key !== "Enter") return;

    const query = searchQuery.trim().toLowerCase();

    if (!query) return;

    const result = navItems.find((item) =>
      item.label.toLowerCase().includes(query)
    );

    if (result) {
      handleTab(result.index);
      return;
    }

    const action = quickActions.find(
      (item) =>
        item.label.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    );

    if (action) {
      handleTab(action.index);
    }
  };

  const filteredActions = quickActions.filter((action) => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return true;

    return (
      action.label.toLowerCase().includes(query) ||
      action.description.toLowerCase().includes(query)
    );
  });

  return (
    <>
      <style>{`
        @keyframes navbarDrop {
          from {
            opacity: 0;
            transform: translateY(-7px) scale(.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes navbarPop {
          from {
            opacity: 0;
            transform: translateY(8px) scale(.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes navbarShine {
          0% {
            transform: translateX(-130%) skewX(-15deg);
          }
          100% {
            transform: translateX(260%) skewX(-15deg);
          }
        }

        @keyframes navbarPulse {
          0%, 100% {
            opacity: .4;
            box-shadow: 0 0 0 0 rgba(34,197,94,.15);
          }
          50% {
            opacity: 1;
            box-shadow: 0 0 0 5px rgba(34,197,94,.035);
          }
        }

        .darsh-navbar-popup {
          animation: navbarDrop .22s cubic-bezier(.22,1,.36,1) both;
        }

        .darsh-search-pop {
          animation: navbarPop .24s cubic-bezier(.22,1,.36,1) both;
        }

        .darsh-navbar-scroll::-webkit-scrollbar {
          width: 5px;
        }

        .darsh-navbar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .darsh-navbar-scroll::-webkit-scrollbar-thumb {
          background: #303030;
          border-radius: 999px;
        }
      `}</style>

      <header
        className={`sticky top-0 z-50 h-[70px] border-b transition-all duration-300 ${
          scrolled
            ? "border-white/[0.09] bg-[#0d0d0d]/95 shadow-[0_10px_40px_rgba(0,0,0,.22)]"
            : "border-white/[0.06] bg-[#0d0d0d]/90"
        } backdrop-blur-2xl`}
      >
        {/* Ambient top glow */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden bg-white/[0.025]">
          <div
            className="h-full w-1/4 bg-gradient-to-r from-transparent via-amber-400/40 to-transparent"
            style={{
              animation: "navbarShine 6s ease-in-out infinite",
            }}
          />
        </div>

        <div className="relative flex h-full items-center gap-3 px-3 sm:px-5 lg:px-6">
          {/* Mobile menu */}
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-[#999] transition-all duration-300 hover:border-amber-500/20 hover:bg-amber-500/[0.06] hover:text-amber-400 lg:hidden"
          >
            <Menu
              size={19}
              className="transition-transform duration-300 group-hover:scale-110"
            />
          </button>

           {/* Mobile brand */}
          <div className="flex shrink-0 items-center gap-2.5 lg:hidden">
            

            <div className="">
              <p className="text-[17px] font-bold tracking-[0.12em] text-white">
                DARSH
              </p>
              <p className="text-[9px] uppercase tracking-[0.15em] text-[#f0f2f5]">
                Admin
              </p>
            </div>
          </div>

          {/* Desktop brand/context */}
          <div className="hidden w-[215px] shrink-0 items-center gap-3 lg:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <Sparkles size={17} />
            </div>

            <div>
              <p className="text-xs font-semibold tracking-[0.08em] text-white">
                DARSH
              </p>
              <p className="mt-0.5 text-[9px] uppercase tracking-[0.14em] text-[#575757]">
                Management Console
              </p>
            </div>
          </div>

          {/* Search */}
          <div
            ref={searchRef}
            className="relative min-w-0 flex-1 lg:max-w-[650px]"
          >
            <div
              className={`hidden h-10 items-center rounded-xl border transition-all duration-300 md:flex ${
                searchOpen
                  ? "border-amber-500/30 bg-[#171717] shadow-[0_0_0_3px_rgba(245,169,11,.04)]"
                  : "border-white/[0.07] bg-[#141414] hover:border-white/[0.11]"
              }`}
            >
              <Search
                size={16}
                className={`ml-3 shrink-0 transition-colors ${
                  searchOpen ? "text-amber-400" : "text-[#666]"
                }`}
              />

              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search orders, products, users..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={handleSearch}
                onFocus={() => setSearchOpen(true)}
                className="h-full min-w-0 flex-1 bg-transparent px-3 text-xs text-white outline-none placeholder:text-[#555]"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mr-1 flex h-7 w-7 items-center justify-center rounded-lg text-[#666] transition hover:bg-white/[0.05] hover:text-white"
                >
                  <X size={14} />
                </button>
              )}

              <div className="mr-2 hidden items-center gap-1 rounded-md border border-white/[0.07] bg-white/[0.025] px-2 py-1 xl:flex">
                <Command size={10} className="text-[#5b5b5b]" />
                <span className="text-[9px] text-[#555]">K</span>
              </div>
            </div>

            {/* Mobile search button */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-[#888] transition hover:border-amber-500/20 hover:bg-amber-500/[0.05] hover:text-amber-400 md:hidden"
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            {/* Search dropdown */}
            {searchOpen && (
              <div className="darsh-search-pop absolute left-0 right-0 top-[48px] z-[80] overflow-hidden rounded-2xl border border-white/[0.09] bg-[#151515] shadow-[0_25px_80px_rgba(0,0,0,.55)]">
                <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                  <div>
                    <p className="text-xs font-semibold text-white">
                      Quick navigation
                    </p>
                    <p className="mt-0.5 text-[10px] text-[#5f5f5f]">
                      Search a section and press Enter
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[#666] transition hover:bg-white/[0.05] hover:text-white"
                  >
                    <X size={15} />
                  </button>
                </div>

                <div className="darsh-navbar-scroll max-h-[360px] overflow-y-auto p-2">
                  {filteredActions.length ? (
                    filteredActions.map((action) => {
                      const Icon = action.icon;
                      const active = activeTab === action.index;

                      return (
                        <button
                          type="button"
                          key={action.index}
                          onClick={() => handleTab(action.index)}
                          className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 ${
                            active
                              ? "bg-amber-500/[0.08]"
                              : "hover:bg-white/[0.035]"
                          }`}
                        >
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all ${
                              active
                                ? "bg-amber-500/15 text-amber-400"
                                : "bg-white/[0.04] text-[#777] group-hover:bg-white/[0.07] group-hover:text-white"
                            }`}
                          >
                            <Icon size={16} />
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="block text-xs font-medium text-white">
                              {action.label}
                            </span>
                            <span className="mt-0.5 block text-[10px] text-[#626262]">
                              {action.description}
                            </span>
                          </span>

                          {active && (
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <div className="px-4 py-10 text-center">
                      <Search
                        size={22}
                        className="mx-auto text-[#4d4d4d]"
                      />
                      <p className="mt-3 text-xs font-medium text-[#888]">
                        No section found
                      </p>
                      <p className="mt-1 text-[10px] text-[#555]">
                        Try “orders”, “products” or “dashboard”
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right controls */}
          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            {/* Desktop shortcut */}
            <div className="hidden items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 xl:flex">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-40" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[9px] uppercase tracking-[0.12em] text-[#5d5d5d]">
                Live
              </span>
            </div>

            {/* Notification */}
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                onClick={() => {
                  setNotificationOpen((value) => !value);
                  setProfileOpen(false);
                }}
                aria-label="Notifications"
                className={`group relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300 ${
                  notificationOpen
                    ? "border-amber-500/20 bg-amber-500/[0.07] text-amber-400"
                    : "border-white/[0.07] bg-white/[0.025] text-[#777] hover:border-white/[0.12] hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                <Bell
                  size={17}
                  className="transition-transform duration-300 group-hover:-rotate-6"
                />

                <span className="absolute right-2.5 top-2 h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,169,11,.65)]" />
              </button>

              {notificationOpen && (
                <div className="darsh-navbar-popup absolute right-0 top-[48px] z-[80] w-[300px] overflow-hidden rounded-2xl border border-white/[0.09] bg-[#151515] shadow-[0_25px_80px_rgba(0,0,0,.55)]">
                  <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3.5">
                    <div>
                      <p className="text-xs font-semibold text-white">
                        Notifications
                      </p>
                      <p className="mt-0.5 text-[10px] text-[#5d5d5d]">
                        Store activity overview
                      </p>
                    </div>

                    <span className="rounded-full bg-amber-500/10 px-2 py-1 text-[9px] font-semibold text-amber-400">
                      {notifications.length} updates
                    </span>
                  </div>

                  <div className="p-2">
                    {notifications.map((item) => {
                      const Icon = item.icon;

                      return (
                        <div
                          key={item.title}
                          className="flex gap-3 rounded-xl px-3 py-3 transition hover:bg-white/[0.035]"
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.bg} ${item.color}`}
                          >
                            <Icon size={16} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-medium text-white">
                              {item.title}
                            </p>
                            <p className="mt-1 text-[10px] leading-4 text-[#666]">
                              {item.text}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen((value) => !value);
                  setNotificationOpen(false);
                }}
                className={`group flex h-10 items-center gap-2 rounded-xl border px-1.5 pr-2 transition-all duration-300 ${
                  profileOpen
                    ? "border-amber-500/20 bg-amber-500/[0.06]"
                    : "border-white/[0.07] bg-white/[0.025] hover:border-white/[0.12] hover:bg-white/[0.05]"
                }`}
              >
                <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 text-[11px] font-black text-black shadow-[0_5px_18px_rgba(245,169,11,.14)]">
                  D
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0d0d0d] bg-emerald-400" />
                </div>

                <div className="hidden text-left sm:block">
                  <span className="block text-[11px] font-semibold text-white">
                    DARSH
                  </span>
                  <span className="block text-[9px] text-[#5d5d5d]">
                    Administrator
                  </span>
                </div>

                <ChevronDown
                  size={14}
                  className={`ml-1 hidden text-[#666] transition-transform duration-300 sm:block ${
                    profileOpen ? "rotate-180 text-amber-400" : ""
                  }`}
                />
              </button>

              {profileOpen && (
                <div className="darsh-navbar-popup absolute right-0 top-[48px] z-[80] w-[285px] overflow-hidden rounded-2xl border border-white/[0.09] bg-[#151515] shadow-[0_25px_80px_rgba(0,0,0,.55)]">
                  {/* Profile header */}
                  <div className="relative overflow-hidden border-b border-white/[0.06] p-4">
                    <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-amber-500/[0.07] blur-2xl" />

                    <div className="relative flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 font-black text-black shadow-[0_8px_25px_rgba(245,169,11,.12)]">
                        D
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">
                          DARSH
                        </p>
                        <p className="mt-0.5 truncate text-[10px] text-[#656565]">
                          contactdarsh9@gmail.com
                        </p>
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          <span className="text-[9px] font-medium text-emerald-400">
                            Online
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick navigation */}
                  <div className="border-b border-white/[0.06] p-3">
                    <p className="px-1 pb-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#555]">
                      Quick access
                    </p>

                    <div className="grid grid-cols-2 gap-1.5">
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = activeTab === item.index;

                        return (
                          <button
                            type="button"
                            key={item.index}
                            onClick={() => handleTab(item.index)}
                            className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[10px] font-medium transition-all ${
                              active
                                ? "bg-amber-500/10 text-amber-400"
                                : "text-[#777] hover:bg-white/[0.04] hover:text-white"
                            }`}
                          >
                            <Icon size={14} />
                            <span className="truncate">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Account actions */}
                  <div className="p-2">
                    <button
                      type="button"
                      onClick={() => setProfileOpen(false)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs text-rose-400/80 transition hover:bg-rose-500/[0.06] hover:text-rose-400"
                    >
                      <LogOut size={15} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile search modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-[75] bg-black/70 backdrop-blur-sm md:hidden">
          <div className="absolute inset-x-3 top-3 overflow-hidden rounded-2xl border border-white/[0.09] bg-[#151515] shadow-[0_30px_100px_rgba(0,0,0,.65)]">
            <div className="flex items-center gap-2 border-b border-white/[0.06] p-3">
              <Search size={17} className="text-amber-400" />

              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={handleSearch}
                placeholder="Search admin sections..."
                className="h-10 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#555]"
              />

              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#666] hover:bg-white/[0.05] hover:text-white"
              >
                <X size={17} />
              </button>
            </div>

            <div className="darsh-navbar-scroll max-h-[70vh] overflow-y-auto p-2">
              {filteredActions.map((action) => {
                const Icon = action.icon;

                return (
                  <button
                    type="button"
                    key={action.index}
                    onClick={() => handleTab(action.index)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                      activeTab === action.index
                        ? "bg-amber-500/10"
                        : "hover:bg-white/[0.035]"
                    }`}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] text-[#888]">
                      <Icon size={16} />
                    </span>

                    <span>
                      <span className="block text-xs font-medium text-white">
                        {action.label}
                      </span>
                      <span className="mt-0.5 block text-[10px] text-[#5d5d5d]">
                        {action.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;