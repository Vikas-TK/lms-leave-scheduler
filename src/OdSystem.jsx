import { useState, useCallback, useEffect } from "react";
import SignIn from "./SignIn";
import NewApplication from "./NewApplication";
import FacultyApproval from "./FacultyApproval";
import { ValidityBadge, RenewButton, checkValidity } from "./validityEngine";
import NavigationShell from "./NavigationShell";
import ProfileModal from "./ProfileModal";
import ClearancePass from "./ClearancePass";
import LetterPreviewModal from "./LetterPreviewModal.jsx";
import ClickSpark from "./ClickSpark";
import { STUDENTS } from "./data/students";
import {
  FileText, CheckCircle2, Clock, XCircle,
  Sparkles, ArrowRight, MessageCircle, ExternalLink,
  Calendar, Layers, Download, Plus, ShieldCheck,
} from "lucide-react";

const G = {
  bg: "#f8fafc",
  card: "#ffffff",
  border: "#e2e8f0",
  text: "#0f172a",
  muted: "#64748b",
  green: "#16a34a",
  greenLight: "#dcfce7",
  emerald: "#059669",
  teal: "#0d9488",
  blue: "#2563eb",
  amber: "#f59e0b",
  red: "#dc2626",
};

const DEPTS = {
  CS:"Computer Science", IT:"Information Technology",
  AIDS:"AI & Data Science", AIML:"AI & Machine Learning",
  CY:"Cyber Security", MECH:"Mechanical Engineering",
  CIVIL:"Civil Engineering", BME:"Biomedical Engineering",
  EEE:"Electrical & Electronics", ECE:"Electronics & Communication",
};
const DEPT_KEYS = Object.keys(DEPTS);
const YEARS = [1,2,3,4];
const SECTIONS = ["A","B","C"];

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

const buildUsers = () => {
  const u = {};
  let ai = 0;
  Object.values(STUDENTS).forEach(s => {
    u[s.regNo] = {
      pass: s.pass, role: "student",
      name: s.name, dept: s.dept, year: s.year,
      section: s.section, rollNo: s.rollNo, regNo: s.regNo, photo: s.photo,
    };
  });
  DEPT_KEYS.forEach(dept => {
    YEARS.forEach(yr => {
      SECTIONS.forEach(sec => {
        u[`ADV${dept}${yr}${sec}`] = {
          pass:"advisor123", role:"advisor",
          name: ADV_NAMES[ai++ % ADV_NAMES.length],
          dept, year:yr, section:sec,
        };
      });
    });
    u[`HOD${dept}`] = { pass:"hod123", role:"hod", name:HOD_NAMES[dept], dept };
  });
  return u;
};
const USERS = buildUsers();

// ── Reactive store with pre-seeded demo applications (persisted to localStorage) ──
const _SEED_DB = [
  {
    id: "OD-001",
    studentId: "714024104200",
    studentName: "714024104200",
    dept: "CS",
    year: 3,
    section: "D",
    rollNo: "200",
    requestType: "od",
    fromDate: "2026-08-10",
    fromTime: "09:00",
    toDate: "2026-08-12",
    toTime: "18:00",
    reason: "Smart India Hackathon 2026 Grand Finale at MIT World Peace University — Presenting AI Autonomous Traffic System",
    coApplicants: ["714024104189", "714024104190"],
    photo: "/students/714024104200.jpg",
    attachmentName: "SIH2026_Selection_Letter.pdf",
    letter: "29 August 2026\n\nTo,\nProf. Suresh Babu\nHead of the Department of Computer Science\n\nAnd\n\nProf. Arun M\nClass Advisor — CS3D\n\nRespected Faculty Members,\n\nSubject: Requisition for On-Duty (OD) Permission — Smart India Hackathon 2026\n\nI am writing to formally request On-Duty (OD) permission for 3 days from 10 August 2026 to 12 August 2026. Our team has qualified for the Grand Finale of Smart India Hackathon 2026 at MIT.\n\nKindly grant OD attendance for the mentioned duration.\n\nYours faithfully,\n714024104200\nRoll No: 200, CS3D",
    advisorStatus: "approved",
    advisorAt: "2026-08-08",
    hodStatus: "approved",
    hodAt: "2026-08-09",
    createdAt: "2026-08-07",
  },
  {
    id: "OD-002",
    studentId: "714024104200",
    studentName: "714024104200",
    dept: "CS",
    year: 3,
    section: "D",
    rollNo: "200",
    requestType: "gatepass",
    fromDate: "2026-09-02",
    fromTime: "10:00",
    toDate: "2026-09-05",
    toTime: "17:00",
    reason: "Paper presentation on Quantum Computing & Cryptography at IEEE International Conference",
    coApplicants: ["714024104189"],
    photo: "/students/714024104200.jpg",
    attachmentName: "IEEE_Acceptance_Letter.pdf",
    letter: "29 August 2026\n\nTo,\nProf. Suresh Babu\nHead of the Department of Computer Science\n\nAnd\n\nProf. Arun M\nClass Advisor — CS3D\n\nRespected Sir/Madam,\n\nSubject: Application for Campus Gate Pass Permission\n\nI request Gate Pass clearance from 02 September 2026 to 05 September 2026 to represent our institution at the IEEE International Conference.\n\nThanking you,\n714024104200 (714024104200)",
    advisorStatus: "approved",
    advisorAt: "2026-08-28",
    hodStatus: "approved",
    hodAt: "2026-08-28",
    createdAt: "2026-08-27",
  },
  {
    id: "OD-003",
    studentId: "714024104200",
    studentName: "714024104200",
    dept: "CS",
    year: 3,
    section: "D",
    rollNo: "200",
    requestType: "od",
    fromDate: "2026-09-12",
    fromTime: "09:00",
    toDate: "2026-09-14",
    toTime: "18:00",
    reason: "National Cyber Security Championship 2026 at IIT Bombay — Capture The Flag (CTF) Competition",
    coApplicants: ["714024104191"],
    photo: "/students/714024104200.jpg",
    attachmentName: "IITB_CTF_Invite.pdf",
    letter: "29 August 2026\n\nTo,\nProf. Suresh Babu\nHead of Department\n\nAnd\n\nProf. Arun M\nClass Advisor — CS3D\n\nSubject: Request for OD Approval for National Cyber Security Championship\n\nI request OD approval from 12 September 2026 to 14 September 2026 for representing our college at IIT Bombay.\n\nSincerely,\n714024104200",
    advisorStatus: null,
    hodStatus: null,
    createdAt: "2026-08-29",
  },
];

