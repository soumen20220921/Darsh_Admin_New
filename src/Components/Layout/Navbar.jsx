import {
  Menu,
  User as UserIcon,
  Bell,
  Search,
  X,
  Settings,
  LogOut,
  Package,
  ShoppingCart,
  Users,
  Calendar,
  Home,
  PlusCircle,
  Stethoscope,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAppContext } from "../../context/Context";

const Navbar = ({ onMenuClick }) => {
  const { setTab, tab: activeTab } = useAppContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDropdownClick = (tabIndex) => {
    setTab(tabIndex);
    setDropdownOpen(false);
  };

  const navItems = [
    { icon: <Home className="h-5 w-5" />, label: "Dashboard", index: 0 },
    { icon: <Users className="h-5 w-5" />, label: "Users", index: 1 },
    { icon: <Package className="h-5 w-5" />, label: "Products", index: 2 },
    { icon: <ShoppingCart className="h-5 w-4" />, label: "Orders", index: 3 },
    { icon: <PlusCircle className="h-5 w-5" />, label: "AddProduct", index: 4 },
    // { icon: <Stethoscope className="h-5 w-5" />, label: "Doctor", index: 5 },
    // { icon: <Calendar className="h-5 w-5" />, label: "Bookings", index: 6 },
  ];

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const quickActions = [
    { label: "View Dashboard", action: () => handleDropdownClick(0) },
    { label: "Manage Products", action: () => handleDropdownClick(2) },
    { label: "Doctors", action: () => handleDropdownClick(5) },
    { label: "Check Orders", action: () => handleDropdownClick(3) },
    { label: "Appointments", action: () => handleDropdownClick(6) },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 sticky top-0 z-50 h-16 flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none lg:hidden cursor-pointer transition-colors duration-200"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="relative flex-1  max-w-2xl" ref={searchRef}>
          <div className="hidden md:flex items-center relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients, orders, products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearch}
              onFocus={() => setSearchOpen(true)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-transparent rounded-xl focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 outline-none text-sm placeholder-gray-400"
            />
          </div>

          <div className="md:hidden flex items-center justify-between bg-gray-50 rounded-xl p-2 shadow-inner">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-lg text-gray-600 hover:bg-white hover:text-indigo-600 transition-all duration-300 transform hover:scale-110 hover:shadow-md"
            >
              <Search className="w-5 h-5" />
            </button>
            {navItems
              .filter(
                (item) =>
                  item.index !== 1 &&
                  item.index !== 2 &&
                  item.index !== 4 &&
                  item.index !== 5
              )
              .slice(0, 7)
              .map((item) => (
                <button
                  key={item.index}
                  onClick={() => handleDropdownClick(item.index)}
                  className={`relative flex flex-col items-center p-2 rounded-xl transition-all duration-300 ${
                    activeTab === item.index
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg transform -translate-y-1"
                      : "text-gray-600 hover:bg-white hover:shadow-md"
                  }`}
                >
                  {item.icon}
                </button>
              ))}
          </div>

          {searchOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-fade-in">
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-700">
                  Quick Search
                </span>
                <button
                  onClick={() => setSearchOpen(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div className="px-4 py-2">
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">
                  Quick Actions
                </p>
                <div className="space-y-1">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        action.action();
                        setSearchOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-all duration-200 text-left"
                    >
                      <Search className="w-4 h-4 text-gray-400" />
                      <span className="text-xs md:text-sm whitespace-nowrap">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 rounded-lg p-2 hover:bg-gray-100 transition-all duration-200 group"
          >
            <div className="h-9 w-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm group-hover:scale-105 transition-transform">
              PW
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-sm font-medium text-gray-700 block">
                Darsh
              </span>
              <span className="text-xs text-gray-500">Admin</span>
            </div>
            <svg
              className={`w-4 h-4 text-gray-400 ml-1 transition-transform duration-200 ${
                dropdownOpen ? "transform rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-fade-in-down">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    PW
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      Darsh
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      Darshweb@gmail.com
                    </p>
                    <p className="text-xs text-green-600 font-medium flex items-center gap-1 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Online
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">
                  Quick Access
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {navItems.slice(0, 7).map((item) => (
                    <button
                      key={item.index}
                      onClick={() => handleDropdownClick(item.index)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all duration-200 ${
                        activeTab === item.index
                          ? "bg-indigo-50 text-indigo-700 font-semibold"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1 px-2 py-2">
                <button
                  onClick={() => console.log("Logged out")}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 w-full text-left hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
