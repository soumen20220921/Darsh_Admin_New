import {
  Package,
  ShoppingCart,
  Users,
  X,
  LayoutDashboard,
  Home as Dashboard,
  PlusCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  UserPlus,
  Stethoscope,
  BarChart3,
  Shield,
  Store,
  Heart,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useAppContext } from "../../context/Context";
import { useState, useEffect } from "react";

export function Sidebar({ closeSidebar }) {
  const { setTab, tab: activeTab } = useAppContext();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    userManagement: true,
    ecommerce: true,
    healthcare: true
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsCollapsed(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleClick = (tabIndex) => {
    setTab(tabIndex);
    if (closeSidebar && isMobile) closeSidebar();
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const navSections = [
    {
      id: "overview",
      title: "Overview",
      icon: <BarChart3 className="h-4 w-4" />,
      items: [
        { icon: <Dashboard className="h-4 w-4" />, label: "Dashboard", index: 0, description: "Analytics & Insights" }
      ]
    },
    {
      id: "userManagement",
      title: "User Management",
      icon: <Shield className="h-4 w-4" />,
      items: [
        { icon: <Users className="h-4 w-4" />, label: "All Users", index: 1, description: "Manage users" },
      ]
    },
    {
      id: "ecommerce",
      title: "E-commerce",
      icon: <Store className="h-4 w-4" />,
      items: [
        { icon: <Package className="h-4 w-4" />, label: "Products", index: 2, description: "Manage inventory" },
        { icon: <ShoppingCart className="h-4 w-4" />, label: "Orders", index: 3, description: "View all orders" },
        { icon: <PlusCircle className="h-4 w-4" />, label: "Add Product", index: 4, description: "Create new product" }
      ]
    },
    // {
    //   id: "healthcare",
    //   title: "Healthcare",
    //   icon: <Heart className="h-4 w-4" />,
    //   items: [
    //     { icon: <Stethoscope className="h-4 w-4" />, label: "Doctors", index: 5, description: "Manage doctors" },
    //     { icon: <Calendar className="h-4 w-4" />, label: "Bookings", index: 6, description: "Appointments" },
    //     // { icon: <Calendar className="h-4 w-4" />, label: "Tharapist", index: 7, description: "Tharapist" }


    //   ]
    // }
  ];

  const allNavItems = navSections.flatMap(section => section.items);

  return (
    <>
      {isMobile && closeSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}

      <div className={`
        h-full flex flex-col bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30 shadow-2xl border-r border-gray-200/60
        transition-all duration-500 ease-in-out relative z-50
        ${isMobile ? 'fixed inset-y-0 left-0 w-80' : 
          isCollapsed ? 'w-20' : 'w-80'}
        ${isMobile ? (closeSidebar ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
      `}>
        
        <div className="flex items-center justify-between p-6 border-b border-gray-200/40 bg-white/80 backdrop-blur-lg">
          <div className={`flex items-center gap-3 transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
            <div className="p-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Master Admin
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Management Portal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {!isMobile && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-all duration-300 cursor-pointer group border border-gray-200/60"
              >
                {isCollapsed ? 
                  <ChevronRight className="h-4 w-4 group-hover:scale-110 transition-transform" /> : 
                  <ChevronLeft className="h-4 w-4 group-hover:scale-110 transition-transform" />
                }
              </button>
            )}
            
            {isMobile && closeSidebar && (
              <button
                onClick={closeSidebar}
                className="p-2 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300 cursor-pointer border border-gray-200/60"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-2">
          {navSections.map((section) => (
            <div key={section.id} className="space-y-1">
              {!isCollapsed && (
                <div
                  onClick={() => toggleSection(section.id)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer group hover:bg-gray-100/50 transition-colors duration-200"
                >
                  <div className="flex items-center gap-2">
                    <div className="text-gray-500 group-hover:text-indigo-600 transition-colors">
                      {section.icon}
                    </div>
                    <span className="text-xs font-semibold text-purple-500 uppercase tracking-wider">
                      {section.title}
                    </span>
                  </div>
                  <div className="text-gray-400 group-hover:text-indigo-600 transition-colors">
                    {expandedSections[section.id] ? 
                      <ChevronUp className="h-3 w-3" /> : 
                      <ChevronDown className="h-3 w-3" />
                    }
                  </div>
                </div>
              )}

              <div className={`space-y-1 ${!expandedSections[section.id] && !isCollapsed ? 'hidden' : 'block'}`}>
                {section.items.map((item) => {
                  const isActive = activeTab === item.index;
                  return (
                    <div
                      key={item.index}
                      onClick={() => handleClick(item.index)}
                      onMouseEnter={() => setHoveredItem(item.index)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={`
                        flex items-center px-3 py-3 rounded-xl transition-all duration-500 cursor-pointer relative overflow-hidden group
                        ${isActive 
                          ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 transform scale-[1.02]" 
                          : "text-gray-600 hover:bg-white hover:text-gray-800 hover:shadow-md hover:shadow-gray-200/60 border border-transparent hover:border-gray-200"
                        }
                        ${isCollapsed ? "justify-center" : ""}
                      `}
                    >
                      <div className={`
                        absolute inset-0 bg-gradient-to-r from-indigo-400/10 to-purple-400/10 
                        transition-transform duration-700 ease-out
                        ${hoveredItem === item.index && !isActive ? 'translate-x-0' : '-translate-x-full'}
                      `} />
                      
                      <div className={`
                        transition-all duration-500 z-10 flex-shrink-0
                        ${isActive ? 'transform scale-110' : ''}
                        ${hoveredItem === item.index && !isActive ? 'transform scale-105' : ''}
                      `}>
                        {item.icon}
                      </div>
                      
                      {!isCollapsed && (
                        <div className="flex-1 min-w-0 ml-3 z-10">
                          <div className="flex items-center justify-between">
                            <span className={`
                              font-medium transition-all duration-300
                              ${isActive ? 'font-semibold' : ''}
                            `}>
                              {item.label}
                            </span>
                            {isActive && (
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            )}
                          </div>
                          <p className="text-xs text-blue mt-0.5 truncate">
                            {item.description}
                          </p>
                        </div>
                      )}

                      {isCollapsed && (
                        <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-50 shadow-xl">
                          <div className="font-medium">{item.label}</div>
                          <div className="text-gray-300 text-xs mt-0.5">{item.description}</div>
                        </div>
                      )}

                      {isCollapsed && isActive && (
                        <div className="absolute -right-1 w-2 h-2 bg-white rounded-full shadow-lg border border-indigo-200" />
                      )}
                    </div>
                  );
                })}
              </div>

              {!isCollapsed && section.id !== 'healthcare' && (
                <div className="border-t border-gray-200/40 my-2" />
              )}
            </div>
          ))}
        </nav>

        <div className="p-2 border-t border-gray-200/40 bg-white/60 backdrop-blur-lg">
          <div className={`
            bg-white/80 rounded-2xl shadow-lg p-4 flex items-center hover:shadow-xl transition-all duration-500 group border border-gray-200/40
            ${isCollapsed ? 'justify-center' : ''}
          `}>
            <div className="relative flex-shrink-0">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full opacity-75 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              <div className="h-12 w-12 bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-lg relative z-10 border-2 border-white shadow-sm">
                BS
              </div>
            </div>
            
            <div className={`
              flex-1 min-w-0 transition-all duration-500 overflow-hidden
              ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto ml-3'}
            `}>
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    Darsh
                  </p>
                  <p className="text-xs text-gray-600 capitalize mt-0.5">Super Admin</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-indigo-600 transition-all duration-200">
                    <Settings className="h-3 w-3" />
                  </button>
                  <button className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200">
                    <LogOut className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-gray-500">Online</span>
              </div>
            </div>

            {isCollapsed && (
              <button className="p-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all duration-300 opacity-0 group-hover:opacity-100">
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {!isCollapsed && (
           <div className="px-4 py-1 border-t border-gray-200/60 bg-white/30">
          <div className="text-center">
            <p className="text-xs text-gray-500 font-medium">v2.1.0</p>
            <p className="text-[10px] text-gray-400">© 2025 Darsh</p>
          </div>
        </div>
        )}
      </div>
    </>
  );
}