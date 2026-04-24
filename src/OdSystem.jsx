import { useState, useCallback } from "react";

const G = {
  navy: "#0A1628", navyLight: "#112240", navyMid: "#0D1E35",
  teal: "#00C9A7", tealDark: "#009E82",
  amber: "#F5A623", red: "#E84040", green: "#27AE60", blue: "#4A90D9",
  slate: "#7A9CBF", slateLight: "#A8C4DE",
  white: "#EEF4FF", dim: "#3A5470",
  glass: "rgba(255,255,255,0.04)", glassBorder: "rgba(255,255,255,0.09)",
  glassHover: "rgba(255,255,255,0.07)",
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

const STUDENT_NAMES = [
  "Arjun Sharma","Priya Nair","Karthik Raj","Divya Menon","Suresh Kumar",
  "Ananya Pillai","Vikram Singh","Meera Iyer","Rohit Das","Lakshmi Patel",
  "Aakash Verma","Sneha Reddy","Harish Babu","Pooja Krishnan","Nikhil Gupta",
  "Kavitha Raj","Dinesh Kumar","Sowmya V","Balaji S","Renu Krishnan",
];
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
  let ni = 0, ai = 0;
  DEPT_KEYS.forEach(dept => {
    YEARS.forEach(yr => {
      SECTIONS.forEach((sec, si) => {
        for (let roll = 1; roll <= 3; roll++) {
          // Make roll unique per section: A=001-003, B=004-006, C=007-009
          const globalRoll = si * 3 + roll;
          const rollStr = String(globalRoll).padStart(3,"0");
          const uid = `ST${dept}${yr}${sec}${rollStr}`;
          u[uid] = {
            pass:"student123", role:"student",
            name: STUDENT_NAMES[ni++ % STUDENT_NAMES.length],
            dept, year:yr, rollNo:rollStr, section:sec,
          };
        }
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

// ── Reactive store ────────────────────────────────────────────────────────────
let OD_DB = [];
let nextId = 1;
const _listeners = new Set();
const _notify = () => _listeners.forEach(fn => fn());

const addRequest  = (req) => { OD_DB = [...OD_DB, req]; _notify(); };
const patchRequest = (id, patch) => { OD_DB = OD_DB.map(r => r.id === id ? {...r,...patch} : r); _notify(); };

function useOD() {
  const [,tick] = useState(0);
  const cb = useCallback(() => tick(n => n+1), []);
  useState(() => { _listeners.add(cb); return () => _listeners.delete(cb); });
  return OD_DB;
}

// ── Status helpers ────────────────────────────────────────────────────────────
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

// ── AI letter ─────────────────────────────────────────────────────────────────
async function genLetter({studentName,rollNo,dept,year,section,fromDate,toDate,reason}) {
  const n = daysCount(fromDate,toDate);
  const advisorId = `ADV${dept}${year}${section}`;
  const hodId     = `HOD${dept}`;
  const advisorName = USERS[advisorId]?.name || "Class Advisor";
  const hodName     = USERS[hodId]?.name     || HOD_NAMES[dept] || "Head of Department";

  const prompt = `Write a formal On-Duty (OD) application letter from a college student addressed to BOTH their Class Advisor AND the Head of Department.

Student Name : ${studentName}
Roll Number  : ${rollNo}
Department   : ${DEPTS[dept]||dept}
Class        : ${dept}${year}${section} (Year ${year}, Section ${section})
From Date    : ${fmt(fromDate)}
To Date      : ${fmt(toDate)}  (${n} day${n>1?"s":""})
Reason/Event : ${reason}
Letter Date  : ${fmt(todayStr())}
Class Advisor: ${advisorName}
HOD          : ${hodName}

Write a COMPLETE formal letter with NO placeholders whatsoever. Use the exact names provided above.

Format:
${fmt(todayStr())}

To,
${hodName}
Head of the Department of ${DEPTS[dept]||dept}

And

${advisorName}
Class Advisor — ${dept}${year}${section}

Department of ${DEPTS[dept]||dept}
[College Name], [City]

Subject: Request for On-Duty (OD) Leave from ${fmt(fromDate)} to ${fmt(toDate)}

Respected Sir/Madam,

[Paragraph 1: Respectfully introduce yourself — full name, roll number, year, section, department.]

[Paragraph 2: Describe the event or activity in specific detail — name of event, organising institution, nature of participation.]

[Paragraph 3: Formally request OD leave for the specified dates. State the number of days.]

[Paragraph 4: Assure that you will complete any missed academic work promptly and will not let attendance affect academic performance.]

Yours faithfully,
${studentName}
Roll No: ${rollNo}
${dept}${year}${section} — Department of ${DEPTS[dept]||dept}`;

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method:"POST",
    headers:{
      "Content-Type":"application/json",
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });
  if(!res.ok) {
    const err = await res.json().catch(()=>({error:{message:res.statusText}}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Error generating letter.";
}

// ── PDF ───────────────────────────────────────────────────────────────────────
function printPDF(req) {
  const st = getStatus(req);
  const win = window.open("","_blank");
  win.document.write(`<!DOCTYPE html><html><head><title>OD — ${req.id}</title>
<style>body{font-family:'Times New Roman',serif;margin:60px 80px;line-height:1.9;font-size:14px;color:#111}
.top{text-align:center;border-bottom:2px solid #333;padding-bottom:12px;margin-bottom:18px}
h2{margin:0;font-size:17px}p.s{margin:4px 0;font-size:12px;color:#555}
pre{white-space:pre-wrap;font-family:'Times New Roman',serif;font-size:14px;line-height:1.9}
.foot{margin-top:40px;border-top:1px solid #bbb;padding-top:10px;font-size:11px;color:#666;display:flex;justify-content:space-between}
.stamp{margin:24px 0;text-align:center}.stamp span{border:2px dashed green;padding:6px 24px;color:green;font-weight:bold;border-radius:4px}
</style></head><body>
<div class="top"><h2>${DEPTS[req.dept]||req.dept} — On-Duty Application</h2>
<p class="s">${req.id} | Submitted: ${fmt(req.createdAt)}</p></div>
<pre>${req.letter}</pre>
${st==="approved"?'<div class="stamp"><span>✓ APPROVED BY HOD</span></div>':""}
<div class="foot"><span>${req.studentId}</span><span>Class: ${clsLabel(req)}</span>
<span>${st==="approved"?"FULLY APPROVED":st==="rejected"?"REJECTED":"PENDING"}</span></div>
</body></html>`);
  win.document.close(); setTimeout(()=>win.print(),400);
}

// ── UI Atoms ──────────────────────────────────────────────────────────────────
function Badge({status}) {
  const M = {
    pending_advisor:{bg:`${G.amber}1e`,color:G.amber,label:"Pending Advisor"},
    pending_hod:    {bg:`${G.blue}1e`, color:G.blue, label:"Pending HOD"},
    approved:       {bg:`${G.green}1e`,color:G.green,label:"Approved ✓"},
    rejected:       {bg:`${G.red}1e`,  color:G.red,  label:"Rejected ✗"},
  };
  const s = M[status]||M.pending_advisor;
  return <span style={{background:s.bg,color:s.color,padding:"3px 9px",borderRadius:20,fontSize:10,fontWeight:700,letterSpacing:.3,border:`1px solid ${s.color}44`,whiteSpace:"nowrap"}}>{s.label}</span>;
}
function Inp({label,...p}) {
  return (
    <div style={{marginBottom:13}}>
      {label&&<label style={{display:"block",fontSize:10,color:G.slate,marginBottom:4,letterSpacing:.8,textTransform:"uppercase",fontWeight:600}}>{label}</label>}
      <input {...p} style={{width:"100%",background:G.glass,border:`1px solid ${G.glassBorder}`,borderRadius:7,padding:"9px 13px",color:G.white,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit",...p.style}}/>
    </div>
  );
}
function Txt({label,...p}) {
  return (
    <div style={{marginBottom:13}}>
      {label&&<label style={{display:"block",fontSize:10,color:G.slate,marginBottom:4,letterSpacing:.8,textTransform:"uppercase",fontWeight:600}}>{label}</label>}
      <textarea {...p} style={{width:"100%",background:G.glass,border:`1px solid ${G.glassBorder}`,borderRadius:7,padding:"9px 13px",color:G.white,fontSize:13,outline:"none",resize:"vertical",boxSizing:"border-box",minHeight:80,fontFamily:"inherit",...p.style}}/>
    </div>
  );
}
function Btn({children,variant="primary",...p}) {
  const S = {
    primary:{background:`linear-gradient(135deg,${G.teal},${G.tealDark})`,color:"#0A1628",fontWeight:700,border:"none"},
    danger: {background:`linear-gradient(135deg,${G.red},#c0392b)`,color:"#fff",fontWeight:700,border:"none"},
    success:{background:`linear-gradient(135deg,${G.green},#1e8449)`,color:"#fff",fontWeight:700,border:"none"},
    ghost:  {background:G.glass,border:`1px solid ${G.glassBorder}`,color:G.slateLight},
  };
  return <button {...p} style={{...S[variant],padding:"8px 18px",borderRadius:7,cursor:"pointer",fontSize:12,letterSpacing:.3,transition:"opacity .15s",...p.style}}
    onMouseEnter={e=>!p.disabled&&(e.currentTarget.style.opacity=".82")}
    onMouseLeave={e=>(e.currentTarget.style.opacity="1")}>{children}</button>;
}
function Card({children,style}) {
  return <div style={{background:G.navyLight,border:`1px solid ${G.glassBorder}`,borderRadius:11,padding:18,...style}}>{children}</div>;
}
function Stat({label,val,color}) {
  return (
    <Card style={{textAlign:"center",padding:"14px 8px"}}>
      <div style={{fontSize:28,fontWeight:800,color,lineHeight:1}}>{val}</div>
      <div style={{fontSize:9,color:G.slate,textTransform:"uppercase",letterSpacing:.7,marginTop:4}}>{label}</div>
    </Card>
  );
}

// ── Login ─────────────────────────────────────────────────────────────────────
function LoginPage({onLogin}) {
  const [id,setId]=useState(""); const [pass,setPass]=useState(""); const [err,setErr]=useState(""); const [busy,setBusy]=useState(false);
  const go = () => {
    setErr(""); setBusy(true);
    setTimeout(() => {
      const u = USERS[id.trim().toUpperCase()];
      if (!u)          { setErr("ID not found. Check format: STCS1A001 / ADVCS1A / HODCS"); setBusy(false); return; }
      if (u.pass!==pass){ setErr("Incorrect password."); setBusy(false); return; }
      onLogin({...u, id:id.trim().toUpperCase()});
    },500);
  };
  return (
    <div style={{minHeight:"100vh",background:G.navy,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,backgroundImage:`radial-gradient(ellipse at 25% 60%,${G.teal}12 0%,transparent 55%),radial-gradient(ellipse at 80% 15%,${G.amber}0a 0%,transparent 45%)`,pointerEvents:"none"}}/>
      <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${G.teal},${G.amber},${G.teal})`}}/>
      <div style={{width:"100%",maxWidth:420,padding:"0 20px",position:"relative"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:56,height:56,borderRadius:14,background:`${G.teal}15`,border:`1.5px solid ${G.teal}40`,marginBottom:12}}>
            <span style={{fontSize:24}}>📋</span>
          </div>
          <h1 style={{margin:0,color:G.white,fontSize:23,fontWeight:800,letterSpacing:-.5}}>OD Portal</h1>
          <p style={{margin:"5px 0 0",color:G.slate,fontSize:12}}>On-Duty Leave Management System</p>
        </div>
        <Card>
          <h2 style={{margin:"0 0 18px",color:G.white,fontSize:15,fontWeight:700}}>Sign In</h2>
          <Inp label="Your ID" placeholder="e.g. STCS1001 / ADVCS1A / HODCS" value={id} onChange={e=>setId(e.target.value)}/>
          <Inp label="Password" type="password" placeholder="Enter password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()}/>
          {err&&<div style={{color:G.red,fontSize:12,marginBottom:10,background:`${G.red}12`,padding:"7px 11px",borderRadius:6}}>{err}</div>}
          <Btn onClick={go} disabled={busy} style={{width:"100%",padding:12,fontSize:13}}>{busy?"Signing in…":"Sign In →"}</Btn>
          <div style={{marginTop:16,padding:12,background:G.glass,borderRadius:7,border:`1px solid ${G.glassBorder}`}}>
            <p style={{color:G.slate,fontSize:10,marginBottom:6,fontWeight:700,letterSpacing:.5,textTransform:"uppercase"}}>ID Format</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:8}}>
              {[{r:"Student",e:"STCS1A001",f:"ST+DEPT+YR+SEC+ROLL"},{r:"Advisor",e:"ADVCS1A",f:"ADV+DEPT+YR+SEC"},{r:"HOD",e:"HODCS",f:"HOD+DEPT"}].map(x=>(
                <div key={x.r} style={{background:G.navyMid,borderRadius:5,padding:"7px 8px"}}>
                  <div style={{color:G.teal,fontSize:9,fontWeight:700,marginBottom:1}}>{x.r}</div>
                  <div style={{color:G.white,fontSize:11,fontWeight:600}}>{x.e}</div>
                  <div style={{color:G.slate,fontSize:9}}>{x.f}</div>
                </div>
              ))}
            </div>
            <p style={{color:G.slate,fontSize:9,margin:0}}>Passwords: <strong style={{color:G.white}}>student123</strong> / <strong style={{color:G.white}}>advisor123</strong> / <strong style={{color:G.white}}>hod123</strong></p>
          </div>
        </Card>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');*{box-sizing:border-box;margin:0;padding:0}input::placeholder{color:${G.slate}55}`}</style>
    </div>
  );
}

// ── Nav ───────────────────────────────────────────────────────────────────────
function Nav({user,onLogout,onSettings}) {
  const rc={student:G.teal,advisor:G.amber,hod:"#C084FC"};
  const rl={student:"Student",advisor:"Class Advisor",hod:"HOD"};
  return (
    <div style={{background:G.navyLight,borderBottom:`1px solid ${G.glassBorder}`,padding:"0 22px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:200}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:19}}>📋</span>
        <span style={{color:G.white,fontWeight:800,fontSize:14}}>OD Portal</span>
        <span style={{color:G.dim,fontSize:11}}>· {DEPTS[user.dept]||user.dept}</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{textAlign:"right"}}>
          <div style={{color:G.white,fontSize:12,fontWeight:600}}>{user.name}</div>
          <div style={{display:"flex",alignItems:"center",gap:4,justifyContent:"flex-end"}}>
            <span style={{width:5,height:5,borderRadius:3,background:rc[user.role]}}/>
            <span style={{color:rc[user.role],fontSize:10,fontWeight:700}}>{rl[user.role]}</span>
            <span style={{color:G.dim,fontSize:10}}>· {user.id}</span>
          </div>
        </div>
        <Btn variant="ghost" onClick={onSettings} style={{padding:"5px 10px",fontSize:11}}>⚙ Settings</Btn>
        <Btn variant="ghost" onClick={onLogout}   style={{padding:"5px 10px",fontSize:11}}>Sign Out</Btn>
      </div>
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
    <div style={{position:"fixed",inset:0,background:"#000a",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}>
      <Card style={{width:370}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <h3 style={{color:G.white,fontSize:15,fontWeight:700}}>Change Password</h3>
          <button onClick={onClose} style={{background:"none",border:"none",color:G.slate,fontSize:20,cursor:"pointer"}}>×</button>
        </div>
        <p style={{color:G.slate,fontSize:11,marginBottom:12}}>ID: <strong style={{color:G.white}}>{user.id}</strong></p>
        <Inp label="Current Password" type="password" value={old} onChange={e=>setOld(e.target.value)}/>
        <Inp label="New Password"     type="password" value={nw}  onChange={e=>setNw(e.target.value)}/>
        <Inp label="Confirm New"      type="password" value={cf}  onChange={e=>setCf(e.target.value)}/>
        {msg&&<div style={{color:msg.e?G.red:G.green,fontSize:11,background:msg.e?`${G.red}12`:`${G.green}12`,padding:"7px 10px",borderRadius:5,marginBottom:10}}>{msg.t}</div>}
        <div style={{display:"flex",gap:8}}><Btn onClick={save} style={{flex:1}}>Save</Btn><Btn variant="ghost" onClick={onClose} style={{flex:1}}>Cancel</Btn></div>
      </Card>
    </div>
  );
}

// ── Student Dashboard ─────────────────────────────────────────────────────────
function StudentDashboard({user}) {
  const requests = useOD();
  const [view,setView]=useState("list");
  const [selId,setSelId]=useState(null);
  const [form,setForm]=useState({fromDate:"",toDate:"",reason:""});
  const [generating,setGenerating]=useState(false);
  const [letter,setLetter]=useState("");
  const [sending,setSending]=useState(false);
  const [sent,setSent]=useState(false);

  const mine = requests.filter(r=>r.studentId===user.id);
  const totalC    = mine.length;
  const pendingC  = mine.filter(isPending).length;
  const approvedC = mine.filter(isApproved).length;
  const rejectedC = mine.filter(isRejected).length;

  const doGenerate = async () => {
    if(!form.fromDate||!form.toDate||!form.reason.trim()) return;
    setGenerating(true);
    try { setLetter(await genLetter({studentName:user.name,rollNo:user.rollNo,dept:user.dept,year:user.year,section:user.section,...form})); }
    catch(e) { setLetter("Generation failed: " + (e?.message || "Unknown error. Please try again.")); }
    setGenerating(false);
  };

  const doSubmit = () => {
    setSending(true);
    setTimeout(()=>{
      addRequest({
        id:`OD-${String(nextId++).padStart(3,"0")}`,
        studentId:user.id, studentName:user.name,
        dept:user.dept, year:user.year, section:user.section, rollNo:user.rollNo,
        ...form, letter, advisorStatus:null, hodStatus:null,
        rejectionReason:"", createdAt:todayStr(),
      });
      setSending(false); setSent(true);
      setTimeout(()=>{setSent(false);setView("list");setForm({fromDate:"",toDate:"",reason:""});setLetter("");},1800);
    },400);
  };

  // Detail
  if(view==="detail") {
    const req = requests.find(r=>r.id===selId);
    if(!req){setView("list");return null;}
    const st = getStatus(req);
    return (
      <div style={{padding:"22px 26px",maxWidth:820,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:18}}>
          <button onClick={()=>setView("list")} style={{background:"none",border:"none",color:G.slate,cursor:"pointer",fontSize:20,lineHeight:1}}>←</button>
          <h2 style={{margin:0,color:G.white,fontSize:18,fontWeight:800}}>{req.id}</h2>
          <Badge status={st}/>
        </div>
        {isRejected(req)&&<Card style={{borderColor:`${G.red}44`,marginBottom:12}}><div style={{color:G.red,fontWeight:700,marginBottom:4}}>❌ Rejected</div><p style={{color:G.white,margin:0,fontSize:12}}>Reason: {req.rejectionReason||"Not provided"}</p></Card>}
        {isApproved(req)&&<Card style={{borderColor:`${G.green}44`,marginBottom:12}}><div style={{color:G.green,fontWeight:700}}>✓ Fully Approved by HOD — OD is granted.</div></Card>}
        {st==="pending_hod"&&<Card style={{borderColor:`${G.blue}44`,marginBottom:12}}><div style={{color:G.blue,fontWeight:700}}>⏫ Advisor approved — Awaiting HOD decision.</div></Card>}
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <span style={{color:G.slateLight,fontSize:12}}>{fmt(req.fromDate)} → {fmt(req.toDate)} · {daysCount(req.fromDate,req.toDate)} day(s)</span>
            <Btn variant="ghost" onClick={()=>printPDF(req)} style={{fontSize:11,padding:"5px 10px"}}>⬇ PDF</Btn>
          </div>
          <pre style={{whiteSpace:"pre-wrap",color:G.white,fontSize:13,lineHeight:1.85,fontFamily:"'DM Mono',monospace",background:G.glass,padding:14,borderRadius:7,margin:0}}>{req.letter}</pre>
        </Card>
      </div>
    );
  }

  // New OD
  if(view==="new") return (
    <div style={{padding:"22px 26px",maxWidth:820,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:18}}>
        <button onClick={()=>{setView("list");setLetter("");}} style={{background:"none",border:"none",color:G.slate,cursor:"pointer",fontSize:20,lineHeight:1}}>←</button>
        <h2 style={{margin:0,color:G.white,fontSize:18,fontWeight:800}}>New OD Application</h2>
      </div>
      <Card style={{marginBottom:14}}>
        <div style={{display:"flex",gap:10,marginBottom:2}}>
          <div style={{flex:1}}><Inp label="From Date" type="date" value={form.fromDate} onChange={e=>setForm(p=>({...p,fromDate:e.target.value}))}/></div>
          <div style={{flex:1}}><Inp label="To Date"   type="date" value={form.toDate}   onChange={e=>setForm(p=>({...p,toDate:e.target.value}))}/></div>
        </div>
        <Txt label="Reason / Event" placeholder="Describe the event in detail e.g. National-level symposium at IIT Madras" rows={3} value={form.reason} onChange={e=>setForm(p=>({...p,reason:e.target.value}))}/>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
          {[`👤 ${user.name}`,`🏫 ${clsLabel(user)}`,`🏷 Roll: ${user.rollNo}`,`🏢 ${DEPTS[user.dept]||user.dept}`].map(t=>(
            <span key={t} style={{fontSize:10,color:G.slate,background:G.glass,padding:"4px 9px",borderRadius:4,border:`1px solid ${G.glassBorder}`}}>{t}</span>
          ))}
        </div>
        <Btn onClick={doGenerate} disabled={generating||!form.fromDate||!form.toDate||!form.reason.trim()}>
          {generating?"⏳ Generating letter…":"✨ Generate OD Letter"}
        </Btn>
      </Card>
      {letter&&(
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <h3 style={{margin:0,color:G.white,fontSize:13,fontWeight:700}}>Generated Letter</h3>
            <Btn variant="ghost" onClick={doGenerate} style={{fontSize:10,padding:"4px 10px"}}>↺ Regenerate</Btn>
          </div>
          <pre style={{whiteSpace:"pre-wrap",color:G.white,fontSize:12,lineHeight:1.85,fontFamily:"'DM Mono',monospace",background:G.glass,padding:14,borderRadius:7,margin:"0 0 14px"}}>{letter}</pre>
          <div style={{background:`${G.teal}0e`,border:`1px solid ${G.teal}30`,borderRadius:7,padding:"9px 12px",marginBottom:12,fontSize:11,color:G.slateLight}}>
            📤 Will be sent to <strong style={{color:G.teal}}>Advisor ({`ADV${user.dept}${user.year}${user.section}`})</strong> and <strong style={{color:G.amber}}>HOD ({`HOD${user.dept}`})</strong>
          </div>
          {sent
            ?<div style={{color:G.green,fontWeight:700,fontSize:13}}>✓ Sent to Advisor & HOD!</div>
            :<Btn onClick={doSubmit} disabled={sending}>{sending?"Submitting…":"📤 Submit to Advisor & HOD"}</Btn>}
        </Card>
      )}
    </div>
  );

  // List
  return (
    <div style={{padding:"22px 26px",maxWidth:960,margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
        <div>
          <h2 style={{margin:0,color:G.white,fontSize:19,fontWeight:800}}>My OD Requests</h2>
          <p style={{margin:"3px 0 0",color:G.slate,fontSize:11}}>{user.name} · {clsLabel(user)} · {DEPTS[user.dept]}</p>
        </div>
        <Btn onClick={()=>setView("new")}>+ New OD Request</Btn>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
        <Stat label="Total"    val={totalC}    color={G.slateLight}/>
        <Stat label="Pending"  val={pendingC}  color={G.amber}/>
        <Stat label="Approved" val={approvedC} color={G.green}/>
        <Stat label="Rejected" val={rejectedC} color={G.red}/>
      </div>
      {mine.length===0
        ?<Card style={{textAlign:"center",padding:44}}><div style={{fontSize:38,marginBottom:10}}>📄</div><p style={{color:G.slate}}>No requests yet. Click <strong style={{color:G.teal}}>+ New OD Request</strong>.</p></Card>
        :mine.slice().reverse().map(req=>{
          const st=getStatus(req);
          return (
            <Card key={req.id} style={{marginBottom:9,cursor:"pointer",transition:"border-color .18s,background .18s"}}
              onClick={()=>{setSelId(req.id);setView("detail");}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=`${G.teal}50`;e.currentTarget.style.background=G.glassHover;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=G.glassBorder;e.currentTarget.style.background=G.navyLight;}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
                    <span style={{color:G.teal,fontSize:11,fontWeight:700}}>{req.id}</span>
                    <Badge status={st}/>
                  </div>
                  <div style={{color:G.white,fontSize:13,fontWeight:600,marginBottom:2}}>{req.reason}</div>
                  <div style={{color:G.slate,fontSize:10}}>{fmt(req.fromDate)} — {fmt(req.toDate)}</div>
                </div>
                <span style={{color:G.dim,fontSize:18}}>›</span>
              </div>
              {isRejected(req)&&req.rejectionReason&&(
                <div style={{marginTop:7,background:`${G.red}10`,border:`1px solid ${G.red}28`,borderRadius:5,padding:"5px 9px",fontSize:10,color:G.red}}>
                  Rejected: {req.rejectionReason}
                </div>
              )}
            </Card>
          );
        })}
    </div>
  );
}

// ── Faculty Dashboard ─────────────────────────────────────────────────────────
function FacultyDashboard({user}) {
  const requests = useOD();
  const [selId,setSelId]=useState(null);
  const [filter,setFilter]=useState("pending");
  const [rejReason,setRejReason]=useState("");
  const [showRej,setShowRej]=useState(false);
  const [,tick]=useState(0);

  const isHod = user.role==="hod";

  const relevant = requests.filter(r => {
    if(r.dept!==user.dept) return false;
    if(!isHod) return r.year===user.year && r.section===user.section;
    return true;
  });

  // For advisor: pending = advisor not yet acted; approved = advisor approved; rejected = advisor rejected
  // For HOD:     pending = HOD not yet acted (covers pending_advisor + pending_hod); approved = HOD approved; rejected = HOD rejected
  const counts = {
    pending:  relevant.filter(r => isHod
      ? (getStatus(r) === "pending_hod" || getStatus(r) === "pending_advisor")
      : getStatus(r) === "pending_advisor"
    ).length,
    approved: relevant.filter(r => isHod
      ? r.hodStatus === "approved"
      : r.advisorStatus === "approved"
    ).length,
    rejected: relevant.filter(r => isHod
      ? r.hodStatus === "rejected"
      : r.advisorStatus === "rejected"
    ).length,
    all: relevant.length,
  };

  const filtered = relevant.filter(r => {
    const st = getStatus(r);
    if (filter === "pending")  return isHod
      ? (st === "pending_hod" || st === "pending_advisor")
      : st === "pending_advisor";
    if (filter === "approved") return isHod ? r.hodStatus === "approved" : r.advisorStatus === "approved";
    if (filter === "rejected") return isHod ? r.hodStatus === "rejected" : r.advisorStatus === "rejected";
    return true;
  });

  const sel = requests.find(r=>r.id===selId);
  const selStatus = sel ? getStatus(sel) : null;
  const canAct = sel && (
    (!isHod && selStatus === "pending_advisor") ||
    (isHod  && (selStatus === "pending_hod" || selStatus === "pending_advisor"))
  );

  const doApprove = () => {
    if(!sel)return;
    // HOD can only approve once advisor has approved
    if(isHod && selStatus !== "pending_hod") return;
    patchRequest(sel.id, isHod?{hodStatus:"approved"}:{advisorStatus:"approved"});
    setShowRej(false); setRejReason(""); tick(n=>n+1);
  };
  const doReject = () => {
    if(!sel||!rejReason.trim())return;
    patchRequest(sel.id, isHod?{hodStatus:"rejected",rejectionReason:rejReason}:{advisorStatus:"rejected",rejectionReason:rejReason});
    setShowRej(false); setRejReason(""); tick(n=>n+1);
  };

  const TABS = ["pending","approved","rejected","all"];
  const TL   = {pending:"Pending",approved:"Approved",rejected:"Rejected",all:"All"};
  const TC   = {pending:G.amber,approved:G.green,rejected:G.red,all:G.slateLight};

  return (
    <div style={{display:"flex",height:"calc(100vh - 56px)",fontFamily:"'DM Sans',sans-serif"}}>
      {/* Left */}
      <div style={{width:330,borderRight:`1px solid ${G.glassBorder}`,overflowY:"auto",background:G.navyMid,display:"flex",flexDirection:"column",flexShrink:0}}>
        <div style={{padding:"16px 14px 10px",borderBottom:`1px solid ${G.glassBorder}`}}>
          <h2 style={{margin:"0 0 2px",color:G.white,fontSize:15,fontWeight:800}}>{isHod?"HOD Review":"Advisor Review"}</h2>
          <p style={{margin:0,color:G.slate,fontSize:10}}>{DEPTS[user.dept]} · {user.name}</p>
          {counts.pending>0&&<div style={{marginTop:8,background:`${G.amber}18`,border:`1px solid ${G.amber}40`,borderRadius:5,padding:"5px 9px",fontSize:10,color:G.amber,fontWeight:600}}>⏳ {counts.pending} pending your action</div>}
        </div>
        {/* Tab strip */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",borderBottom:`1px solid ${G.glassBorder}`}}>
          {TABS.map(t=>(
            <button key={t} onClick={()=>setFilter(t)} style={{padding:"9px 2px",background:filter===t?`${G.teal}14`:"transparent",border:"none",borderBottom:filter===t?`2px solid ${G.teal}`:"2px solid transparent",color:filter===t?G.teal:G.slate,fontSize:9,fontWeight:700,cursor:"pointer",textAlign:"center",transition:"all .12s",textTransform:"uppercase",letterSpacing:.3}}>
              {TL[t]}
              <div style={{fontSize:15,fontWeight:800,color:filter===t?G.teal:TC[t],marginTop:1}}>{counts[t]}</div>
            </button>
          ))}
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"9px 10px"}}>
          {filtered.length===0
            ?<div style={{textAlign:"center",color:G.slate,fontSize:11,paddingTop:30}}>No requests here.</div>
            :filtered.slice().reverse().map(req=>{
              const st=getStatus(req); const active=selId===req.id;
              return (
                <div key={req.id} onClick={()=>{setSelId(req.id);setShowRej(false);setRejReason("");}}
                  style={{background:active?`${G.teal}12`:G.glass,border:`1px solid ${active?G.teal+"50":G.glassBorder}`,borderRadius:8,padding:"10px 11px",marginBottom:7,cursor:"pointer",transition:"all .12s"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:6}}>
                    <div style={{minWidth:0}}>
                      <div style={{color:G.teal,fontSize:10,fontWeight:700,marginBottom:1}}>{req.id}</div>
                      <div style={{color:G.white,fontSize:11,fontWeight:600,marginBottom:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{req.studentName}</div>
                      <div style={{color:G.slate,fontSize:9}}>{clsLabel(req)} · Roll {req.rollNo}</div>
                      <div style={{color:G.dim,fontSize:9,marginTop:1}}>{fmt(req.fromDate)} → {fmt(req.toDate)}</div>
                    </div>
                    <Badge status={st}/>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Right */}
      <div style={{flex:1,overflowY:"auto",padding:24}}>
        {!sel
          ?<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",color:G.slate,gap:8}}>
            <div style={{fontSize:48}}>📬</div>
            <p style={{fontSize:13}}>Select a request to review.</p>
          </div>
          :(()=>{
            const st=getStatus(sel);
            return <>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:3}}>
                    <h3 style={{margin:0,color:G.white,fontSize:17,fontWeight:800}}>{sel.id}</h3>
                    <Badge status={st}/>
                  </div>
                  <p style={{margin:0,color:G.slate,fontSize:11}}>{sel.studentName} · {clsLabel(sel)} · {DEPTS[sel.dept]}</p>
                </div>
                <Btn variant="ghost" onClick={()=>printPDF(sel)} style={{fontSize:11,padding:"5px 10px"}}>⬇ PDF</Btn>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9,marginBottom:16}}>
                {[
                  {l:"Student ID",v:sel.studentId},
                  {l:"From",v:fmt(sel.fromDate)},
                  {l:"To",v:fmt(sel.toDate)},
                  {l:"Days",v:daysCount(sel.fromDate,sel.toDate)},
                ].map(i=>(
                  <Card key={i.l} style={{padding:"10px 12px"}}>
                    <div style={{fontSize:9,color:G.slate,textTransform:"uppercase",letterSpacing:.7}}>{i.l}</div>
                    <div style={{color:G.white,fontWeight:700,fontSize:12,marginTop:3}}>{i.v}</div>
                  </Card>
                ))}
              </div>

              {/* Approval trail */}
              <div style={{display:"flex",gap:9,marginBottom:16}}>
                {[
                  {label:"Advisor Decision",status:sel.advisorStatus,waitColor:G.amber,pending:!sel.advisorStatus},
                  {label:"HOD Decision",    status:sel.hodStatus,    waitColor:G.blue, pending:!sel.hodStatus&&sel.advisorStatus==="approved"},
                ].map(tr=>(
                  <Card key={tr.label} style={{flex:1,padding:"10px 13px",borderColor:tr.status==="approved"?`${G.green}44`:tr.status==="rejected"?`${G.red}44`:tr.pending?`${tr.waitColor}30`:G.glassBorder}}>
                    <div style={{fontSize:9,color:G.slate,textTransform:"uppercase",letterSpacing:.6,marginBottom:3}}>{tr.label}</div>
                    <div style={{fontWeight:700,fontSize:12,color:tr.status==="approved"?G.green:tr.status==="rejected"?G.red:tr.pending?tr.waitColor:G.dim}}>
                      {tr.status==="approved"?"✓ Approved":tr.status==="rejected"?"✗ Rejected":tr.pending?"⏳ Pending":"— Waiting"}
                    </div>
                  </Card>
                ))}
              </div>

              <Card style={{marginBottom:16}}>
                <div style={{fontSize:10,color:G.slate,textTransform:"uppercase",letterSpacing:.7,marginBottom:10}}>OD Letter</div>
                <pre style={{whiteSpace:"pre-wrap",color:G.white,fontSize:12,lineHeight:1.85,fontFamily:"'DM Mono',monospace",background:G.glass,padding:16,borderRadius:7,margin:0}}>{sel.letter}</pre>
              </Card>

              {canAct&&(
                <Card style={{borderColor:`${G.teal}38`}}>
                  <div style={{fontSize:12,color:G.white,fontWeight:700,marginBottom:isHod&&selStatus==="pending_advisor"?6:12}}>{isHod?"HOD Decision":"Advisor Decision"}</div>
                  {isHod&&selStatus==="pending_advisor"&&(
                    <div style={{marginBottom:10,background:`${G.amber}12`,border:`1px solid ${G.amber}30`,borderRadius:6,padding:"6px 10px",fontSize:10,color:G.amber}}>
                      ⚠ Advisor has not yet responded. You may reject now, or wait for advisor approval before approving.
                    </div>
                  )}
                  {!showRej
                    ?<div style={{display:"flex",gap:10}}>
                      <Btn variant="success" onClick={doApprove}
                        disabled={isHod && selStatus==="pending_advisor"}
                        style={{flex:1,padding:11}}>✓ Approve OD</Btn>
                      <Btn variant="danger" onClick={()=>setShowRej(true)} style={{flex:1,padding:11}}>✕ Reject OD</Btn>
                    </div>
                    :<>
                      <Txt label="Rejection Reason (required)" placeholder="Clear reason — shown to the student." rows={3} value={rejReason} onChange={e=>setRejReason(e.target.value)}/>
                      <div style={{display:"flex",gap:8}}>
                        <Btn variant="danger" onClick={doReject} disabled={!rejReason.trim()}>Confirm Rejection</Btn>
                        <Btn variant="ghost"  onClick={()=>setShowRej(false)}>Cancel</Btn>
                      </div>
                    </>}
                </Card>
              )}
              {isRejected(sel)&&<Card style={{borderColor:`${G.red}38`}}><div style={{color:G.red,fontWeight:700,marginBottom:5}}>❌ Rejected</div><p style={{color:G.white,margin:0,fontSize:12}}>{sel.rejectionReason||"No reason."}</p></Card>}
              {st==="approved"&&<Card style={{borderColor:`${G.green}38`}}><div style={{color:G.green,fontWeight:700}}>✓ Fully approved — OD is granted.</div></Card>}
              {!isHod&&st==="pending_hod"&&<Card style={{borderColor:`${G.blue}38`}}><div style={{color:G.blue,fontWeight:700}}>⏫ You approved — awaiting HOD.</div></Card>}
            </>;
          })()}
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [user,setUser]=useState(null);
  const [settings,setSettings]=useState(false);
  return (
    <div style={{minHeight:"100vh",background:G.navy,fontFamily:"'DM Sans',sans-serif",color:G.white}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:${G.navy}}::-webkit-scrollbar-thumb{background:${G.dim};border-radius:2px}
        input[type=date]::-webkit-calendar-picker-indicator{filter:invert(.7)}
        input::placeholder,textarea::placeholder{color:${G.slate}50}
        button:disabled{opacity:.38;cursor:not-allowed!important}
      `}</style>
      {!user
        ?<LoginPage onLogin={setUser}/>
        :<>
          <Nav user={user} onLogout={()=>setUser(null)} onSettings={()=>setSettings(true)}/>
          {settings&&<SettingsModal user={user} onClose={()=>setSettings(false)}/>}
          {user.role==="student"&&<StudentDashboard user={user}/>}
          {(user.role==="advisor"||user.role==="hod")&&<FacultyDashboard user={user}/>}
        </>}
    </div>
  );
}