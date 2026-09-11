import { useState, useEffect, useRef } from "react";
import {
  User, Lock, Eye, EyeOff, LogIn,
  Home, Sun, GraduationCap, Building2, AlertCircle, ChevronRight, Sparkles, Info,
} from "lucide-react";
import { STUDENTS } from "./data/students";

const ROLES = [
  {
    key: "hosteller", label: "Hosteller", icon: Home,
    color: "#16a34a", light: "#dcfce7", border: "#86efac",
    userType: "student", placeholder: "e.g. 714024104200",
    formatExample: "714024104200", formatDesc: "12-digit Register Number",
    password: "last 4 digits of register", hint: "Hosteller Student",
  },
  {
    key: "dayscholar", label: "Day Scholar", icon: Sun,
    color: "#0d9488", light: "#ccfbf1", border: "#5eead4",
    userType: "student", placeholder: "e.g. 714024104200",
    formatExample: "714024104200", formatDesc: "12-digit Register Number",
    password: "last 4 digits of register", hint: "Day Scholar Student",
  },
  {
    key: "advisor", label: "Advisor", icon: GraduationCap,
    color: "#2563eb", light: "#dbeafe", border: "#93c5fd",
    userType: "advisor", placeholder: "e.g. ADVCS1A",
    formatExample: "ADVCS1A", formatDesc: "ADV + DEPT + YR + SEC",
    password: "advisor123", hint: "Faculty Advisor",
  },
  {
    key: "hod", label: "HOD", icon: Building2,
    color: "#7c3aed", light: "#ede9fe", border: "#c4b5fd",
    userType: "hod", placeholder: "e.g. HODCS",
    formatExample: "HODCS", formatDesc: "HOD + DEPT",
    password: "hod123", hint: "Head of Department",
  },
];

const DEPT_KEYS = ["CS","IT","AIDS","AIML","CY","MECH","CIVIL","BME","EEE","ECE"];
const YEARS = [1,2,3,4];
const SECTIONS = ["A","B","C"];

const buildUserMap = () => {
  const u = {};
  Object.values(STUDENTS).forEach(s => {
    u[s.regNo] = {
      pass: s.pass, role: "student",
      name: s.name, dept: s.dept, year: s.year, section: s.section,
      rollNo: s.rollNo, regNo: s.regNo, photo: s.photo,
    };
  });
  DEPT_KEYS.forEach(dept => {
    YEARS.forEach(yr => {
      SECTIONS.forEach(sec => {
        u["ADV"+dept+yr+sec] = { pass:"advisor123", role:"advisor", dept, year:yr, section:sec };
      });
    });
    u["HOD"+dept] = { pass:"hod123", role:"hod", dept };
  });
  return u;
};
const USER_MAP = buildUserMap();

const SIGNIN_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

@keyframes si-floatCard {
  0%,100% { transform: translateY(0px); }
  50%      { transform: translateY(-10px); }
}
@keyframes si-floatOrb1 {
  0%,100% { transform: translateY(0) scale(1); }
  50%      { transform: translateY(-18px) scale(1.04); }
}
@keyframes si-floatOrb2 {
  0%,100% { transform: translateY(0) scale(1); }
  50%      { transform: translateY(14px) scale(0.97); }
}
@keyframes si-shake {
  0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)}
}
@keyframes si-spin {
  from{transform:rotate(0deg)} to{transform:rotate(360deg)}
}
@keyframes si-fadeUp {
  from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)}
}
@keyframes si-badgeFloat {
  0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)}
}
@keyframes si-dotBounce {
  0%,100%{transform:scale(1)} 50%{transform:scale(1.5)}
}

.si-card        { animation: si-floatCard 6s ease-in-out infinite; }
.si-card.si-shake { animation: si-shake 0.42s ease; }
.si-fadein      { animation: si-fadeUp 0.5s cubic-bezier(.22,.9,.36,1) both; }
.si-badge       { animation: si-badgeFloat 3s ease-in-out infinite; }