// Hydrate from localStorage if a previous session saved requests (so student submissions survive refresh / advisor login)
let OD_DB;
try {
  const saved = typeof localStorage !== "undefined" ? localStorage.getItem("od_requests") : null;
  OD_DB = saved ? JSON.parse(saved) : _SEED_DB;
  if (!Array.isArray(OD_DB) || OD_DB.length === 0) OD_DB = _SEED_DB;
} catch (_) {
  OD_DB = _SEED_DB;
}
// One-time migration: ensure every stored request has a photo for the advisor dashboard
try {
  let migrated = false;
  OD_DB = OD_DB.map(r => {
    if (!r.photo) {
      const s = STUDENTS[r.studentId];
      if (s && s.photo) { migrated = true; return { ...r, photo: s.photo }; }
      if (/^714024104\d{3}$/.test(r.studentId) && r.studentId !== "714024104198") {
        migrated = true; return { ...r, photo: `/students/${r.studentId}.jpg` };
      }
    }
    return r;
  });
  if (migrated) {
    try { localStorage.setItem("od_requests", JSON.stringify(OD_DB)); } catch (_) {}
  }
} catch (_) {}
let nextId = (() => {
  let max = 3;
  try {
    for (const r of OD_DB) {
      const n = parseInt(String(r.id).split("-")[1], 10);
      if (!isNaN(n) && n > max) max = n;
    }
  } catch (_) {}
  return max + 1;
})();

const _listeners = new Set();
const _notify = () => _listeners.forEach(fn => fn());
const _persist = () => {
  try { localStorage.setItem("od_requests", JSON.stringify(OD_DB)); } catch (_) {}
  _notify();
};
// Keep in-memory store in sync if another tab writes to localStorage
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === "od_requests" && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (Array.isArray(parsed)) { OD_DB = parsed; _notify(); }
      } catch (_) {}
    }
  });
}

const addRequest  = (req) => { OD_DB = [...OD_DB, req]; _persist(); };
const patchRequest = (id, patch) => { OD_DB = OD_DB.map(r => r.id === id ? {...r,...patch} : r); _persist(); };

function useOD() {
  const [,tick] = useState(0);
  const cb = useCallback(() => tick(n => n+1), []);
  useEffect(() => { _listeners.add(cb); return () => _listeners.delete(cb); }, [cb]);
  return OD_DB;
}

const getStatus = r => {
  if (r.hodStatus === "approved") return "approved";
  if (r.hodStatus === "rejected" || r.advisorStatus === "rejected") return "rejected";
  if (r.advisorStatus === "approved") return "pending_hod";
  return "pending_advisor";
};
const isPending  = r => { const s = getStatus(r); return s==="pending_advisor"||s==="pending_hod"; };
const isApproved = r => getStatus(r)==="approved";
const isRejected = r => getStatus(r)==="rejected";

const fmt = d => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"}) : "";
const daysCount = (a,b) => Math.max(1, Math.round((new Date(b)-new Date(a))/86400000)+1);
const clsLabel  = r => `${r.dept}${r.year}${r.section}`;
const todayStr  = () => new Date().toISOString().split("T")[0];

