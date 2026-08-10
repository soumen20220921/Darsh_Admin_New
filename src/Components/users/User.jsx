import axios from "axios";
import { Search, Edit, Trash2, UserPlus, Users, Download, RefreshCw, Zap, Sparkles, Mail, Phone, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppContext } from "../../context/Context";

const User = () => {
  const [allUser, setAllUser] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [exporting, setExporting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshPulse, setRefreshPulse] = useState(false);
  const { url } = useAppContext();

  // Auto-refresh pulse effect
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setRefreshPulse(true);
      setTimeout(() => setRefreshPulse(false), 1000);
    }, 30000);

    return () => clearInterval(pulseInterval);
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${url}/api/user/allusers`);
      setAllUser(res.data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setAllUser([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [url]);

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await fetchUsers();
      setTimeout(() => setRefreshing(false), 1000);
    } catch (error) {
      setRefreshing(false);
      console.error("Failed to refresh users:", error);
    }
  };

  const exportUsers = async () => {
    setExporting(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      const data = filteredUsers.map(user => ({
        'User ID': user._id,
        'Full Name': user.name || 'N/A',
        'Email': user.email || 'N/A',
        'Registration Date': user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : 'N/A',
        'Account Status': user.isActive !== false ? 'Active' : 'Inactive','Account Age': user.createdAt ? `${Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))} days` : 'N/A'
      }));

      const csv = Object.keys(data[0]).join(',') + '\n' +
        data.map(row => 
          Object.values(row).map(field => 
            `"${String(field).replace(/"/g, '""')}"`
          ).join(',')
        ).join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', downloadUrl);
      link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}_${filteredUsers.length}_users.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
      
      setTimeout(() => setExporting(false), 500);
    } catch (error) {
      setExporting(false);
      console.error('Export error:', error);
    }
  };

  const filteredUsers = allUser.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm)
  );

  // Enhanced user stats
  const userStats = {
    total: allUser.length,
    active: allUser.filter(user => user.isActive !== false).length,
    newThisMonth: allUser.filter(user => {
      const userDate = new Date(user.createdAt);
      const now = new Date();
      return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear();
    }).length,
    searched: filteredUsers.length
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 bg-gradient-to-r from-indigo-600 to-pink-500 text-transparent bg-clip-text">
            User Management
          </h1>
          <p className="text-gray-600">Manage system users ({allUser.length} total)</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <button
            onClick={exportUsers}
            disabled={exporting || filteredUsers.length === 0}
            className={`
              relative flex items-center justify-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-semibold text-sm md:text-base
              transition-all duration-500 ease-out transform hover:scale-105 hover:shadow-2xl
              ${exporting 
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg' 
                : filteredUsers.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-purple-500/25'
              }
              overflow-hidden group
            `}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            
            <div className="relative flex items-center gap-2 md:gap-3">
              {exporting ? (
                <>
                  <div className="animate-spin">
                    <RefreshCw className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <span className="text-xs md:text-sm">Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:scale-110" />
                  <span className="text-xs md:text-sm">Export CSV</span>
                  <Sparkles className="w-3 h-3 md:w-4 md:h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </>
              )}
            </div>
            
            {!exporting && filteredUsers.length > 0 && (
              <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                {filteredUsers.length}
              </div>
            )}
          </button>

          <button
            onClick={refreshData}
            disabled={refreshing}
            className={`
              relative flex items-center justify-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-semibold text-sm md:text-base
              transition-all duration-500 ease-out transform hover:scale-105 hover:shadow-2xl
              ${refreshing
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                : refreshPulse
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg ring-2 ring-blue-300 ring-opacity-50'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-blue-500/25'
              }
              overflow-hidden group
            `}
          >
            {refreshPulse && !refreshing && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-2xl animate-pulse" />
            )}
            
            <div className="relative flex items-center gap-2 md:gap-3">
              <RefreshCw 
                className={`w-4 h-4 md:w-5 md:h-5 transition-all duration-300 ${
                  refreshing ? 'animate-spin' : refreshPulse ? 'animate-bounce' : 'group-hover:rotate-180'
                }`} 
              />
              <span className="text-xs md:text-sm">
                {refreshing ? 'Refreshing...' : refreshPulse ? 'New Data!' : 'Refresh'}
              </span>
            </div>
            
            <div className="absolute -top-1 -right-1">
              <div className={`w-2 h-2 rounded-full ${
                refreshing ? 'bg-yellow-400 animate-ping' : 
                refreshPulse ? 'bg-green-400 animate-pulse' : 
                'bg-green-400'
              }`} />
            </div>
          </button>

          {/* Add User Button */}
          <button
            className="inline-flex items-center justify-center gap-2 px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold text-sm md:text-base group disabled:opacity-50 disabled:cursor-not-allowed"
            disabled
          >
            <UserPlus className="h-4 w-4 md:h-5 md:w-5 transition-transform " />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <p className="text-sm text-gray-600">
          Showing {filteredUsers.length} of {allUser.length} users
        </p>
        <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
          <div className={`w-2 h-2 rounded-full ${refreshing ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
          <span>Live User Updates</span>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-green-100 to-green-50 p-4 rounded-xl shadow hover:shadow-lg transition transform hover:-translate-y-1 group cursor-pointer">
          <div className="flex items-center space-x-2">
            <Users className="text-green-600 h-5 w-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm text-gray-600">Total Users</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-green-700">{userStats.total}</p>
          <p className="text-xs text-gray-500 mt-1">All registered users</p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-100 to-blue-50 p-4 rounded-xl shadow hover:shadow-lg transition transform hover:-translate-y-1 group cursor-pointer">
          <div className="flex items-center space-x-2">
            <UserPlus className="text-blue-600 h-5 w-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm text-gray-600">Active Users</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-blue-700">{userStats.active}</p>
          <p className="text-xs text-gray-500 mt-1">Currently active</p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-100 to-purple-50 p-4 rounded-xl shadow hover:shadow-lg transition transform hover:-translate-y-1 group cursor-pointer">
          <div className="flex items-center space-x-2">
            <Calendar className="text-purple-600 h-5 w-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm text-gray-600">New This Month</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-purple-700">{userStats.newThisMonth}</p>
          <p className="text-xs text-gray-500 mt-1">Recent signups</p>
        </div>
        
        <div className="bg-gradient-to-r from-indigo-100 to-indigo-50 p-4 rounded-xl shadow hover:shadow-lg transition transform hover:-translate-y-1 group cursor-pointer">
          <div className="flex items-center space-x-2">
            <Search className="text-indigo-600 h-5 w-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm text-gray-600">Search Results</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-indigo-700">{userStats.searched}</p>
          <p className="text-xs text-gray-500 mt-1">Matching current search</p>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 transition hover:shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users by name, email, or phone..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
            />
          </div>
        </div>
      </div>

      {/* Users List - Responsive Design */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {filteredUsers.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      User Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contact Information
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Account Info
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-indigo-50/50 transition duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400 to-pink-400 flex items-center justify-center text-white shadow-md">
                            <span className="text-sm font-medium">{user.name?.[0]?.toUpperCase() || "U"}</span>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">{user.name || 'No Name'}</div>
                            <div className="text-xs text-gray-500">ID: {user._id.slice(-8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Mail className="h-3 w-3" />
                            <span>{user.email || 'No email'}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Phone className="h-3 w-3" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500">
                            Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                            user.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive !== false ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-indigo-600 rounded-full hover:bg-indigo-100 disabled:opacity-50 transition" disabled>
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-pink-600 rounded-full hover:bg-pink-100 disabled:opacity-50 transition" disabled>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 p-4">
              {filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400 to-pink-400 flex items-center justify-center text-white shadow-md flex-shrink-0">
                        <span className="text-sm font-medium">{user.name?.[0]?.toUpperCase() || "U"}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 truncate">{user.name || 'No Name'}</h3>
                        <p className="text-sm text-gray-600 truncate">{user.email}</p>
                        {user.phone && (
                          <p className="text-sm text-gray-500 truncate">{user.phone}</p>
                        )}
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            user.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      <button className="p-2 text-indigo-600 rounded-full hover:bg-indigo-100 disabled:opacity-50 transition" disabled>
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-pink-600 rounded-full hover:bg-pink-100 disabled:opacity-50 transition" disabled>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <UserPlus className="mx-auto h-14 w-14 text-indigo-300" />
            <h3 className="mt-3 text-xl font-bold text-gray-800">No users found</h3>
            <p className="mt-2 text-gray-500 max-w-sm mx-auto">
              {searchTerm
                ? "No users match your search. Try another keyword."
                : "It looks like there are no users yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default User;