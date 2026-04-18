import { colors, fonts } from "../styles";

function StatusBadge({ ok }) {
  return (
    <span style={{
      fontFamily: fonts.mono, fontSize: 10, fontWeight: 600,
      padding: "3px 10px", borderRadius: 12,
      background: ok ? `${colors.green}10` : `${colors.red}10`,
      color: ok ? colors.green : colors.red,
      border: `1px solid ${ok ? colors.green : colors.red}25`,
    }}>{ok ? "Healthy" : "Issues Detected"}</span>
  );
}

export default function MetricCard({ label, value, detail, ok }) {
  return (
    <div style={{
      background: colors.card,
      border: `1px solid ${colors.border}`,
      borderTop: `2px solid ${ok ? colors.green : colors.red}`,
      borderRadius: 12, padding: 24,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontFamily: fonts.sans, fontSize: 13, fontWeight: 600, color: colors.textSecondary }}>{label}</span>
        <StatusBadge ok={ok} />
      </div>
      <div style={{
        fontFamily: fonts.mono, fontSize: 22, fontWeight: 700,
        color: ok ? colors.green : colors.red, marginBottom: 6,
      }}>{value}</div>
      <div style={{ fontFamily: fonts.sans, fontSize: 13, color: colors.textMuted }}>{detail}</div>
    </div>
  );
}