// ── Helper to clean asterisks (stars) and markdown from letter text ──────────
function cleanLetterText(text) {
  if (!text) return "";
  let t = text;
  // Remove markdown headers and horizontal lines
  t = t.replace(/^#+\s*/gm, "");
  t = t.replace(/^\s*[-_]{3,}\s*$/gm, "");
  // Remove all asterisks (stars) like **bold** or *italic*
  t = t.replace(/\*/g, "");
  // Remove duplicate initial college/institution title if AI generated it before 'To'
  const toIdx = t.search(/\bTo\b/i);
  if (toIdx > 0 && toIdx < 160) {
    t = t.slice(toIdx);
  }
  return t.trim();
}

// ── AI letter via Groq API (openai/gpt-oss-120b & qwen/qwen3.8-27b) ─────────────
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";


async function genLetter({studentName,rollNo,dept,year,section,fromDate,toDate,reason}) {
  const n = daysCount(fromDate,toDate);
  const advisorId = `ADV${dept}${year}${section}`;
  const hodId     = `HOD${dept}`;
  const advisorName = USERS[advisorId]?.name || "Class Advisor";
  const hodName     = USERS[hodId]?.name     || HOD_NAMES[dept] || "Head of Department";
  const sName       = studentName || rollNo || "Student";

  const systemPrompt = `You are an expert institutional AI assistant for college On-Duty (OD) applications.
Your job is to generate a clean, formal, complete On-Duty application letter from the student to their college faculty.
CRITICAL FORMAT RULES:
1. Do NOT use markdown bold asterisks (NO ** or * stars anywhere in the text).
2. Do NOT include a college letterhead or date at the top (the paper template already prints the official college header and date). Start directly with the "To" address.
3. Write complete plain text with zero placeholders or bracketed blanks. Use the exact names and details provided.`;

  const userPrompt = `Write a formal college On-Duty (OD) application letter starting directly with "To".

Student Details:
- Student Name : ${sName}
- Roll Number  : ${rollNo}
- Department   : ${DEPTS[dept] || dept}
- Class        : Year ${year}, Section ${section} (${dept}${year}${section})
- From Date    : ${fmt(fromDate)}
- To Date      : ${fmt(toDate)} (${n} day${n > 1 ? "s" : ""})
- Reason/Event : ${reason}
- Class Advisor: ${advisorName}
- Head of Dept : ${hodName}

Format:
To
${advisorName},
Class Advisor, Department of ${DEPTS[dept] || dept}

${hodName},
Head of Department, Department of ${DEPTS[dept] || dept}

Subject: Requisition for On-Duty (OD) Leave for ${n} Day(s) — ${sName} (${rollNo})

Respected Sir/Madam,

[Formal body paragraph explaining participation in ${reason} from ${fmt(fromDate)} to ${fmt(toDate)}. Assurance to catch up on missed academic work.]

Thank you.

Yours faithfully,
${sName}
Roll No: ${rollNo}
Department of ${DEPTS[dept] || dept}`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.5,
        max_tokens: 1024,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
      throw new Error(err?.error?.message || `Groq Error HTTP ${res.status}`);
    }

    const data = await res.json();
    const rawContent = data.choices?.[0]?.message?.content?.trim() || "";
    return cleanLetterText(rawContent) || "Error generating letter.";
  } catch (err) {
    // Fallback to qwen/qwen3.8-27b if 120b has any transient issue
    const resFallback = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "qwen/qwen3.8-27b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.5,
        max_tokens: 1024,
      }),
    });
    if (!resFallback.ok) {
      throw new Error(err.message || "Failed to generate letter with Groq AI.");
    }
    const dataFallback = await resFallback.json();
    const rawFallback = dataFallback.choices?.[0]?.message?.content?.trim() || "";
    return cleanLetterText(rawFallback) || "Error generating letter.";
  }
}

