import { useState, useRef, useCallback, useEffect } from "react";
import {
  ArrowLeft, FileText, Clock, Users, Paperclip, User,
  Plus, X, AlertCircle, CheckCircle2, ChevronRight,
  CalendarDays, Timer, BookOpen, DoorOpen, Plane,
  Sparkles, Send, RotateCcw, Lock, Info, Eye, Download, Image as ImageIcon, Printer
} from "lucide-react";
import LetterPreviewModal from "./LetterPreviewModal.jsx";

const DEPTS = {
  CS:"Computer Science", IT:"Information Technology",
  AIDS:"AI & Data Science", AIML:"AI & Machine Learning",
  CY:"Cyber Security", MECH:"Mechanical Engineering",
  CIVIL:"Civil Engineering", BME:"Biomedical Engineering",
  EEE:"Electrical & Electronics", ECE:"Electronics & Communication",
};

const REQ_TYPES = [
  { key:"od",       label:"OD Request",   shortLabel:"OD",        icon:BookOpen,  color:"#16a34a", bg:"#dcfce7", border:"#86efac", desc:"On-Duty leave for external events, competitions, or academic activities.", hostelerOnly:false },
  { key:"gatepass", label:"Gate Pass",    shortLabel:"Gate Pass", icon:DoorOpen,  color:"#16a34a", bg:"#dcfce7", border:"#86efac", desc:"Permission to exit campus during college hours.",                          hostelerOnly:true  },
  { key:"leave",    label:"Leave Letter", shortLabel:"Leave",     icon:Plane,     color:"#16a34a", bg:"#dcfce7", border:"#86efac", desc:"Medical, personal, or emergency leave from college.",                      hostelerOnly:true  },
  { key:"apology",  label:"Apology Letter", shortLabel:"Apology", icon:AlertCircle, color:"#16a34a", bg:"#dcfce7", border:"#86efac", desc:"Official apology letter for misconduct or academic issues.",             hostelerOnly:false },
];

const todayStr = () => new Date().toISOString().split("T")[0];

function calcDuration(fromDate, toDate) {
  if (!fromDate || !toDate) return null;
  const start = new Date(fromDate);
  const end   = new Date(toDate);
  const diffMs = end - start;
  if (diffMs < 0) return { error:true, text:"End must be on or after start" };
  const days  = Math.floor(diffMs / 86400000) + 1; // inclusive
  return { days, text: days + " Day" + (days !== 1 ? "s" : "") };
}

