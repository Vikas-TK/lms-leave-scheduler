import { useState, useEffect, useRef } from "react";
import {
  X, Printer, Download, CheckCircle2, Shield, Award,
  QrCode, Calendar, User, Building2, Hash, MapPin, Sparkles,
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

const fmt = d => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "—";
const fmtShort = d => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const daysCount = (a, b) => Math.max(1, Math.round((new Date(b) - new Date(a)) / 86400000) + 1);
const todayStr = () => new Date().toISOString().split("T")[0];

function advisorFromReq(req) {
  const idx = (parseInt(req.rollNo || "1", 10)) % ADV_NAMES.length;
  return ADV_NAMES[idx];
}

function buildVerifyUrl(id) {
  return `https://odportal.aigentix.app/verify/${id}`;
}

function buildQRSrc(id) {
  const payload = encodeURIComponent(buildVerifyUrl(id));
  return `https://api.qrserver.com/v1/create-qr-code/?size=140x140&bgcolor=ffffff&color=000000&data=${payload}&qzone=1&format=png`;
}

const PRINT_CSS = `
@media print {
  body * { visibility: hidden !important; }
  #clearance-pass-printable, #clearance-pass-printable * { visibility: visible !important; }
  #clearance-pass-printable {
    position: fixed !important; inset: 0 !important;
    width: 100vw !important; height: auto !important;
    background: white !important; color: black !important;
    display: block !important; padding: 0 !important; margin: 0 !important;
    z-index: 9999 !important;
  }
  .cp-pass-card {
    box-shadow: none !important; border: 2px solid #333 !important;
    border-radius: 0 !important; max-width: 100% !important;
    background: white !important; margin: 0 !important; padding: 24px 32px !important;
    page-break-inside: avoid !important;
  }
  .cp-no-print { display: none !important; }
  .cp-print-show { display: block !important; }
  .cp-col-header { background: #064e3b !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}

@keyframes modalZoomIn {
  from { opacity: 0; transform: scale(0.96) translateY(16px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

.cp-modal-anim {
  animation: modalZoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
`;

function PassCard({ req }) {
  const advisorName = advisorFromReq(req);
  const hodName     = HOD_NAMES[req.dept] || "Head of Department";
  const deptFull    = DEPTS[req.dept] || req.dept;
  const days        = daysCount(req.fromDate, req.toDate);
  const verifyUrl   = buildVerifyUrl(req.id);
  const qrSrc       = buildQRSrc(req.id);
  const isOD        = req.requestType !== "gatepass";
  const typeLabel   = isOD ? "On-Duty (OD)" : "Campus Gate Pass";

  return (
    <div
      className="cp-pass-card"
      style={{
        background: "#ffffff",
        border: "1.5px solid #e2e8f0",
        borderRadius: 24,
        boxShadow: "0 14px 40px rgba(15, 23, 42, 0.08)",
        overflow: "hidden", width: "100%", maxWidth: 620,
        color: "#0f172a", fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* College Header */}
      <div
        className="cp-col-header"
        style={{
          background: "linear-gradient(135deg, #064e3b, #065f46)",
          padding: "20px 24px",
          display: "flex", alignItems: "center", gap: 16,
        }}
      >
        <div style={{
          width: 50, height: 50, borderRadius: 16, flexShrink: 0,
          background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 16px rgba(16, 185, 129, 0.4)",
        }}>
          <Award size={26} color="#fff" strokeWidth={2.2} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#fff", fontWeight: 900, fontSize: 16, letterSpacing: "-0.2px" }}>
            AIGentix Institute of Technology
          </div>
          <div style={{ color: "#a7f3d0", fontSize: 11, fontWeight: 600, marginTop: 2 }}>
            Department of {deptFull} · NAAC A++ Accredited
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{
            background: "#10b981", color: "#fff",
            fontSize: 10, fontWeight: 900, padding: "5px 12px",
            borderRadius: 9999, letterSpacing: "0.6px", textTransform: "uppercase",
            boxShadow: "0 2px 8px rgba(16, 185, 129, 0.4)",
          }}>
            {typeLabel}
          </div>
          <div style={{ color: "#6ee7b7", fontSize: 10, marginTop: 4, fontFamily: "monospace", fontWeight: 700 }}>
            {req.id}
          </div>
        </div>
      </div>

      {/* Approved Banner */}
      <div style={{
        background: "#f0fdf4", borderBottom: "1.5px solid #bbf7d0",
        padding: "10px 24px", display: "flex", alignItems: "center", gap: 8,
      }}>
        <CheckCircle2 size={16} color="#16a34a" strokeWidth={2.5} />
        <span style={{ color: "#15803d", fontSize: 11, fontWeight: 900, letterSpacing: "0.5px", textTransform: "uppercase" }}>
          Official Digital Clearance Pass · Active & Validated
        </span>
        <span style={{ marginLeft: "auto", color: "#16a34a", fontSize: 10, fontWeight: 700 }}>
          HOD Approved: {fmt(req.hodAt)}
        </span>
      </div>

      {/* Main Body */}
      <div style={{ padding: "24px" }}>
        <div style={{ display: "flex", gap: 20, marginBottom: 20, alignItems: "flex-start" }}>
          {/* Info Table */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>
              Student Information
            </div>
            {[
              { label: "Student Name", value: req.studentName },
              { label: "Roll Number",  value: req.rollNo },
              { label: "Department",   value: deptFull },
              { label: "Class",        value: `${req.dept}${req.year}${req.section} — Yr ${req.year}, Sec ${req.section}` },
              { label: "Student ID",   value: req.studentId },
            ].map(row => (
              <div key={row.label} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "baseline" }}>
                <span style={{ color: "#64748b", fontSize: 11, fontWeight: 700, minWidth: 96, flexShrink: 0 }}>{row.label}</span>
                <span style={{ color: "#0f172a", fontSize: 12, fontWeight: 800 }}>: {row.value}</span>
              </div>
            ))}
          </div>

          {/* QR Code */}
          <div style={{ flexShrink: 0, textAlign: "center" }}>
            <div style={{
              width: 124, height: 124, borderRadius: 16,
              border: "2px solid #e2e8f0", overflow: "hidden",
              background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
            }}>
              <img src={qrSrc} alt="Verification QR" width={118} height={118} style={{ display: "block" }} />
            </div>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#64748b", marginTop: 6 }}>
              Scan for Real-Time Gate Security
            </div>
          </div>
        </div>

        {/* Permission Details */}
        <div style={{
          background: "#f8fafc", border: "1.5px solid #e2e8f0",
          borderRadius: 18, padding: "14px 16px", marginBottom: 20,
        }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", marginBottom: 8, lineHeight: 1.5 }}>
            {req.reason}
          </div>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>From</span>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#16a34a" }}>{fmtShort(req.fromDate)} {req.fromTime && `· ${req.fromTime}`}</div>
            </div>
            <div style={{ color: "#94a3b8", fontSize: 18 }}>→</div>
            <div>
              <span style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>To</span>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#16a34a" }}>{fmtShort(req.toDate)} {req.toTime && `· ${req.toTime}`}</div>
            </div>
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <span style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Duration</span>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#2563eb" }}>{days} Day{days > 1 ? "s" : ""}</div>
            </div>
          </div>
        </div>

        {/* Stamps Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
          {/* Advisor Stamp */}
          <div style={{
            border: "2px dashed #86efac", borderRadius: 16, padding: "14px", textAlign: "center", background: "#f0fdf4",
          }}>
            <div style={{ fontSize: 10, color: "#166534", fontWeight: 800, textTransform: "uppercase", marginBottom: 8 }}>
              Advisor Digital Seal
            </div>
            <div style={{
              width: 42, height: 42, borderRadius: "50%", margin: "0 auto 8px",
              background: "#dcfce7", border: "2px solid #86efac",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <CheckCircle2 size={20} color="#16a34a" strokeWidth={2.5} />
            </div>
            <div style={{ fontSize: 12, fontWeight: 900, color: "#0f172a" }}>{advisorName}</div>
            <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>Class Advisor</div>
            <div style={{ fontSize: 9, fontWeight: 800, color: "#16a34a", background: "#dcfce7", borderRadius: 9999, padding: "2px 8px", display: "inline-block", marginTop: 6 }}>
              ✓ APPROVED · {fmt(req.advisorAt)}
            </div>
          </div>

          {/* HOD Seal */}
          <div style={{
            border: "2px solid #93c5fd", borderRadius: 16, padding: "14px", textAlign: "center", background: "#eff6ff",
          }}>
            <div style={{ fontSize: 10, color: "#1e40af", fontWeight: 800, textTransform: "uppercase", marginBottom: 8 }}>
              HOD Official Seal
            </div>
            <div style={{
              width: 42, height: 42, borderRadius: "50%", margin: "0 auto 8px",
              background: "#dbeafe", border: "2px solid #93c5fd",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Shield size={20} color="#2563eb" strokeWidth={2.5} />
            </div>
            <div style={{ fontSize: 12, fontWeight: 900, color: "#0f172a" }}>{hodName}</div>
            <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>Head of Department</div>
            <div style={{ fontSize: 9, fontWeight: 800, color: "#2563eb", background: "#dbeafe", borderRadius: 9999, padding: "2px 8px", display: "inline-block", marginTop: 6 }}>
              ◉ SEALED · {fmt(req.hodAt)}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontSize: 10, color: "#2563eb", fontFamily: "monospace", fontWeight: 700 }}>
            {verifyUrl}
          </div>
          <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700 }}>
            Issued on: {fmtShort(req.hodAt || todayStr())}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClearancePass({ req, onClose }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const handlePrint = () => { window.print(); };

  return (
    <>
      <style>{PRINT_CSS}</style>

      <div id="clearance-pass-printable" style={{ display: "none" }}>
        <PassCard req={req} />
      </div>

      <div
        ref={overlayRef}
        onClick={e => { if (e.target === overlayRef.current) onClose(); }}
        className="cp-no-print"
        style={{
          position: "fixed", inset: 0,
          background: "rgba(15,23,42,0.45)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 950, padding: "20px", overflow: "auto",
        }}
      >
        <div
          className="cp-modal-anim"
          style={{
            width: "100%", maxWidth: 680,
            background: "#ffffff",
            borderRadius: 28,
            boxShadow: "0 25px 70px rgba(15,23,42,0.15)",
            border: "1.5px solid #e2e8f0",
            overflow: "hidden",
          }}
        >
          {/* Modal Header */}
          <div style={{
            padding: "16px 22px",
            background: "#f0fdf4",
            borderBottom: "1.5px solid #bbf7d0",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle2 size={18} color="#16a34a" strokeWidth={2.5} />
              </div>
              <div>
                <div style={{ color: "#0f172a", fontWeight: 900, fontSize: 15 }}>Digital Clearance Pass</div>
                <div style={{ color: "#16a34a", fontSize: 11, fontWeight: 700 }}>Final Approved by HOD</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={handlePrint}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "linear-gradient(135deg, #16a34a, #059669)",
                  border: "none", color: "#fff",
                  fontSize: 12, fontWeight: 900, padding: "8px 16px",
                  borderRadius: 9999, cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(22,163,74,0.35)",
                }}
              >
                <Printer size={14} strokeWidth={2.5} /> Print Pass
              </button>

              <button
                onClick={handlePrint}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "#ffffff", border: "1.5px solid #e2e8f0",
                  color: "#0f172a", fontSize: 12, fontWeight: 800, padding: "8px 16px",
                  borderRadius: 9999, cursor: "pointer",
                }}
              >
                <Download size={14} strokeWidth={2.5} /> PDF
              </button>

              <button
                onClick={onClose}
                style={{
                  width: 32, height: 32, borderRadius: 10, border: "none",
                  background: "#ffffff", color: "#64748b",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Pass Preview */}
          <div style={{ padding: "24px", overflowY: "auto", maxHeight: "calc(90vh - 80px)" }}>
            <PassCard req={req} />
          </div>
        </div>
      </div>
    </>
  );
}
