import { useState } from "react";
import { colors, fonts } from "../styles";

export default function ExpandableSection({ title, subtitle, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={{ marginBottom: 16 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", background: colors.card, border: `1px solid ${colors.border}`,
          borderRadius: open ? "12px 12px 0 0" : 12, padding: "18px 24px",
          cursor: "pointer", display: "flex", alignItems: "center",
          justifyContent: "space-between", color: colors.textPrimary,
          transition: "border-radius 0.2s",
        }}
      >
        <div>
          <div style={{ fontFamily: fonts.sans, fontSize: 15, fontWeight: 600, textAlign: "left" }}>{title}</div>
          {subtitle && (
            <div style={{ fontFamily: fonts.sans, fontSize: 12, color: colors.textMuted, marginTop: 4, textAlign: "left" }}>{subtitle}</div>
          )}
        </div>
        <span style={{
          fontFamily: fonts.mono, fontSize: 14, color: colors.textMuted,
          transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)",
          flexShrink: 0, marginLeft: 16,
        }}>▼</span>
      </button>
      {open && (
        <div style={{
          background: colors.card, border: `1px solid ${colors.border}`, borderTop: "none",
          borderRadius: "0 0 12px 12px", padding: 24,
        }}>
          {children}
        </div>
      )}
    </div>
  );
}