function printPDF(req) {
  const st = getStatus(req);
  const deptFull = DEPTS[req.dept] || req.dept || "Department of Engineering";
  const cleanBody = cleanLetterText(req.letter);
  const todayFormatted = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const win = window.open("","_blank");
  if (!win) {
    alert("Please allow popups to open print dialog.");
    return;
  }

  win.document.write(`<!DOCTYPE html><html><head><title>OD_${req.id}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Inter:wght@400;500;600;700;800&family=EB+Garamond:wght@400;500;600;700&display=swap');
@page { size: A4 portrait; margin: 14mm 16mm; }
body { font-family: 'EB Garamond', Georgia, serif; color: #0f172a; margin: 0; padding: 0; font-size: 13.5pt; line-height: 1.65; background: #fff; }
.top { text-align: center; border-bottom: 2.5px solid #064e3b; padding-bottom: 12px; margin-bottom: 16px; }
.college-title { font-family: 'Cinzel', Georgia, serif; font-size: 16pt; font-weight: 800; color: #064e3b; text-transform: uppercase; margin: 0; }
.sub-title { font-family: 'Inter', sans-serif; font-size: 8.5pt; color: #4b5563; margin: 3px 0 0; font-weight: 700; text-transform: uppercase; }
.dept-banner { font-family: 'Inter', sans-serif; font-size: 9.5pt; font-weight: 800; color: #065f46; margin: 4px 0 0; text-transform: uppercase; }
.meta-bar { display: flex; justify-content: space-between; font-family: 'Inter', sans-serif; font-size: 9pt; color: #475569; font-weight: 600; margin-bottom: 18px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px; }
.letter-content { white-space: pre-wrap; font-size: 13pt; line-height: 1.7; text-align: justify; color: #0f172a; }
.footer-stamps { margin-top: 36px; display: flex; justify-content: space-between; align-items: flex-end; page-break-inside: avoid; }
.stamp-box { text-align: center; width: 180px; font-family: 'Inter', sans-serif; }
.stamp-seal { border: 1.5px dashed #059669; border-radius: 8px; padding: 6px 8px; color: #065f46; font-size: 8pt; font-weight: 800; text-transform: uppercase; margin-bottom: 6px; background: #f0fdf4; }
.sign-line { font-size: 9pt; font-weight: 700; color: #1e293b; border-top: 1.5px solid #94a3b8; padding-top: 4px; }
@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style></head><body>
<div class="top">
  <h1 class="college-title">INSTITUTION OF ENGINEERING & TECHNOLOGY</h1>
  <div class="sub-title">AUTONOMOUS INSTITUTION · APPROVED BY AICTE · AFFILIATED TO UNIVERSITY</div>
  <div class="dept-banner">${deptFull}</div>
</div>
<div class="meta-bar">
  <span>Ref: <strong>${req.id}</strong></span>
  <span>Date: <strong>${todayFormatted}</strong></span>
</div>
<div class="letter-content">${cleanBody}</div>
<div class="footer-stamps">
  <div class="stamp-box">
    <div style="height:35px;font-style:italic;font-size:14pt;color:#1e293b">${req.studentName || req.studentId}</div>
    <div class="sign-line">${req.studentName || req.studentId}<br/><span style="font-size:7.5pt;color:#64748b;font-weight:500">${req.rollNo || req.studentId} · ${clsLabel(req)}</span></div>
  </div>
  <div class="stamp-box">
    <div class="stamp-seal">${req.advisorStatus === "approved" ? "✓ Advisor Approved" : "⏳ Pending Review"}</div>
    <div class="sign-line">Class Advisor</div>
  </div>
  <div class="stamp-box">
    <div class="stamp-seal" style="border-color:#2563eb;color:#1d4ed8;background:#eff6ff">${req.hodStatus === "approved" ? "🏛️ HOD Sanctioned" : "🏛️ Department Seal"}</div>
    <div class="sign-line">Head of Department</div>
  </div>
</div>
</body></html>`);
  win.document.close();
  setTimeout(()=>win.print(),400);
}

// ── UI Atoms (Curvy & Light Themed) ──────────────────────────────────────────
function Badge({status}) {
  const M = {
    pending_advisor:{bg:"#fef3c7",color:"#d97706",border:"#fde68a",label:"Pending Advisor"},
    pending_hod:    {bg:"#dbeafe",color:"#2563eb",border:"#bfdbfe",label:"Pending HOD"},
    approved:       {bg:"#dcfce7",color:"#16a34a",border:"#86efac",label:"Approved ✓"},
    rejected:       {bg:"#fee2e2",color:"#dc2626",border:"#fca5a5",label:"Rejected ✗"},
  };
  const s = M[status]||M.pending_advisor;
  return <span style={{background:s.bg,color:s.color,border:`1.5px solid ${s.border}`,padding:"4px 12px",borderRadius:9999,fontSize:11,fontWeight:800,letterSpacing:.3,whiteSpace:"nowrap"}}>{s.label}</span>;
}

