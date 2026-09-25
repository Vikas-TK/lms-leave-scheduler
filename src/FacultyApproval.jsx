import { useState, useMemo, useEffect } from "react";
import {
  CheckCircle2, XCircle, Clock, Users, Search,
  ChevronRight, X, AlertTriangle, FileText,
  Building2, GraduationCap, Shield,
  ArrowUpRight, RotateCcw, Inbox, TrendingUp,
  BookOpen, DoorOpen, Plane, SlidersHorizontal, ChevronDown, Sparkles,
  ShieldCheck,
} from "lucide-react";
import { ValidityBadge } from "./validityEngine";
import { supabase } from "./supabaseClient";

function StudentImg({ photo, name, size = 42, radius = "50%", style }) {
  const [fail, setFail] = useState(false);
  const letter = String(name || "S").replace(/\*/g, "")[0] || "S";
  if (!photo || fail) {
    return (
      <div style={{
        width:size, height:size, borderRadius:radius, flexShrink:0,
        background:"linear-gradient(135deg, #16a34a, #059669)",
        color:"#fff", fontSize:Math.round(size*0.42), fontWeight:900,
        display:"flex", alignItems:"center", justifyContent:"center",
        border:"2px solid #bbf7d0", ...style,
      }}>
        {letter}
      </div>
    );
  }
  return (
    <img
      src={photo}
      alt={name}
      onError={()=>setFail(true)}
      style={{
        width:size, height:size, borderRadius:radius, flexShrink:0,
        objectFit:"cover", border:"2px solid #bbf7d0", ...style,
      }}
    />
  );
}

const C = {
  bg: "#f8fafc",
  panel: "#ffffff",
  card: "#ffffff",
  border: "#e2e8f0",
  text: "#0f172a",
  slate: "#475569",
  dim: "#94a3b8",
  green: "#16a34a",
  greenLight: "#dcfce7",
  red: "#dc2626",
  amber: "#d97706",
  blue: "#2563eb",
  purple: "#7c3aed",
  cyan: "#0d9488",
  indigo: "#6366f1",
};

const DEPTS = {
  CS:"Computer Science", IT:"Information Technology",
  AIDS:"AI & Data Science", AIML:"AI & Machine Learning",
  CY:"Cyber Security", MECH:"Mechanical Engineering",
  CIVIL:"Civil Engineering", BME:"Biomedical Engineering",
  EEE:"Electrical & Electronics", ECE:"Electronics & Communication",
};

const REQ_META = {
  od:       { label:"OD Request",   icon:BookOpen, color:"#16a34a", bg:"#dcfce7", border:"#86efac" },
  gatepass: { label:"Gate Pass",    icon:DoorOpen, color:"#d97706", bg:"#fef3c7", border:"#fde68a" },
  leave:    { label:"Leave Letter", icon:Plane,    color:"#2563eb", bg:"#dbeafe", border:"#bfdbfe" },
};

const fmt = d => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—";
const fmtS = d => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short"}) : "—";
const days = (a,b) => Math.max(1, Math.round((new Date(b)-new Date(a))/86400000)+1);
const todayStr = () => new Date().toISOString().split("T")[0];
const cls = r => `${r.dept}${r.year}${r.section}`;
const getStatus = r => {
  if (r.status === "completed") return "approved";
  if (r.status === "cancelled") return "rejected";
  if (r.status === "draft") return "draft";
  return "pending";
};

function SBadge({status, sm}) {
  const cfg = {
    pending:         { label:"In Progress",     color:"#d97706", bg:"#fef3c7", border:"#fde68a", Ic:Clock },
    approved:        { label:"Completed",       color:"#16a34a", bg:"#dcfce7", border:"#86efac", Ic:CheckCircle2 },
    rejected:        { label:"Cancelled",       color:"#dc2626", bg:"#fee2e2", border:"#fca5a5", Ic:XCircle },
  };
  const s = cfg[status] || cfg.pending;
  const Ic = s.Ic;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      padding: sm ? "3px 9px" : "4px 12px",
      borderRadius:9999, background:s.bg, border:`1.5px solid ${s.border}`,
      color:s.color, fontSize: sm ? 10 : 11, fontWeight:800, whiteSpace:"nowrap",
    }}>
      <Ic size={sm ? 10 : 12} strokeWidth={2.5} />
      {s.label}
    </span>
  );
}

