export function parseSDRStats(raw) {
  if (!raw || !raw.trim()) return null;

  const get = (pattern, flags) => {
    const m = raw.match(new RegExp(pattern, flags));
    return m ? m[1] : null;
  };

  const dc = get(/Remote host is in data center '(\w+)'/);

  const primaryMatch = raw.match(/Primary router:\s+(\S+)\s+\(([^)]+)\)\s+Ping\s*=\s*(\d+)\+(\d+)=(\d+)/);
  const primary = primaryMatch ? {
    name: primaryMatch[1], addr: primaryMatch[2],
    front: +primaryMatch[3], back: +primaryMatch[4], total: +primaryMatch[5]
  } : null;

  const backupMatch = raw.match(/Backup router:\s+(\S+)\s+\(([^)]+)\)\s+Ping\s*=\s*(\d+)\+(\d+)=(\d+)/);
  const backup = backupMatch ? {
    name: backupMatch[1], addr: backupMatch[2],
    front: +backupMatch[3], back: +backupMatch[4], total: +backupMatch[5]
  } : null;

  const e2eStart = raw.indexOf("End-to-end connection: connected");
  const relayStart = raw.indexOf("Primary router:");
  const backupStart = raw.indexOf("Backup router:");

  const e2eSection = e2eStart >= 0 && relayStart >= 0 ? raw.slice(e2eStart, relayStart) : "";
  const relaySection = relayStart >= 0 ? raw.slice(relayStart, backupStart >= 0 ? backupStart : undefined) : "";

  function parseSectionStats(section) {
    if (!section) return null;

    const remoteIdx = section.indexOf("Rate stats received from remote host");
    const localSection = remoteIdx >= 0 ? section.slice(0, remoteIdx) : section;
    const remoteSection = remoteIdx >= 0 ? section.slice(remoteIdx) : "";

    const currentRates = {};
    const sentRateMatch = localSection.match(/Current rates:[\s\S]*?Sent:\s+([\d.]+)\s+pkts\/sec\s+([\d.]+)\s+(\S+)\/sec/);
    const recvRateMatch = localSection.match(/Current rates:[\s\S]*?Recv:\s+([\d.]+)\s+pkts\/sec\s+([\d.]+)\s+(\S+)\/sec/);
    if (sentRateMatch) { currentRates.sentPps = +sentRateMatch[1]; currentRates.sentBps = sentRateMatch[2] + " " + sentRateMatch[3]; }
    if (recvRateMatch) { currentRates.recvPps = +recvRateMatch[1]; currentRates.recvBps = recvRateMatch[2] + " " + recvRateMatch[3]; }

    const qualityMatch = localSection.match(/Quality:\s+([\d.]+)%\s+\(Dropped:([\d.]+)%/);
    const currentQuality = qualityMatch ? +qualityMatch[1] : null;
    const currentDropPct = qualityMatch ? +qualityMatch[2] : null;

    const pingMatch = localSection.match(/Ping:(\d+)ms/);
    const currentPing = pingMatch ? +pingMatch[1] : null;

    const varMatch = localSection.match(/Max latency variance:\s+([\d.]+)ms/);
    const maxVariance = varMatch ? +varMatch[1] : null;

    const bwMatch = localSection.match(/Est avail bandwidth:\s+([\d.]+\s*\S+\/s)/);
    const estBandwidth = bwMatch ? bwMatch[1] : null;

    const bufMatch = localSection.match(/Bytes buffered:\s+(\d+)/);
    const bytesBuffered = bufMatch ? +bufMatch[1] : null;

    const droppedMatch = localSection.match(/Dropped\s*:\s+([\d,]+)\s+pkts\s+([\d.]+)%/);
    const droppedPkts = droppedMatch ? +droppedMatch[1].replace(/,/g, "") : 0;
    const droppedPct = droppedMatch ? +droppedMatch[2] : 0;

    const sentMatch = localSection.match(/Sent:\s+([\d,]+)\s+pkts/);
    const recvMatch = localSection.match(/Recv:\s+([\d,]+)\s+pkts\s+([\d,]+)\s+bytes/);
    const sentPkts = sentMatch ? +sentMatch[1].replace(/,/g, "") : 0;
    const recvPkts = recvMatch ? +recvMatch[1].replace(/,/g, "") : 0;

    const varHistMatch = localSection.match(/Latency variance histogram:.*?(\d+) total[\s\S]*?<1\s+1-2\s+2-5\s+5-10\s+10-20\s+>20[\s\S]*?([\d.]+)%\s+([\d.]+)%\s+([\d.]+)%\s+([\d.]+)%\s+([\d.]+)%\s+([\d.]+)%/);
    let varianceHist = null;
    if (varHistMatch) {
      varianceHist = {
        total: +varHistMatch[1],
        lt1: +varHistMatch[2], r1_2: +varHistMatch[3], r2_5: +varHistMatch[4],
        r5_10: +varHistMatch[5], r10_20: +varHistMatch[6], gt20: +varHistMatch[7]
      };
    }

    const pingDist = {};
    const pingDistMatch = localSection.match(/Ping distribution:[\s\S]*?(\d+)ms\s+(\d+)ms\s+(\d+)ms\s+(\d+)ms/);
    if (pingDistMatch) {
      const pingDistFull = localSection.match(/Ping distribution:[\s\S]*?(\d+)ms\s+(\d+)ms\s+(\d+)ms\s+(\d+)ms\s+(\d+)ms/);
      if (pingDistFull) {
        pingDist.p5 = +pingDistFull[1]; pingDist.p50 = +pingDistFull[2];
        pingDist.p75 = +pingDistFull[3]; pingDist.p95 = +pingDistFull[4]; pingDist.p98 = +pingDistFull[5];
      } else {
        pingDist.p5 = +pingDistMatch[1]; pingDist.p50 = +pingDistMatch[2];
        pingDist.p75 = +pingDistMatch[3]; pingDist.p95 = +pingDistMatch[4];
      }
    }

    const qualHistMatch = localSection.match(/Connection quality histogram:.*?(\d+) measurement[\s\S]*?perfect\s+99\+[\s\S]*?([\d.]+)%\s+([\d.]+)%\s+([\d.]+)%\s+([\d.]+)%\s+([\d.]+)%\s+([\d.]+)%\s+([\d.]+)%\s+([\d.]+)%\s+([\d.]+)%/);
    let qualHist = null;
    if (qualHistMatch) {
      qualHist = {
        perfect: +qualHistMatch[2], p99: +qualHistMatch[3], p97_99: +qualHistMatch[4],
        p95_97: +qualHistMatch[5], p90_95: +qualHistMatch[6], p75_90: +qualHistMatch[7],
        p50_75: +qualHistMatch[8], lt50: +qualHistMatch[9], dead: +qualHistMatch[10]
      };
    }

    const qualDistMatch = localSection.match(/Connection quality distribution:[\s\S]*?([\d]+)%\s+([\d]+)%\s+([\d]+)%/);
    let qualDist = null;
    if (qualDistMatch) {
      const qualDistFull = localSection.match(/Connection quality distribution:[\s\S]*?([\d]+)%\s+([\d]+)%\s+([\d]+)%\s+([\d]+)%/);
      if (qualDistFull) {
        qualDist = { p50: +qualDistFull[1], p25: +qualDistFull[2], p5: +qualDistFull[3], p2: +qualDistFull[4] };
      } else {
        qualDist = { p50: +qualDistMatch[1], p25: +qualDistMatch[2], p5: +qualDistMatch[3] };
      }
    }

    let remoteDropped = null;
    let remoteQuality = null;
    if (remoteSection) {
      const rdMatch = remoteSection.match(/Dropped\s*:\s+([\d,]+)\s+pkts\s+([\d.]+)%/);
      remoteDropped = rdMatch ? { pkts: +rdMatch[1].replace(/,/g, ""), pct: +rdMatch[2] } : null;
      const rqMatch = remoteSection.match(/Connection quality histogram:.*?(\d+) measurement[\s\S]*?perfect\s+99\+[\s\S]*?([\d.]+)%/);
      if (rqMatch) remoteQuality = +rqMatch[2];
    }

    return {
      currentRates, currentQuality, currentDropPct, currentPing, maxVariance,
      estBandwidth, bytesBuffered,
      droppedPkts, droppedPct, sentPkts, recvPkts,
      pingDist, qualHist, qualDist, varianceHist,
      remoteDropped, remoteQuality
    };
  }

  const e2e = parseSectionStats(e2eSection);
  const relay = parseSectionStats(relaySection);

  return { dc, primary, backup, e2e, relay };
}
