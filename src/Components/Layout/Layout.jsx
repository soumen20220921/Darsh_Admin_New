import React, { useState, useEffect, useRef } from "react";
import Navbar from "./Navbar";
import { Sidebar } from "./Sidebar";
import { useAppContext } from "../../context/Context";
import User from "../users/User.jsx";
import Product from "../product/Product.jsx";
import Order from "../orders/Order.jsx";
import AddProduct from "../product/AddProduct.jsx";
import Dashboard from "../dashboard/Dashboard.jsx";
import Doctor from "../Doctor/Doctor.jsx";
import Booking from "../Doctor/Booking.jsx";
import Therapist from "../Tharapist/Therapist.js";
const Layout = () => {
  const { tab } = useAppContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
      scrollRef.current.scrollTop = 0;
    }
  }, [tab]);

  const renderContent = () => {
    switch (tab) {
      case 0: return <Dashboard />;
      case 1: return <User />;
      case 2: return <Product />;
      case 3: return <Order />;
      case 4: return <AddProduct />;
      case 5: return <Doctor />;
      case 6: return <Booking />;
      case 7: return <Therapist/>
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-500 ease-in-out lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar closeSidebar={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main
          ref={scrollRef}
          className="flex-1 overflow-x-hidden overflow-y-auto  bg-transparent"
        >
          <div className="  mx-auto animate-fadeIn">
            <div className="bg-white/80 backdrop-blur-lg  shadow-sm border border-white/50 p-6 lg:p-8">
              {renderContent()}
            </div>
          </div>
        </main>

        
      </div>
    </div>
  );
};

export default Layout;