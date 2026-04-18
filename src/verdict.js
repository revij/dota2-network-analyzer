const isSignificantDrop = (pkts, pct) => pkts > 1 && pct > 0.01;

export function computeVerdict(latest) {
  if (!latest || !latest.e2e) return null;

  const e2e = latest.e2e;
  const relay = latest.relay;

  const e2eHasDrops = isSignificantDrop(e2e.droppedPkts, e2e.droppedPct);
  const relayHasDrops = relay && isSignificantDrop(relay.droppedPkts, relay.droppedPct);
  const relayClean = relay && !relayHasDrops;
  const serverHasDrops = e2e.remoteDropped && isSignificantDrop(e2e.remoteDropped.pkts, e2e.remoteDropped.pct);
  const serverClean = e2e.remoteDropped && !serverHasDrops;

  if (relayHasDrops) {
    return {
      status: "local_issue",
      headline: "Packet loss on your network",
      explanation: `${relay.droppedPkts.toLocaleString()} packets (${relay.droppedPct}%) lost between the player's PC and Valve's relay server. This points to a local network, cable, or ISP issue.`,
      badge: "Your network — action needed",
      hasDrops: true,
      relayClean: false,
      serverClean,
    };
  }

  if (!relayHasDrops && e2eHasDrops) {
    const dc = latest.dc?.toUpperCase() || "unknown";
    return {
      status: "valve_issue",
      headline: "Packet loss inside Valve's network",
      explanation: `${e2e.droppedPkts.toLocaleString()} packets (${e2e.droppedPct}%) lost inside Valve's SDR infrastructure in the ${dc} datacenter. The player-to-relay path is clean — this is not a local network problem.`,
      badge: "Valve infrastructure — not your issue",
      hasDrops: true,
      relayClean: true,
      serverClean,
    };
  }

  if (!relayHasDrops && !e2eHasDrops && serverHasDrops) {
    return {
      status: "server_issue",
      headline: "Game server dropping packets",
      explanation: `The game server reports ${e2e.remoteDropped.pkts.toLocaleString()} lost packets (${e2e.remoteDropped.pct}%). Your network and Valve's relay are clean — this is a server-side issue.`,
      badge: "Server-side — not your issue",
      hasDrops: false,
      relayClean: true,
      serverClean: false,
    };
  }

  const negligible = e2e.droppedPkts > 0;
  return {
    status: "healthy",
    headline: "Connection is healthy",
    explanation: negligible
      ? `Only ${e2e.droppedPkts} packet(s) dropped (${e2e.droppedPct}%) — negligible and within normal operation.`
      : "No packet loss detected on any part of the connection.",
    badge: "No action needed",
    hasDrops: false,
    relayClean: true,
    serverClean: serverClean !== false,
  };
}

export { isSignificantDrop };
