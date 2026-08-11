import axios from "axios";
import { Activity, Calendar, Download, Edit3, Mail, MoreHorizontal, Phone, RefreshCw, Search, Sparkles, Trash2, UserPlus, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppContext } from "../../context/Context";

const User = () => {
  const [allUser, setAllUser] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [exporting, setExporting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshPulse, setRefreshPulse] = useState(false);
  const { url } = useAppContext();
  const [selectedUser, setSelectedUser] = useState(null);
  const [sortBy, setSortBy] = useState("newest");

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
        'Account Status': user.isActive !== false ? 'Active' : 'Inactive',
        'Account Age': user.createdAt ? `${Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))} days` : 'N/A'
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
    inactive: allUser.filter(user => user.isActive === false).length,
    newThisMonth: allUser.filter(user => {
      const userDate = new Date(user.createdAt);
      const now = new Date();
      return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear();
    }).length,
    searched: filteredUsers.length
  };

  const displayedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === "name") {
      return (a.name || "").localeCompare(b.name || "");
    }
    if (sortBy === "oldest") {
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    }
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    return parts.length === 1
      ? parts[0].slice(0, 2).toUpperCase()
      : `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getAccountAge = (date) => {
    if (!date) return "N/A";
    const days = Math.max(
      0,
      Math.floor((Date.now() - new Date(date).getTime()) / 86400000)
    );
    if (days < 1) return "Today";
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.floor(days / 30)} months`;
    return `${Math.floor(days / 365)} years`;
  };

  return (
    <div className="min-h-full bg-[#0b0b0b] px-4 py-5 text-white sm:px-6 sm:py-7 lg:px-8 lg:py-8">
      <style>{`
        @keyframes darshUsersIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes darshUsersCard {
          from { opacity: 0; transform: translateY(14px) scale(.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes darshUsersGlow {
          0%,100% { opacity:.15; transform:translateX(-20%); }
          50% { opacity:.45; transform:translateX(70%); }
        }
        @keyframes darshUsersPulse {
          0%,100% { opacity:.45; box-shadow:0 0 0 0 rgba(34,197,94,.15); }
          50% { opacity:1; box-shadow:0 0 0 5px rgba(34,197,94,.03); }
        }
        .darsh-users-in { animation:darshUsersIn .42s cubic-bezier(.22,1,.36,1) both; }
        .darsh-users-card { animation:darshUsersCard .42s cubic-bezier(.22,1,.36,1) both; }
        .darsh-users-scroll::-webkit-scrollbar { height:5px; width:5px; }
        .darsh-users-scroll::-webkit-scrollbar-track { background:transparent; }
        .darsh-users-scroll::-webkit-scrollbar-thumb { background:#2d2d2d; border-radius:999px; }
        @media (prefers-reduced-motion: reduce) {
          .darsh-users-in,.darsh-users-card { animation:none !important; }
        }
      `}</style>

      <div className="pointer-events-none absolute left-1/2 top-0 h-52 w-[70%] -translate-x-1/2 overflow-hidden">
        <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-amber-400/[0.035] to-transparent blur-2xl" style={{ animation: "darshUsersGlow 7s ease-in-out infinite" }} />
      </div>

      <div className="relative mx-auto max-w-[1700px]">
        <div className="darsh-users-in flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400"><Users size={14} /></span>
              <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#626262]">Customer management</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-[34px]">Customers</h1>
            <p className="mt-1 text-xs text-[#696969] sm:text-sm">
              {allUser.length} registered {allUser.length === 1 ? "customer" : "customers"} in DARSH
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 sm:flex">
              <span className={`h-1.5 w-1.5 rounded-full bg-emerald-400 ${refreshing ? "animate-ping" : ""}`} style={!refreshing ? { animation: "darshUsersPulse 2.2s ease-in-out infinite" } : undefined} />
              <span className="text-[9px] uppercase tracking-[0.12em] text-[#626262]">{refreshing ? "Syncing" : "Live data"}</span>
            </div>

            <button type="button" onClick={refreshData} disabled={refreshing} className={`group flex h-10 items-center gap-2 rounded-xl border px-3.5 text-xs font-medium transition-all duration-300 ${refreshing || refreshPulse ? "border-amber-500/25 bg-amber-500/10 text-amber-400" : "border-white/[0.08] bg-white/[0.025] text-[#888] hover:border-white/[0.13] hover:bg-white/[0.05] hover:text-white"}`}>
              <RefreshCw size={14} className={refreshing ? "animate-spin" : "transition-transform duration-300 group-hover:rotate-180"} />
              <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
            </button>

            <button type="button" onClick={exportUsers} disabled={exporting || !displayedUsers.length} className="group relative flex h-10 items-center gap-2 overflow-hidden rounded-xl bg-[#f5a90b] px-3.5 text-xs font-semibold text-black shadow-[0_8px_25px_rgba(245,169,11,.08)] transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40">
              <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-700 group-hover:translate-x-full" />
              {exporting ? <RefreshCw size={14} className="relative animate-spin" /> : <Download size={14} className="relative" />}
              <span className="relative">{exporting ? "Exporting..." : "Export CSV"}</span>
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["TOTAL CUSTOMERS", userStats.total, "All registered customers", Users, "amber"],
            ["ACTIVE CUSTOMERS", userStats.active, `${userStats.inactive} inactive`, Activity, "green"],
            ["NEW THIS MONTH", userStats.newThisMonth, "Recent registrations", Calendar, "purple"],
            ["SEARCH RESULTS", userStats.searched, `Showing of ${userStats.total}`, Search, "blue"],
          ].map(([label, value, note, Icon, accent], index) => {
            const iconClasses = {
              amber: "bg-amber-500/10 text-amber-400",
              green: "bg-emerald-500/10 text-emerald-400",
              purple: "bg-purple-500/10 text-purple-400",
              blue: "bg-blue-500/10 text-blue-400",
            };

            return (
              <div key={label} className="darsh-users-card group relative overflow-hidden rounded-xl border border-white/[0.09] bg-[#171717] p-4 shadow-[0_10px_35px_rgba(0,0,0,.12)] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.14]" style={{ animationDelay: `${index * 70}ms` }}>
                <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-amber-500/[0.025] blur-2xl" />
                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="text-[9px] font-medium tracking-[0.12em] text-[#6c6c6c]">{label}</p>
                    <p className="mt-5 text-2xl font-bold tracking-tight text-white sm:text-[27px]">{value}</p>
                    <p className="mt-1 text-[10px] text-[#5e5e5e]">{note}</p>
                  </div>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClasses[accent]} transition-transform duration-300 group-hover:scale-110`}><Icon size={16} /></div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="darsh-users-card mt-4 rounded-xl border border-white/[0.09] bg-[#171717] p-3 sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#606060]" />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search customer by name, email or phone..." className="h-10 w-full rounded-lg border border-white/[0.08] bg-[#141414] pl-9 pr-10 text-xs text-white outline-none transition-all placeholder:text-[#515151] focus:border-amber-500/30 focus:ring-2 focus:ring-amber-500/[0.04]" />
              {searchTerm && <button type="button" onClick={() => setSearchTerm("")} className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-[#666] hover:bg-white/[0.05] hover:text-white"><X size={13} /></button>}
            </div>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="h-10 min-w-[145px] rounded-lg border border-white/[0.08] bg-[#141414] px-3 text-xs text-[#8b8b8b] outline-none focus:border-amber-500/30">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name">Name A-Z</option>
            </select>

            {searchTerm && <div className="rounded-lg border border-amber-500/10 bg-amber-500/[0.04] px-3 py-2 text-[10px] text-amber-400">{displayedUsers.length} matching</div>}
          </div>
        </div>

        <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] text-[#5e5e5e]">Showing <span className="font-semibold text-[#999]">{displayedUsers.length}</span> of <span className="font-semibold text-[#999]">{allUser.length}</span> customers</p>
          <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.1em] text-[#555]"><Sparkles size={11} className="text-amber-500/60" />Customer directory</div>
        </div>

        <div className="darsh-users-card hidden overflow-hidden rounded-xl border border-white/[0.09] bg-[#171717] shadow-[0_15px_45px_rgba(0,0,0,.14)] md:block">
          {displayedUsers.length ? (
            <div className="darsh-users-scroll overflow-x-auto">
              <table className="min-w-[900px] w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.07] bg-[#191919]">
                    {["Customer", "Contact", "Joined", "Account", "Actions"].map((head, i) => (
                      <th key={head} className={`px-4 py-3 text-[9px] font-medium uppercase tracking-[0.12em] text-[#6b6b6b] ${i === 4 ? "text-right" : "text-left"}`}>{head}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayedUsers.map((user) => {
                    const active = user.isActive !== false;
                    return (
                      <tr key={user._id} onClick={() => setSelectedUser(user)} className="group cursor-pointer border-b border-white/[0.055] last:border-b-0 transition-colors duration-200 hover:bg-white/[0.025]">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-[11px] font-bold text-amber-400 ring-1 ring-amber-500/10 transition-transform group-hover:scale-105">{getInitials(user.name)}</div>
                            <div className="min-w-0"><p className="truncate text-xs font-semibold text-white">{user.name || "No Name"}</p><p className="mt-0.5 text-[9px] text-[#555]">ID: {user._id?.slice(-8) || "N/A"}</p></div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="space-y-1">
                            <div className="flex max-w-[300px] items-center gap-1.5 truncate text-[10px] text-[#888]"><Mail size={11} className="shrink-0 text-[#555]" /><span className="truncate">{user.email || "No email"}</span></div>
                            {user.phone && <div className="flex items-center gap-1.5 text-[10px] text-[#666]"><Phone size={11} className="text-[#555]" /><span>{user.phone}</span></div>}
                          </div>
                        </td>
                        <td className="px-4 py-3.5"><p className="text-[10px] text-[#888]">{formatDate(user.createdAt)}</p><p className="mt-0.5 text-[9px] text-[#505050]">{getAccountAge(user.createdAt)}</p></td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-medium ${active ? "border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-400" : "border-rose-500/20 bg-rose-500/[0.06] text-rose-400"}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-400" : "bg-rose-400"}`} />{active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex justify-end gap-1.5">
                            <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedUser(user); }} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-[#666] transition hover:border-amber-500/20 hover:bg-amber-500/[0.06] hover:text-amber-400"><MoreHorizontal size={14} /></button>
                            <button type="button" disabled className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.05] bg-white/[0.015] text-[#444]"><Edit3 size={13} /></button>
                            <button type="button" disabled className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.05] bg-white/[0.015] text-[#444]"><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : <EmptyState searchTerm={searchTerm} />}
        </div>

        <div className="space-y-2.5 md:hidden">
          {displayedUsers.length ? displayedUsers.map((user) => {
            const active = user.isActive !== false;
            return (
              <button type="button" key={user._id} onClick={() => setSelectedUser(user)} className="darsh-users-card block w-full rounded-xl border border-white/[0.08] bg-[#171717] p-3.5 text-left transition-all hover:border-white/[0.14]">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-xs font-bold text-amber-400">{getInitials(user.name)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0"><p className="truncate text-xs font-semibold text-white">{user.name || "No Name"}</p><p className="mt-0.5 truncate text-[9px] text-[#555]">{user.email || "No email"}</p></div>
                      <span className={`shrink-0 rounded-full border px-2 py-1 text-[8px] ${active ? "border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-400" : "border-rose-500/20 bg-rose-500/[0.06] text-rose-400"}`}>{active ? "Active" : "Inactive"}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-white/[0.025] p-2"><p className="text-[8px] uppercase tracking-[0.1em] text-[#4f4f4f]">Phone</p><p className="mt-1 truncate text-[9px] text-[#777]">{user.phone || "Not available"}</p></div>
                      <div className="rounded-lg bg-white/[0.025] p-2"><p className="text-[8px] uppercase tracking-[0.1em] text-[#4f4f4f]">Joined</p><p className="mt-1 text-[9px] text-[#777]">{formatDate(user.createdAt)}</p></div>
                    </div>
                  </div>
                </div>
              </button>
            );
          }) : <div className="rounded-xl border border-white/[0.08] bg-[#171717]"><EmptyState searchTerm={searchTerm} /></div>}
        </div>
      </div>

      {selectedUser && (
        <>
          <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />
          <div className="fixed inset-y-0 right-0 z-[100] flex w-full max-w-md flex-col border-l border-white/[0.08] bg-[#111111] shadow-[-20px_0_80px_rgba(0,0,0,.5)]">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
              <div><p className="text-xs font-semibold text-white">Customer details</p><p className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-[#555]">DARSH customer profile</p></div>
              <button type="button" onClick={() => setSelectedUser(null)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-[#666] hover:text-white"><X size={16} /></button>
            </div>
            <div className="darsh-users-scroll flex-1 overflow-y-auto p-5">
              <div className="rounded-2xl border border-white/[0.08] bg-[#171717] p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-lg font-bold text-amber-400">{getInitials(selectedUser.name)}</div>
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold text-white">{selectedUser.name || "No Name"}</h2>
                    <p className="mt-1 truncate text-[10px] text-[#666]">{selectedUser.email || "No email"}</p>
                    <span className={`mt-2 inline-flex rounded-full border px-2 py-1 text-[8px] ${selectedUser.isActive !== false ? "border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-400" : "border-rose-500/20 bg-rose-500/[0.06] text-rose-400"}`}>{selectedUser.isActive !== false ? "Active customer" : "Inactive customer"}</span>
                  </div>
                </div>
                <div className="mt-5 space-y-2">
                  <DetailRow icon={Mail} label="Email" value={selectedUser.email || "Not available"} />
                  <DetailRow icon={Phone} label="Phone" value={selectedUser.phone || "Not available"} />
                  <DetailRow icon={Calendar} label="Joined" value={formatDate(selectedUser.createdAt)} />
                  <DetailRow icon={Activity} label="Account age" value={getAccountAge(selectedUser.createdAt)} />
                </div>
              </div>
              <div className="mt-3 rounded-2xl border border-white/[0.07] bg-[#151515] p-4">
                <div className="flex items-center gap-2"><Sparkles size={13} className="text-amber-400" /><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#777]">Customer ID</p></div>
                <p className="mt-3 break-all rounded-lg bg-black/20 p-3 font-mono text-[9px] text-[#666]">{selectedUser._id || "N/A"}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}; // <-- Added missing closing brace

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.018] p-3">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-[#666]"><Icon size={13} /></div>
    <div className="min-w-0">
      <p className="text-[8px] uppercase tracking-[0.12em] text-[#4f4f4f]">{label}</p>
      <p className="mt-0.5 truncate text-[10px] text-[#888]">{value}</p>
    </div>
  </div>
);

const EmptyState = ({ searchTerm }) => (
  <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400"><UserPlus size={24} /></div>
    <h3 className="mt-4 text-sm font-semibold text-white">No customers found</h3>
    <p className="mt-1.5 max-w-sm text-[10px] leading-5 text-[#5b5b5b]">
      {searchTerm ? "No customers match your search. Try another name, email or phone." : "There are no registered customers yet."}
    </p>
  </div>
);

export default User;