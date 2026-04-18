import { useState } from "react";
import { colors, fonts } from "../styles";
import ExpandableSection from "./ExpandableSection";

function HelpCard({ title, children }) {
  return (
    <div style={{
      background: `${colors.bg}80`, border: `1px solid ${colors.border}`,
      borderRadius: 10, padding: 20, marginBottom: 12,
    }}>
      <div style={{ fontFamily: fonts.sans, fontSize: 14, fontWeight: 600, color: colors.textPrimary, marginBottom: 10 }}>{title}</div>
      <div style={{ fontFamily: fonts.sans, fontSize: 13, lineHeight: 1.8, color: colors.textSecondary }}>{children}</div>
    </div>
  );
}

function ScenarioCard({ color, label, description }) {
  return (
    <div style={{
      background: `${color}06`, border: `1px solid ${color}20`,
      borderLeft: `3px solid ${color}`,
      borderRadius: "2px 8px 8px 2px", padding: "14px 18px",
    }}>
      <div style={{ fontFamily: fonts.sans, fontSize: 12, fontWeight: 600, color, marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: fonts.sans, fontSize: 12, lineHeight: 1.7, color: colors.textSecondary }}>{description}</div>
    </div>
  );
}

function TechnicalReference() {
  const [open, setOpen] = useState(false);
  const codeLine = (text, color) => (
    <div key={text} style={{ fontFamily: fonts.mono, fontSize: 11, lineHeight: 1.7, color: color || colors.textSecondary, whiteSpace: "pre" }}>{text}</div>
  );
  const codeBg = { background: "rgba(255,255,255,0.03)", borderRadius: 6, padding: "12px 16px", overflowX: "auto", marginBottom: 12 };

  return (
    <div style={{ marginTop: 16 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "transparent", border: `1px solid ${colors.border}`, borderRadius: 8,
          padding: "10px 16px", cursor: "pointer", color: colors.textMuted,
          fontFamily: fonts.sans, fontSize: 12, fontWeight: 500,
          display: "flex", alignItems: "center", gap: 8,
        }}
      >
        <span style={{ transition: "transform 0.2s", transform: open ? "rotate(90deg)" : "rotate(0deg)", fontSize: 10 }}>▶</span>
        Technical Reference (for advanced users)
      </button>
      {open && (
        <div style={{ marginTop: 12, padding: 20, background: `${colors.bg}80`, border: `1px solid ${colors.border}`, borderRadius: 10 }}>
          <div style={{ fontFamily: fonts.sans, fontSize: 13, fontWeight: 600, color: colors.textPrimary, marginBottom: 12 }}>
            Diagnosis Decision Tree
          </div>
          <div style={codeBg}>
            {codeLine("Check 1: Does \"Primary router\" section show drops?")}
            {codeLine("  YES → Problem between player and relay (player network/ISP)", colors.red)}
            {codeLine("  NO  → Player-to-relay path is clean ✓", colors.green)}
            {codeLine("")}
            {codeLine("Check 2: Does \"End-to-end\" section show drops?")}
            {codeLine("  YES, but relay clean → Drops inside Valve's infrastructure", colors.red)}
            {codeLine("  NO  → Connection is fully clean ✓", colors.green)}
            {codeLine("")}
            {codeLine("Check 3: \"Remote host\" stats show drops?")}
            {codeLine("  YES → Server didn't receive packets (upstream loss)", colors.red)}
            {codeLine("  NO  → Server received everything fine ✓", colors.green)}
          </div>

          <div style={{ fontFamily: fonts.sans, fontSize: 13, fontWeight: 600, color: colors.textPrimary, marginBottom: 12, marginTop: 20 }}>
            Key Fields
          </div>
          <div style={codeBg}>
            {codeLine("End-to-end section:")}
            {codeLine("  Dropped = total app-layer loss across entire path")}
            {codeLine("  Remote host Dropped = packets server never received")}
            {codeLine("")}
            {codeLine("Primary router section:")}
            {codeLine("  Ping = front + back = total")}
            {codeLine("    front = player → relay (YOUR network)")}
            {codeLine("    back  = relay → server (VALVE network)")}
            {codeLine("  Dropped = lost between player and relay")}
            {codeLine("")}
            {codeLine("Connection quality histogram:")}
            {codeLine("  % of intervals at each quality tier")}
            {codeLine("  'perfect' = 100% delivery, lower = loss episodes")}
          </div>
        </div>
      )}
    </div>
  );
}

export default function HelpGuide() {
  return (
    <ExpandableSection title="How This Works" subtitle="Quick guide for understanding the results" defaultOpen={false}>
      <HelpCard title="What does this tool do?">
        This tool reads diagnostic data from Dota 2's console to figure out where network problems are happening.
        It tells you whether packet loss is on your local network, inside Valve's infrastructure, or at the game server.
      </HelpCard>

      <HelpCard title="How to get the data">
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          <li>Open the Dota 2 console</li>
          <li>Type <code style={{ fontFamily: fonts.mono, fontSize: 11, background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: 3 }}>net_connections_stats</code></li>
          <li>Copy the entire output</li>
          <li>Paste it above and click "Analyze Connection"</li>
        </ol>
      </HelpCard>

      <div style={{ fontFamily: fonts.sans, fontSize: 13, fontWeight: 600, color: colors.textPrimary, marginBottom: 12 }}>
        What do the results mean?
      </div>
      <div style={{ display: "grid", gap: 10, marginBottom: 8 }}>
        <ScenarioCard
          color={colors.green}
          label="All green — Connection is healthy"
          description="No significant packet loss anywhere. The connection is working as expected."
        />
        <ScenarioCard
          color={colors.red}
          label="'Your Network' shows issues"
          description="Packets are being lost between the player's PC and Valve's relay. Check the network cable, switch port, or ISP connection."
        />
        <ScenarioCard
          color={colors.amber}
          label="'Overall Connection' has issues but 'Your Network' is clean"
          description="Packets reach Valve's relay fine, but get lost inside their infrastructure. This is Valve's problem, not yours."
        />
      </div>

      <TechnicalReference />
    </ExpandableSection>
  );
}