.si-tab:hover:not(.si-tab-active) {
  background: rgba(22,163,74,0.08) !important;
  transform: translateY(-1px);
}
.si-tab { transition: all 0.22s cubic-bezier(.34,1.56,.64,1); }

.si-input-wrap:focus-within {
  border-color: var(--rc) !important;
  box-shadow: 0 0 0 3px var(--rs) !important;
  transform: translateY(-1px);
}
.si-input-wrap { transition: all 0.2s ease; }

.si-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px var(--rs) !important;
  filter: brightness(1.06);
}
.si-submit:active:not(:disabled) { transform: translateY(0); }
.si-submit { transition: all 0.22s cubic-bezier(.34,1.56,.64,1); }

.si-format-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important;
}
.si-format-card { transition: all 0.22s ease; }

input::placeholder { color: #94a3b8 !important; }
`;

export default function SignIn({ onLogin }) {
  const [activeRole, setActiveRole] = useState("hosteller");
  const [userId,   setUserId]   = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [shake,    setShake]    = useState(false);
  const [focused,  setFocused]  = useState(null);

  const role = ROLES.find(r => r.key === activeRole);

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 450); };

  const handleRoleChange = key => {
    setActiveRole(key); setError(""); setUserId(""); setPassword("");
  };

  const handleLogin = () => {
    setError("");
    if (!userId.trim() || !password.trim()) {
      setError("Please enter both User ID and Password."); triggerShake(); return;
    }
    setLoading(true);
    setTimeout(() => {
      const uid = userId.trim().toUpperCase();
      const user = USER_MAP[uid];
      if (!user) {
        setError("ID not found. Check format: " + role.formatExample);
        setLoading(false); triggerShake(); return;
      }
      if (user.pass !== password) {
        setError("Incorrect password. Use the demo credentials below.");
        setLoading(false); triggerShake(); return;
      }
      const session = { ...user, id: uid, loginRole: activeRole };
      try { localStorage.setItem("od_session", JSON.stringify(session)); } catch(e) {}
      setLoading(false);
      onLogin(session);
    }, 600);
  };

  const handleKeyDown = e => { if (e.key === "Enter") handleLogin(); };

  // CSS vars for role color
  const cssVars = { "--rc": role.color, "--rs": role.color + "28" };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', sans-serif",
      position: "relative", overflow: "hidden",
      padding: "40px 20px",
    }}>
      <style>{SIGNIN_CSS}</style>

      {/* ── Floating orbs ──────────────────────────────────────── */}
      <div style={{
        position:"absolute", width:420, height:420, top:"-80px", right:"-60px", borderRadius:"50%",
        background:"radial-gradient(circle, #bbf7d0 0%, #86efac44 50%, transparent 70%)",
        animation:"si-floatOrb1 8s ease-in-out infinite", pointerEvents:"none", zIndex:0,
      }}/>
      <div style={{
        position:"absolute", width:340, height:340, bottom:"-80px", left:"-60px", borderRadius:"50%",
        background:"radial-gradient(circle, #a7f3d0 0%, #6ee7b744 50%, transparent 70%)",
        animation:"si-floatOrb2 10s ease-in-out infinite 1s", pointerEvents:"none", zIndex:0,
      }}/>
      <div style={{
        position:"absolute", width:200, height:200, top:"35%", right:"8%", borderRadius:"50%",
        background:"radial-gradient(circle, #dbeafe 0%, transparent 70%)",
        animation:"si-floatOrb1 12s ease-in-out infinite 2s", pointerEvents:"none", zIndex:0,
      }}/>
      <div style={{
        position:"absolute", width:160, height:160, top:"20%", left:"5%", borderRadius:"50%",
        background:"radial-gradient(circle, #ede9fe 0%, transparent 70%)",
        animation:"si-floatOrb2 9s ease-in-out infinite 0.5s", pointerEvents:"none", zIndex:0,
      }}/>

      {/* ── Main layout ────────────────────────────────────────── */}
      <div style={{ position:"relative", zIndex:1, width:"100%", maxWidth:460, display:"flex", flexDirection:"column", alignItems:"center", gap:20 }}>

        {/* Brand badge */}
        <div className="si-badge si-fadein" style={{ animationDelay:"0s" }}>
          <div style={{
            display:"inline-flex", alignItems:"center", gap:8,
            background:"linear-gradient(90deg, #16a34a, #0d9488)",
            borderRadius:99, padding:"6px 18px 6px 10px",
            boxShadow:"0 4px 20px rgba(22,163,74,0.25)",
          }}>
            <div style={{ width:26, height:26, borderRadius:"50%", background:"rgba(255,255,255,0.25)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Sparkles size={14} color="#fff" strokeWidth={2} />
            </div>
            <span style={{ color:"#fff", fontSize:11, fontWeight:800, letterSpacing:"0.8px", textTransform:"uppercase" }}>
              OD Portal · AIGentix
            </span>
          </div>
        </div>

        {/* Heading */}
        <div className="si-fadein" style={{ animationDelay:"0.08s", textAlign:"center" }}>
          <h1 style={{ margin:"0 0 6px", fontSize:"2.1rem", fontWeight:900, color:"#0f172a", letterSpacing:"-0.5px" }}>
            Welcome back 👋
          </h1>
          <p style={{ margin:0, color:"#64748b", fontSize:13, fontWeight:500 }}>
            On-Duty & Leave Management System
          </p>
        </div>

        {/* ── Floating Card ─────────────────────────────────────── */}
        <div
          className={`si-card si-fadein${shake ? " si-shake" : ""}`}
          style={{
            animationDelay:"0.14s",
            width:"100%",
            background:"#ffffff",
            borderRadius:28,
            padding:"28px 28px 24px",
            boxShadow:"0 20px 60px rgba(15,23,42,0.10), 0 4px 16px rgba(15,23,42,0.06)",
            border:"1px solid rgba(226,232,240,0.8)",
            ...cssVars,
          }}
        >
          {/* Role tab switcher */}
          <div style={{
            display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6,
            background:"#f8fafc", borderRadius:16, padding:5, marginBottom:22,
          }}>
            {ROLES.map(r => {
              const Icon = r.icon;
              const active = activeRole === r.key;
              return (
                <button
                  key={r.key}
                  className={`si-tab${active ? " si-tab-active" : ""}`}
                  onClick={() => handleRoleChange(r.key)}
                  style={{
                    display:"flex", flexDirection:"column", alignItems:"center", gap:4,
                    padding:"9px 4px 7px", borderRadius:11,
                    background: active ? "#fff" : "transparent",
                    border: active ? `1.5px solid ${r.border}` : "1.5px solid transparent",
                    color: active ? r.color : "#94a3b8",
                    fontSize:9, fontWeight: active ? 700 : 500,
                    cursor:"pointer", letterSpacing:"0.3px",
                    boxShadow: active ? `0 2px 12px ${r.color}18` : "none",
                  }}
                >
                  <Icon size={14} strokeWidth={active ? 2.5 : 1.8} />
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>

          {/* Role indicator */}
          <div style={{
            display:"flex", alignItems:"center", gap:8, marginBottom:18,
            padding:"8px 12px", borderRadius:12,
            background: role.light, border:`1px solid ${role.border}`,
          }}>
            <span style={{
              width:7, height:7, borderRadius:"50%", background:role.color,
              boxShadow:`0 0 8px ${role.color}`,
              display:"inline-block", flexShrink:0,
            }}/>
            <span style={{ color:role.color, fontSize:10, fontWeight:700, letterSpacing:"0.5px" }}>
              {role.hint}
            </span>
            <span style={{ color:role.color+"99", fontSize:10, marginLeft:"auto", fontFamily:"monospace" }}>
              {role.formatExample}
            </span>
          </div>

          {/* User ID input */}
          <div style={{ marginBottom:14 }}>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#374151", marginBottom:7, letterSpacing:"0.4px" }}>
              User ID
            </label>
            <div
              className="si-input-wrap"
              style={{
                display:"flex", alignItems:"center",
                background:"#f8fafc", border:`1.5px solid ${focused==="id" ? role.color : "#e2e8f0"}`,
                borderRadius:14, overflow:"hidden",
                boxShadow: focused==="id" ? `0 0 0 3px ${role.color}20` : "none",
              }}
            >
              <User size={14} style={{ marginLeft:14, color: focused==="id" ? role.color : "#94a3b8", flexShrink:0, transition:"color 0.2s" }} />
              <input
                id="signin-userid" type="text" autoComplete="username"
                placeholder={role.placeholder} value={userId}
                onChange={e => { setUserId(e.target.value); setError(""); }}
                onFocus={() => setFocused("id")} onBlur={() => setFocused(null)} onKeyDown={handleKeyDown}
                style={{
                  flex:1, background:"transparent", border:"none", outline:"none",
                  padding:"13px 14px", color:"#0f172a", fontSize:13,
                  fontFamily:"'DM Mono', 'Courier New', monospace", fontWeight:600,
                }}
              />
            </div>
          </div>

          {/* Password input */}
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#374151", marginBottom:7, letterSpacing:"0.4px" }}>
              Password
            </label>
            <div
              className="si-input-wrap"
              style={{
                display:"flex", alignItems:"center",
                background:"#f8fafc", border:`1.5px solid ${focused==="pw" ? role.color : "#e2e8f0"}`,
                borderRadius:14, overflow:"hidden",
                boxShadow: focused==="pw" ? `0 0 0 3px ${role.color}20` : "none",
              }}
            >
              <Lock size={14} style={{ marginLeft:14, color: focused==="pw" ? role.color : "#94a3b8", flexShrink:0, transition:"color 0.2s" }} />
              <input
                id="signin-password" type={showPass ? "text" : "password"} autoComplete="current-password"
                placeholder="Enter your password" value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                onFocus={() => setFocused("pw")} onBlur={() => setFocused(null)} onKeyDown={handleKeyDown}
                style={{
                  flex:1, background:"transparent", border:"none", outline:"none",
                  padding:"13px 14px", color:"#0f172a", fontSize:13,
                }}
              />
              <button type="button" onClick={() => setShowPass(p => !p)}
                style={{ background:"none", border:"none", color:"#94a3b8", cursor:"pointer", padding:"0 14px", display:"flex", alignItems:"center", transition:"color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color = role.color}
                onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
              >
                {showPass ? <EyeOff size={14}/> : <Eye size={14}/>}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              display:"flex", alignItems:"flex-start", gap:9,
              background:"#fef2f2", border:"1.5px solid #fecaca",
              borderRadius:12, padding:"10px 13px", marginBottom:16,
            }}>
              <AlertCircle size={13} style={{ color:"#ef4444", flexShrink:0, marginTop:1 }} />
              <span style={{ color:"#dc2626", fontSize:12, lineHeight:1.5 }}>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            id="signin-submit" type="button" onClick={handleLogin} disabled={loading}
            className="si-submit"
            style={{
              width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:9,
              borderRadius:16, padding:"14px 20px", fontSize:13, fontWeight:800,
              border:"none", cursor: loading ? "not-allowed" : "pointer",
              letterSpacing:"0.4px",
              background: loading
                ? "#e2e8f0"
                : `linear-gradient(135deg, ${role.color}, ${role.color}cc)`,
              color: loading ? "#94a3b8" : "#fff",
              boxShadow: loading ? "none" : `0 6px 20px ${role.color}35`,
            }}
          >
            {loading ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  style={{ animation:"si-spin 0.8s linear infinite" }}>
                  <path d="M21 12a9 9 0 11-9-9"/>
                </svg>
                Signing in…
              </>
            ) : (
              <>
                <LogIn size={14} strokeWidth={2.5} />
                Sign In
                <ChevronRight size={13} strokeWidth={2.5} />
              </>
            )}
          </button>
        </div>

        {/* ── ID Format Guide card ────────────────────────────── */}
        <div className="si-fadein" style={{ animationDelay:"0.22s", width:"100%" }}>
          <div style={{
            background:"#fff", borderRadius:20, overflow:"hidden",
            boxShadow:"0 8px 30px rgba(15,23,42,0.07)", border:"1px solid #e2e8f0",
          }}>
            <div style={{
              display:"flex", alignItems:"center", gap:8,
              padding:"10px 16px",
              background:`linear-gradient(90deg, ${role.color}10, transparent)`,
              borderBottom:"1px solid #f1f5f9",
            }}>
              <Info size={12} style={{ color:role.color }} />
              <span style={{ color:role.color, fontSize:9, fontWeight:800, letterSpacing:"1.2px", textTransform:"uppercase" }}>
                ID Format Guide
              </span>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, padding:"12px 12px 8px" }}>
              {[
                { label:"Student", ex:"714024104200", desc:"12-digit Register Number", color:ROLES[0].color, light:ROLES[0].light, border:ROLES[0].border },
                { label:"Advisor", ex:"ADVCS3D",   desc:"ADV + DEPT + YR + SEC",       color:ROLES[2].color, light:ROLES[2].light, border:ROLES[2].border },
              ].map(f => (
                <div key={f.label} className="si-format-card" style={{
                  borderRadius:14, padding:"11px 12px",
                  background:f.light, border:`1.5px solid ${f.border}`,
                  boxShadow:`0 2px 8px ${f.color}10`,
                }}>
                  <div style={{ color:f.color, fontSize:8, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:5 }}>{f.label}</div>
                  <div style={{ fontFamily:"monospace", color:"#0f172a", fontWeight:800, fontSize:12, marginBottom:3 }}>{f.ex}</div>
                  <div style={{ color:"#64748b", fontSize:9, lineHeight:1.5 }}>{f.desc}</div>
                </div>
              ))}
              <div className="si-format-card" style={{
                gridColumn:"1 / -1", borderRadius:14, padding:"11px 12px",
                background:ROLES[3].light, border:`1.5px solid ${ROLES[3].border}`,
                display:"flex", alignItems:"center", justifyContent:"space-between",
                boxShadow:`0 2px 8px ${ROLES[3].color}10`,
              }}>
                <div>
                  <div style={{ color:ROLES[3].color, fontSize:8, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:3 }}>HOD</div>
                  <div style={{ color:"#64748b", fontSize:9 }}>HOD + DEPT code</div>
                </div>
                <div style={{ fontFamily:"monospace", color:"#0f172a", fontWeight:800, fontSize:13 }}>HODCS</div>
              </div>
            </div>

            {/* Demo passwords */}
            <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:"6px 16px", padding:"10px 16px", borderTop:"1px solid #f1f5f9" }}>
              <span style={{ color:"#94a3b8", fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.7px" }}>Demo Passwords</span>
              {[
                { label:"Student", val:"Last 4 digits of register (e.g. 4200)", color:ROLES[0].color, bg:ROLES[0].light, border:ROLES[0].border },
                { label:"Advisor", val:"advisor123", color:ROLES[2].color, bg:ROLES[2].light, border:ROLES[2].border },
                { label:"HOD",     val:"hod123",     color:ROLES[3].color, bg:ROLES[3].light, border:ROLES[3].border },
              ].map(c => (
                <span key={c.label} style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <span style={{ color:"#64748b", fontSize:9 }}>{c.label}:</span>
                  <code style={{
                    fontFamily:"'DM Mono','Courier New',monospace",
                    background:c.bg, color:c.color, fontSize:9, fontWeight:700,
                    padding:"2px 8px", borderRadius:8, border:`1px solid ${c.border}`,
                  }}>{c.val}</code>
                </span>
              ))}
            </div>
          </div>
        </div>

        <p style={{ color:"#94a3b8", fontSize:11, textAlign:"center" }}>
          AIGentix OD Portal · {new Date().getFullYear()} · For demo use only
        </p>
      </div>
    </div>
  );
}