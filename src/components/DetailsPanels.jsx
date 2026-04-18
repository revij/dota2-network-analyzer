import { colors, fonts } from "../styles";
import ExpandableSection from "./ExpandableSection";

function QualityBar({ histogram }) {
  if (!histogram) return null;
  const segments = [
    { key: "perfect", label: "Perfect", color: colors.green, value: histogram.perfect },
    { key: "p99", label: "99+", color: "#4ade80", value: histogram.p99 },
    { key: "p97_99", label: "97-99", color: "#86efac", value: histogram.p97_99 },
    { key: "p95_97", label: "95-97", color: "#fbbf24", value: histogram.p95_97 },
    { key: "p90_95", label: "90-95", color: colors.amber, value: histogram.p90_95 },
    { key: "p75_90", label: "75-90", color: colors.red, value: histogram.p75_90 },
    { key: "p50_75", label: "50-75", color: "#dc2626", value: histogram.p50_75 },
    { key: "lt50", label: "<50", color: "#991b1b", value: histogram.lt50 },
    { key: "dead", label: "Offline", color: "#450a0a", value: histogram.dead },
  ].filter(s => s.value > 0);

  return (
    <div>
      <div style={{ display: "flex", height: 24, borderRadius: 6, overflow: "hidden", marginBottom: 8 }}>
        {segments.map(s => (
          <div key={s.key} style={{
            width: `${s.value}%`, background: s.color, minWidth: s.value > 0 ? 2 : 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 9, fontWeight: 600, fontFamily: fonts.mono,
            color: [colors.green, "#4ade80", "#86efac", "#fbbf24"].includes(s.color) ? "#0a0e17" : "#fff",
          }}>
            {s.value >= 5 ? `${s.value.toFixed(1)}%` : ""}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px" }}>
        {segments.map(s => (
          <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: colors.textSecondary }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
            <span>{s.label}: {s.value.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DetailsPanels({ latest }) {
  if (!latest) return null;

  return (
    <ExpandableSection title="Technical Details" subtitle="Ping breakdown, quality metrics, and connection histogram" defaultOpen={false}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        {/* Ping */}
        <div style={{ background: `${colors.bg}80`, border: `1px solid ${colors.border}`, borderRadius: 10, padding: 22 }}>
          <div style={{ fontFamily: fonts.sans, fontSize: 13, fontWeight: 600, color: colors.textSecondary, marginBottom: 14 }}>Ping</div>
          <div style={{ fontFamily: fonts.mono, fontSize: 32, fontWeight: 700, color: colors.blue, marginBottom: 6 }}>
            {latest.e2e?.currentPing ?? "?"}ms
          </div>
          {latest.e2e?.pingDist && (
            <div style={{ fontSize: 13, color: colors.textSecondary, fontFamily: fonts.mono, lineHeight: 1.8 }}>
              Best: {latest.e2e.pingDist.p5}ms · Typical: {latest.e2e.pingDist.p50}ms · Worst: {latest.e2e.pingDist.p95}ms
              {latest.e2e.pingDist.p98 != null && ` · p98: ${latest.e2e.pingDist.p98}ms`}
            </div>
          )}
          {latest.primary && (
            <div style={{ marginTop: 12, fontSize: 13, color: colors.textMuted, fontFamily: fonts.mono }}>
              Your network: {latest.primary.front}ms + Valve network: {latest.primary.back}ms = {latest.primary.total}ms total
            </div>
          )}
          {latest.backup && (
            <div style={{ fontSize: 11, color: colors.textMuted, fontFamily: fonts.mono, marginTop: 6 }}>
              Backup relay: {latest.backup.name} — {latest.backup.front}+{latest.backup.back}={latest.backup.total}ms
            </div>
          )}
        </div>

        {/* Quality */}
        <div style={{ background: `${colors.bg}80`, border: `1px solid ${colors.border}`, borderRadius: 10, padding: 22 }}>
          <div style={{ fontFamily: fonts.sans, fontSize: 13, fontWeight: 600, color: colors.textSecondary, marginBottom: 14 }}>Current Quality</div>
          <div style={{
            fontFamily: fonts.mono, fontSize: 32, fontWeight: 700, marginBottom: 6,
            color: latest.e2e?.currentQuality >= 99 ? colors.green : latest.e2e?.currentQuality >= 90 ? colors.amber : colors.red,
          }}>
            {latest.e2e?.currentQuality ?? "?"}%
          </div>
          <div style={{ fontSize: 13, color: colors.textSecondary }}>
            Connection stability: {latest.e2e?.maxVariance ?? "?"}ms jitter
          </div>
          {latest.e2e?.qualDist && (
            <div style={{ marginTop: 12, fontSize: 13, color: colors.textMuted, fontFamily: fonts.mono }}>
              Typical: {latest.e2e.qualDist.p50}% · Low points: {latest.e2e.qualDist.p5}%
              {latest.e2e.qualDist.p2 != null && ` · Worst: ${latest.e2e.qualDist.p2}%`}
            </div>
          )}
        </div>
      </div>

      {/* Histogram */}
      {latest.e2e?.qualHist && (
        <div>
          <div style={{ fontFamily: fonts.sans, fontSize: 13, fontWeight: 600, color: colors.textSecondary, marginBottom: 14 }}>
            Connection Quality Over Time
          </div>
          <QualityBar histogram={latest.e2e.qualHist} />
        </div>
      )}
    </ExpandableSection>
  );
}
