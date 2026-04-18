# Dota 2 Connection Analyzer

A client-side web tool that analyzes Dota 2's `net_connections_stats` console output to pinpoint where packet loss is occurring — your local network, Valve's infrastructure, or the game server.

**Live demo:** https://revij.github.io/dota2-network-analyzer/

## Why

Tournament staff, admins, and players often need to diagnose "who's at fault" when a Dota 2 connection degrades. The raw `net_connections_stats` output is dense and full of networking jargon 
(SDR relays, front/back ping splits, quality histograms). This tool parses it and gives you a plain-English verdict in one click.

## How it works

1. Open the Dota 2 console and spectate a game.
2. Type `net_connections_stats`
3. Copy the full output
4. Paste it into the tool and click **Analyze Connection**

The tool reports one of four verdicts:

- **Connection is healthy** — no significant loss detected
- **Packet loss on your network** — loss between the player's PC and Valve's relay (local/ISP issue)
- **Packet loss inside Valve's network** — packets reach Valve's relay cleanly but get lost inside their infrastructure
- **Game server dropping packets** — the game server reports it didn't receive some packets

Each analysis is added to a snapshot history so you can track connection degradation over a match.

## Development

```bash
npm install
npm run dev       # start dev server
npm run build     # production build
npm run preview   # preview production build locally
```

## Deployment

Deploys automatically to GitHub Pages via GitHub Actions on every push to `main`. See `.github/workflows/deploy.yml`.

## License

MIT
