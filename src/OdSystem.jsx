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
import { supabase } from "./supabaseClient";
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

const addRequest = async (req) => { 
  const { data, error } = await supabase.from('applications').insert([req]).select(); 
  if (error) {
    console.error("Insert Error:", error);
    return { success: false, error };
  }
  return { success: true, data };
};

const patchRequest = async (id, patch) => { 
  const { data, error } = await supabase.from('applications').update(patch).eq('id', id).select(); 
  if (error) {
    console.error("Supabase patchRequest error:", error);
    return { success: false, error };
  }
  return { success: true, data };
};

const addHistoryRecord = async (record) => {
  const { data, error } = await supabase.from('application_routing_history').insert([record]).select();
  if (error) {
    console.error("History Insert Error:", error);
    return { success: false, error };
  }
  return { success: true, data };
};

function ToastNotification({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;
  const isError = toast.type === "error";

  return (
    <div style={{
      position: "fixed",
      top: 24,
      right: 24,
      zIndex: 999999,
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "14px 20px",
      borderRadius: 16,
      background: isError ? "#fef2f2" : "#f0fdf4",
      border: `1.5px solid ${isError ? "#fca5a5" : "#86efac"}`,
      boxShadow: "0 14px 34px rgba(0,0,0,0.12)",
      color: isError ? "#991b1b" : "#166534",
      fontSize: 13,
      fontWeight: 700,
      animation: "toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      maxWidth: 440,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        background: isError ? "#dc2626" : "#16a34a",
        color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, fontWeight: 900, flexShrink: 0
      }}>
        {isError ? "✕" : "✓"}
      </div>
      <div style={{ flex: 1 }}>
        {toast.title && (
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", opacity: 0.8, marginBottom: 2 }}>
            {toast.title}
          </div>
        )}
        <div style={{ lineHeight: 1.45 }}>{toast.message}</div>
      </div>
      <button onClick={onClose} style={{
        background: "none", border: "none", color: "inherit", cursor: "pointer",
        padding: 4, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.7
      }}>
        ✕
      </button>
    </div>
  );
}

function useOD() {
  const [data, setData] = useState([]);

  const fetchApps = useCallback(async () => {
    const { data: apps, error } = await supabase.from('applications').select('*').order('submittedAt', { ascending: false });
    if (!error && apps) {
      const arr = Object.assign([...apps], { refresh: fetchApps });
      setData(arr);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchInitial = async () => {
      const { data: apps } = await supabase.from('applications').select('*').order('submittedAt', { ascending: false });
      if (mounted && apps) {
        const arr = Object.assign([...apps], { refresh: fetchApps });
        setData(arr);
      }
    };
    fetchInitial();

    const channelName = `apps-${Math.random().toString(36).substring(7)}`;
    const channel = supabase.channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, () => {
        fetchApps();
      })
      .subscribe();
    return () => { mounted = false; supabase.removeChannel(channel); };
  }, [fetchApps]);

  return data;
}

const getStatus = r => {
  if (r.status === 'completed') return "approved";
  if (r.status === 'cancelled') return "rejected";
  if (r.status === 'draft') return "draft";
  return "pending";
};
const isPending  = r => { const s = getStatus(r); return s==="pending"; };
const isApproved = r => getStatus(r)==="approved";
const isRejected = r => getStatus(r)==="rejected";
const isDraft = r => getStatus(r)==="draft";

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
const rawGroq = (import.meta.env.VITE_GROQ_API_KEY || "").replace(/["']/g, "").trim();
const rawGemini = (import.meta.env.VITE_GEMINI_API_KEY || "").replace(/["']/g, "").trim();
const GROQ_API_KEY = (rawGroq.startsWith("gsk_") ? rawGroq : (rawGemini.startsWith("gsk_") ? rawGemini : (rawGroq || rawGemini)));


async function genLetter({studentName,rollNo,dept,year,section,fromDate,toDate,reason,reqType}) {
  const n = daysCount(fromDate,toDate);
  const advisorId = `ADV${dept}${year}${section}`;
  const hodId     = `HOD${dept}`;
  const { data: adv } = await supabase.from('users').select('name').eq('id', advisorId).single();
  const { data: hod } = await supabase.from('users').select('name').eq('id', hodId).single();
  const advisorName = adv?.name || "Class Advisor";
  const hodName     = hod?.name || HOD_NAMES[dept] || "Head of Department";
  const sName       = studentName || rollNo || "Student";

  const typeMap = {
    od: "On-Duty (OD)",
    gatepass: "Campus Gate Pass",
    leave: "Leave Application",
    apology: "Apology"
  };
  const letterType = typeMap[reqType] || "On-Duty (OD)";

  const systemPrompt = `You are an expert institutional AI assistant for college applications.
Your job is to generate a clean, formal, complete ${letterType} letter from the student to their college faculty.
CRITICAL FORMAT RULES:
1. Do NOT use markdown bold asterisks (NO ** or * stars anywhere in the text).
2. Do NOT include a college letterhead or date at the top (the paper template already prints the official college header and date). Start directly with the "To" address.
3. Write complete plain text with zero placeholders or bracketed blanks. Use the exact names and details provided.`;

  const userPrompt = `Write a formal college ${letterType} letter starting directly with "To".

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

Subject: ${reqType === 'apology' ? `Apology Letter regarding ${reason}` : `Requisition for ${letterType} for ${n} Day(s) — ${sName} (${rollNo})`}

Respected Sir/Madam,

[Formal body paragraph explaining ${reqType === 'apology' ? `sincere apology for ${reason} which occurred around ${fmt(fromDate)}. Assurance not to repeat the mistake.` : `participation/absence for ${reason} from ${fmt(fromDate)} to ${fmt(toDate)}. Assurance to catch up on missed academic work.`}]

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
    <div class="stamp-seal">${req.status === "completed" ? "✓ Final Verification" : "⏳ Pending Verification"}</div>
    <div class="sign-line">Authorized Signatory</div>
  </div>
  <div class="stamp-box">
    <div class="stamp-seal" style="border-color:#2563eb;color:#1d4ed8;background:#eff6ff">${req.status === "completed" ? "🏛️ Department Sanctioned" : "🏛️ Department Seal"}</div>
    <div class="sign-line">Office of the HOD</div>
  </div>
</div>
</body></html>`);
  win.document.close();
  setTimeout(()=>win.print(),400);
}

// ── UI Atoms (Curvy & Light Themed) ──────────────────────────────────────────
function Badge({status}) {
  const M = {
    draft:          {bg:"#f1f5f9",color:"#64748b",border:"#e2e8f0",label:"Draft"},
    pending:        {bg:"#fef3c7",color:"#d97706",border:"#fde68a",label:"In Progress"},
    approved:       {bg:"#dcfce7",color:"#16a34a",border:"#86efac",label:"Completed ✓"},
    rejected:       {bg:"#fee2e2",color:"#dc2626",border:"#fca5a5",label:"Cancelled ✗"},
  };
  const s = M[status]||M.pending;
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
  const save=async ()=>{
    const { data: dbUser } = await supabase.from('users').select('password').eq('id', user.id).single();
    if(!dbUser || dbUser.password!==old){setMsg({e:true,t:"Old password incorrect."});return;}
    if(nw.length<6){setMsg({e:true,t:"Min 6 characters."});return;}
    if(nw!==cf){setMsg({e:true,t:"Passwords don't match."});return;}
    const { error } = await supabase.from('users').update({password: nw}).eq('id', user.id);
    if(error){setMsg({e:true,t:"Update failed."});return;}
    setMsg({e:false,t:"Password changed!"}); setOld(""); setNw(""); setCf("");
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
function StudentDashboard({user, activeTab, onTabChange, showToast}) {
  const requests = useOD();
  const [view,setView]=useState("list");
  const [selId,setSelId]=useState(null);
  const [renewalTarget,setRenewalTarget]=useState(null);
  const [clearanceReq,setClearanceReq]=useState(null);
  const [previewDocReq,setPreviewDocReq]=useState(null);
  const [tabFilter, setTabFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dateDesc");

  useEffect(() => {
    setView("list");
  }, [activeTab]);

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
  }).sort((a, b) => {
    if (sortBy === "dateDesc") return new Date(b.submittedAt) - new Date(a.submittedAt);
    if (sortBy === "dateAsc") return new Date(a.submittedAt) - new Date(b.submittedAt);
    if (sortBy === "durDesc") return daysCount(b.fromDate, b.toDate) - daysCount(a.fromDate, a.toDate);
    if (sortBy === "durAsc") return daysCount(a.fromDate, a.toDate) - daysCount(b.fromDate, b.toDate);
    return 0;
  });

  const handleForwardToAdvisor = async (req) => {
    const advisorId = `ADV${req.dept}${req.year}${req.section || 'A'}`;
    const res = await patchRequest(req.id, {
      status: 'in_progress',
      current_assignee_id: advisorId
    });
    if (res.success) {
      await addHistoryRecord({
        applicationId: req.id,
        actionByUserId: user.id,
        forwardedToUserId: advisorId,
        actionTaken: 'forwarded'
      });
    }
    if (requests.refresh) requests.refresh();
    if (res && res.success === false) {
      if (showToast) showToast(`Failed to forward application: ${res.error?.message || 'Database error'}`, 'error');
    } else {
      if (showToast) showToast(`Application #${req.id} successfully forwarded to Class Advisor (${advisorId})!`, 'success');
    }
  };

  const handleNewSubmit = async (formData) => {
    const newId = `OD-${Math.floor(Math.random() * 10000).toString().padStart(4,"0")}`;
    const autoForward = Boolean(formData.autoForward);
    const advisorId = `ADV${user.dept}${user.year}${user.section || 'A'}`;

    const newAppPayload = {
      id: newId,
      studentId: user.id,
      studentName: user.name,
      dept: user.dept,
      year: user.year,
      section: user.section,
      rollNo: user.rollNo,
      requestType: formData.requestType,
      fromDate: formData.fromDate,
      fromTime: formData.fromTime || null,
      toDate: formData.toDate,
      toTime: formData.toTime || null,
      reason: formData.reason,
      coApplicants: formData.coApplicants || [],
      attachmentName: formData.attachmentName || null,
      letter: formData.letter,
      photo: user.photo !== undefined ? user.photo : `/students/${(user.regNo || user.id || "").replace(/\*/g, "")}.jpg`,
      status: autoForward ? 'in_progress' : 'draft',
      current_assignee_id: autoForward ? advisorId : null,
      submittedAt: todayStr(),
    };

    const res = await addRequest(newAppPayload);
    if (res && res.success) {
      await addHistoryRecord({
        applicationId: newId,
        actionByUserId: user.id,
        forwardedToUserId: autoForward ? advisorId : null,
        actionTaken: autoForward ? 'created_and_forwarded' : 'created'
      });
    }

    if (requests.refresh) requests.refresh();
    setRenewalTarget(null);

    if (res && res.success === false) {
      if (showToast) showToast(`Failed to save application: ${res.error?.message || 'Database error'}`, 'error');
    } else {
      if (showToast) {
        if (autoForward) {
          showToast(`Application #${newId} created and forwarded to Class Advisor (${advisorId})!`, 'success');
        } else {
          showToast(`Draft #${newId} saved to your dashboard! You can review and forward it anytime.`, 'success');
        }
      }
    }
    setTimeout(() => setView("list"), 1200);
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

        {isDraft(req) && (
          <div style={{borderRadius:20,padding:"18px 22px",background:"#eff6ff",border:"1.5px solid #bfdbfe",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:14}}>
            <div>
              <div style={{color:"#1e40af",fontWeight:800,fontSize:14,marginBottom:4}}>📝 Draft Mode (Action Required)</div>
              <p style={{margin:0,color:"#2563eb",fontSize:13}}>This application is currently saved as a draft. Forward it to your Class Advisor to begin the approval process.</p>
            </div>
            <Btn onClick={() => handleForwardToAdvisor(req)} style={{background: '#2563eb', boxShadow: '0 4px 16px rgba(37,99,235,0.3)', fontSize:13, padding:"10px 22px"}}>
              🚀 Forward to Advisor
            </Btn>
          </div>
        )}

        {isPending(req) && (
          <div style={{borderRadius:20,padding:"18px 22px",background:"#fffbeb",border:"1.5px solid #fde68a",marginBottom:16}}>
            <div style={{color:"#b45309",fontWeight:800,fontSize:14,marginBottom:4}}>
              ⏳ Application In Progress
            </div>
            <p style={{margin:0,color:"#92400e",fontSize:13}}>
              This application is currently in the review process. 
              {req.current_assignee_id ? ` It is waiting on ${req.current_assignee_id}.` : ''}
            </p>
          </div>
        )}

        {isRejected(req) && (
          <div style={{borderRadius:20,padding:"18px 22px",background:"#fef2f2",border:"1.5px solid #fecaca",marginBottom:16}}>
            <div style={{color:"#dc2626",fontWeight:800,fontSize:14,marginBottom:4}}>❌ Application Cancelled / Rejected</div>
            {req.cancelReason ? (
              <p style={{margin:0,color:"#991b1b",fontSize:13}}><strong>Reason provided:</strong> {req.cancelReason}</p>
            ) : (
              <p style={{margin:0,color:"#991b1b",fontSize:13}}>This application was not approved by faculty.</p>
            )}
          </div>
        )}

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

  // ── Render Card Item ──────────────────────────────────────────────
  const renderCard = (req, compact = false) => {
    const st = getStatus(req);
    const validity = checkValidity(req);
    return (
      <div
        key={req.id}
        onClick={()=>{setSelId(req.id);setView("detail");}}
        style={{
          background:"#f8fafc", border:"1.5px solid #e2e8f0", borderRadius:18,
          padding: compact ? "12px 16px" : "16px 20px", cursor:"pointer",
          transition:"all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
          display:"flex", alignItems:"center", justifyContent:"space-between", gap:16,
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
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
            <span style={{fontSize:12,fontWeight:900,color:"#16a34a",fontFamily:"monospace"}}>{req.id}</span>
            <Badge status={st}/>
            {!compact && <ValidityBadge req={req} compact/>}
          </div>
          <div style={{fontSize:14,fontWeight:800,color:"#0f172a",marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
            {req.reason}
          </div>
          <div style={{fontSize:12,color:"#64748b",fontWeight:600}}>
            {fmt(req.fromDate)} {compact ? "" : `— ${fmt(req.toDate)} · ${daysCount(req.fromDate,req.toDate)} day(s)`}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          {isDraft(req) ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleForwardToAdvisor(req);
              }}
              style={{
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                color: "#ffffff",
                border: "none",
                borderRadius: 9999,
                padding: "7px 16px",
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.18s ease"
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              🚀 Forward to Advisor
            </button>
          ) : !compact && isApproved(req) ? (
            <span style={{fontSize:11,fontWeight:800,color:"#16a34a",background:"#dcfce7",border:"1px solid #86efac",borderRadius:9999,padding:"4px 10px"}}>
              🪪 Pass Ready
            </span>
          ) : null}
          <span style={{color:"#94a3b8",fontSize:18}}>›</span>
        </div>
      </div>
    );
  };

  // ── HOME VIEW (ActiveTab === "dashboard") ─────────────────────────
  if (activeTab === "dashboard" && view === "list") {
    return (
      <div style={{maxWidth:1080,margin:"0 auto",display:"flex",flexDirection:"column",gap:24}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16}}>
          <div>
            <h1 style={{margin:"0 0 4px",fontSize:26,fontWeight:900,color:"#0f172a",letterSpacing:"-0.4px"}}>
              Welcome, {(user.name || "Student").split(" ")[0]}!
            </h1>
            <p style={{margin:0,fontSize:13,color:"#64748b",fontWeight:600}}>
              {clsLabel(user)} · {DEPTS[user.dept] || user.dept}
            </p>
          </div>
          <button
            onClick={()=>{setRenewalTarget(null);setView("new");}}
            style={{
              background:"#16a34a", color:"#ffffff", border:"none", borderRadius:9999,
              padding:"11px 24px", fontSize:13, fontWeight:800, cursor:"pointer",
              boxShadow:"0 4px 16px rgba(22, 163, 74, 0.35)", display:"flex", alignItems:"center", gap:8,
              transition:"all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)"
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
            <Plus size={16} strokeWidth={2.8}/> Create Application
          </button>
        </div>

        {/* Recent Applications Simplified List */}
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <h3 style={{margin:0,fontSize:18,fontWeight:800,color:"#0f172a"}}>Recent Applications</h3>
            <button onClick={()=>onTabChange("applications")} style={{background:"none",border:"none",color:"#2563eb",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
              View All <ArrowRight size={14}/>
            </button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {mine.length === 0 ? (
              <div style={{padding:"30px",textAlign:"center",background:"#ffffff",border:"1.5px dashed #cbd5e1",borderRadius:18,color:"#94a3b8",fontSize:13,fontWeight:600}}>
                You haven't submitted any applications yet.
              </div>
            ) : (
              mine.slice(0, 4).map(req => renderCard(req, true))
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── APPLICATIONS VIEW (ActiveTab === "applications") ──────────────
  return (
    <div style={{maxWidth:1080,margin:"0 auto",display:"flex",flexDirection:"column",gap:20}}>

      {/* ── Top Header Title Row ─────────────────────────────────── */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16}}>
        <div>
          <h1 style={{margin:"0 0 4px",fontSize:26,fontWeight:900,color:"#0f172a",letterSpacing:"-0.4px"}}>
            All Applications
          </h1>
          <p style={{margin:0,fontSize:13,color:"#64748b",fontWeight:600}}>
            Track, sort, and manage your college requests.
          </p>
        </div>
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
        {/* Filter Pills & Sorting */}
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

          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <select 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value)}
              style={{
                background:"#f8fafc", border:"1.5px solid #e2e8f0", borderRadius:9999,
                padding:"6px 12px", fontSize:12, fontWeight:700, color:"#475569", outline:"none", cursor:"pointer"
              }}
            >
              <option value="dateDesc">Date: Newest First</option>
              <option value="dateAsc">Date: Oldest First</option>
              <option value="durDesc">Duration: Longest</option>
              <option value="durAsc">Duration: Shortest</option>
            </select>
            <span style={{fontSize:12,fontWeight:700,color:"#64748b"}}>
              Quota Balance: <strong style={{color:"#16a34a"}}>{Math.max(0, 20 - approvedC)}</strong> / 20
            </span>
          </div>
        </div>

        {filteredMine.length === 0 ? (
          <div style={{textAlign:"center",padding:"48px 20px",color:"#94a3b8"}}>
            <FileText size={36} style={{margin:"0 auto 10px",color:"#cbd5e1"}}/>
            <p style={{margin:"0 0 12px",fontSize:14,fontWeight:700,color:"#475569"}}>No applications match this filter.</p>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {filteredMine.map(req => renderCard(req))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Faculty Dashboard ────────────────────────────────────────────────────────
function FacultyDashboard({user, showToast}) {
  const requests = useOD();
  return (
    <FacultyApproval
      user={user}
      requests={requests}
      onPatch={async (id, patch) => {
        const res = await patchRequest(id, patch);
        if (requests.refresh) requests.refresh();
        return res;
      }}
      onShowToast={showToast}
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
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success", title = "") => {
    setToast({ message, type, title });
  };

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
    @keyframes toastSlideIn{from{opacity:0;transform:translateY(-20px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}
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
          {user.role==="student" && <StudentDashboard user={user} activeTab={activeTab} onTabChange={setActiveTab} showToast={showToast}/>}
          {(user.role==="advisor"||user.role==="hod") && <FacultyDashboard user={user} showToast={showToast}/>}
        </NavigationShell>

        <ToastNotification toast={toast} onClose={() => setToast(null)} />
      </ClickSpark>
    </div>
  );
}