function Btn({children,variant="primary",style,...p}) {
  const S = {
    primary:{background:"#16a34a",color:"#ffffff",boxShadow:"0 4px 16px rgba(22, 163, 74, 0.35)",border:"none"},
    success:{background:"linear-gradient(135deg, #10b981, #059669)",color:"#ffffff",boxShadow:"0 4px 14px rgba(16, 185, 129, 0.3)",border:"none"},
    danger: {background:"linear-gradient(135deg, #ef4444, #dc2626)",color:"#fff",boxShadow:"0 4px 14px rgba(239, 68, 68, 0.3)",border:"none"},
    ghost:  {background:"#ffffff",border:"1.5px solid #e2e8f0",color:"#334155",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"},
  };
  return (
    <button
      {...p}
      style={{
        ...S[variant],
        padding:"10px 20px",
        borderRadius:9999,
        cursor:"pointer",
        fontSize:12,
        fontWeight:800,
        letterSpacing:.3,
        transition:"all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
        ...style,
      }}
      onMouseEnter={e=>{
        if(!p.disabled) {
          e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
          e.currentTarget.style.filter = "brightness(1.06)";
        }
      }}
      onMouseLeave={e=>{
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.filter = "none";
      }}
    >
      {children}
    </button>
  );
}

function Stat({label,val,color,bg,border}) {
  return (
    <div
      style={{
        background:"#ffffff",
        border:`1.5px solid ${border || "#e2e8f0"}`,
        borderRadius:22,
        padding:"18px 16px",
        textAlign:"center",
        boxShadow:"0 10px 30px rgba(15, 23, 42, 0.04)",
        transition:"all 0.22s ease",
      }}
      onMouseEnter={e=>{
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 14px 34px rgba(15, 23, 42, 0.08)";
      }}
      onMouseLeave={e=>{
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 10px 30px rgba(15, 23, 42, 0.04)";
      }}
    >
      <div style={{fontSize:32,fontWeight:900,color,lineHeight:1}}>{val}</div>
      <div style={{fontSize:11,color:"#64748b",fontWeight:700,textTransform:"uppercase",letterSpacing:.8,marginTop:6}}>{label}</div>
    </div>
  );
}

// ── Settings ──────────────────────────────────────────────────────────────────
function SettingsModal({user,onClose}) {
  const [old,setOld]=useState(""); const [nw,setNw]=useState(""); const [cf,setCf]=useState(""); const [msg,setMsg]=useState(null);
  const save=()=>{
    if(USERS[user.id].pass!==old){setMsg({e:true,t:"Old password incorrect."});return;}
    if(nw.length<6){setMsg({e:true,t:"Min 6 characters."});return;}
    if(nw!==cf){setMsg({e:true,t:"Passwords don't match."});return;}
    USERS[user.id].pass=nw; setMsg({e:false,t:"Password changed!"}); setOld(""); setNw(""); setCf("");
  };
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.4)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:20}}>
      <div style={{background:"#ffffff",borderRadius:24,padding:28,width:"100%",maxWidth:400,boxShadow:"0 25px 60px rgba(15,23,42,0.15)",border:"1px solid #e2e8f0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <h3 style={{color:"#0f172a",fontSize:17,fontWeight:900}}>Account Security</h3>
          <button onClick={onClose} style={{background:"#f1f5f9",border:"none",color:"#64748b",width:30,height:30,borderRadius:10,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        <p style={{color:"#64748b",fontSize:12,marginBottom:16}}>User ID: <strong style={{color:"#0f172a"}}>{user.id}</strong></p>
        
        {["Current Password","New Password","Confirm New"].map((l,idx)=>{
          const val = idx===0?old:idx===1?nw:cf;
          const setV = idx===0?setOld:idx===1?setNw:setCf;
          return (
            <div key={l} style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:11,fontWeight:700,color:"#475569",marginBottom:6}}>{l}</label>
              <input type="password" value={val} onChange={e=>setV(e.target.value)} style={{width:"100%",background:"#f8fafc",border:"1.5px solid #e2e8f0",borderRadius:14,padding:"11px 14px",fontSize:13,color:"#0f172a",outline:"none"}}/>
            </div>
          );
        })}

        {msg&&<div style={{color:msg.e?"#dc2626":"#16a34a",fontSize:12,background:msg.e?"#fef2f2":"#f0fdf4",padding:"9px 12px",borderRadius:10,marginBottom:14,border:`1px solid ${msg.e?"#fecaca":"#bbf7d0"}`}}>{msg.t}</div>}
        <div style={{display:"flex",gap:10,marginTop:6}}>
          <Btn onClick={save} style={{flex:1}}>Save</Btn>
          <Btn variant="ghost" onClick={onClose} style={{flex:1}}>Cancel</Btn>
        </div>
      </div>
    </div>
  );
}

