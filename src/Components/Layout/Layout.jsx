import React, { useEffect, useRef, useState } from "react";
import {
  ChevronRight,
  Command,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  X,
} from "lucide-react";

import Navbar from "./Navbar";
import { Sidebar } from "./Sidebar";
import { useAppContext } from "../../context/Context";

import User from "../users/User.jsx";
import Product from "../product/Product.jsx";
import Order from "../orders/Order.jsx";
import AddProduct from "../product/AddProduct.jsx";
import Dashboard from "../dashboard/Dashboard.jsx";

const Layout = () => {
  const { tab } = useAppContext();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [pageReady, setPageReady] = useState(false);

  const scrollRef = useRef(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("darsh-admin-sidebar");
      if (saved !== null) {
        setSidebarCollapsed(saved === "collapsed");
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "darsh-admin-sidebar",
        sidebarCollapsed ? "collapsed" : "expanded"
      );
    } catch (_) {}
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    const timer = window.setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, 80);

    return () => window.clearTimeout(timer);
  }, [tab]);

  useEffect(() => {
    setPageReady(false);
    const timer = window.setTimeout(() => setPageReady(true), 35);
    return () => window.clearTimeout(timer);
  }, [tab]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [tab]);

  useEffect(() => {
    if (!sidebarOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const renderContent = () => {
    switch (Number(tab)) {
      case 0:
        return <Dashboard />;
      case 1:
        return <User />;
      case 2:
        return <Product />;
      case 3:
        return <Order />;
      case 4:
        return <AddProduct />;
      default:
        return <Dashboard />;
    }
  };

  const currentPage =
    {
      0: "Dashboard",
      1: "Users",
      2: "Products",
      3: "Orders",
      4: "Add Product",
    }[Number(tab)] || "Dashboard";

  return (
    <div className="min-h-screen overflow-hidden bg-[#0b0b0b] text-white">
      <style>{`
        @keyframes darshPageIn {
          from { opacity: 0; transform: translateY(10px) scale(.995); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes darshGlow {
          0%,100% { opacity: .25; transform: translateX(-30%); }
          50% { opacity: .75; transform: translateX(220%); }
        }

        @keyframes darshPulse {
          0%,100% { opacity: .35; box-shadow: 0 0 0 0 rgba(245,169,11,.25); }
          50% { opacity: 1; box-shadow: 0 0 0 5px rgba(245,169,11,.04); }
        }

        .darsh-admin-scroll::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        .darsh-admin-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .darsh-admin-scroll::-webkit-scrollbar-thumb {
          background: #2c2c2c;
          border-radius: 999px;
        }

        .darsh-admin-scroll::-webkit-scrollbar-thumb:hover {
          background: #444;
        }

        .darsh-page-transition {
          animation: darshPageIn .38s cubic-bezier(.22,1,.36,1) both;
        }

        @media (prefers-reduced-motion: reduce) {
          .darsh-page-transition { animation: none !important; }
        }
      `}</style>

      {/* Desktop sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 hidden border-r border-white/[0.07] bg-[#0e0e0e] transition-[width] duration-300 ease-out lg:block ${
          sidebarCollapsed ? "w-[82px]" : "w-[270px]"
        }`}
      >
        <div className="pointer-events-none absolute left-1/2 top-[-120px] h-72 w-72 -translate-x-1/2 rounded-full bg-amber-500/[0.045] blur-3xl" />

        <div className="relative flex h-full flex-col">
          <div
            className={`flex h-[74px] shrink-0 items-center border-b border-white/[0.06] ${
              sidebarCollapsed
                ? "justify-center px-3"
                : "justify-between px-5"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f5a90b] font-black text-black shadow-[0_8px_28px_rgba(245,169,11,.16)]">
                D
              </div>

              {!sidebarCollapsed && (
                <div className="animate-[darshPageIn_.25s_ease_both]">
                  <p className="text-[15px] font-bold tracking-[0.12em]">
                    DARSH
                  </p>
                  <p className="mt-0.5 text-[9px] uppercase tracking-[0.16em] text-[#656565]">
                    Admin workspace
                  </p>
                </div>
              )}
            </div>

            {!sidebarCollapsed && (
              <button
                type="button"
                onClick={() => setSidebarCollapsed(true)}
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#666] transition hover:bg-white/[0.05] hover:text-white"
              >
                <PanelLeftClose size={17} />
              </button>
            )}
          </div>

          <div className="darsh-admin-scroll flex-1 overflow-y-auto overflow-x-hidden py-4">
            <Sidebar />
          </div>

          {sidebarCollapsed && (
            <div className="border-t border-white/[0.06] p-3">
              <button
                type="button"
                onClick={() => setSidebarCollapsed(false)}
                aria-label="Expand sidebar"
                title="Expand sidebar"
                className="flex h-10 w-full items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-[#777] transition hover:border-amber-500/20 hover:bg-amber-500/[0.05] hover:text-amber-400"
              >
                <PanelLeftOpen size={17} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/70 backdrop-blur-[3px] transition-opacity duration-300 lg:hidden ${
          sidebarOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-[70] flex w-[285px] flex-col border-r border-white/[0.08] bg-[#0e0e0e] shadow-[20px_0_80px_rgba(0,0,0,.45)] transition-transform duration-300 ease-out lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[74px] shrink-0 items-center justify-between border-b border-white/[0.06] px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5a90b] font-black text-black">
              D
            </div>
            <div>
              <p className="text-sm font-bold tracking-[0.12em]">DARSH</p>
              <p className="text-[9px] uppercase tracking-[0.14em] text-[#656565]">
                Admin workspace
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-[#777] transition hover:border-amber-500/20 hover:text-white"
          >
            <X size={17} />
          </button>
        </div>

        <div className="darsh-admin-scroll flex-1 overflow-y-auto overflow-x-hidden py-4">
          <Sidebar closeSidebar={() => setSidebarOpen(false)} />
        </div>

        <div className="border-t border-white/[0.06] px-4 py-3">
          <div className="flex items-center gap-2 text-[10px] text-[#626262]">
            <span
              className="h-2 w-2 rounded-full bg-emerald-400"
              style={{ animation: "darshPulse 2s ease-in-out infinite" }}
            />
            Live admin workspace
          </div>
        </div>
      </aside>

      {/* Main application */}
      <div
        className={`flex min-h-screen flex-col transition-[padding-left] duration-300 ${
          sidebarCollapsed ? "lg:pl-[82px]" : "lg:pl-[270px]"
        }`}
      >
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Context bar */}
        <div className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0b0b0b]/90 backdrop-blur-xl">
          <div className="flex min-h-[48px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-7">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                <LayoutDashboard size={14} />
              </div>

              <div className="flex min-w-0 items-center gap-2">
                <span className="hidden text-[10px] uppercase tracking-[0.13em] text-[#555] sm:inline">
                  DARSH Admin
                </span>
                <ChevronRight size={12} className="hidden text-[#414141] sm:block" />
                <span className="truncate text-xs font-medium text-[#aaa]">
                  {currentPage}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <div className="hidden items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 sm:flex">
                <Command size={12} className="text-[#666]" />
                <span className="text-[10px] text-[#5f5f5f]">Admin</span>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-[#606060]">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                  style={{ animation: "darshPulse 2s ease-in-out infinite" }}
                />
                <span className="hidden sm:inline">Live</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <main
          ref={scrollRef}
          className="darsh-admin-scroll relative flex-1 overflow-x-hidden overflow-y-auto bg-[#0b0b0b]"
        >
          <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-[70%] -translate-x-1/2 bg-amber-500/[0.018] blur-3xl" />

          <div className="pointer-events-none absolute left-0 right-0 top-0 h-px overflow-hidden bg-white/[0.03]">
            <div
              className="h-full w-1/3 bg-gradient-to-r from-transparent via-amber-400/30 to-transparent"
              style={{ animation: "darshGlow 5s ease-in-out infinite" }}
            />
          </div>

          <div className="relative mx-auto min-h-full w-full max-w-[1800px]">
            <div
              key={String(tab)}
              className={`darsh-page-transition ${
                pageReady ? "opacity-100" : "opacity-0"
              }`}
            >
              {renderContent()}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="hidden h-9 shrink-0 items-center justify-between border-t border-white/[0.05] bg-[#0d0d0d] px-5 text-[9px] uppercase tracking-[0.12em] text-[#4f4f4f] sm:flex">
          <div className="flex items-center gap-2">
            <Sparkles size={11} className="text-amber-500/60" />
            DARSH Admin Panel
          </div>

          <div className="flex items-center gap-3">
            <span>Secure workspace</span>
            <span className="text-[#292929]">•</span>
            <span>{new Date().getFullYear()}</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;