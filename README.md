# OptiQ Vision

AI-powered quality control for incoming fruit and raw-material inspection. Built for the **CyberHack 2026** hackathon (Track 2: AI for Fruit & Raw-Material QC).

## Problem

Factories that process fruit and botanical inputs rely on manual eyeballing to grade incoming deliveries. This creates three problems:

1. **Inconsistency** — different inspectors, different standards
2. **No audit trail** — clipboard notes get lost, can't trace a defective batch back to its source
3. **Binary thinking** — inspectors either accept or reject, losing usable Grade B/C product that could go to secondary processing

## Solution

OptiQ Vision replaces the clipboard with a camera-based grading workflow:

1. **Intake** — operator logs supplier, lot number, and commodity before scanning
2. **Train** — show the AI a few examples of each quality grade (runs entirely in-browser via TensorFlow.js)
3. **Inspect** — scan items one by one; each scan produces a grade (A/B/C/Reject), confidence score, and timestamped photo
4. **Report** — complete the batch to get a summary: grade distribution, yield rate, reject rate, and exportable CSV

Every scan is tied to a supplier and lot, so procurement teams can track supplier quality over time.

## Tech Stack

- **Frontend:** React + TypeScript (Vite)
- **ML Engine:** TensorFlow.js (MobileNet feature extractor + KNN classifier)
- **Styling:** Vanilla CSS
- **Runs entirely in the browser.** No backend, no API keys, no cloud dependency.

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. Allow camera access when prompted.

## Workflow

```
Intake Form → Train AI (optional) → Scan & Grade → Complete Batch → Export CSV
```

## Grading System

| Grade | Meaning | Action |
|-------|---------|--------|
| A | Premium quality | Store as-is |
| B | Minor imperfection | Standard processing |
| C | Overripe or soft | Process immediately |
| REJECT | Rotten, moldy, foreign object | Segregate |

## License

MIT
