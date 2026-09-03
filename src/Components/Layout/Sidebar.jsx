import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  LayoutDashboard,
  Package,
  PanelLeftOpen,
  PlusCircle,
  ShieldCheck,
  ShoppingCart,
  Store,
  Users,
} from "lucide-react";
import { useAppContext } from "../../context/Context";

export function Sidebar({
  closeSidebar,
  collapsed = false,
  onToggleCollapse,
}) {
  const { setTab, tab: activeTab } = useAppContext();

  const [hoveredItem, setHoveredItem] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    userManagement: true,
    ecommerce: true,
    preBooking: true,
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (activeTab === 0) {
      setExpandedSections((prev) => ({
        ...prev,
        overview: true,
      }));
    }

    if (activeTab >= 1 && activeTab <= 1) {
      setExpandedSections((prev) => ({
        ...prev,
        userManagement: true,
      }));
    }

    if (activeTab >= 2 && activeTab <= 4) {
      setExpandedSections((prev) => ({
        ...prev,
        ecommerce: true,
      }));
    }

    if (activeTab >= 5 && activeTab <= 6) {
      setExpandedSections((prev) => ({
        ...prev,
        preBooking: true,
      }));
    }

  }, [activeTab]);

  const handleClick = (tabIndex) => {
    setTab(tabIndex);

    if (isMobile && closeSidebar) {
      closeSidebar();
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const navSections = useMemo(
    () => [
      {
        id: "overview",
        title: "Overview",
        icon: BarChart3,
        items: [
          { icon: LayoutDashboard, label: "Dashboard", index: 0, description: "Analytics & insights" },
        ],
      },
      {
        id: "userManagement",
        title: "User Management",
        icon: ShieldCheck,
        items: [
          { icon: Users, label: "All Users", index: 1, description: "Manage users" },
        ],
      },
      {
        id: "ecommerce",
        title: "E-commerce",
        icon: Store,
        items: [
          { icon: Package, label: "Products", index: 2, description: "Manage inventory" },
          { icon: ShoppingCart, label: "Orders", index: 3, description: "Paid & unpaid orders" },
          { icon: PlusCircle, label: "Add Product", index: 4, description: "Create new product" },
        ],
      },
      {
        id: "preBooking",
        title: "Pre-booking",
        icon: CalendarDays,
        items: [
          { icon: CalendarDays, label: "Pre-booking Products", index: 5, description: "Manage pre-booking catalogue" },
          { icon: ShoppingCart, label: "Pre-booking Orders", index: 6, description: "Manage pre-booking orders" },
        ],
      },
    ],
    []
  );

  return (
    <>
      <style>{`
        @keyframes darshSidebarItem {
          from {
            opacity: 0;
            transform: translateX(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes darshSidebarGlow {
          0%, 100% {
            opacity: .25;
            transform: translateY(0);
          }
          50% {
            opacity: .65;
            transform: translateY(12px);
          }
        }

        @keyframes darshSidebarPulse {
          0%, 100% {
            opacity: .4;
            box-shadow: 0 0 0 0 rgba(34,197,94,.15);
          }
          50% {
            opacity: 1;
            box-shadow: 0 0 0 5px rgba(34,197,94,.025);
          }
        }

        .darsh-sidebar-scroll::-webkit-scrollbar {
          width: 5px;
        }

        .darsh-sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .darsh-sidebar-scroll::-webkit-scrollbar-thumb {
          background: #292929;
          border-radius: 999px;
        }

        .darsh-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: #3a3a3a;
        }

        .darsh-sidebar-item {
          animation: darshSidebarItem .32s cubic-bezier(.22,1,.36,1) both;
        }

        @media (prefers-reduced-motion: reduce) {
          .darsh-sidebar-item {
            animation: none !important;
          }
        }
      `}</style>

      <aside className="relative z-50 flex h-full w-full flex-col overflow-hidden bg-[#0e0e0e] text-white">
        {/* Ambient decoration */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-amber-500/[0.045] blur-3xl" />
        <div
          className="pointer-events-none absolute bottom-24 -right-20 h-56 w-56 rounded-full bg-orange-500/[0.025] blur-3xl"
          style={{ animation: "darshSidebarGlow 7s ease-in-out infinite" }}
        />

       

        {/* Collapsed expand control */}
        {collapsed && !isMobile && onToggleCollapse && (
          <div className="relative border-b border-white/[0.05] p-2">
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Expand sidebar"
              title="Expand sidebar"
              className="flex h-9 w-full items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-[#666] transition-all duration-300 hover:border-amber-500/20 hover:bg-amber-500/[0.06] hover:text-amber-400"
            >
              <PanelLeftOpen size={16} />
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="darsh-sidebar-scroll relative flex-1 overflow-x-hidden overflow-y-auto px-2.5 py-4">
          {!collapsed && (
            <div className="mb-4 flex items-center gap-2 px-2">
              <span className="h-px flex-1 bg-white/[0.05]" />
              <span className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#484848]">
                Navigation
              </span>
              <span className="h-px flex-1 bg-white/[0.05]" />
            </div>
          )}

          <div className="space-y-3">
            {navSections.map((section, sectionIndex) => {
              const SectionIcon = section.icon;
              const expanded = expandedSections[section.id];

              return (
                <div
                  key={section.id}
                  className="relative"
                  style={{
                    animationDelay: `${sectionIndex * 45}ms`,
                  }}
                >
                  {/* Section heading */}
                  {!collapsed ? (
                    <button
                      type="button"
                      onClick={() => toggleSection(section.id)}
                      className="group mb-1 flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-white/[0.025]"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <SectionIcon
                          size={13}
                          className="shrink-0 text-[#555] transition-colors group-hover:text-amber-400"
                        />

                        <span className="truncate text-[9px] font-semibold uppercase tracking-[0.15em] text-[#666] group-hover:text-[#8a8a8a]">
                          {section.title}
                        </span>
                      </span>

                      <ChevronDown
                        size={12}
                        className={`shrink-0 text-[#4e4e4e] transition-transform duration-300 ${
                          expanded ? "rotate-0" : "-rotate-90"
                        }`}
                      />
                    </button>
                  ) : (
                    <div className="mb-1 flex justify-center py-1">
                      <span className="h-px w-7 bg-white/[0.06]" />
                    </div>
                  )}

                  {/* Section items */}
                  <div
                    className={`space-y-1 overflow-hidden transition-all duration-300 ${
                      collapsed || expanded
                        ? "max-h-[500px] opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    {section.items.map((item, itemIndex) => {
                      const ItemIcon = item.icon;
                      const isActive = activeTab === item.index;
                      const isHovered = hoveredItem === item.index;

                      return (
                        <button
                          type="button"
                          key={item.index}
                          onClick={() => handleClick(item.index)}
                          onMouseEnter={() => setHoveredItem(item.index)}
                          onMouseLeave={() => setHoveredItem(null)}
                          className={`darsh-sidebar-item group relative flex w-full items-center overflow-visible rounded-xl text-left transition-all duration-300 ${
                            collapsed
                              ? "h-11 justify-center px-0"
                              : "min-h-[54px] px-3"
                          } ${
                            isActive
                              ? "bg-amber-500/[0.09] text-white shadow-[inset_0_0_0_1px_rgba(245,169,11,.12)]"
                              : "text-[#777] hover:bg-white/[0.035] hover:text-white"
                          }`}
                          style={{
                            animationDelay: `${itemIndex * 35}ms`,
                          }}
                        >
                          {/* Active vertical indicator */}
                          <span
                            className={`absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full bg-[#f5a90b] transition-all duration-300 ${
                              isActive
                                ? "h-7 w-[3px] opacity-100"
                                : "h-0 w-[2px] opacity-0 group-hover:h-5 group-hover:opacity-60"
                            }`}
                          />

                          {/* Hover shimmer */}
                          <span
                            className={`pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400/[0.055] via-transparent to-transparent transition-transform duration-500 ${
                              isHovered && !isActive
                                ? "translate-x-0 opacity-100"
                                : "-translate-x-full opacity-0"
                            }`}
                          />

                          {/* Icon */}
                          <span
                            className={`relative z-10 flex shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${
                              collapsed ? "h-9 w-9" : "h-9 w-9"
                            } ${
                              isActive
                                ? "bg-amber-500/15 text-amber-400"
                                : "bg-white/[0.025] text-[#686868] group-hover:bg-white/[0.05] group-hover:text-[#c4c4c4]"
                            }`}
                          >
                            <ItemIcon
                              size={17}
                              className={`transition-transform duration-300 ${
                                isActive
                                  ? "scale-105"
                                  : "group-hover:scale-110"
                              }`}
                            />
                          </span>

                          {/* Text */}
                          {!collapsed && (
                            <span className="relative z-10 ml-3 min-w-0 flex-1">
                              <span className="flex items-center justify-between gap-2">
                                <span
                                  className={`truncate text-[11px] ${
                                    isActive
                                      ? "font-semibold text-white"
                                      : "font-medium text-[#858585] group-hover:text-white"
                                  }`}
                                >
                                  {item.label}
                                </span>

                                {isActive && (
                                  <span className="relative flex h-1.5 w-1.5 shrink-0">
                                    <span className="absolute inset-0 animate-ping rounded-full bg-amber-400 opacity-30" />
                                    <span className="relative h-1.5 w-1.5 rounded-full bg-amber-400" />
                                  </span>
                                )}
                              </span>

                              <span
                                className={`mt-0.5 block truncate text-[9px] ${
                                  isActive
                                    ? "text-[#777]"
                                    : "text-[#505050] group-hover:text-[#656565]"
                                }`}
                              >
                                {item.description}
                              </span>
                            </span>
                          )}

                          {/* Tooltip when collapsed */}
                          {collapsed && (
                            <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-[100] w-max -translate-y-1/2 translate-x-[-3px] rounded-xl border border-white/[0.09] bg-[#171717] px-3 py-2 opacity-0 shadow-[0_15px_45px_rgba(0,0,0,.5)] transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
                              <span className="block text-[10px] font-semibold text-white">
                                {item.label}
                              </span>
                              <span className="mt-0.5 block text-[9px] text-[#656565]">
                                {item.description}
                              </span>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </nav>

      

        {/* Mobile footer */}
        {isMobile && (
          <div className="shrink-0 border-t border-white/[0.05] px-4 py-2.5">
            <div className="flex items-center justify-between text-[8px] uppercase tracking-[0.12em] text-[#444]">
              <span>DARSH Admin</span>
              <span>2026</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}