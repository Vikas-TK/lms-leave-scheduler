import { useState, useEffect, useRef } from "react";
import {
  X, User, Award, BookOpen, Calendar, CheckCircle2, Clock,
  XCircle, Home, Sun, GraduationCap, Building2, BarChart3,
  Layers, ClipboardList, BadgeCheck, Shield, Sparkles,
} from "lucide-react";

const DEPTS = {
  CS:"Computer Science", IT:"Information Technology",
  AIDS:"AI & Data Science", AIML:"AI & Machine Learning",
  CY:"Cyber Security", MECH:"Mechanical Engineering",
  CIVIL:"Civil Engineering", BME:"Biomedical Engineering",
  EEE:"Electrical & Electronics", ECE:"Electronics & Communication",
};

const ADV_NAMES = [
  "Dr. Lakshmi Priya","Dr. Rajesh Mohan","Dr. Anita Rao","Dr. Sunil Kumar",
  "Dr. Preethi Nair","Dr. Kiran Babu","Dr. Meena Devi","Dr. Venkat Rao",
  "Prof. Kavitha S","Prof. Arun M","Prof. Shalini T","Prof. Ramesh N",
];
const HOD_NAMES = {
  CS:"Prof. Suresh Babu", IT:"Prof. Anil Menon", AIDS:"Prof. Deepa Nair",
  AIML:"Prof. Sanjay Iyer", CY:"Prof. Ramesh Pillai", MECH:"Prof. Anand Kumar",
  CIVIL:"Prof. Ravi Sharma", BME:"Prof. Uma Devi", EEE:"Prof. Ganesh Rao", ECE:"Prof. Priya S",
};

function seedAttendance(rollNo, dept) {
  const n = (parseInt(rollNo || "1", 10) + dept.charCodeAt(0)) % 20;
  return 78 + n; // 78%–97%
}

const OD_QUOTA = 20;

