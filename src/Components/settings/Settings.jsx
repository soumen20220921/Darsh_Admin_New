import React, { useState } from "react";
import { User, Key, Save, Bell } from "lucide-react";
import { motion } from "framer-motion";

const Settings = () => {
  const [profile, setProfile] = useState({
    name: "Darsh",
    email: "boisalisarkar@masteradmin.com",
  });
  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
  });

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPassword({ ...password, [e.target.name]: e.target.value });
  };

  const toggleNotification = (type) => {
    setNotifications({ ...notifications, [type]: !notifications[type] });
  };

  const saveProfile = (e) => {
    e.preventDefault();
    console.log("Profile saved:", profile);
  };

  const changePassword = (e) => {
    e.preventDefault();
    if (password.new !== password.confirm) {
      alert("New passwords do not match!");
      return;
    }
    console.log("Password changed:", password);
    setPassword({ current: "", new: "", confirm: "" });
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };

  return (
    <div className="p-4 lg:p-8 space-y-10 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 min-h-screen">
      <motion.h1
        className="text-4xl font-extrabold text-gray-800 drop-shadow-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        ⚙️ Settings
      </motion.h1>

      {/* Profile Settings Section */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ rotate: 0.5, scale: 1.01 }}
        className="backdrop-blur-xl bg-white/70 border border-gray-200 shadow-xl rounded-2xl overflow-hidden"
      >
        <div className="flex items-center space-x-3 bg-gradient-to-r from-violet-400/90 to-fuchsia-300/90 text-gray-900 p-4">
          <User className="h-6 w-6" />
          <h2 className="text-lg font-semibold">User Profile</h2>
        </div>
        <div className="p-6">
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Name</label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:ring-2 focus:ring-violet-400 focus:border-violet-400 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:ring-2 focus:ring-violet-400 focus:border-violet-400 transition"
                />
              </div>
            </div>
            <button
              type="submit"
              className="flex items-center px-5 py-2 bg-gradient-to-r from-violet-500 to-pink-400 text-white rounded-lg shadow-md transform hover:scale-105 hover:shadow-lg transition-all"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Profile
            </button>
          </form>
        </div>
      </motion.div>

      {/* Security Settings Section */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ rotate: -0.5, scale: 1.01 }}
        className="backdrop-blur-xl bg-white/70 border border-gray-200 shadow-xl rounded-2xl overflow-hidden"
      >
        <div className="flex items-center space-x-3 bg-gradient-to-r from-orange-300/90 to-rose-300/90 text-gray-900 p-4">
          <Key className="h-6 w-6" />
          <h2 className="text-lg font-semibold">Password & Security</h2>
        </div>
        <div className="p-6">
          <form onSubmit={changePassword} className="space-y-4">
            <input
              type="password"
              name="current"
              placeholder="Current Password"
              value={password.current}
              onChange={handlePasswordChange}
              className="block w-full rounded-lg border-gray-200 shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition"
            />
            <input
              type="password"
              name="new"
              placeholder="New Password"
              value={password.new}
              onChange={handlePasswordChange}
              className="block w-full rounded-lg border-gray-200 shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition"
            />
            <input
              type="password"
              name="confirm"
              placeholder="Confirm New Password"
              value={password.confirm}
              onChange={handlePasswordChange}
              className="block w-full rounded-lg border-gray-200 shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition"
            />
            <button
              type="submit"
              className="flex items-center px-5 py-2 bg-gradient-to-r from-orange-400 to-rose-400 text-white rounded-lg shadow-md transform hover:scale-105 hover:shadow-lg transition-all"
            >
              <Save className="h-4 w-4 mr-2" />
              Change Password
            </button>
          </form>
        </div>
      </motion.div>

      {/* Notifications Section */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ rotate: 0.5, scale: 1.01 }}
        className="backdrop-blur-xl bg-white/70 border border-gray-200 shadow-xl rounded-2xl overflow-hidden"
      >
        <div className="flex items-center space-x-3 bg-gradient-to-r from-teal-300/90 to-emerald-300/90 text-gray-900 p-4">
          <Bell className="h-6 w-6" />
          <h2 className="text-lg font-semibold">Notification Preferences</h2>
        </div>
        <div className="p-6 space-y-4">
          {Object.entries(notifications).map(([type, value]) => (
            <div key={type} className="flex items-center justify-between">
              <span className="capitalize text-gray-700">{type} Notifications</span>
              <button
                onClick={() => toggleNotification(type)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
                  value ? "bg-teal-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                    value ? "translate-x-6" : "translate-x-0"
                  }`}
                ></div>
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
