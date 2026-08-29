import { useState, useEffect, useRef, useCallback } from "react";
import {
  LayoutDashboard, FileText, History, ClipboardList,
  User, Settings, Bell, ChevronDown, Menu, X,
  LogOut, CheckCircle2, Clock, XCircle, Shield,
  Sparkles, BookOpen, Sun, Moon,
} from "lucide-react";

const ROLE_META = {
  student:  { label: "Student",       color: "#16a34a", bg: "#dcfce7", border: "#86efac" },
  advisor:  { label: "Class Advisor", color: "#2563eb", bg: "#dbeafe", border: "#93c5fd" },
  hod:      { label: "Head of Dept",  color: "#7c3aed", bg: "#ede9fe", border: "#c4b5fd" },
};

const DEPTS = {
  CS:"Computer Science", IT:"Information Technology",
  AIDS:"AI & Data Science", AIML:"AI & Machine Learning",
  CY:"Cyber Security", MECH:"Mechanical Engineering",
  CIVIL:"Civil Engineering", BME:"Biomedical Engineering",
  EEE:"Electrical & Electronics", ECE:"Electronics & Communication",
};

function buildNotifications(user, requests) {
  const notes = [];

  if (user.role === "student") {
    const mine = requests.filter(r => r.studentId === user.id);
    mine.forEach(r => {
      if (r.advisorStatus === "approved" && !r.hodStatus) {
        notes.push({ id: r.id + "-adv", icon: CheckCircle2, color: "#16a34a", text: `${r.id} approved by Advisor`, sub: "Awaiting HOD approval", time: r.advisorAt });
      }
      if (r.hodStatus === "approved") {
        notes.push({ id: r.id + "-hod", icon: CheckCircle2, color: "#16a34a", text: `${r.id} fully approved`, sub: "Digital Clearance Pass Ready", time: r.hodAt });
      }
      if (r.advisorStatus === "rejected") {
        notes.push({ id: r.id + "-rej", icon: XCircle, color: "#dc2626", text: `${r.id} rejected by Advisor`, sub: r.rejectionReason || "Application rejected", time: r.advisorAt });
      }
      if (r.hodStatus === "rejected") {
        notes.push({ id: r.id + "-hrej", icon: XCircle, color: "#dc2626", text: `${r.id} rejected by HOD`, sub: r.rejectionReason || "Application rejected", time: r.hodAt });
      }
    });
  }

  if (user.role === "advisor") {
    const pending = requests.filter(r =>
      r.dept === user.dept && r.year === user.year && r.section === user.section
      && r.advisorStatus == null
    );
    pending.forEach(r => {
      notes.push({ id: r.id + "-pa", icon: Clock, color: "#d97706", text: `${r.id} awaiting your approval`, sub: r.studentName, time: r.createdAt });
    });
  }

  if (user.role === "hod") {
    const pending = requests.filter(r =>
      r.dept === user.dept && r.advisorStatus === "approved" && r.hodStatus == null
    );
    pending.forEach(r => {
      notes.push({ id: r.id + "-ph", icon: Clock, color: "#d97706", text: `${r.id} needs HOD seal`, sub: r.studentName, time: r.advisorAt });
    });
  }

  return notes;
}

function buildNavLinks(role) {
  const base = [
    { id: "dashboard",    icon: LayoutDashboard, label: "Home"         },
    { id: "applications", icon: FileText,         label: "Applications" },
    { id: "history",      icon: History,          label: "History"      },
  ];
  if (role === "student") {
    base.push({ id: "templates", icon: BookOpen, label: "Templates" });
  }
  if (role === "advisor" || role === "hod") {
    base.push({ id: "approvals", icon: ClipboardList, label: "Approvals" });
  }
  base.push(
    { id: "profile",  icon: User,     label: "Profile"  },
    { id: "settings", icon: Settings, label: "Settings" },
  );
  return base;
}

function initials(name = "") {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

const SHELL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

@keyframes floatOrbs {
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-12px) scale(1.03); }
}

