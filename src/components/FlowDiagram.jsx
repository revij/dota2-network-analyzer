import { colors, fonts } from "../styles";

function FlowNode({ icon, label, sublabel, accent, glow }) {
  return (
    <div style={{
      flex: 1, padding: "22px 14px", borderRadius: 12, textAlign: "center",
      border: `1px solid ${accent}33`,
      background: `linear-gradient(180deg, ${colors.card}, ${accent}08)`,
      boxShadow: glow ? `0 0 24px ${accent}18` : "none",
      minWidth: 0,
    }}>
      <div style={{ fontSize: 26, marginBottom: 8 }}>{icon}</div>
      <div style={{
        fontFamily: fonts.sans, fontSize: 12, fontWeight: 700,
        textTransform: "uppercase", letterSpacing: 0.8, color: accent, marginBottom: 6,
      }}>{label}</div>
      <div style={{ fontSize: 11, color: colors.textSecondary, lineHeight: 1.6 }}>{sublabel}</div>
    </div>
  );
}

function FlowArrow({ ok, label }) {
  const color = ok ? colors.green : colors.red;
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", width: 56, minWidth: 36, flexShrink: 0,
    }}>
      <div style={{
        width: "100%", height: 2, position: "relative",
        background: `linear-gradient(90deg, ${color}33, ${color})`,
      }}>
        <div style={{
          position: "absolute", right: -1, top: "50%", transform: "translateY(-50%)",
          width: 0, height: 0,
          borderTop: "4px solid transparent", borderBottom: "4px solid transparent",
          borderLeft: `6px solid ${color}`,
        }} />
      </div>
      <div style={{
        fontFamily: fonts.mono, fontSize: 8, fontWeight: 600,
        marginTop: 5, padding: "2px 6px", borderRadius: 4, whiteSpace: "nowrap",
        color, background: `${color}10`,
      }}>{label}</div>
    </div>
  );
}

function BoundaryDivider() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      position: "relative", width: 0, zIndex: 1, overflow: "visible",
    }}>
      <div style={{
        position: "absolute", top: -28, whiteSpace: "nowrap",
        display: "flex", gap: 6, alignItems: "center",
        fontSize: 9, fontFamily: fonts.mono, fontWeight: 600, letterSpacing: 0.5,
      }}>
        <span style={{ color: colors.blue }}>your network</span>
        <span style={{ color: colors.textMuted }}>│</span>
        <span style={{ color: colors.purple }}>valve's network</span>
      </div>
      <div style={{
        position: "absolute", top: 0, bottom: 0,
        borderLeft: `1px dashed ${colors.textMuted}44`,
      }} />
    </div>
  );
}

export default function FlowDiagram({ latest, verdict }) {
  if (!latest) return null;

  const relayClean = verdict.relayClean;
  const e2eClean = !verdict.hasDrops;
  const serverClean = verdict.serverClean;

  return (
    <div style={{ marginBottom: 48, position: "relative", paddingTop: 16 }}>
      <div style={{ display: "flex", alignItems: "stretch", gap: 0, overflowX: "auto" }}>
        <FlowNode
          icon="🖥️" label="Your PC" sublabel="Player's Computer"
          accent={colors.blue}
        />
        <FlowArrow
          ok={relayClean}
          label={relayClean ? "No loss" : `${latest.relay?.droppedPkts} lost`}
        />
        <BoundaryDivider />
        <FlowNode
          icon="🔀" label="Valve Relay"
          sublabel={latest.primary ? (
            <>
              <span style={{ fontFamily: fonts.mono, fontSize: 10 }}>{latest.primary.name}</span>
              <br />
              <span style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.textMuted }}>{latest.primary.addr}</span>
            </>
          ) : "Relay"}
          accent={colors.green}
        />
        <FlowArrow
          ok={e2eClean}
          label={e2eClean ? "No loss" : `${latest.e2e?.droppedPkts} lost`}
        />
        <FlowNode
          icon="🔒" label="Valve Network"
          sublabel={e2eClean
            ? <span style={{ color: colors.green, fontSize: 11 }}>Clean</span>
            : <span style={{ color: colors.red, fontSize: 11 }}>{latest.e2e?.droppedPkts} packets lost</span>
          }
          accent={verdict.hasDrops && verdict.relayClean ? colors.red : colors.green}
          glow={verdict.hasDrops && verdict.relayClean}
        />
        <FlowArrow
          ok={serverClean}
          label={serverClean ? "No loss" : "Drops"}
        />
        <FlowNode
          icon="🎮" label="Game Server"
          sublabel={<>DC: <span style={{ fontFamily: fonts.mono, fontSize: 10 }}>{latest.dc?.toUpperCase() || "?"}</span></>}
          accent={colors.purple}
        />
      </div>
    </div>
  );
}
