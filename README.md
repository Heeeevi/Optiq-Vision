# OptiQ Vision

AI-powered quality control for incoming fruit and raw-material inspection. Built for **CyberHack 2026** (Track 2: AI for Fruit & Raw-Material QC).

## Problem

Sima Arome's incoming QC relies on manual eyeballing — inconsistent grading, zero audit trail, and binary pass/fail decisions that waste usable product.

## Solution

OptiQ Vision replaces the clipboard with a camera-based grading workflow:

1. **Login** — role-based access (Admin / Operator)
2. **Intake** — log supplier, lot number, and commodity
3. **Train** — teach the AI quality grades using your own samples (runs in-browser via TensorFlow.js)
4. **Inspect** — scan items with the camera; each scan produces a grade (A/B/C/Reject), confidence, and timestamped photo
5. **Report** — batch summary with grade distribution, yield/reject rate, photo evidence, and CSV export
6. **Analytics** — supplier scorecard tracks reject rates across batches

Every scan is tied to a supplier and lot for full traceability.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript (Vite) |
| ML Engine | TensorFlow.js — MobileNet v2 + KNN Classifier |
| Styling | Vanilla CSS |
| Persistence | Browser localStorage |
| Runtime | 100% client-side — no backend, no API keys |

## Getting Started

```bash
npm install
npm run dev
```

Open `https://localhost:5173`. Allow camera access when prompted.

## User Roles

| Role | Access |
|------|--------|
| **Operator** | Intake → Scan → Report |
| **Admin** | Dashboard + Batch History + Supplier Scorecard + Intake → Scan → Report |

## Grading System

| Grade | Meaning | Action |
|-------|---------|--------|
| A | Premium quality | Store as-is |
| B | Minor imperfection | Standard processing |
| C | Overripe or soft | Process immediately |
| REJECT | Rotten, moldy, foreign object | Segregate |

## Screenshots

_See demo video for full walkthrough._

## License

MIT