@keyframes dropdownIn {
  from { opacity: 0; transform: translateY(8px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes pulseGlow {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.15); opacity: 0.85; }
}

.ns-sidebar-link {
  transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.ns-sidebar-link:hover:not(.active) {
  background: #f0fdf4 !important;
  color: #16a34a !important;
  transform: translateX(4px);
}
.ns-sidebar-link.active {
  background: #16a34a !important;
  color: #ffffff !important;
  box-shadow: 0 6px 18px rgba(22, 163, 74, 0.35) !important;
}

.ns-header-btn {
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.ns-header-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(0,0,0,0.08);
}

.ns-dropdown-menu {
  animation: dropdownIn 0.2s cubic-bezier(0.22, 0.9, 0.36, 1) both;
}

@media (max-width: 820px) {
  .ns-sidebar {
    transform: translateX(-100%);
    transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
  .ns-sidebar.open {
    transform: translateX(0) !important;
  }
  .ns-main-container {
    margin-left: 0 !important;
  }
}
`;

export default function NavigationShell({
  user,
  requests,
  activeTab,
  onTabChange,
  onLogout,
  onOpenProfile,
  onOpenSettings,
  children,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bellOpen,    setBellOpen]    = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const bellRef    = useRef(null);
  const profileRef = useRef(null);

  const notifications = buildNotifications(user, requests);
  const unread        = notifications.length;
  const navLinks      = buildNavLinks(user.role);
  const roleMeta      = ROLE_META[user.role] || ROLE_META.student;

  useEffect(() => {
    function handler(e) {
      if (bellRef.current    && !bellRef.current.contains(e.target))    setBellOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleTabChange = useCallback((id) => {
    if (id === "profile")  { onOpenProfile();  setSidebarOpen(false); return; }
    if (id === "settings") { onOpenSettings(); setSidebarOpen(false); return; }
    onTabChange(id);
    setSidebarOpen(false);
  }, [onTabChange, onOpenProfile, onOpenSettings]);

  const SIDEBAR_W = 240;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #f0fdf4 0%, #f8fafc 40%, #f1f5f9 100%)",
      fontFamily: "'Inter', sans-serif",
      color: "#0f172a",
      position: "relative",
      display: "flex",
    }}>
      <style>{SHELL_CSS}</style>

      {/* Floating decorative ambient light */}
      <div style={{
        position: "fixed", width: 500, height: 500, top: "-100px", right: "-100px",
        borderRadius: "50%", background: "radial-gradient(circle, #bbf7d0 0%, #86efac22 50%, transparent 70%)",
        animation: "floatOrbs 10s ease-in-out infinite", pointerEvents: "none", zIndex: 0,
      }} />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(15,23,42,0.3)",
            zIndex: 299, backdropFilter: "blur(4px)",
          }}
        />
      )}

      {/* ── Sidebar ────────────────────────────────────────────── */}
      <aside
        className={`ns-sidebar${sidebarOpen ? " open" : ""}`}
        style={{
          width: SIDEBAR_W,
          minHeight: "100vh",
          background: "#ffffff",
          borderRight: "1px solid #e2e8f0",
          boxShadow: "4px 0 24px rgba(15, 23, 42, 0.03)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          left: 0, top: 0, bottom: 0,
          zIndex: 300,
          padding: "20px 14px",
        }}
      >
        {/* Brand Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px 20px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: "linear-gradient(135deg, #16a34a, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 14px rgba(22, 163, 74, 0.35)",
            flexShrink: 0,
          }}>
            <Sparkles size={18} color="#fff" strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.3px", display: "flex", alignItems: "center", gap: 4 }}>
              OD PORTAL <span style={{ color: "#16a34a", fontSize: 11 }}>●</span>
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", letterSpacing: "0.5px", textTransform: "uppercase" }}>
              {DEPTS[user.dept] ? DEPTS[user.dept].split(" ")[0] : user.dept}
            </div>
          </div>
        </div>

        {/* Role Pill Card */}
        <div style={{ margin: "16px 0 12px", padding: "10px 12px", borderRadius: 16, background: roleMeta.bg, border: `1.5px solid ${roleMeta.border}`, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: roleMeta.color, boxShadow: `0 0 8px ${roleMeta.color}` }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: roleMeta.color, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {roleMeta.label}
            </div>
            <div style={{ fontSize: 10, color: "#475569", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.name}
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, paddingTop: 6 }}>
          {navLinks.map(link => {
            const Icon = link.icon;
            const active = activeTab === link.id;
            return (
              <button
                key={link.id}
                className={`ns-sidebar-link ${active ? "active" : ""}`}
                onClick={() => handleTabChange(link.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "11px 16px", borderRadius: 9999,
                  background: active ? "#16a34a" : "transparent",
                  color: active ? "#ffffff" : "#475569",
                  fontSize: 13, fontWeight: active ? 700 : 600,
                  border: "none", cursor: "pointer", width: "100%", textAlign: "left",
                }}
              >
                <Icon size={16} strokeWidth={active ? 2.5 : 2} />
                <span>{link.label}</span>
                {link.id === "approvals" && unread > 0 && (
                  <span style={{
                    marginLeft: "auto", minWidth: 20, height: 20, borderRadius: 10,
                    background: active ? "#ffffff" : "#16a34a",
                    color: active ? "#16a34a" : "#ffffff",
                    fontSize: 10, fontWeight: 800,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "0 6px",
                  }}>
                    {unread}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout button at bottom */}
        <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 14 }}>
          <button
            onClick={onLogout}
            className="ns-sidebar-link"
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 16px", borderRadius: 9999, width: "100%",
              background: "#fef2f2", color: "#dc2626",
              border: "1px solid #fee2e2", fontSize: 13, fontWeight: 700,
              cursor: "pointer", textAlign: "left",
            }}
          >
            <LogOut size={16} strokeWidth={2.2} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main Workspace ──────────────────────────────────────── */}
      <div
        className="ns-main-container"
        style={{
          marginLeft: SIDEBAR_W,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* ── Top Header ────────────────────────────────────────── */}
        <header style={{
          height: 68,
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          position: "sticky", top: 0, zIndex: 200,
          background: "rgba(255, 255, 255, 0.82)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
        }}>
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(s => !s)}
            style={{
              display: "none", background: "#f8fafc", border: "1px solid #e2e8f0",
              borderRadius: 12, padding: "8px", cursor: "pointer",
            }}
            className="ns-hamburger"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Breadcrumb / Title */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>OD Portal</span>
            <span style={{ fontSize: 13, color: "#cbd5e1" }}>/</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", textTransform: "capitalize" }}>
              {navLinks.find(l => l.id === activeTab)?.label ?? "Dashboard"}
            </span>
          </div>

          {/* Header Action Items */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Quick theme indicator pill */}
            <div style={{
              width: 38, height: 38, borderRadius: 14, background: "#f0fdf4",
              border: "1px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center",
              color: "#16a34a", cursor: "default",
            }}>
              <Sun size={17} strokeWidth={2.2} />
            </div>

            {/* Notification Bell */}
            <div ref={bellRef} style={{ position: "relative" }}>
              <button
                className="ns-header-btn"
                onClick={() => { setBellOpen(b => !b); setProfileOpen(false); }}
                style={{
                  position: "relative",
                  width: 38, height: 38, borderRadius: 14,
                  background: bellOpen ? "#dcfce7" : "#ffffff",
                  border: `1.5px solid ${bellOpen ? "#86efac" : "#e2e8f0"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: bellOpen ? "#16a34a" : "#475569",
                }}
              >
                <Bell size={17} strokeWidth={2} />
                {unread > 0 && (
                  <span style={{
                    position: "absolute", top: -3, right: -3,
                    minWidth: 16, height: 16, borderRadius: 9999,
                    background: "#dc2626", color: "#fff",
                    fontSize: 9, fontWeight: 900,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "0 4px", border: "2px solid #ffffff",
                  }}>
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {bellOpen && (
                <div
                  className="ns-dropdown-menu"
                  style={{
                    position: "absolute", top: 48, right: 0,
                    width: 320, background: "#ffffff",
                    border: "1px solid #e2e8f0", borderRadius: 20,
                    boxShadow: "0 20px 50px rgba(15, 23, 42, 0.12)",
                    overflow: "hidden", zIndex: 500,
                  }}
                >
                  <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc" }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>Notifications</span>
                    {unread > 0 && (
                      <span style={{ background: "#dcfce7", color: "#16a34a", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 9999 }}>
                        {unread} new
                      </span>
                    )}
                  </div>
                  <div style={{ maxHeight: 300, overflowY: "auto", padding: "6px" }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: "30px 16px", textAlign: "center", color: "#94a3b8", fontSize: 12 }}>
                        <Bell size={22} style={{ margin: "0 auto 8px", color: "#cbd5e1" }} />
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map(n => {
                        const Icon = n.icon;
                        return (
                          <div
                            key={n.id}
                            style={{
                              display: "flex", alignItems: "flex-start", gap: 10,
                              padding: "10px 12px", borderRadius: 12,
                              transition: "background 0.15s", cursor: "default",
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                          >
                            <div style={{
                              width: 30, height: 30, borderRadius: 10,
                              background: `${n.color}15`, border: `1px solid ${n.color}30`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              flexShrink: 0,
                            }}>
                              <Icon size={14} style={{ color: n.color }} strokeWidth={2.4} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{n.text}</div>
                              {n.sub && <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{n.sub}</div>}
                              {n.time && <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 4 }}>{n.time}</div>}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Profile Pill (SR SARATHI style) */}
            <div ref={profileRef} style={{ position: "relative" }}>
              <button
                className="ns-header-btn"
                onClick={() => { setProfileOpen(p => !p); setBellOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "#ffffff", border: "1.5px solid #e2e8f0",
                  borderRadius: 9999, padding: "5px 12px 5px 6px",
                  cursor: "pointer",
                }}
              >
                {/* Avatar Badge */}
                <div style={{
                  width: 28, height: 28, borderRadius: 9999,
                  background: "#16a34a", color: "#ffffff",
                  fontSize: 11, fontWeight: 900,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {initials(user?.name || user?.id || "User")}
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#0f172a", textTransform: "uppercase" }}>
                  {(user?.name || user?.id || "User").split(" ")[0]}
                </span>
                <ChevronDown size={14} color="#64748b" style={{ transform: profileOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </button>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div
                  className="ns-dropdown-menu"
                  style={{
                    position: "absolute", top: 48, right: 0,
                    width: 220, background: "#ffffff",
                    border: "1px solid #e2e8f0", borderRadius: 20,
                    boxShadow: "0 20px 50px rgba(15, 23, 42, 0.12)",
                    overflow: "hidden", zIndex: 500, padding: "6px",
                  }}
                >
                  <div style={{ padding: "12px 14px", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>{user.name}</div>
                    <div style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace", marginTop: 2 }}>{user.id}</div>
                  </div>
                  <div style={{ padding: "6px 0" }}>
                    {[
                      { label: "My Profile", icon: User, action: () => { setProfileOpen(false); onOpenProfile(); } },
                      { label: "Settings", icon: Settings, action: () => { setProfileOpen(false); onOpenSettings(); } },
                    ].map(item => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.label}
                          onClick={item.action}
                          style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "9px 12px", width: "100%",
                            background: "transparent", border: "none", borderRadius: 10,
                            color: "#334155", fontSize: 12, fontWeight: 600,
                            cursor: "pointer", textAlign: "left", transition: "background 0.15s",
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <Icon size={14} color="#16a34a" strokeWidth={2} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 4 }}>
                    <button
                      onClick={onLogout}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "9px 12px", width: "100%",
                        background: "transparent", border: "none", borderRadius: 10,
                        color: "#dc2626", fontSize: 12, fontWeight: 700,
                        cursor: "pointer", textAlign: "left", transition: "background 0.15s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <LogOut size={14} strokeWidth={2.2} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Page Content ──────────────────────────────────────── */}
        <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