function InfoRow({ icon: Icon, label, value, accent }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: "1px solid #f1f5f9" }}>
      <div style={{ width: 32, height: 32, borderRadius: 10, background: `${accent || "#16a34a"}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={16} color={accent || "#16a34a"} strokeWidth={2.2} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ color: "#64748b", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 700 }}>{label}</div>
        <div style={{ color: "#0f172a", fontSize: 13, fontWeight: 700, marginTop: 1 }}>{value}</div>
      </div>
    </div>
  );
}

function StatTile({ label, val, color, sub, bg, border }) {
  return (
    <div style={{ background: bg || "#f8fafc", border: `1.5px solid ${border || "#e2e8f0"}`, borderRadius: 18, padding: "14px 10px", textAlign: "center" }}>
      <div style={{ fontSize: 24, fontWeight: 900, color, lineHeight: 1 }}>{val}</div>
      <div style={{ color: "#64748b", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.7px", marginTop: 4, fontWeight: 700 }}>{label}</div>
      {sub && <div style={{ color: color, fontSize: 9, fontWeight: 700, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function ProgressBar({ pct, color }) {
  return (
    <div style={{ height: 8, background: "#e2e8f0", borderRadius: 9999, overflow: "hidden", marginTop: 8 }}>
      <div
        style={{ width: `${pct}%`, height: "100%", borderRadius: 9999, background: color, transition: "width 0.8s ease" }}
      />
    </div>
  );
}

export default function ProfileModal({ user, requests, onClose }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const isStudent = user.role === "student";
  const isHOD = user.role === "hod";

  // Student metrics
  const mine = requests.filter(r => r.studentId === user.id);
  const approved = mine.filter(r => r.hodStatus === "approved");
  const pending = mine.filter(r => !r.hodStatus && !r.advisorStatus);
  const rejected = mine.filter(r => r.hodStatus === "rejected" || r.advisorStatus === "rejected");
  const odUsed = approved.length;
  const odRemain = Math.max(0, OD_QUOTA - odUsed);
  const attendance = seedAttendance(user.rollNo, user.dept);
  const isHosteller = user.loginRole === "hosteller";
  const advisorIdx = (parseInt(user.rollNo || "1", 10)) % ADV_NAMES.length;
  const advisorName = ADV_NAMES[advisorIdx];

  // Faculty metrics
  const pendingForMe = isHOD
    ? requests.filter(r => r.dept === user.dept && r.advisorStatus === "approved" && r.hodStatus == null)
    : requests.filter(r => r.dept === user.dept && r.year === user.year && r.section === user.section && r.advisorStatus == null);

  const approvedByMe = isHOD
    ? requests.filter(r => r.dept === user.dept && r.hodStatus === "approved")
    : requests.filter(r => r.dept === user.dept && r.year === user.year && r.section === user.section && r.advisorStatus === "approved");

  return (
    <div
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(15,23,42,0.45)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 900, padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%", maxWidth: 540,
          background: "#ffffff",
          borderRadius: 28,
          boxShadow: "0 25px 70px rgba(15,23,42,0.15)",
          border: "1.5px solid #e2e8f0",
          overflow: "hidden",
          maxHeight: "90vh", display: "flex", flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "18px 24px",
          borderBottom: "1px solid #f1f5f9",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "#f8fafc",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User size={16} color="#16a34a" />
            </div>
            <div>
              <div style={{ color: "#0f172a", fontWeight: 900, fontSize: 15 }}>Institutional Profile</div>
              <div style={{ color: "#64748b", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>{user.id}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: 10, border: "none", background: "#ffffff", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ overflowY: "auto", flex: 1, padding: "24px" }}>
          {isStudent ? (
            <div>
              {/* Student Banner */}
              <div style={{
                background: "linear-gradient(135deg, #064e3b 0%, #065f46 60%, #0f766e 100%)",
                borderRadius: 22, padding: "20px 22px", color: "#fff", marginBottom: 20,
                display: "flex", alignItems: "center", gap: 16,
              }}>
                <div style={{
                  width: 54, height: 54, borderRadius: 9999, background: "#10b981",
                  color: "#fff", fontSize: 22, fontWeight: 900,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 16px rgba(16, 185, 129, 0.4)", flexShrink: 0,
                }}>
                  {(user.name || user.id || "U")[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 4 }}>{user.name || user.id || "Student"}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ background: "rgba(255,255,255,0.2)", padding: "3px 10px", borderRadius: 9999, fontSize: 10, fontWeight: 800 }}>
                      {isHosteller ? "Hosteller" : "Day Scholar"}
                    </span>
                    <span style={{ background: "#10b981", padding: "3px 10px", borderRadius: 9999, fontSize: 10, fontWeight: 800 }}>
                      {user.dept}{user.year}{user.section}
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
                <StatTile label="ODs Used" val={odUsed} color="#2563eb" bg="#eff6ff" border="#bfdbfe" />
                <StatTile label="Quota Left" val={odRemain} color="#16a34a" sub={`/ 20`} bg="#f0fdf4" border="#bbf7d0" />
                <StatTile label="Pending" val={pending.length} color="#d97706" bg="#fef3c7" border="#fde68a" />
                <StatTile label="Rejected" val={rejected.length} color="#dc2626" bg="#fef2f2" border="#fecaca" />
              </div>

              {/* Attendance Bar */}
              <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 20, padding: "16px 18px", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <BarChart3 size={15} color="#16a34a" />
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>Attendance Percentage</span>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 900, color: "#16a34a" }}>{attendance}%</span>
                </div>
                <ProgressBar pct={attendance} color="linear-gradient(90deg, #10b981, #059669)" />
              </div>

              {/* Details List */}
              <div style={{ background: "#ffffff", border: "1.5px solid #e2e8f0", borderRadius: 20, padding: "8px 18px" }}>
                <InfoRow icon={BookOpen} label="Department" value={DEPTS[user.dept] || user.dept} />
                <InfoRow icon={Layers} label="Class" value={`Year ${user.year}, Section ${user.section}`} />
                <InfoRow icon={User} label="Roll Number" value={user.rollNo} />
                <InfoRow icon={GraduationCap} label="Faculty Class Advisor" value={advisorName} />
                <InfoRow icon={Calendar} label="Academic Year" value="2026 – 2027" />
              </div>
            </div>
          ) : (
            <div>
              {/* Faculty Banner */}
              <div style={{
                background: "linear-gradient(135deg, #064e3b 0%, #065f46 60%, #0f766e 100%)",
                borderRadius: 22, padding: "20px 22px", color: "#fff", marginBottom: 20,
                display: "flex", alignItems: "center", gap: 16,
              }}>
                <div style={{
                  width: 54, height: 54, borderRadius: 9999, background: "#10b981",
                  color: "#fff", fontSize: 22, fontWeight: 900,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 16px rgba(16, 185, 129, 0.4)", flexShrink: 0,
                }}>
                  {(user.name || user.id || "F")[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 4 }}>{user.name || user.id || "Faculty"}</div>
                  <span style={{ background: "rgba(255,255,255,0.2)", padding: "3px 10px", borderRadius: 9999, fontSize: 10, fontWeight: 800 }}>
                    {isHOD ? "Head of Department" : "Faculty Class Advisor"}
                  </span>
                </div>
              </div>

              {/* 3 Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
                <StatTile label="Pending Action" val={pendingForMe.length} color="#d97706" bg="#fef3c7" border="#fde68a" />
                <StatTile label="Approved by You" val={approvedByMe.length} color="#16a34a" bg="#f0fdf4" border="#bbf7d0" />
                <StatTile label="Department" val={user.dept} color="#2563eb" bg="#eff6ff" border="#bfdbfe" />
              </div>

              {/* Details List */}
              <div style={{ background: "#ffffff", border: "1.5px solid #e2e8f0", borderRadius: 20, padding: "8px 18px" }}>
                <InfoRow icon={BadgeCheck} label="Designation" value={isHOD ? "Head of Department (HOD)" : "Class Advisor / Faculty"} />
                <InfoRow icon={Building2} label="Department" value={DEPTS[user.dept] || user.dept} />
                <InfoRow icon={Layers} label="Assigned Batch" value={isHOD ? "All Batches & Years" : `Year ${user.year}, Section ${user.section}`} />
                <InfoRow icon={Calendar} label="Academic Year" value="2026 – 2027" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
