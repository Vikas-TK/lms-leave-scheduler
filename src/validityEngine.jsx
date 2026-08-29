import { useState, useEffect } from "react";
import { Clock, AlertTriangle, CheckCircle2, RotateCcw, Sparkles } from "lucide-react";

/**
 * Calculates current validity and expiry status for an application.
 * @param {Object} req - The application request object
 * @returns {Object} Validity metadata
 */
export function checkValidity(req) {
  if (!req || !req.toDate) {
    return {
      isExpired: false,
      isValid: true,
      label: "Active",
      shortLabel: "Active",
      color: "#16a34a",
      bg: "#dcfce7",
      borderColor: "#86efac",
      dateStr: "—",
      formattedDate: "—",
    };
  }

  const toTime = req.toTime || "23:59";
  const timeFormatted = toTime.length === 5 ? toTime + ":00" : toTime;
  const targetEnd = new Date(`${req.toDate}T${timeFormatted}`);
  const now = new Date();

  const isExpired = !isNaN(targetEnd.getTime()) && now.getTime() > targetEnd.getTime();
  
  const formattedDate = new Date(req.toDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const formattedShort = new Date(req.toDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });

  const timeLabel = req.toTime ? ` ${req.toTime}` : "";

  if (isExpired) {
    return {
      isExpired: true,
      isValid: false,
      label: "Time Over / Expired",
      shortLabel: "Expired",
      detail: `Expired on ${formattedDate}${timeLabel}`,
      formattedDate,
      formattedShort,
      color: "#dc2626",
      bg: "#fee2e2",
      borderColor: "#fca5a5",
      glow: "rgba(220, 38, 38, 0.15)",
      icon: AlertTriangle,
    };
  }

  return {
    isExpired: false,
    isValid: true,
    label: `Active / Valid Until ${formattedDate}`,
    shortLabel: `Valid until ${formattedShort}`,
    detail: `Valid until ${formattedDate}${timeLabel}`,
    formattedDate,
    formattedShort,
    color: "#16a34a",
    bg: "#dcfce7",
    borderColor: "#86efac",
    glow: "rgba(22, 163, 74, 0.15)",
    icon: CheckCircle2,
  };
}

/**
 * Automated Validity Badge Component
 */
export function ValidityBadge({ req, compact = false, showIcon = true }) {
  const [tick, setTick] = useState(0);

  // Auto-refresh every 30 seconds to catch live transitions across the expiration boundary
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  const info = checkValidity(req);
  const Icon = info.icon;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: compact ? "3px 9px" : "5px 12px",
        borderRadius: 9999,
        background: info.bg,
        border: `1.5px solid ${info.borderColor}`,
        color: info.color,
        fontSize: compact ? 10 : 11,
        fontWeight: 700,
        letterSpacing: "0.2px",
        whiteSpace: "nowrap",
        boxShadow: `0 2px 8px ${info.glow}`,
        transition: "all 0.22s ease",
      }}
      title={info.detail}
    >
      {/* Status dot */}
      <span
        style={{
          width: compact ? 5 : 6,
          height: compact ? 5 : 6,
          borderRadius: "50%",
          background: info.color,
          boxShadow: `0 0 6px ${info.color}`,
          display: "inline-block",
        }}
      />
      {showIcon && Icon && <Icon size={compact ? 11 : 12} strokeWidth={2.5} />}
      <span>{compact ? info.shortLabel : info.label}</span>
    </span>
  );
}

/**
 * 1-Click Renewal Action Button
 */
export function RenewButton({ onClick, compact = false, label = "Renew / Reuse Letter", style = {} }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: compact ? "6px 12px" : "9px 16px",
        borderRadius: 9999,
        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        border: "1px solid #059669",
        color: "#ffffff",
        fontSize: compact ? 11 : 12,
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
        fontFamily: "'Inter', sans-serif",
        boxShadow: "0 4px 14px rgba(16, 185, 129, 0.28)",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(16, 185, 129, 0.38)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow = "0 4px 14px rgba(16, 185, 129, 0.28)";
      }}
    >
      <RotateCcw size={compact ? 12 : 13} strokeWidth={2.5} />
      <span>{label}</span>
    </button>
  );
}