export default function NewApplication({ user, initialData, onBack, onSubmit, genLetter }) {
  const isHosteller = user.loginRole === "hosteller";

  const draftKey = `draft_application_${user.id}`;
  let draft = null;
  try { draft = !initialData && typeof localStorage !== "undefined" ? JSON.parse(localStorage.getItem(draftKey) || "null") : null; } catch (_) {}

  const [step, setStep] = useState(draft?.step || 1);
  const [reqType, setReqType] = useState(initialData?.requestType || draft?.reqType || "od");
  const [fromDate, setFromDate] = useState(initialData?.fromDate || draft?.fromDate || todayStr());
  const [toDate, setToDate] = useState(initialData?.toDate || draft?.toDate || todayStr());
  const [reason, setReason] = useState(initialData?.reason || draft?.reason || "");
  const [coApplicants, setCoApplicants] = useState(initialData?.coApplicants || draft?.coApplicants || []);
  const [coInput, setCoInput] = useState("");
  const [attachment, setAttachment] = useState(initialData?.attachmentName ? { name: initialData.attachmentName } : null);

  const [letter, setLetter] = useState(initialData?.letter || draft?.letter || "");
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData || typeof localStorage === "undefined") return;
    try { localStorage.setItem(draftKey, JSON.stringify({ step, reqType, fromDate, toDate, reason, coApplicants, letter })); } catch (_) {}
  }, [step, reqType, fromDate, toDate, reason, coApplicants, letter, initialData, draftKey]);

  const duration = (reqType === "od" || reqType === "leave") ? calcDuration(fromDate, toDate) : null;

  const addCoApplicant = () => {
    const v = coInput.trim().toUpperCase();
    if (!v) return;
    if (coApplicants.includes(v)) { setCoInput(""); return; }
    setCoApplicants(p => [...p, v]);
    setCoInput("");
  };

  const removeCoApplicant = (id) => {
    setCoApplicants(p => p.filter(x => x !== id));
  };

  const handleGenerateAI = async () => {
    if (!reason.trim()) { setError("Please provide a reason before generating letter."); return; }
    setError("");
    setGenerating(true);
    try {
      const txt = await genLetter({
        studentName: (user.name || user.id).replace(/\*/g, ""),
        rollNo: (user.rollNo || user.id).replace(/\*/g, ""),
        dept: user.dept,
        year: user.year,
        section: user.section,
        fromDate,
        toDate,
        reason: reason.replace(/\*/g, ""),
        reqType,
      });
      const cleanTxt = (txt || "").replace(/\*/g, "").trim();
      setLetter(cleanTxt);
    } catch (e) {
      setError("AI generation failed: " + e.message);
    } finally {
      setGenerating(false);
    }
  };

  const [isForwardedMode, setIsForwardedMode] = useState(false);

  const handleSubmit = (autoForward = false) => {
    if (!reason.trim()) { setError("Please fill in the reason / event details."); return; }
    if (!letter.trim()) { setError("Please generate or write the application letter."); return; }
    setError("");
    setIsForwardedMode(autoForward);
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      try { if (typeof localStorage !== "undefined") localStorage.removeItem(draftKey); } catch (_) {}
      onSubmit({
        requestType: reqType,
        fromDate,
        toDate: (reqType === "od" || reqType === "leave") ? toDate : fromDate,
        reason,
        coApplicants,
        attachmentName: attachment?.name || null,
        letter,
        autoForward,
      });
    }, 800);
  };

  const handleOpenPreview = () => {
    if (!reason.trim()) { setError("Please provide an event reason first."); return; }
    if (!letter.trim()) { setError("Please generate or write the OD letter first."); return; }
    setError("");
    setPreviewOpen(true);
  };

  if (submitted) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "60px 20px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", background: "#dcfce7", padding: "24px", borderRadius: "50%", marginBottom: 24, boxShadow: "0 10px 30px rgba(22,163,74,0.2)" }}>
          <CheckCircle2 size={64} color="#16a34a" />
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", marginBottom: 12 }}>
          {isForwardedMode ? "Application Forwarded to Advisor!" : "Draft Saved Successfully!"}
        </h2>
        <p style={{ color: "#64748b", fontSize: 16, maxWidth: 440, margin: "0 auto", lineHeight: 1.6 }}>
          {isForwardedMode
            ? "Your application has been published and sent to your Class Advisor for review. Returning to dashboard..."
            : "Your application has been generated and saved to your dashboard as a draft. Taking you there now..."}
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Official Paper Preview Modal */}
      {previewOpen && (
        <LetterPreviewModal
          user={user}
          letter={letter}
          reason={reason}
          fromDate={fromDate}
          toDate={toDate}
          coApplicants={coApplicants}
          reqType={reqType}
          onClose={() => setPreviewOpen(false)}
          onEditAgain={() => setPreviewOpen(false)}
          onSendToAdvisor={() => {
            setPreviewOpen(false);
            handleSubmit(true);
          }}
        />
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={onBack}
            style={{
              background: "#ffffff", border: "1.5px solid #e2e8f0", width: 40, height: 40,
              borderRadius: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <ArrowLeft size={18} color="#0f172a" />
          </button>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#0f172a" }}>
              {initialData ? `Renew / Reuse Letter #${initialData.id}` : "Letter Requisition"}
            </h2>
            <p style={{ margin: 0, color: "#64748b", fontSize: 12, fontWeight: 600 }}>
              Step {step} of 3
            </p>
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <div style={{
        background: "#ffffff",
        borderRadius: 28,
        padding: "30px 32px",
        boxShadow: "0 12px 40px rgba(15,23,42,0.05)",
        border: "1.5px solid #e2e8f0",
        display: "flex", flexDirection: "column", gap: 22,
      }}>
        {/* Phase 1: Request Type Selector */}
        {step === 1 && (
          <div style={{ animation: "dropdownIn 0.3s ease" }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#0f172a", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Phase 1: Select Request Type
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {REQ_TYPES.map(t => {
                const active = reqType === t.key;
                const disabled = t.hostelerOnly && !isHosteller;
                return (
                  <div
                    key={t.key}
                    onClick={() => { if (!disabled) { setReqType(t.key); } }}
                    style={{
                      border: `1.5px solid ${active ? t.color : "#e2e8f0"}`,
                      background: active ? t.bg : disabled ? "#f8fafc" : "#ffffff",
                      borderRadius: 18,
                      padding: "16px 14px",
                      cursor: disabled ? "not-allowed" : "pointer",
                      opacity: disabled ? 0.45 : 1,
                      transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      display: "flex", flexDirection: "column", gap: 6,
                    }}
                    onMouseEnter={e => { if (!disabled && !active) e.currentTarget.style.borderColor = t.color; }}
                    onMouseLeave={e => { if (!disabled && !active) e.currentTarget.style.borderColor = "#e2e8f0"; }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 800, fontSize: 14, color: active ? t.color : "#0f172a" }}>{t.shortLabel}</span>
                      </div>
                      {active && <CheckCircle2 size={16} color={t.color} />}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
              <button onClick={() => setStep(2)} style={{ padding: "10px 24px", borderRadius: 9999, background: "#0f172a", color: "#fff", border: "none", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>Next <ChevronRight size={16} /></button>
            </div>
          </div>
        )}

        {/* Phase 2: Date & Time Selectors */}
        {step === 2 && (
          <div style={{ animation: "dropdownIn 0.3s ease" }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#0f172a", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Phase 2: Dates
            </label>
            <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 22, padding: "18px 20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: (reqType === "od" || reqType === "leave") ? "1fr 1fr" : "1fr", gap: 20 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>
                    {(reqType === "od" || reqType === "leave") ? "From Date" : "Date"}
                  </label>
                  <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                    <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={{ flex: 1, padding: "10px", borderRadius: 12, border: "1px solid #cbd5e1", fontSize: 13, background: "#fff", outline: "none" }} />
                  </div>
                </div>
                {(reqType === "od" || reqType === "leave") && (
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>
                      To Date
                    </label>
                    <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                      <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={{ flex: 1, padding: "10px", borderRadius: 12, border: "1px solid #cbd5e1", fontSize: 13, background: "#fff", outline: "none" }} />
                    </div>
                  </div>
                )}
              </div>
              {duration && (
                <div style={{ marginTop: 12, fontSize: 12, fontWeight: 700, color: duration.error ? "#dc2626" : "#16a34a" }}>
                  Total Duration: {duration.text}
                </div>
              )}
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
              <button onClick={() => setStep(1)} style={{ padding: "10px 20px", borderRadius: 9999, background: "#f1f5f9", color: "#64748b", border: "1.5px solid #e2e8f0", fontWeight: 800, cursor: "pointer" }}>Back</button>
              <button onClick={() => { if (duration?.error) return; setStep(3); }} style={{ padding: "10px 24px", borderRadius: 9999, background: "#0f172a", color: "#fff", border: "none", fontWeight: 800, cursor: duration?.error ? "not-allowed" : "pointer", opacity: duration?.error ? 0.5 : 1, display: "flex", alignItems: "center", gap: 8 }}>Next <ChevronRight size={16} /></button>
            </div>
          </div>
        )}

        {/* Phase 3: Reason, Co-Applicants & Letter */}
        {step === 3 && (
          <div style={{ animation: "dropdownIn 0.3s ease", display: "flex", flexDirection: "column", gap: 22 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Phase 3: Event / Activity Reason
                </label>
                <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 700 }}>⚡ Powered by Groq AI</span>
              </div>
              <textarea
                placeholder="e.g. Smart India Hackathon 2026 Grand Finale at MIT World Peace University — autonomous robotics presentation..."
                value={reason}
                onChange={e => setReason(e.target.value)}
                style={{
                  width: "100%", minHeight: 90, background: "#f8fafc", border: "1.5px solid #e2e8f0",
                  borderRadius: 18, padding: "14px 16px", fontSize: 13, color: "#0f172a", outline: "none",
                }}
              />
            </div>

            {/* Co-Applicants */}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#0f172a", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Group Team Members / Co-Applicants (Optional)
              </label>
              <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <input
                  placeholder="e.g. STCS1A002"
                  value={coInput}
                  onChange={e => setCoInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addCoApplicant()}
                  style={{ flex: 1, background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "10px 14px", fontSize: 13 }}
                />
                <button
                  type="button" onClick={addCoApplicant}
                  style={{ background: "#f1f5f9", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "10px 18px", fontWeight: 800, color: "#0f172a", cursor: "pointer" }}
                >
                  + Add
                </button>
              </div>
              {coApplicants.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {coApplicants.map(id => (
                    <span key={id} style={{ background: "#dcfce7", border: "1.5px solid #86efac", color: "#16a34a", padding: "4px 12px", borderRadius: 9999, fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
                      {id}
                      <button onClick={() => removeCoApplicant(id)} style={{ background: "none", border: "none", color: "#16a34a", cursor: "pointer", padding: 0 }}>✕</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* AI Letter Generator Section with Groq AI & Direct Live Editor */}
            <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 24, padding: 22 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Sparkles size={18} color="#16a34a" />
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 900, color: "#0f172a" }}>AI Formal Letter Drafter</span>
                    <span style={{ marginLeft: 8, fontSize: 10, background: "#16a34a", color: "#fff", padding: "2px 8px", borderRadius: 9999, fontWeight: 800 }}>
                      ⚡ GROQ AI
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {letter.trim() && (
                    <button
                      type="button"
                      onClick={handleOpenPreview}
                      style={{
                        background: "#ffffff",
                        border: "1.5px solid #86efac",
                        borderRadius: 9999,
                        padding: "7px 16px",
                        fontSize: 12,
                        fontWeight: 800,
                        color: "#16a34a",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        boxShadow: "0 2px 8px rgba(22, 163, 74, 0.15)",
                      }}
                    >
                      <Eye size={14} /> Preview Paper Document
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleGenerateAI} disabled={generating}
                    style={{
                      background: "linear-gradient(135deg, #16a34a, #059669)",
                      color: "#fff", border: "none", borderRadius: 9999, padding: "8px 18px",
                      fontSize: 12, fontWeight: 800, cursor: generating ? "not-allowed" : "pointer",
                      boxShadow: "0 4px 14px rgba(22, 163, 74, 0.35)",
                      display: "flex", alignItems: "center", gap: 6,
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={e => { if (!generating) e.currentTarget.style.transform = "translateY(-1px) scale(1.02)"; }}
                    onMouseLeave={e => { if (!generating) e.currentTarget.style.transform = "translateY(0) scale(1)"; }}
                  >
                    <Sparkles size={14} /> {generating ? "⚡ Drafting with Groq AI..." : "⚡ Generate Letter with Groq"}
                  </button>
                </div>
              </div>

              <div style={{ position: "relative" }}>
                <textarea
                  placeholder="Enter event details above and click '⚡ Generate Letter with Groq'. You can freely edit or customize the text below anytime before submitting..."
                  value={letter}
                  onChange={e => setLetter(e.target.value)}
                  style={{
                    width: "100%", minHeight: 220, background: "#ffffff", border: "1.5px solid #bbf7d0",
                    borderRadius: 18, padding: "16px", fontSize: 13, color: "#0f172a", lineHeight: 1.8,
                    fontFamily: "'Inter', sans-serif", outline: "none",
                  }}
                />
                {letter.trim() && (
                  <div style={{
                    position: "absolute", bottom: 12, right: 14,
                    fontSize: 10, color: "#16a34a", fontWeight: 700, background: "#dcfce7",
                    padding: "2px 8px", borderRadius: 9999, border: "1px solid #86efac",
                  }}>
                    ✓ Editable text ({letter.length} chars)
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 14, padding: "12px 16px", color: "#dc2626", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {/* Submit & Preview Bar */}
            <div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setStep(2)} style={{ padding: "10px 20px", borderRadius: 9999, background: "#f1f5f9", color: "#64748b", border: "1.5px solid #e2e8f0", fontWeight: 800, cursor: "pointer" }}>Back</button>
              </div>

              <div style={{ display: "flex", gap: 12, flex: 1, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={handleOpenPreview}
                  disabled={!letter.trim()}
                  style={{
                    padding: "14px 22px", borderRadius: 9999,
                    background: "#ffffff", border: "1.5px solid #86efac", color: "#16a34a",
                    fontSize: 14, fontWeight: 800, cursor: !letter.trim() ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", gap: 8,
                    boxShadow: "0 2px 10px rgba(22, 163, 74, 0.12)",
                  }}
                >
                  <Eye size={16} /> Preview & Download
                </button>

                <button
                  type="button"
                  onClick={() => handleSubmit(false)} disabled={submitting}
                  style={{
                    padding: "14px 20px", borderRadius: 9999,
                    background: "#f8fafc", border: "1.5px solid #cbd5e1",
                    color: "#475569", fontSize: 13, fontWeight: 800,
                    cursor: submitting ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", gap: 6,
                  }}
                >
                  <Send size={15} /> {submitting ? "Saving..." : "Save as Draft"}
                </button>

                <button
                  type="button"
                  onClick={() => handleSubmit(true)} disabled={submitting}
                  style={{
                    padding: "14px 24px", borderRadius: 9999,
                    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                    color: "#fff", border: "none", fontSize: 14, fontWeight: 900,
                    cursor: submitting ? "not-allowed" : "pointer",
                    boxShadow: "0 6px 20px rgba(37, 99, 235, 0.35)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}
                >
                  <Sparkles size={16} /> {submitting ? "Sending..." : "Send to Advisor"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}