# Enterprise Campus ITSM & Asset Management System

An enterprise-grade IT Service Management (ITSM) and Asset Management platform built for university campus operations. Designed to streamline break-fix maintenance, manage hardware requisitions, and maintain NAAC/NBA audit-ready logs across campus facilities.

---

## 📌 Core Capabilities

* **Standardized Location Schema (`BFRR`):** Encodes physical campus locations using a 4-digit mapping system (`Building-Floor-Room`, e.g., `1102` = Building 1, Floor 1, Room 02) to eliminate location ambiguity.
* **Unified Dual Pipeline:** Operates a streamlined workflow for both **Break-Fix Repairs** (classroom AV, network issues, hardware failures) and **Asset Requisitions** (faculty/department equipment requests).
* **Role-Gated Dashboards:** Tailored interfaces for Students/Faculty, CISO/Admin Gatekeepers, and Field Technical Assistants.
* **3-Stage Lifecycle Tracking:** Simplifies status tracking across all tickets:
  1. **`Submitted`** (Awaiting CISO Triage / Approval)
  2. **`In Progress`** (Technician Assigned & Active On-Site / Provisioning)
  3. **`Resolved`** (Completed & CISO Signed-off)
* **Real-time Alert Routing:** Configurable event-driven notifications dispatched via WhatsApp (high-urgency dispatches/rework alerts) and In-App System Messages (audit feeds/status updates).

---

## 👥 User Role Architecture

### 1. End-User & Faculty Portal
* **Break-Fix Reporting:** Quick issue submission using cascading location pickers and structured error categories.
* **Faculty & Department Requisitions:** Dedicated form for requesting hardware allocations (desktops, monitors, switches) with academic justification, quantity selection, and ownership tagging (Individual vs. Department Lab).
* **Live Status Tracker:** Real-time visibility into active requests using a simplified 3-stage progress bar without redundant administrative clutter.

### 2. CISO & Admin Triage
* **Request Verification:** Gatekeeper controls to approve, reject, or request clarification (`NEEDS_INFO`) from requesters.
* **Technician Dispatch:** One-click technician assignment based on active workload and SLA priority.
* **Final Audit Sign-off:** Verification queue for reviewing technician repair notes, hardware stock deductions, and proof photos before closing tickets.

### 3. Technical Assistant Mobile View
* **Field-Optimized Execution:** Mobile-first layout focused strictly on assigned tasks.
* **State-Gated Resolution Inputs:** Dynamically reveals repair notes, active stock usage logging, and proof photo upload controls only after clicking **`Start Work`**.
* **Direct Requester Contact:** One-tap calling and WhatsApp shortcuts to coordinate on-site access with faculty or room supervisors.

---

## 🔄 System Workflow Architecture

```text
  [ End-User / Faculty ]                [ CISO Gatekeeper ]             [ Technical Assistant ]
            │                                    │                                 │
            │─── 1. Submit Issue / Request ─────>│                                 │
            │     (Status: SUBMITTED)            │                                 │
            │                                    │─── 2. Approve & Assign ────────>│
            │<── Status: IN_PROGRESS ────────────│    (Status: IN_PROGRESS)        │
            │                                    │                                 │─── 3. On-Site Fix / Handover
            │                                    │<── Status: PENDING_VERIFY ──────│    & Upload Photo
            │                                    │                                 │
            │<── Status: RESOLVED ───────────────│─── 4. Verify & Sign-Off ────────┘
```