function Metric({label, value, color, icon:Ic, sub}) {
  return (
    <div
      style={{
        background:"#ffffff",
        border:"1.5px solid #e2e8f0",
        borderRadius:22,
        padding:"18px 20px",
        position:"relative",
        overflow:"hidden",
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
      <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:10}}>
        <div style={{
          width:36, height:36, borderRadius:12,
          background:`${color}15`, border:`1.5px solid ${color}30`,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          <Ic size={18} style={{color}} strokeWidth={2.4}/>
        </div>
        <span style={{fontSize:26, fontWeight:900, color:"#0f172a", lineHeight:1}}>{value}</span>
      </div>
      <div style={{color:"#64748b", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:".8px"}}>{label}</div>
      {sub && <div style={{color, fontSize:10, fontWeight:700, marginTop:4}}>{sub}</div>}
    </div>
  );
}

function TypePill({type}) {
  const m = REQ_META[type] || REQ_META.od;
  const Ic = m.icon;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      padding:"3px 10px", borderRadius:9999,
      background:m.bg, border:`1.5px solid ${m.border}`,
      color:m.color, fontSize:10, fontWeight:800,
    }}>
      <Ic size={11} strokeWidth={2.4}/>
      {m.label}
    </span>
  );
}

function TStep({label, status, actor, ts, note, last}) {
  const sc = {
    approved: { color:"#16a34a", dot:"#16a34a", bg:"#dcfce7", icon:"✓" },
    rejected: { color:"#dc2626", dot:"#dc2626", bg:"#fee2e2", icon:"✗" },
    pending:  { color:"#d97706", dot:"#d97706", bg:"#fef3c7", icon:"⏳" },
    waiting:  { color:"#94a3b8", dot:"#cbd5e1", bg:"#f1f5f9", icon:"—" },
  };
  const s = sc[status] || sc.waiting;
  return (
    <div style={{display:"flex", gap:14, paddingBottom: last ? 0 : 18, position:"relative"}}>
      {!last && <div style={{position:"absolute", left:12, top:26, bottom:0, width:2, background:"#e2e8f0"}} />}
      <div style={{
        width:26, height:26, borderRadius:"50%",
        background:s.bg, border:`2px solid ${s.dot}`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:11, fontWeight:900, color:s.color, flexShrink:0, zIndex:1,
      }}>
        {s.icon}
      </div>
      <div style={{flex:1, minWidth:0}}>
        <div style={{display:"flex", alignItems:"center", gap:8, flexWrap:"wrap"}}>
          <span style={{color:"#0f172a", fontSize:13, fontWeight:800}}>{label}</span>
          <span style={{color:s.color, fontSize:11, fontWeight:700}}>
            {status==="approved"?"Approved":status==="rejected"?"Rejected":status==="pending"?"Awaiting Review":"Pending"}
          </span>
          {ts && <span style={{color:"#94a3b8", fontSize:10, marginLeft:"auto"}}>{ts}</span>}
        </div>
        {actor && <div style={{color:"#64748b", fontSize:11, marginTop:2, fontWeight:600}}>{actor}</div>}
        {note && (
          <div style={{marginTop:8, padding:"8px 12px", background:"#fef2f2", border:"1.5px solid #fecaca", borderRadius:10, color:"#dc2626", fontSize:11, lineHeight:1.5}}>
            Reason: {note}
          </div>
        )}
      </div>
    </div>
  );
}

