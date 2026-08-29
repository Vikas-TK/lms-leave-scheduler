import { useRef, useState } from "react";
import {
  X, Download, Image as ImageIcon, Send, CheckCircle2,
  Printer, FileText, Sparkles, Building2, ShieldCheck, Edit3, ZoomIn, ZoomOut
} from "lucide-react";
import html2canvas from "html2canvas";

const DEPTS = {
  CS: "Computer Science & Engineering",
  IT: "Information Technology",
  AIDS: "Artificial Intelligence & Data Science",
  AIML: "Artificial Intelligence & Machine Learning",
  CY: "Cyber Security & Information Assurance",
  MECH: "Mechanical Engineering",
  CIVIL: "Civil Engineering",
  BME: "Biomedical Engineering",
  EEE: "Electrical & Electronics Engineering",
  ECE: "Electronics & Communication Engineering",
};

// Clean asterisks (stars) and markdown formatting
function sanitizeLetter(text) {
  if (!text) return "";
  let t = text;
  // Remove markdown headers
  t = t.replace(/^#+\s*/gm, "");
  // Remove markdown horizontal rules
  t = t.replace(/^\s*[-_]{3,}\s*$/gm, "");
  // Remove all asterisks (stars)
  t = t.replace(/\*/g, "");
  // Remove duplicate top letterhead if AI included one before 'To'
  const toIdx = t.search(/\bTo\b/i);
  if (toIdx > 0 && toIdx < 160) {
    t = t.slice(toIdx);
  }
  return t.trim();
}

export default function LetterPreviewModal({
  user,
  letter,
  reason,
  fromDate,
  toDate,
  coApplicants = [],
  reqType = "od",
  onClose,
  onSendToAdvisor,
  onEditAgain,
}) {
  const paperRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [downloadingImg, setDownloadingImg] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const deptFull = DEPTS[user.dept] || user.dept || "Department of Engineering";
  const studentName = (user.name || user.id || "Student Name").replace(/\*/g, "");
  const rollNo = (user.rollNo || user.id || "ROLL001").replace(/\*/g, "");
  const cleanBody = sanitizeLetter(letter);

  const todayFormatted = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Download Full Document as Image (.PNG) with ZERO truncation
  const handleDownloadImage = async () => {
    if (!paperRef.current) return;
    setDownloadingImg(true);
    try {
      const el = paperRef.current;

      // Scroll container to top
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }

      // Capture exact scroll dimensions
      const fullHeight = Math.max(el.scrollHeight, el.offsetHeight, 900);
      const fullWidth = Math.max(el.scrollWidth, el.offsetWidth, 780);

      const canvas = await html2canvas(el, {
        scale: 2, // 300dpi Retina crisp quality
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: fullWidth,
        height: fullHeight,
        windowWidth: fullWidth + 100,
        windowHeight: fullHeight + 200,
        scrollY: 0,
        scrollX: 0,
        x: 0,
        y: 0,
        onclone: (clonedDoc) => {
          const clonedEl = clonedDoc.getElementById("od-letter-paper-preview");
          if (clonedEl) {
            clonedEl.style.height = "auto";
            clonedEl.style.maxHeight = "none";
            clonedEl.style.overflow = "visible";
            clonedEl.style.transform = "none";
            clonedEl.style.position = "static";
            clonedEl.style.margin = "0";
            clonedEl.style.boxShadow = "none";
          }
          // Ensure ancestor containers in clone are unrestricted
          const allDivs = clonedDoc.querySelectorAll("div");
          allDivs.forEach((d) => {
            if (d.style && (d.style.overflow === "auto" || d.style.overflow === "hidden" || d.style.overflowY === "auto")) {
              d.style.overflow = "visible";
              d.style.maxHeight = "none";
            }
          });
        },
      });

      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imgData;
      link.download = `OD_Letter_${rollNo}_${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Image generation error:", err);
      alert("Failed to export image: " + (err?.message || "Unknown error"));
    } finally {
      setDownloadingImg(false);
    }
  };

  // Download / Print Full Document as PDF
  const handleDownloadPDF = () => {
    setDownloadingPdf(true);
    const win = window.open("", "_blank");
    if (!win) {
      alert("Please allow popups to open the print/PDF dialog.");
      setDownloadingPdf(false);
      return;
    }

    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>OD_Letter_${rollNo}</title>
          <meta charset="utf-8"/>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Playfair+Display:ital,wght@1,600&family=Inter:wght@400;500;600;700;800&family=EB+Garamond:wght@400;500;600;700&display=swap');
            @page {
              size: A4 portrait;
              margin: 14mm 16mm;
            }
            body {
              font-family: 'EB Garamond', Georgia, serif;
              color: #0f172a;
              background: #fff;
              margin: 0;
              padding: 0;
              font-size: 13.5pt;
              line-height: 1.65;
            }
            .header-table {
              width: 100%;
              border-bottom: 2.5px solid #064e3b;
              padding-bottom: 12px;
              margin-bottom: 16px;
              text-align: center;
            }
            .college-title {
              font-family: 'Cinzel', Georgia, serif;
              font-size: 16pt;
              font-weight: 800;
              color: #064e3b;
              text-transform: uppercase;
              letter-spacing: 1.2px;
              margin: 0;
            }
            .sub-title {
              font-family: 'Inter', sans-serif;
              font-size: 8.5pt;
              color: #4b5563;
              margin: 3px 0 0;
              font-weight: 700;
              letter-spacing: 0.5px;
              text-transform: uppercase;
            }
            .dept-banner {
              font-family: 'Inter', sans-serif;
              font-size: 9.5pt;
              font-weight: 800;
              color: #065f46;
              margin: 4px 0 0;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .meta-bar {
              display: flex;
              justify-content: space-between;
              font-family: 'Inter', sans-serif;
              font-size: 9pt;
              color: #475569;
              font-weight: 600;
              margin-bottom: 18px;
              border-bottom: 1px dashed #cbd5e1;
              padding-bottom: 8px;
            }
            .letter-content {
              white-space: pre-wrap;
              font-size: 13pt;
              line-height: 1.7;
              text-align: justify;
              color: #0f172a;
            }
            .co-app-box {
              margin-top: 14px;
              padding: 8px 12px;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              font-family: 'Inter', sans-serif;
              font-size: 9pt;
            }
            .footer-stamps {
              margin-top: 36px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              page-break-inside: avoid;
            }
            .stamp-box {
              text-align: center;
              width: 180px;
              font-family: 'Inter', sans-serif;
            }
            .stamp-seal {
              border: 1.5px dashed #059669;
              border-radius: 8px;
              padding: 6px 8px;
              color: #065f46;
              font-size: 8pt;
              font-weight: 800;
              text-transform: uppercase;
              margin-bottom: 6px;
              background: #f0fdf4;
            }
            .sign-line {
              font-size: 9pt;
              font-weight: 700;
              color: #1e293b;
              border-top: 1.5px solid #94a3b8;
              padding-top: 4px;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="header-table">
            <h1 class="college-title">INSTITUTION OF ENGINEERING & TECHNOLOGY</h1>
            <div class="sub-title">AUTONOMOUS INSTITUTION · APPROVED BY AICTE · AFFILIATED TO UNIVERSITY</div>
            <div class="dept-banner">${deptFull}</div>
          </div>
          <div class="meta-bar">
            <span>Ref: <strong>OD-REQ/${new Date().getFullYear()}/${rollNo}</strong></span>
            <span>Date: <strong>${todayFormatted}</strong></span>
          </div>
          <div class="letter-content">${cleanBody}</div>
          ${
            coApplicants && coApplicants.length > 0
              ? `<div class="co-app-box"><strong>Group Team Members / Co-Applicants:</strong> ${coApplicants.join(", ")}</div>`
              : ""
          }
          <div class="footer-stamps">
            <div class="stamp-box">
              <div style="height:35px;font-family:'Playfair Display',cursive;font-style:italic;font-size:14pt;color:#1e293b">${studentName}</div>
              <div class="sign-line">${studentName}<br/><span style="font-size:7.5pt;color:#64748b;font-weight:500">${rollNo} · ${user.dept}${user.year}${user.section}</span></div>
            </div>
            <div class="stamp-box">
              <div class="stamp-seal">⏳ Pending Review<br/><span style="font-size:7pt;font-weight:500">Class Advisor Verification</span></div>
              <div class="sign-line">Class Advisor</div>
            </div>
            <div class="stamp-box">
              <div class="stamp-seal" style="border-color:#2563eb;color:#1d4ed8;background:#eff6ff">🏛️ Department Seal<br/><span style="font-size:7pt;font-weight:500">Head of Department</span></div>
              <div class="sign-line">Head of Department</div>
            </div>
          </div>
        </body>
      </html>
    `);
    win.document.close();
    setTimeout(() => {
      win.focus();
      win.print();
      setDownloadingPdf(false);
    }, 500);
  };

  const handleSend = () => {
    setSentSuccess(true);
    setTimeout(() => {
      if (onSendToAdvisor) onSendToAdvisor();
    }, 800);
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 1000,
      background: "rgba(15, 23, 42, 0.75)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
      overflowY: "auto",
    }}>
      <div className="letter-modal-dialog" style={{
        background: "#ffffff",
        borderRadius: 28,
        width: "100%",
        maxWidth: 960,
        height: "92vh",
        maxHeight: 900,
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 25px 60px rgba(0, 0, 0, 0.3)",
        border: "1.5px solid #e2e8f0",
        overflow: "hidden",
        animation: "si-scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}>
        {/* Modal Top Action Bar */}
        <div style={{
          padding: "14px 24px",
          background: "#f8fafc",
          borderBottom: "1.5px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12, background: "#dcfce7",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#16a34a", flexShrink: 0,
            }}>
              <FileText size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: "#0f172a" }}>
                Official OD Letter Preview
              </h3>
              <p style={{ margin: 0, fontSize: 11, color: "#64748b", fontWeight: 600 }}>
                Clean institutional letter with full formatting & instant export
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {onEditAgain && (
              <button
                onClick={onEditAgain}
                style={{
                  background: "#ffffff",
                  border: "1.5px solid #cbd5e1",
                  borderRadius: 9999,
                  padding: "8px 14px",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#334155",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Edit3 size={14} /> Edit Text
              </button>
            )}

            <button
              onClick={handleDownloadImage}
              disabled={downloadingImg}
              style={{
                background: "#ffffff",
                border: "1.5px solid #86efac",
                borderRadius: 9999,
                padding: "8px 14px",
                fontSize: 12,
                fontWeight: 700,
                color: "#16a34a",
                cursor: downloadingImg ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 2px 6px rgba(22,163,74,0.1)",
              }}
              title="Download entire full letter as clean PNG image"
            >
              <ImageIcon size={14} color="#16a34a" />
              {downloadingImg ? "Exporting Full PNG..." : "Download PNG"}
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={downloadingPdf}
              style={{
                background: "#ffffff",
                border: "1.5px solid #bfdbfe",
                borderRadius: 9999,
                padding: "8px 14px",
                fontSize: 12,
                fontWeight: 700,
                color: "#2563eb",
                cursor: downloadingPdf ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 2px 6px rgba(37,99,235,0.1)",
              }}
              title="Download entire full letter as printable PDF"
            >
              <Printer size={14} color="#2563eb" />
              {downloadingPdf ? "Opening..." : "Download PDF"}
            </button>

            <button
              onClick={onClose}
              style={{
                background: "#f1f5f9",
                border: "none",
                width: 36, height: 36,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#64748b",
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Letter Document Viewer */}
        <div
          ref={scrollContainerRef}
          className="letter-preview-scroll-container"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "28px 24px",
            background: "#f1f5f9",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* ── Official Institutional Document Paper Canvas ───────── */}
          <div
            ref={paperRef}
            id="od-letter-paper-preview"
            style={{
              width: "100%",
              maxWidth: 780,
              background: "#ffffff",
              borderRadius: 16,
              padding: "44px 50px",
              boxShadow: "0 10px 35px rgba(0, 0, 0, 0.08)",
              border: "1px solid #e2e8f0",
              fontFamily: "'EB Garamond', Georgia, serif",
              color: "#0f172a",
              position: "relative",
              margin: "0 auto 30px auto",
              boxSizing: "border-box",
            }}
          >
            {/* Official Letterhead */}
            <div style={{
              borderBottom: "2.5px solid #064e3b",
              paddingBottom: 16,
              marginBottom: 20,
              textAlign: "center",
            }}>
              <div style={{
                fontSize: 18,
                fontWeight: 800,
                color: "#064e3b",
                letterSpacing: "1.2px",
                textTransform: "uppercase",
                fontFamily: "'Cinzel', Georgia, serif",
              }}>
                INSTITUTION OF ENGINEERING & TECHNOLOGY
              </div>
              <div style={{
                fontSize: 10,
                color: "#64748b",
                fontWeight: 700,
                letterSpacing: "0.8px",
                marginTop: 3,
                fontFamily: "'Inter', sans-serif",
                textTransform: "uppercase",
              }}>
                Autonomous Institution · Approved by AICTE · Affiliated to University
              </div>
              <div style={{
                fontSize: 12,
                fontWeight: 800,
                color: "#065f46",
                marginTop: 6,
                fontFamily: "'Inter', sans-serif",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>
                {deptFull}
              </div>
            </div>

            {/* Reference & Date Meta Bar */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 11,
              fontFamily: "'Inter', sans-serif",
              color: "#475569",
              fontWeight: 600,
              marginBottom: 22,
              borderBottom: "1px dashed #cbd5e1",
              paddingBottom: 10,
            }}>
              <span>Ref: <strong style={{ color: "#0f172a" }}>OD-REQ/{new Date().getFullYear()}/{rollNo}</strong></span>
              <span>Date: <strong style={{ color: "#0f172a" }}>{todayFormatted}</strong></span>
            </div>

            {/* Clean Letter Body without raw stars */}
            <div style={{
              fontSize: 15,
              lineHeight: 1.85,
              whiteSpace: "pre-wrap",
              color: "#0f172a",
              textAlign: "justify",
              minHeight: 280,
            }}>
              {cleanBody}
            </div>

            {/* Group Members Tag if any */}
            {coApplicants && coApplicants.length > 0 && (
              <div style={{
                marginTop: 22,
                padding: "10px 14px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
              }}>
                <strong style={{ color: "#0f172a" }}>Group Team Members / Co-Applicants:</strong>{" "}
                <span style={{ color: "#059669", fontWeight: 700 }}>{coApplicants.join(", ")}</span>
              </div>
            )}

            {/* Institutional Signatures & Verification Seals */}
            <div style={{
              marginTop: 45,
              paddingTop: 16,
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
              alignItems: "flex-end",
              fontFamily: "'Inter', sans-serif",
            }}>
              {/* Student Signature */}
              <div style={{ textAlign: "center" }}>
                <div style={{ height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: "'Playfair Display', cursive", fontStyle: "italic", fontSize: 16, color: "#1e293b" }}>
                    {studentName}
                  </span>
                </div>
                <div style={{ borderTop: "1.5px solid #64748b", paddingTop: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#0f172a" }}>{studentName}</div>
                  <div style={{ fontSize: 10, color: "#64748b" }}>{rollNo} · {user.dept}{user.year}{user.section}</div>
                  <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 600 }}>Applicant Signature</div>
                </div>
              </div>

              {/* Class Advisor Stamp */}
              <div style={{ textAlign: "center" }}>
                <div style={{
                  border: "1.5px dashed #059669",
                  borderRadius: 10,
                  padding: "6px 10px",
                  background: "#f0fdf4",
                  marginBottom: 8,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 900, color: "#065f46", textTransform: "uppercase" }}>
                    ⏳ Pending Review
                  </div>
                  <div style={{ fontSize: 8, color: "#059669", fontWeight: 600 }}>
                    Class Advisor Verification
                  </div>
                </div>
                <div style={{ borderTop: "1.5px solid #cbd5e1", paddingTop: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>Class Advisor</div>
                  <div style={{ fontSize: 9, color: "#94a3b8" }}>Verification & Routing</div>
                </div>
              </div>

              {/* HOD Stamp */}
              <div style={{ textAlign: "center" }}>
                <div style={{
                  border: "1.5px dashed #2563eb",
                  borderRadius: 10,
                  padding: "6px 10px",
                  background: "#eff6ff",
                  marginBottom: 8,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 900, color: "#1d4ed8", textTransform: "uppercase" }}>
                    🏛️ Department Seal
                  </div>
                  <div style={{ fontSize: 8, color: "#2563eb", fontWeight: 600 }}>
                    Head of Department
                  </div>
                </div>
                <div style={{ borderTop: "1.5px solid #cbd5e1", paddingTop: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>Head of Dept (HOD)</div>
                  <div style={{ fontSize: 9, color: "#94a3b8" }}>Final Sanctioning Authority</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Confirmation Bar */}
        <div style={{
          padding: "14px 24px",
          background: "#ffffff",
          borderTop: "1.5px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          flexShrink: 0,
        }}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
            {sentSuccess ? (
              <span style={{ color: "#16a34a", fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
                <CheckCircle2 size={16} /> OD Letter submitted! Routing to Class Advisor...
              </span>
            ) : (
              <span>Ready to submit? The letter will be routed to your Class Advisor immediately.</span>
            )}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onClose}
              style={{
                background: "#ffffff",
                border: "1.5px solid #e2e8f0",
                borderRadius: 9999,
                padding: "10px 20px",
                fontSize: 13,
                fontWeight: 700,
                color: "#64748b",
                cursor: "pointer",
              }}
            >
              Back
            </button>

            {onSendToAdvisor && (
              <button
                onClick={handleSend}
                disabled={sentSuccess}
                style={{
                  background: "linear-gradient(135deg, #16a34a, #059669)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 9999,
                  padding: "10px 26px",
                  fontSize: 13,
                  fontWeight: 900,
                  cursor: sentSuccess ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 16px rgba(22, 163, 74, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
                onMouseEnter={(e) => { if (!sentSuccess) e.currentTarget.style.transform = "translateY(-1px) scale(1.02)"; }}
                onMouseLeave={(e) => { if (!sentSuccess) e.currentTarget.style.transform = "translateY(0) scale(1)"; }}
              >
                <Send size={15} /> {sentSuccess ? "Submitted!" : "Send to Advisor"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