// ── Student Dashboard ─────────────────────────────────────────────────────────
function StudentDashboard({user, activeTab, onTabChange}) {
  const requests = useOD();
  const [view,setView]=useState("list");
  const [selId,setSelId]=useState(null);
  const [renewalTarget,setRenewalTarget]=useState(null);
  const [clearanceReq,setClearanceReq]=useState(null);
  const [previewDocReq,setPreviewDocReq]=useState(null);
  const [tabFilter, setTabFilter] = useState("all");

  const mine = requests.filter(r=>r.studentId===user.id);
  const totalC    = mine.length;
  const pendingC  = mine.filter(isPending).length;
  const approvedC = mine.filter(isApproved).length;
  const rejectedC = mine.filter(isRejected).length;

  const filteredMine = mine.filter(r => {
    if (tabFilter === "pending") return isPending(r);
    if (tabFilter === "approved") return isApproved(r);
    if (tabFilter === "rejected") return isRejected(r);
    return true;
  });

  const handleNewSubmit = (formData) => {
    addRequest({
      id:`OD-${String(nextId++).padStart(3,"0")}`,
      studentId:user.id, studentName:user.name,
      dept:user.dept, year:user.year, section:user.section, rollNo:user.rollNo,
      ...formData,
      // Keep explicit null (e.g. 714024104198 has no photo) — don't fallback to a 404 file
      photo: user.photo !== undefined ? user.photo : `/students/${(user.regNo || user.id || "").replace(/\*/g, "")}.jpg`,
      advisorStatus: null, advisorAt: null,
      hodStatus: null, hodAt: null,
      createdAt:todayStr(),
    });
    setRenewalTarget(null);
    setTimeout(()=>setView("list"),1800);
  };

  const handleStartRenewal = (req) => {
    setRenewalTarget(req);
    setView("new");
  };

  // Detail View
  if(view==="detail") {
    const req = requests.find(r=>r.id===selId);
    if(!req){setView("list");return null;}
    const st = getStatus(req);
    const validity = checkValidity(req);
    return (
      <div style={{maxWidth:860,margin:"0 auto"}}>
        {clearanceReq && <ClearancePass req={clearanceReq} onClose={()=>setClearanceReq(null)} />}
        {previewDocReq && (
          <LetterPreviewModal
            user={user}
            letter={previewDocReq.letter}
            reason={previewDocReq.reason}
            fromDate={previewDocReq.fromDate}
            toDate={previewDocReq.toDate}
            coApplicants={previewDocReq.coApplicants || []}
            reqType={previewDocReq.requestType || "od"}
            onClose={()=>setPreviewDocReq(null)}
          />
        )}

        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20,flexWrap:"wrap"}}>
          <button onClick={()=>setView("list")} style={{background:"#ffffff",border:"1.5px solid #e2e8f0",width:38,height:38,borderRadius:12,color:"#0f172a",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>←</button>
          <h2 style={{margin:0,color:"#0f172a",fontSize:22,fontWeight:900}}>{req.id}</h2>
          <Badge status={st}/>
          <ValidityBadge req={req}/>
          {req.renewedFrom&&(
            <span style={{fontSize:11,background:"#ede9fe",color:"#7c3aed",border:"1.5px solid #ddd6fe",borderRadius:9999,padding:"4px 10px",fontWeight:700}}>
              🔗 Linked clone of #{req.renewedFrom}
            </span>
          )}
          <div style={{marginLeft:"auto",display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
            <button
              onClick={()=>setPreviewDocReq(req)}
              style={{
                background:"#ffffff",border:"1.5px solid #86efac",borderRadius:9999,
                padding:"8px 16px",fontSize:12,fontWeight:800,color:"#16a34a",
                cursor:"pointer",display:"flex",alignItems:"center",gap:6,
                boxShadow:"0 2px 8px rgba(22,163,74,0.12)",
              }}
            >
              📄 Official Document (PDF / Image)
            </button>
            {isApproved(req) && (
              <Btn
                variant="success"
                onClick={()=>setClearanceReq(req)}
                style={{fontSize:12,padding:"9px 18px",display:"flex",alignItems:"center",gap:8}}
              >
                <ShieldCheck size={16}/> Clearance Pass
              </Btn>
            )}
            <RenewButton onClick={()=>handleStartRenewal(req)} label="🔄 1-Click Renew"/>
          </div>
        </div>

        {/* Dynamic Validity Banner */}
        {validity.isExpired ? (
          <div style={{borderRadius:20,padding:"16px 20px",background:"#fef2f2",border:"1.5px solid #fecaca",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
            <div>
              <div style={{color:"#dc2626",fontWeight:800,fontSize:14,marginBottom:4}}>⚠️ Time Over / Expired</div>
              <p style={{margin:0,color:"#991b1b",fontSize:12}}>{validity.detail} — This application's validity timeframe has expired.</p>
            </div>
            <RenewButton onClick={()=>handleStartRenewal(req)} label="🔄 1-Click Renew / Reuse"/>
          </div>
        ) : isApproved(req) ? (
          <div style={{borderRadius:20,padding:"16px 20px",background:"#f0fdf4",border:"1.5px solid #bbf7d0",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
            <div>
              <div style={{color:"#16a34a",fontWeight:800,fontSize:14,marginBottom:4}}>✓ Active & Digitally Approved</div>
              <p style={{margin:0,color:"#166534",fontSize:12}}>{validity.detail} — Approved by HOD. Valid for campus duty and attendance.</p>
            </div>
            <Btn variant="ghost" onClick={()=>setClearanceReq(req)}>View Digital Pass</Btn>
          </div>
        ) : null}

        <div style={{background:"#ffffff",borderRadius:24,padding:26,boxShadow:"0 10px 30px rgba(15,23,42,0.05)",border:"1.5px solid #e2e8f0"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <span style={{color:"#64748b",fontSize:13,fontWeight:700}}>{fmt(req.fromDate)} → {fmt(req.toDate)} · {daysCount(req.fromDate,req.toDate)} day(s)</span>
            <div style={{display:"flex",gap:8}}>
              <Btn variant="ghost" onClick={()=>setPreviewDocReq(req)} style={{fontSize:11,padding:"6px 14px"}}>👁️ View Official Paper</Btn>
              <Btn variant="ghost" onClick={()=>printPDF(req)} style={{fontSize:11,padding:"6px 14px"}}>⬇ Print PDF</Btn>
            </div>
          </div>
          <pre style={{whiteSpace:"pre-wrap",color:"#0f172a",fontSize:13,lineHeight:1.85,fontFamily:"'Inter', sans-serif",background:"#f8fafc",border:"1px solid #e2e8f0",padding:20,borderRadius:16,margin:0}}>{req.letter}</pre>
        </div>
      </div>
    );
  }

  // New Application View
  if(view==="new") return (
    <NewApplication
      user={user}
      initialData={renewalTarget}
      onBack={()=>{setRenewalTarget(null);setView("list");}}
      onSubmit={handleNewSubmit}
      genLetter={genLetter}
    />
  );

  // List View (Clean Light-Mint OD Dashboard)
  return (
    <div style={{maxWidth:1080,margin:"0 auto",display:"flex",flexDirection:"column",gap:20}}>

      {/* ── Top Header Title Row ─────────────────────────────────── */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16}}>
        <div>
          <h1 style={{margin:"0 0 4px",fontSize:26,fontWeight:900,color:"#0f172a",letterSpacing:"-0.4px"}}>
            My OD Requests
          </h1>
          <p style={{margin:0,fontSize:13,color:"#64748b",fontWeight:600}}>
            {clsLabel(user)} · {DEPTS[user.dept] || user.dept} · Student ID: {user.id}
          </p>
        </div>

        <button
          onClick={()=>{setRenewalTarget(null);setView("new");}}
          style={{
            background:"#16a34a",
            color:"#ffffff",
            border:"none",
            borderRadius:9999,
            padding:"11px 24px",
            fontSize:13,
            fontWeight:800,
            cursor:"pointer",
            boxShadow:"0 4px 16px rgba(22, 163, 74, 0.35)",
            display:"flex",
            alignItems:"center",
            gap:8,
            transition:"all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
          onMouseEnter={e=>{
            e.currentTarget.style.transform="translateY(-2px) scale(1.02)";
            e.currentTarget.style.boxShadow="0 8px 24px rgba(22, 163, 74, 0.45)";
          }}
          onMouseLeave={e=>{
            e.currentTarget.style.transform="translateY(0) scale(1)";
            e.currentTarget.style.boxShadow="0 4px 16px rgba(22, 163, 74, 0.35)";
          }}
        >
          <Plus size={16} strokeWidth={2.8}/> + OD Letter
        </button>
      </div>

      {/* ── 4 Quick Stats (Light Curvy Cards) ────────────────────── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
        <Stat label="Total" val={totalC} color="#0f172a" bg="#ffffff" border="#e2e8f0"/>
        <Stat label="Pending" val={pendingC} color="#d97706" bg="#ffffff" border="#fde68a"/>
        <Stat label="Approved" val={approvedC} color="#16a34a" bg="#ffffff" border="#bbf7d0"/>
        <Stat label="Rejected" val={rejectedC} color="#dc2626" bg="#ffffff" border="#fecaca"/>
      </div>

      {/* ── Applications Card ────────────────────────────────────── */}
      <div style={{
        background:"#ffffff",
        borderRadius:24,
        padding:"24px 26px",
        boxShadow:"0 10px 30px rgba(15,23,42,0.04)",
        border:"1.5px solid #e2e8f0",
      }}>
        {/* Filter Pills */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18,flexWrap:"wrap",gap:12}}>
          <div style={{display:"flex",background:"#f1f5f9",borderRadius:9999,padding:4,gap:4}}>
            {[
              {id:"all", label:`All (${totalC})`},
              {id:"pending", label:`Pending (${pendingC})`},
              {id:"approved", label:`Approved (${approvedC})`},
              {id:"rejected", label:`Rejected (${rejectedC})`},
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setTabFilter(tab.id)}
                style={{
                  padding:"6px 16px",
                  borderRadius:9999,
                  border:"none",
                  background: tabFilter === tab.id ? "#ffffff" : "transparent",
                  color: tabFilter === tab.id ? "#16a34a" : "#64748b",
                  fontSize:12,
                  fontWeight: tabFilter === tab.id ? 800 : 600,
                  cursor:"pointer",
                  boxShadow: tabFilter === tab.id ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                  transition:"all 0.18s ease",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span style={{fontSize:12,fontWeight:700,color:"#64748b"}}>
            Quota Balance: <strong style={{color:"#16a34a"}}>{Math.max(0, 20 - approvedC)}</strong> / 20 days
          </span>
        </div>

        {filteredMine.length === 0 ? (
          <div style={{textAlign:"center",padding:"48px 20px",color:"#94a3b8"}}>
            <FileText size={36} style={{margin:"0 auto 10px",color:"#cbd5e1"}}/>
            <p style={{margin:"0 0 12px",fontSize:14,fontWeight:700,color:"#475569"}}>No applications in this view.</p>
            <Btn onClick={()=>{setRenewalTarget(null);setView("new");}} style={{fontSize:11,padding:"7px 18px"}}>
              + Apply Now
            </Btn>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {filteredMine.slice().reverse().map(req => {
              const st = getStatus(req);
              const validity = checkValidity(req);
              return (
                <div
                  key={req.id}
                  onClick={()=>{setSelId(req.id);setView("detail");}}
                  style={{
                    background:"#f8fafc",
                    border:"1.5px solid #e2e8f0",
                    borderRadius:18,
                    padding:"16px 20px",
                    cursor:"pointer",
                    transition:"all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"space-between",
                    gap:16,
                  }}
                  onMouseEnter={e=>{
                    e.currentTarget.style.background="#ffffff";
                    e.currentTarget.style.borderColor="#86efac";
                    e.currentTarget.style.transform="translateY(-2px)";
                    e.currentTarget.style.boxShadow="0 10px 24px rgba(22, 163, 74, 0.08)";
                  }}
                  onMouseLeave={e=>{
                    e.currentTarget.style.background="#f8fafc";
                    e.currentTarget.style.borderColor="#e2e8f0";
                    e.currentTarget.style.transform="translateY(0)";
                    e.currentTarget.style.boxShadow="none";
                  }}
                >
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                      <span style={{fontSize:12,fontWeight:900,color:"#16a34a",fontFamily:"monospace"}}>{req.id}</span>
                      <Badge status={st}/>
                      <ValidityBadge req={req} compact/>
                      {req.renewedFrom && (
                        <span style={{fontSize:10,background:"#ede9fe",color:"#7c3aed",border:"1px solid #ddd6fe",borderRadius:9999,padding:"2px 8px",fontWeight:700}}>
                          Cloned from #{req.renewedFrom}
                        </span>
                      )}
                    </div>
                    <div style={{fontSize:14,fontWeight:800,color:"#0f172a",marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                      {req.reason}
                    </div>
                    <div style={{fontSize:12,color:"#64748b",fontWeight:600}}>
                      {fmt(req.fromDate)} — {fmt(req.toDate)} · {daysCount(req.fromDate,req.toDate)} day(s)
                      {req.coApplicants?.length > 0 && ` · +${req.coApplicants.length} co-applicant(s)`}
                    </div>
                  </div>

                  <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
                    {isApproved(req) && (
                      <span style={{fontSize:11,fontWeight:800,color:"#16a34a",background:"#dcfce7",border:"1px solid #86efac",borderRadius:9999,padding:"4px 10px"}}>
                        🪪 Pass Ready
                      </span>
                    )}
                    <span style={{color:"#94a3b8",fontSize:18}}>›</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Faculty Dashboard ────────────────────────────────────────────────────────
function FacultyDashboard({user}) {
  const requests = useOD();
  return (
    <FacultyApproval
      user={user}
      requests={requests}
      onPatch={(id, patch) => patchRequest(id, patch)}
    />
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  const requests = useOD();
  const [user,setUser]=useState(() => {
    try { const s = localStorage.getItem("od_session"); return s ? JSON.parse(s) : null; } catch(_) { return null; }
  });
  const [settings,setSettings]=useState(false);
  const [profileOpen,setProfileOpen]=useState(false);
  const [activeTab,setActiveTab]=useState("dashboard");

  const handleLogout = () => {
    try { localStorage.removeItem("od_session"); } catch(_) {}
    setUser(null);
  };

  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#f8fafc;color:#0f172a;font-family:'Inter',sans-serif}
    ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:#f1f5f9}::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:9999px}
    input::placeholder,textarea::placeholder{color:#94a3b8}
    button:disabled{opacity:.4;cursor:not-allowed!important}
  `;

  if (!user) {
    return (
      <div style={{minHeight:"100vh",background:"#f0fdf4",fontFamily:"'Inter',sans-serif",color:"#0f172a"}}>
        <style>{globalStyles}</style>
        <ClickSpark sparkColor="#16a34a" sparkSize={12} sparkRadius={22} sparkCount={10} duration={500} extraScale={1.2}>
          <SignIn onLogin={(session) => { setUser(session); }} />
        </ClickSpark>
      </div>
    );
  }

  return (
    <div style={{minHeight:"100vh",fontFamily:"'Inter',sans-serif",color:"#0f172a"}}>
      <style>{globalStyles}</style>
      <ClickSpark sparkColor="#10b981" sparkSize={10} sparkRadius={18} sparkCount={8} duration={450} extraScale={1.1}>

        {profileOpen && (
          <ProfileModal
            user={user}
            requests={requests}
            onClose={()=>setProfileOpen(false)}
          />
        )}
        {settings && <SettingsModal user={user} onClose={()=>setSettings(false)}/>}

        <NavigationShell
          user={user}
          requests={requests}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
          onOpenProfile={()=>setProfileOpen(true)}
          onOpenSettings={()=>setSettings(true)}
        >
          {user.role==="student" && <StudentDashboard user={user} activeTab={activeTab} onTabChange={setActiveTab}/>}
          {(user.role==="advisor"||user.role==="hod") && <FacultyDashboard user={user}/>}
        </NavigationShell>

      </ClickSpark>
    </div>
  );
}