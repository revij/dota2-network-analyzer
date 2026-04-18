import { colors, fonts } from "../styles";
import ExpandableSection from "./ExpandableSection";

export default function HistoryTable({ history }) {
  if (history.length <= 1) return null;

  const headers = ["#", "Time", "Total Lost", "Loss %", "Network Lost", "Quality", "Ping"];

  return (
    <ExpandableSection title="Snapshot History" subtitle={`${history.length} readings — compare over time`} defaultOpen={true}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {headers.map(h => (
                <th key={h} style={{
                  fontFamily: fonts.sans, fontSize: 11, fontWeight: 600,
                  color: colors.textMuted, textAlign: "left",
                  padding: "10px 14px", borderBottom: `1px solid ${colors.border}`,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((h, i) => {
              const isLatest = i === history.length - 1;
              const dropColor = h.e2e?.droppedPct > 1 ? colors.red : h.e2e?.droppedPct > 0 ? colors.amber : colors.green;
              const qualColor = h.e2e?.currentQuality >= 99 ? colors.green : h.e2e?.currentQuality >= 90 ? colors.amber : colors.red;

              return (
                <tr key={i} style={{ background: isLatest ? `${colors.blue}08` : "transparent" }}>
                  <td style={cellStyle}>{i + 1}</td>
                  <td style={cellStyle}>{h.timestamp}</td>
                  <td style={{ ...cellStyle, color: h.e2e?.droppedPkts > 0 ? colors.red : colors.green }}>{h.e2e?.droppedPkts ?? 0}</td>
                  <td style={{ ...cellStyle, color: dropColor }}>{h.e2e?.droppedPct ?? 0}%</td>
                  <td style={{ ...cellStyle, color: colors.green }}>{h.relay?.droppedPkts ?? 0}</td>
                  <td style={{ ...cellStyle, color: qualColor }}>{h.e2e?.currentQuality ?? "?"}%</td>
                  <td style={cellStyle}>{h.e2e?.currentPing ?? "?"}ms</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ExpandableSection>
  );
}

const cellStyle = {
  padding: "10px 14px",
  borderBottom: `1px solid ${colors.border}50`,
  fontFamily: fonts.mono,
  fontSize: 12,
  color: colors.textPrimary,
};
