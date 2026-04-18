import { colors, fonts, statusColors } from "../styles";

export default function VerdictHero({ verdict }) {
  if (!verdict) return null;

  const accent = statusColors[verdict.status];
  const isGood = verdict.status === "healthy";

  return (
    <div style={{
      background: `linear-gradient(135deg, ${colors.card}, ${accent}08)`,
      border: `1px solid ${accent}33`,
      borderLeft: `4px solid ${accent}`,
      borderRadius: "4px 14px 14px 4px",
      padding: "36px 32px",
      marginBottom: 48,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          background: `${accent}15`,
          border: `2px solid ${accent}44`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, flexShrink: 0,
        }}>
          {isGood ? "✓" : "⚠"}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{
            fontFamily: fonts.sans, fontSize: 22, fontWeight: 700,
            color: accent, margin: 0, marginBottom: 10,
          }}>{verdict.headline}</h2>
          <p style={{
            fontFamily: fonts.sans, fontSize: 15, lineHeight: 1.7,
            color: colors.textSecondary, margin: 0, marginBottom: 16,
          }}>{verdict.explanation}</p>
          <span style={{
            fontFamily: fonts.mono, fontSize: 11, fontWeight: 600,
            padding: "5px 14px", borderRadius: 20,
            background: `${accent}12`, color: accent,
            border: `1px solid ${accent}30`,
          }}>{verdict.badge}</span>
        </div>
      </div>
    </div>
  );
}