function Drawer({req, user, isHod, facultyUsers, onClose, onOpenApprove, onOpenReject}) {
  const [tab, setTab] = useState("details");
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (tab === "audit" && req) {
      setLoadingHistory(true);
      supabase.from('application_routing_history')
        .select('*')
        .eq('applicationId', req.id)
        .order('createdAt', { ascending: true })
        .then(({ data }) => {
          if (data) setHistory(data);
          setLoadingHistory(false);
        });
    }
  }, [tab, req]);

  const getUserName = (id) => {
    if (!id) return "";
    if (id === req.studentId) return req.studentName;
    const f = (facultyUsers||[]).find(u => u.id === id);
    return f ? f.name : id;
  };

  if(!req) return null;
  const st = getStatus(req);
  const dur = days(req.fromDate, req.toDate);

  const canAct = req.current_assignee_id === user.id && req.status === 'in_progress';

  return (
    <div style={{position:"fixed", inset:0, background:"rgba(15,23,42,0.45)", backdropFilter:"blur(6px)", display:"flex", justifyContent:"flex-end", zIndex:999}}>
      <div style={{
        width:"100%", maxWidth:600, background:"#ffffff", height:"100%",
        display:"flex", flexDirection:"column", boxShadow:"-10px 0 40px rgba(15,23,42,0.15)",
        borderLeft:"1px solid #e2e8f0", overflow:"hidden",
      }}>
        {/* Header */}
        <div style={{padding:"20px 24px", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", justifyContent:"space-between", background:"#f8fafc"}}>
          <div style={{display:"flex", alignItems:"center", gap:10}}>
            <span style={{fontSize:18, fontWeight:900, color:"#0f172a", fontFamily:"monospace"}}>{req.id}</span>
            <TypePill type={req.requestType}/>
            <SBadge status={st}/>
          </div>
          <button onClick={onClose} style={{background:"#ffffff", border:"1.5px solid #e2e8f0", borderRadius:12, width:34, height:34, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#64748b"}}>
            <X size={16}/>
          </button>
        </div>

        {/* Content Tabs */}
        <div style={{display:"flex", borderBottom:"1px solid #f1f5f9", padding:"0 20px", background:"#ffffff"}}>
          {[
            {id:"details", label:"Application Details"},
            {id:"letter", label:"AI Generated Letter"},
            {id:"audit", label:"Approval Trail"},
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding:"14px 16px", border:"none", background:"none",
                borderBottom: tab===t.id ? "2.5px solid #16a34a" : "2.5px solid transparent",
                color: tab===t.id ? "#16a34a" : "#64748b",
                fontSize:12, fontWeight: tab===t.id ? 800 : 600,
                cursor:"pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div style={{flex:1, overflowY:"auto", padding:"24px"}}>
          {tab === "details" && (
            <div style={{display:"flex", flexDirection:"column", gap:16}}>
              {/* Student info card */}
              <div style={{background:"#f0fdf4", border:"1.5px solid #bbf7d0", borderRadius:18, padding:18}}>
                <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:10}}>
                  <StudentImg photo={req.photo} name={req.studentName} size={48} radius="50%"/>
                  <div>
                    <div style={{fontSize:15, fontWeight:800, color:"#0f172a"}}>{req.studentName}</div>
                    <div style={{fontSize:11, color:"#166534", fontWeight:700}}>{cls(req)} · Roll: {req.rollNo} · ID: {req.studentId}</div>
                  </div>
                </div>
              </div>

              {/* Event reason */}
              <div style={{background:"#ffffff", border:"1.5px solid #e2e8f0", borderRadius:18, padding:18}}>
                <div style={{fontSize:11, fontWeight:800, color:"#64748b", textTransform:"uppercase", letterSpacing:".8px", marginBottom:6}}>Event / Objective</div>
                <div style={{fontSize:13, fontWeight:700, color:"#0f172a", lineHeight:1.6}}>{req.reason}</div>
              </div>

              {/* Dates grid */}
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
                <div style={{background:"#f8fafc", border:"1.5px solid #e2e8f0", borderRadius:16, padding:14}}>
                  <div style={{fontSize:10, fontWeight:700, color:"#64748b", textTransform:"uppercase"}}>From Date</div>
                  <div style={{fontSize:13, fontWeight:800, color:"#0f172a", marginTop:4}}>{fmt(req.fromDate)} {req.fromTime && `· ${req.fromTime}`}</div>
                </div>
                <div style={{background:"#f8fafc", border:"1.5px solid #e2e8f0", borderRadius:16, padding:14}}>
                  <div style={{fontSize:10, fontWeight:700, color:"#64748b", textTransform:"uppercase"}}>To Date</div>
                  <div style={{fontSize:13, fontWeight:800, color:"#0f172a", marginTop:4}}>{fmt(req.toDate)} {req.toTime && `· ${req.toTime}`}</div>
                </div>
              </div>
            </div>
          )}

          {tab === "letter" && (
            <div style={{background:"#f8fafc", border:"1.5px solid #e2e8f0", borderRadius:18, padding:20}}>
              <pre style={{whiteSpace:"pre-wrap", color:"#0f172a", fontSize:13, lineHeight:1.85, fontFamily:"'Inter', sans-serif", margin:0}}>
                {req.letter}
              </pre>
            </div>
          )}

          {tab === "audit" && (
            <div style={{background:"#ffffff", border:"1.5px solid #e2e8f0", borderRadius:18, padding:20}}>
              {loadingHistory ? (
                <div style={{color:"#64748b", fontSize:13, textAlign:"center", padding:"20px"}}>Loading history...</div>
              ) : history.length === 0 ? (
                <div style={{color:"#64748b", fontSize:13, textAlign:"center", padding:"20px"}}>No routing history found.</div>
              ) : (
                history.map((h, i) => {
                  const isLast = i === history.length - 1;
                  let label = "Action";
                  let status = "approved"; 
                  if (h.actionTaken === 'created' || h.actionTaken === 'created_draft') { label = "Application Drafted"; }
                  else if (h.actionTaken === 'created_and_forwarded') { label = `Submitted & Forwarded to ${getUserName(h.forwardedToUserId)}`; status="pending"; }
                  else if (h.actionTaken === 'forwarded') { label = `Forwarded to ${getUserName(h.forwardedToUserId)}`; status = "pending"; }
                  else if (h.actionTaken === 'completed') { label = "Final Verification Completed"; }
                  else if (h.actionTaken === 'cancelled') { label = "Application Rejected"; status = "rejected"; }

                  return (
                    <TStep
                      key={h.id}
                      label={label}
                      status={status}
                      actor={`By ${getUserName(h.actionByUserId)}`}
                      ts={new Date(h.createdAt).toLocaleString("en-IN", {day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit"})}
                      note={h.comments}
                      last={isLast}
                    />
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Action Bottom Bar */}
        {canAct && (
          <div style={{padding:"18px 24px", borderTop:"1px solid #f1f5f9", background:"#f8fafc", display:"flex", gap:12}}>
            <button
              onClick={() => onOpenApprove(req)}
              style={{
                padding:"12px 20px", borderRadius:9999, flex:2,
                background:"linear-gradient(135deg, #16a34a, #059669)",
                color:"#fff", border:"none", fontSize:13, fontWeight:900, cursor:"pointer",
                boxShadow:"0 4px 16px rgba(22, 163, 74, 0.35)",
                display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              }}
            >
              <CheckCircle2 size={16}/> Confirm
            </button>
            <button
              onClick={() => onOpenReject(req)}
              style={{
                padding:"12px 20px", borderRadius:9999, flex:1,
                background:"#fee2e2", color:"#dc2626", border:"1.5px solid #fecaca",
                fontSize:13, fontWeight:800, cursor:"pointer",
              }}
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Faculty Main Dashboard ───────────────────────────────────────────────────
export default function FacultyApproval({ user, requests, onPatch, onShowToast }) {
  const isHod = user.role === "hod";
  const notify = onShowToast || ((msg) => alert(msg));
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selReq, setSelReq] = useState(null);

  const [approveModalReq, setApproveModalReq] = useState(null);
  const [rejectModalReq, setRejectModalReq] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [forwardSelection, setForwardSelection] = useState("");
  const [confirmActionTab, setConfirmActionTab] = useState("forward");

  const [facultyUsers, setFacultyUsers] = useState([]);
  useEffect(() => {
    supabase.from('users').select('id, name, role, dept, year, section').in('role', ['advisor', 'hod']).then(({data}) => {
      if (data) setFacultyUsers(data);
    });
  }, []);

  const handleOpenApproveModal = (req) => {
    const deptHod = facultyUsers.find(u => u.role === 'hod' && u.dept === (req.dept || user.dept));
    if (deptHod) {
      setForwardSelection(deptHod.id);
    } else {
      const anyHod = facultyUsers.find(u => u.role === 'hod');
      setForwardSelection(anyHod ? anyHod.id : `HOD${req.dept || user.dept}`);
    }
    setConfirmActionTab(isHod ? "final" : "forward");
    setApproveModalReq(req);
  };

  const handleOpenRejectModal = (req) => {
    setRejectModalReq(req);
    setCancelReason("");
  };

  const submitApprove = async () => {
    if (!approveModalReq) return;
    const req = typeof approveModalReq === 'object' ? approveModalReq : requests.find(r => r.id === approveModalReq) || { id: approveModalReq };
    const reqId = req.id;

    let patch = {};
    let successMsg = "";

    if (confirmActionTab === "final" || (isHod && confirmActionTab !== "forward")) {
      patch = {
        status: "completed",
        current_assignee_id: null,
      };
      successMsg = `Application #${reqId} has been officially verified & approved!`;
    } else {
      const targetUser = facultyUsers.find(u => u.id === forwardSelection);
      const targetName = targetUser ? `${targetUser.role === 'hod' ? 'HOD ' : ''}${targetUser.name} (${targetUser.id})` : forwardSelection;
      patch = {
        status: "in_progress",
        current_assignee_id: forwardSelection,
      };
      successMsg = `Application #${reqId} confirmed and forwarded to ${targetName}!`;
    }

    const res = await onPatch(reqId, patch);

    if (res && res.success) {
      await supabase.from('application_routing_history').insert([{
        applicationId: reqId,
        actionByUserId: user.id,
        forwardedToUserId: confirmActionTab === "final" ? null : forwardSelection,
        actionTaken: confirmActionTab === "final" ? 'completed' : 'forwarded'
      }]);
    }

    setApproveModalReq(null);
    setSelReq(null);

    if (res && res.success === false) {
      notify(`Failed to update application: ${res.error?.message || 'Database error'}`, 'error');
    } else {
      notify(successMsg, 'success');
    }
  };

  const submitReject = async () => {
    if (!rejectModalReq) return;
    if (!cancelReason.trim()) {
      alert("A reason for cancellation / rejection is mandatory.");
      return;
    }
    const req = typeof rejectModalReq === 'object' ? rejectModalReq : requests.find(r => r.id === rejectModalReq) || { id: rejectModalReq };
    const reqId = req.id;
    const reasonSummary = cancelReason.trim();

    const patch = {
      status: 'cancelled',
      current_assignee_id: null,
      cancelReason: reasonSummary,
    };

    const res = await onPatch(reqId, patch);

    if (res && res.success) {
      await supabase.from('application_routing_history').insert([{
        applicationId: reqId,
        actionByUserId: user.id,
        actionTaken: 'cancelled',
        comments: reasonSummary
      }]);
    }

    setRejectModalReq(null);
    setCancelReason("");
    setSelReq(null);

    if (res && res.success === false) {
      notify(`Failed to reject application: ${res.error?.message || 'Database error'}`, 'error');
    } else {
      notify(`Application #${reqId} has been cancelled. Reason recorded: "${reasonSummary}"`, 'error');
    }
  };

  const relevant = useMemo(() => {
    return requests.filter(r => {
      if (r.status === 'draft') return false;
      if (r.current_assignee_id === user.id) return true;
      if (isHod && r.dept === user.dept) return true;
      if (!isHod && r.dept === user.dept && r.year === user.year && (r.section || '').toUpperCase() === (user.section || '').toUpperCase()) return true;
      return false;
    });
  }, [requests, user, isHod]);

  const isPendingAction = (r) => {
    return r.current_assignee_id === user.id && r.status === 'in_progress';
  };

  const pending = relevant.filter(isPendingAction);
  const approved = relevant.filter(r => r.status === "completed");
  const rejected = relevant.filter(r => r.status === "cancelled");

  const filtered = useMemo(() => {
    return relevant.filter(r => {
      const matchSearch = (r.studentName || "").toLowerCase().includes(search.toLowerCase()) ||
                          (r.rollNo || "").includes(search) ||
                          (r.reason || "").toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;
      if (filter === "pending") return isPendingAction(r);
      if (filter === "approved") return r.status === "completed";
      if (filter === "rejected") return r.status === "cancelled";
      return true;
    });
  }, [relevant, search, filter, isPendingAction]);

  return (
    <div style={{maxWidth:1080, margin:"0 auto", display:"flex", flexDirection:"column", gap:22}}>
      {/* ── Modals ───────────────────────────────────────────────────────────── */}
      {approveModalReq && (
        <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.45)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,padding:20}}>
          <div style={{background:"#ffffff",borderRadius:24,padding:26,width:"100%",maxWidth:500,boxShadow:"0 25px 60px rgba(15,23,42,0.18)",border:"1.5px solid #e2e8f0",display:"flex",flexDirection:"column",gap:16}}>
            {/* Header */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #f1f5f9",paddingBottom:14}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <span style={{fontSize:16,fontWeight:900,color:"#0f172a",fontFamily:"monospace"}}>{approveModalReq.id}</span>
                  <span style={{background:"#dcfce7",color:"#16a34a",fontSize:11,fontWeight:800,padding:"2px 8px",borderRadius:9999}}>
                    {approveModalReq.studentName} ({cls(approveModalReq)})
                  </span>
                </div>
                <h3 style={{margin:0,color:"#0f172a",fontSize:18,fontWeight:900}}>
                  Application Confirmation
                </h3>
              </div>
              <button
                onClick={()=>setApproveModalReq(null)}
                style={{background:"#f1f5f9",border:"none",borderRadius:12,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#64748b"}}
              >
                <X size={16}/>
              </button>
            </div>

            {/* Selection Tabs: Forward vs Complete Final Verification */}
            <div style={{display:"flex",background:"#f1f5f9",borderRadius:14,padding:4,gap:4}}>
              <button
                type="button"
                onClick={() => setConfirmActionTab("forward")}
                style={{
                  flex:1,padding:"10px 14px",borderRadius:10,border:"none",
                  background: confirmActionTab === "forward" ? "#ffffff" : "transparent",
                  color: confirmActionTab === "forward" ? "#16a34a" : "#64748b",
                  fontSize:13, fontWeight:800, cursor:"pointer",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                  boxShadow: confirmActionTab === "forward" ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                  transition:"all 0.18s ease"
                }}
              >
                <ArrowUpRight size={15}/> Forward
              </button>
              <button
                type="button"
                onClick={() => setConfirmActionTab("final")}
                style={{
                  flex:1,padding:"10px 14px",borderRadius:10,border:"none",
                  background: confirmActionTab === "final" ? "#ffffff" : "transparent",
                  color: confirmActionTab === "final" ? "#16a34a" : "#64748b",
                  fontSize:13, fontWeight:800, cursor:"pointer",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                  boxShadow: confirmActionTab === "final" ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                  transition:"all 0.18s ease"
                }}
              >
                <ShieldCheck size={15}/> Complete Final Verification
              </button>
            </div>

            {/* Tab 1 Content: Forward */}
            {confirmActionTab === "forward" && (
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <div style={{background:"#f0fdf4",border:"1.5px solid #bbf7d0",borderRadius:16,padding:"12px 14px"}}>
                  <div style={{fontSize:12,fontWeight:800,color:"#166534",marginBottom:2}}>
                    Forward to Higher Authority / Faculty
                  </div>
                  <div style={{fontSize:11,color:"#15803d",lineHeight:1.4}}>
                    Choose the Head of Department or another faculty member to forward this application for subsequent review.
                  </div>
                </div>

                <div>
                  <label style={{display:"block",fontSize:12,fontWeight:800,color:"#475569",marginBottom:6}}>
                    Select Recipient:
                  </label>
                  <select
                    value={forwardSelection}
                    onChange={e => setForwardSelection(e.target.value)}
                    style={{width:"100%",padding:"11px 14px",borderRadius:12,border:"1.5px solid #cbd5e1",background:"#f8fafc",fontSize:13,fontWeight:700,color:"#0f172a",outline:"none",cursor:"pointer"}}
                  >
                    <optgroup label="Head of Department (Recommended)">
                      {facultyUsers.filter(u=>u.role==='hod').map(u => (
                        <option key={u.id} value={u.id}>HOD — {DEPTS[u.dept]||u.dept} ({u.name})</option>
                      ))}
                    </optgroup>
                    <optgroup label="Other Faculty / Class Advisors">
                      {facultyUsers.filter(u=>u.role==='advisor' && u.id !== user.id).map(u => (
                        <option key={u.id} value={u.id}>{u.dept}{u.year}{u.section} — {u.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div style={{display:"flex",gap:10,marginTop:6}}>
                  <button
                    onClick={submitApprove}
                    style={{flex:1,padding:"12px 18px",borderRadius:9999,background:"linear-gradient(135deg, #16a34a, #059669)",color:"#fff",border:"none",fontWeight:800,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,boxShadow:"0 4px 14px rgba(22, 163, 74, 0.3)"}}
                  >
                    <ArrowUpRight size={15}/> Confirm & Forward
                  </button>
                  <button
                    onClick={()=>setApproveModalReq(null)}
                    style={{padding:"12px 20px",borderRadius:9999,background:"#f1f5f9",color:"#64748b",border:"none",fontWeight:800,fontSize:13,cursor:"pointer"}}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2 Content: Complete Final Verification */}
            {confirmActionTab === "final" && (
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <div style={{background:"#eff6ff",border:"1.5px solid #bfdbfe",borderRadius:16,padding:"12px 14px"}}>
                  <div style={{fontSize:12,fontWeight:800,color:"#1e40af",marginBottom:2}}>
                    Grant Immediate Final Clearance
                  </div>
                  <div style={{fontSize:11,color:"#1d4ed8",lineHeight:1.4}}>
                    Digitally sign, seal, and grant final approval for this requisition directly without routing.
                  </div>
                </div>

                <div style={{background:"#f8fafc",border:"1.5px solid #e2e8f0",borderRadius:16,padding:"12px 14px",display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:38,height:38,borderRadius:12,background:"#dcfce7",border:"1.5px solid #86efac",display:"flex",alignItems:"center",justifyContent:"center",color:"#16a34a",flexShrink:0}}>
                    <CheckCircle2 size={18}/>
                  </div>
                  <div>
                    <div style={{fontSize:10,fontWeight:700,color:"#64748b",textTransform:"uppercase"}}>Authorized Signatory</div>
                    <div style={{fontSize:13,fontWeight:900,color:"#0f172a"}}>{user.name}</div>
                    <div style={{fontSize:11,color:"#16a34a",fontWeight:700}}>{isHod ? `Head of Department · ${DEPTS[user.dept]||user.dept}` : `Class Advisor · ${user.dept}${user.year}${user.section}`}</div>
                  </div>
                </div>

                <div style={{display:"flex",gap:10,marginTop:6}}>
                  <button
                    onClick={submitApprove}
                    style={{flex:1,padding:"12px 18px",borderRadius:9999,background:"linear-gradient(135deg, #16a34a, #059669)",color:"#fff",border:"none",fontWeight:800,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,boxShadow:"0 4px 14px rgba(22, 163, 74, 0.3)"}}
                  >
                    <CheckCircle2 size={15}/> Complete Final Verification
                  </button>
                  <button
                    onClick={()=>setApproveModalReq(null)}
                    style={{padding:"12px 20px",borderRadius:9999,background:"#f1f5f9",color:"#64748b",border:"none",fontWeight:800,fontSize:13,cursor:"pointer"}}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {rejectModalReq && (
        <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.4)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:20}}>
          <div style={{background:"#ffffff",borderRadius:24,padding:28,width:"100%",maxWidth:480,boxShadow:"0 25px 60px rgba(15,23,42,0.15)",border:"1px solid #e2e8f0"}}>
            <h3 style={{color:"#dc2626",fontSize:20,fontWeight:900,marginBottom:8}}>Cancel / Reject Application</h3>
            <p style={{color:"#64748b",fontSize:13,marginBottom:20}}>You must provide a reason for cancelling this request. The student will see this reason.</p>
            
            <label style={{display:"block",fontSize:12,fontWeight:800,color:"#475569",marginBottom:8}}>Reason for Cancellation:</label>
            <textarea
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              placeholder="E.g., Insufficient attendance, clash with internal exams..."
              rows={4}
              style={{width:"100%",padding:"12px 16px",borderRadius:12,border:"1.5px solid #fecaca",background:"#fef2f2",fontSize:14,color:"#991b1b",outline:"none",marginBottom:24,resize:"none"}}
            />

            <div style={{display:"flex",gap:12}}>
              <button
                onClick={submitReject}
                style={{flex:1,padding:"12px",borderRadius:9999,background:"#dc2626",color:"#fff",border:"none",fontWeight:800,fontSize:14,cursor:"pointer"}}
              >
                Confirm Rejection
              </button>
              <button
                onClick={()=>{setRejectModalReq(null);setCancelReason("");}}
                style={{padding:"12px 24px",borderRadius:9999,background:"#f1f5f9",color:"#64748b",border:"none",fontWeight:800,fontSize:14,cursor:"pointer"}}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Top Header Title Row ─────────────────────────────────── */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16}}>
        <div>
          <h1 style={{margin:"0 0 4px",fontSize:26,fontWeight:900,color:"#0f172a",letterSpacing:"-0.4px"}}>
            Faculty Approval Console
          </h1>
          <p style={{margin:0,fontSize:13,color:"#64748b",fontWeight:600}}>
            {isHod ? `Head of Department — ${DEPTS[user.dept] || user.dept}` : `Class Advisor · ${user.dept}${user.year}${user.section}`} · {user.name}
          </p>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{
            background:"#dcfce7",
            border:"1.5px solid #86efac",
            color:"#16a34a",
            padding:"7px 18px",borderRadius:9999,fontSize:12,fontWeight:800,
          }}>
            Pending Actions: {pending.length}
          </span>
        </div>
      </div>

      {/* ── Metric Stats Cards ───────────────────────────────────── */}
      <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14}}>
        <Metric label="Total Batch Requests" value={relevant.length} color="#0f172a" icon={Inbox} />
        <Metric label="Awaiting Your Action" value={pending.length} color="#d97706" icon={Clock} sub="Priority Action" />
        <Metric label="Approved Passes" value={approved.length} color="#16a34a" icon={CheckCircle2} />
        <Metric label="Rejected Requests" value={rejected.length} color="#dc2626" icon={XCircle} />
      </div>

      {/* ── Applications Queue Card ──────────────────────────────── */}
      <div style={{
        background:"#ffffff", borderRadius:28, padding:"26px 28px",
        boxShadow:"0 12px 40px rgba(15,23,42,0.05)", border:"1.5px solid #e2e8f0",
      }}>
        {/* Search & Filter Bar */}
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:14, marginBottom:20}}>
          {/* Pill Tabs */}
          <div style={{display:"flex", background:"#f1f5f9", borderRadius:9999, padding:4, gap:4}}>
            {[
              {id:"all", label:"All Requests"},
              {id:"pending", label:`Pending (${pending.length})`},
              {id:"approved", label:"Approved"},
              {id:"rejected", label:"Rejected"},
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                style={{
                  padding:"7px 16px", borderRadius:9999, border:"none",
                  background: filter===tab.id ? "#ffffff" : "transparent",
                  color: filter===tab.id ? "#16a34a" : "#64748b",
                  fontSize:12, fontWeight: filter===tab.id ? 800 : 600,
                  cursor:"pointer",
                  boxShadow: filter===tab.id ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                  transition:"all 0.18s ease",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{display:"flex", alignItems:"center", background:"#f8fafc", border:"1.5px solid #e2e8f0", borderRadius:9999, padding:"8px 16px", width:260}}>
            <Search size={14} color="#94a3b8" style={{marginRight:8}} />
            <input
              placeholder="Search student or roll..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{border:"none", background:"transparent", outline:"none", fontSize:12, color:"#0f172a", width:"100%"}}
            />
          </div>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div style={{textAlign:"center", padding:"50px 20px", color:"#94a3b8"}}>
            <Inbox size={38} style={{margin:"0 auto 12px", color:"#cbd5e1"}} />
            <p style={{margin:0, fontSize:14, fontWeight:600}}>No applications match your criteria.</p>
          </div>
        ) : (
          <div style={{display:"flex", flexDirection:"column", gap:12}}>
            {filtered.map(req => {
              const st = getStatus(req);
              const needsAction = isPendingAction(req);
              return (
                <div
                  key={req.id}
                  onClick={() => setSelReq(req)}
                  style={{
                    background: needsAction ? "#f0fdf4" : "#f8fafc",
                    border: `1.5px solid ${needsAction ? "#86efac" : "#e2e8f0"}`,
                    borderRadius:20, padding:"16px 20px", cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"space-between", gap:16,
                    transition:"all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                  onMouseEnter={e=>{
                    e.currentTarget.style.background = "#ffffff";
                    e.currentTarget.style.borderColor = "#16a34a";
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = "0 12px 30px rgba(22, 163, 74, 0.1)";
                  }}
                  onMouseLeave={e=>{
                    e.currentTarget.style.background = needsAction ? "#f0fdf4" : "#f8fafc";
                    e.currentTarget.style.borderColor = needsAction ? "#86efac" : "#e2e8f0";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <StudentImg photo={req.photo} name={req.studentName} size={44} radius="50%"/>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:6, flexWrap:"wrap"}}>
                      <span style={{fontSize:12, fontWeight:900, color:"#16a34a", fontFamily:"monospace"}}>{req.id}</span>
                      <TypePill type={req.requestType}/>
                      <SBadge status={st}/>
                      <span style={{fontSize:12, fontWeight:800, color:"#0f172a"}}>{req.studentName} ({cls(req)} - #{req.rollNo})</span>
                    </div>
                    <div style={{fontSize:13, fontWeight:700, color:"#334155", marginBottom:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
                      {req.reason}
                    </div>
                    <div style={{fontSize:11, color:"#64748b"}}>
                      {fmt(req.fromDate)} → {fmt(req.toDate)} · {days(req.fromDate, req.toDate)} day(s)
                    </div>
                  </div>

                  <div style={{display:"flex", alignItems:"center", gap:8, flexShrink:0}}>
                    {needsAction && (
                      <div style={{display:"flex", alignItems:"center", gap:6}}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenApproveModal(req);
                          }}
                          style={{
                            background: "#16a34a", color: "#fff", border: "none",
                            padding: "6px 14px", borderRadius: 9999, fontSize: 11, fontWeight: 800,
                            cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                            boxShadow: "0 2px 8px rgba(22,163,74,0.25)"
                          }}
                        >
                          <CheckCircle2 size={13}/> Confirm
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenRejectModal(req);
                          }}
                          style={{
                            background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca",
                            padding: "6px 12px", borderRadius: 9999, fontSize: 11, fontWeight: 800,
                            cursor: "pointer"
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    <ChevronRight size={18} color="#94a3b8" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Drawer */}
      {selReq && (
        <Drawer
          req={selReq}
          user={user}
          isHod={isHod}
          facultyUsers={facultyUsers}
          onClose={() => setSelReq(null)}
          onOpenApprove={handleOpenApproveModal}
          onOpenReject={handleOpenRejectModal}
        />
      )}
    </div>
  );
}