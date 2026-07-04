# Campus Lost & Found System — Project Specification

## 1. Overview

A campus-scoped web platform for reporting, searching, and claiming lost or found items. Built on the MERN stack (MongoDB, Express, React, Node.js), deployed as a single responsive codebase that functions as both a desktop website and a mobile-installable Progressive Web App (PWA).

The system is intentionally scoped small — a single campus, a bounded user base, physical items with real ownership disputes. The design choices below reflect that scale. Do not over-engineer this into something that needs infrastructure a university lost-and-found office doesn't need.

---

## 2. Core Objectives

| # | Objective | Notes |
|---|-----------|-------|
| 1 | Report a lost or found item | Structured form: category, location, description, photo, hidden challenge questions |
| 2 | Search with minimal input | Text-index-based intelligent search, expandable to semantic search later |
| 3 | Claim an item securely | Challenge-question verification + admin approval before handover |
| 4 | Alert on future matches | Saved searches trigger notifications when a matching item is later reported |

---

## 3. System Architecture

```
Client (React, PWA)
   │
   ▼
Express REST API (Node.js)
   │
   ├── Auth Service (JWT + campus email verification)
   ├── Item Service (CRUD, search)
   ├── Claim Service (verification, approval workflow)
   ├── Notification Service (Twilio SMS/WhatsApp, email fallback)
   └── Alert Service (saved search matching, triggered on new item creation)
   │
   ▼
MongoDB Atlas
   ├── Users
   ├── Items
   ├── Claims
   ├── SearchAlerts
   └── AuditLogs
```

---

## 4. Feature Breakdown

### 4.1 Reporting

- Form fields: item type (lost/found), category, title, description, location (dropdown or campus map pin), photo upload, date/time.
- **Hidden challenge questions**: reporter sets 1–2 identifying details (e.g. "what's inside the bag pocket", "scratch pattern on the case") that are stored but never shown on the public listing. This is the core fraud-prevention mechanism for claims.
- Auto-categorization suggestion from uploaded photo (optional, phase 2).
- Duplicate-detection warning if a similar item was reported recently (basic string similarity check, not mandatory for MVP).

### 4.2 Searching

- **MVP**: MongoDB text index across title, description, category, location, with field weighting (description weighted highest).
- **Phase 2**: Atlas Vector Search using text embeddings for genuine semantic matching (e.g. "black bag with a laptop" matches "dark backpack, has a Dell inside" even without shared keywords).
- Filters: category, date range, location, status (lost/found/claimed).
- No login required to search — only to report or claim.

### 4.3 Claiming

- Claimant selects an item and answers the hidden challenge questions set by the reporter.
- If answers match (or are close enough for a human reviewer to judge), the claim moves to **pending admin review** — it is never auto-approved.
- Claimant must be a verified campus account (college email or student ID).
- Admin/staff reviews the claim, optionally requests additional proof (a prior photo with the item, a receipt), then approves or rejects.
- On approval: claimant receives a pickup notification via SMS/WhatsApp with a time-limited QR code or PIN to present at the physical lost-and-found counter.
- Full audit trail: who claimed, who approved, timestamps — stored in `AuditLogs`. This matters if a claim is disputed later.

### 4.4 Saved Search Alerts

- If a search returns no results (or the user explicitly saves a search), store the query.
- On every new item report, run it against active saved searches.
- Matching users are notified (SMS/WhatsApp/email) that a possibly-matching item was just reported.
- This closes the gap where an item is lost before it's reported, and the person who lost it searched too early.

---

## 5. Data Models (sketch)

```
User {
  _id, name, email (campus domain only), campusId, phone,
  role: "student" | "staff" | "admin",
  isVerified, createdAt
}

Item {
  _id, type: "lost" | "found",
  title, description, category, location,
  imageUrl,
  challengeQuestions: [{ question, answerHash }],
  reportedBy: User._id,
  status: "open" | "pending_claim" | "claimed" | "closed",
  createdAt
}

Claim {
  _id, itemId, claimantId,
  answers: [String],
  proofImageUrl,
  status: "pending" | "approved" | "rejected",
  reviewedBy: User._id,
  reviewedAt, createdAt
}

SearchAlert {
  _id, userId, queryText, category,
  active: Boolean, createdAt
}

AuditLog {
  _id, action, actorId, targetId, metadata, timestamp
}
```

---

## 6. Additional / Enhancement Tech

| Feature | Recommendation | Priority |
|---|---|---|
| Semantic search | MongoDB Atlas Vector Search (text embeddings) | Phase 2 |
| Image matching | CLIP-based image embeddings for reverse photo search | Phase 3, optional |
| Notifications | Twilio (SMS + WhatsApp Business API) | MVP for SMS, Phase 2 for WhatsApp (needs Meta business verification) |
| Mobile + desktop | PWA (manifest.json + service worker, Workbox) | MVP |
| Fraud prevention | Hidden challenge questions + mandatory human approval | MVP |
| Spam/abuse prevention | express-rate-limit + reCAPTCHA on report/claim forms | MVP |
| Identity verification | Campus email domain restriction or student ID validation | MVP |
| Campus map | Leaflet.js with a custom campus image overlay for pinning locations | Phase 2 |
| Admin dashboard | Claim queue, resolution-time analytics, category hotspots | Phase 2 |
| Auto-tagging | Vision model suggests category from uploaded photo | Phase 2 |

---

## 7. Security & Fraud Prevention Summary

No purely digital verification step eliminates fraud risk for physical item handover. The design here layers three checks:

1. **Identity**: only verified campus accounts can claim.
2. **Knowledge**: claimant must answer details only the true owner would know.
3. **Human judgment**: a staff member approves every claim before pickup, with a full audit trail.

Remove any one of these three and the system becomes meaningfully easier to exploit.

---

## 8. Phased Build Plan

**Phase 1 (MVP)**
Report, text-based search, challenge-question claims, admin approval, SMS notifications, PWA shell.

**Phase 2**
Vector search, WhatsApp notifications, campus map, admin analytics dashboard, saved search alerts.

**Phase 3 (optional)**
Image-based matching, photo auto-tagging, predictive "likely match" surfacing on report submission.

---

## 9. Honest Scoping Notes

- Full semantic AI search is good, but not necessary for launch at campus scale (a few hundred active listings). Start with weighted text search; upgrade only if search quality genuinely underperforms.
- WhatsApp Business API is not instantly available — Meta's business verification process takes time. Plan SMS as the reliable channel for MVP.
- Image embedding search sounds impressive but adds real compute cost and complexity for a marginal gain over good text search + photos shown inline in results. Treat it as a stretch goal, not a core deliverable.
- The most fragile part of this entire system is not the tech — it's the claim approval workflow. If admins are slow or inconsistent in reviewing claims, the whole platform's trust collapses regardless of how good the search is.
