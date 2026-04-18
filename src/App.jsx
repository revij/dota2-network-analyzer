import { useState, useCallback } from "react";
import { parseSDRStats } from "./parser";
import { computeVerdict, isSignificantDrop } from "./verdict";
import { colors, fonts } from "./styles";
import VerdictHero from "./components/VerdictHero";
import FlowDiagram from "./components/FlowDiagram";
import MetricCard from "./components/MetricCard";
import DetailsPanels from "./components/DetailsPanels";
import HistoryTable from "./components/HistoryTable";
import HelpGuide from "./components/HelpGuide";

export default function App() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);

  const handleParse = useCallback(() => {
    const parsed = parseSDRStats(input);
    if (parsed && parsed.e2e) {
      setHistory(prev => [...prev, { ...parsed, timestamp: new Date().toLocaleTimeString() }]);
    }
  }, [input]);

  const latest = history.length > 0 ? history[history.length - 1] : null;
  const verdict = latest ? computeVerdict(latest) : null;

  return (
    <div style={{
      minHeight: "100vh", background: colors.bg, color: colors.textPrimary,
      fontFamily: fonts.sans, padding: "40px 20px",
      overflowX: "hidden", width: "100%",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 900, margin: "0 auto", overflowX: "hidden" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{
            fontFamily: fonts.sans, fontSize: 26, fontWeight: 700,
            letterSpacing: -0.5, marginBottom: 8,
            background: "linear-gradient(135deg, #e2e8f0, #94a3b8)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>Dota 2 Connection Analyzer</h1>
          <p style={{ color: colors.textMuted, fontSize: 14, fontWeight: 400 }}>
            Check where network problems are happening
          </p>
        </div>

        {/* Input */}
        <div style={{ marginBottom: 40 }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Paste the output of net_connections_stats here..."
            style={{
              width: "100%", height: 140, background: colors.card,
              border: `1px solid ${colors.border}`, borderRadius: 12,
              padding: 18, color: colors.textPrimary, fontSize: 12,
              resize: "vertical", fontFamily: fonts.mono, lineHeight: 1.5,
              outline: "none",
            }}
          />
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button
              onClick={handleParse}
              style={{
                background: colors.blue, color: "#fff", border: "none",
                borderRadius: 8, padding: "11px 26px",
                fontFamily: fonts.sans, fontSize: 14, fontWeight: 600,
                cursor: "pointer",
              }}
            >Analyze Connection</button>
            <button
              onClick={() => setInput("")}
              style={{
                background: "transparent", color: colors.textMuted,
                border: `1px solid ${colors.border}`, borderRadius: 8,
                padding: "11px 20px", fontFamily: fonts.sans, fontSize: 14,
                fontWeight: 500, cursor: "pointer",
              }}
            >Clear</button>
            {history.length > 0 && (
              <button
                onClick={() => setHistory([])}
                style={{
                  background: "transparent", color: colors.red,
                  border: `1px solid ${colors.red}33`, borderRadius: 8,
                  padding: "11px 20px", fontFamily: fonts.sans, fontSize: 14,
                  fontWeight: 500, cursor: "pointer",
                }}
              >Reset History</button>
            )}
          </div>
        </div>

        {/* Results */}
        {latest && verdict && (
          <>
            <VerdictHero verdict={verdict} />

            <FlowDiagram latest={latest} verdict={verdict} />

            {/* Overview Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 48 }}>
              <MetricCard
                label="Your Network"
                value={`${latest.relay?.droppedPct ?? "?"}%`}
                detail={`${latest.relay?.droppedPkts ?? 0} of ${(latest.relay?.recvPkts ?? 0).toLocaleString()} packets lost`}
                ok={!isSignificantDrop(latest.relay?.droppedPkts ?? 0, latest.relay?.droppedPct ?? 0)}
              />
              <MetricCard
                label="Overall Connection"
                value={`${latest.e2e?.droppedPct ?? "?"}%`}
                detail={`${latest.e2e?.droppedPkts ?? 0} packets lost · Currently ${latest.e2e?.currentDropPct ?? 0}% loss`}
                ok={!isSignificantDrop(latest.e2e?.droppedPkts ?? 0, latest.e2e?.droppedPct ?? 0)}
              />
              <MetricCard
                label="Game Server"
                value={`${latest.e2e?.remoteDropped?.pct ?? "?"}%`}
                detail={`Server reports ${latest.e2e?.remoteDropped?.pkts ?? "?"} lost packets`}
                ok={!isSignificantDrop(latest.e2e?.remoteDropped?.pkts ?? 0, latest.e2e?.remoteDropped?.pct ?? 0)}
              />
            </div>

            <DetailsPanels latest={latest} />

            <HistoryTable history={history} />
          </>
        )}

        {/* Empty State */}
        {!latest && (
          <div style={{
            textAlign: "center", padding: "60px 24px", color: colors.textMuted,
            border: `1px dashed ${colors.border}`, borderRadius: 14,
          }}>
            <div style={{ fontSize: 44, marginBottom: 18 }}>📡</div>
            <div style={{ fontFamily: fonts.sans, fontSize: 18, fontWeight: 600, color: colors.textSecondary, marginBottom: 10 }}>
              Analyze Your Connection
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.8, maxWidth: 400, margin: "0 auto" }}>
              <div style={{ marginBottom: 8 }}>Paste console output above to check for connection issues</div>
              <ol style={{ textAlign: "left", display: "inline-block", margin: 0, paddingLeft: 20 }}>
                <li>Open the Dota 2 console</li>
                <li>Type <code style={{ fontFamily: fonts.mono, fontSize: 11, background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: 3 }}>net_connections_stats</code></li>
                <li>Copy the entire output</li>
                <li>Paste it above and click "Analyze Connection"</li>
              </ol>
            </div>
          </div>
        )}

        {/* Help Guide */}
        <div style={{ marginTop: 48 }}>
          <HelpGuide />
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 40, paddingTop: 24, borderTop: `1px solid ${colors.border}`,
          textAlign: "center", fontFamily: fonts.mono, fontSize: 11, color: colors.textMuted,
        }}>
          v{__APP_VERSION__} · <a
            href="https://github.com/revij/dota2-network-analyzer"
            target="_blank" rel="noopener noreferrer"
            style={{ color: colors.textMuted, textDecoration: "none", borderBottom: `1px dotted ${colors.textMuted}` }}
          >github.com/revij/dota2-network-analyzer</a>
        </div>
      </div>
    </div>
  );
}
