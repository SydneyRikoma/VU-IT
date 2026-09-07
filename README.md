# Campus Insight Hub

Lovable Prompt — Campus Intelligence Platform (UI Only, No Mock Data)

Build a frontend-only interface (no backend, no dummy/sample data pre-filled anywhere) for a university operations portal called "Campus Intelligence Platform." This system has exactly four modules — no others. Do not add, invent, or include any module, page, or feature beyond what is listed below. This is a UI shell — every list, table, and dashboard should render in its empty state with a clear "No data yet" placeholder and the correct empty-state icon/button, since no data will be seeded.

Global Visual Style (layout & shape language only)

Top bar: light lavender-grey background, product/portal name on the left, a simple row of navigation controls on the right (keep this minimal and generic).

Below that: a centered search bar ("Search Module") with a magnifying-glass icon, rounded corners, subtle border.

Main content: a light grey background containing a responsive grid of module cards (wraps to fewer columns on smaller screens). Each card: white background, soft rounded corners, subtle shadow, a light blue-to-white radial gradient circular panel behind a centered icon, and a bold module title above the icon. Cards should have a gentle hover-lift effect.

Color palette: white/light-grey backgrounds, deep navy/black text, a single accent blue (icons, active states, links, buttons), green for "active/success" and status-good indicators, amber/orange for "pending" states, red for "urgent/error" states.

Typography: clean sans-serif, bold for headings, medium-grey for secondary text.

Home Screen (Module Grid)

Exactly four module cards, each clickable and routing to its own page:

Asset Management

Ticket & Dispatch (Call Action Taken)

CCTV Surveillance

Audit & Compliance

Include a role switcher in the top bar (dropdown or pill) that changes which actions are visible/enabled across the system, with these options:

Primary Users (Administrative & Oversight): Admin, CISO (Chief Information Security Officer), HOD (Head of Department), Technical Assistant

End Users: Faculty, Teaching Staff, Non-Teaching Staff, Student, Department

(Approval/action buttons throughout the system should only appear enabled for the roles that would realistically hold that authority — e.g., approval steps for HOD/Technical Assistant/Admin, ticket-raising for all roles.)

Module 1: Asset Management

Sidebar or tab layout with exactly these sections:

Dead Stock (Hardware) — table view (columns: Component, Serial No., Department, Building/Floor/Lab, Status, Decommission Date), empty state, "+ Add Dead Stock Entry" button.

Current Stock (Hardware) — table view (columns: Component, Serial No., Assigned To, Department, Building/Floor/Lab, Status), empty state, "+ Add Stock Entry" button.

Faculty Profiles — card/grid list (photo placeholder, name, department, assigned assets count), empty state, "+ Add Faculty Profile" button.

Issue of Hardware — filterable table/form view with filters for Department, Floor, Building, Lab; empty state; "+ Issue Hardware" button opening a form (Component, Recipient, Department, Location, Date).

Year-Wise Hardware Registry — a year-selector, showing a table in the fixed uniform format: Year | Hardware Component | Issue No. | Issue Name, empty state per year.

Do not add any other sections to this module (no purchasing, no vendor management, no maintenance scheduling — these are not in scope).

Module 2: Ticket & Dispatch (Call Action Taken)

Build this module around the exact process flow below and nothing beyond it:

Ticket Raise (Issue Request): a "Raise a Ticket" button opening a form — Issue Title, Description, Category, Priority (High / Moderate / Low), Location (Dept/Floor/Building/Lab), Attach Photo (upload placeholder).

Request Intake & Triage: a triage view where incoming tickets are assigned a priority using a Priority Rating Matrix (a simple matrix/table UI for setting Urgency × Impact → resulting Priority), producing the High/Moderate/Low rating.

Multi-Tier Approval Pipeline: a horizontal stepper/progress-tracker on each ticket's detail page with exactly these stages — Raised → Law HOD → CSE HOD → Tech, each stage showing a status icon (pending/approved/rejected) and Approve/Reject/Comment actions (enabled only for the appropriate role).

Lifecycle Status Tracker: a Kanban-style board with exactly three columns — Taken, In Progress, Completed — cards draggable between columns, each showing Ticket ID, Title, and a Priority badge (High/Moderate/Low), colored red/amber/green respectively. Empty columns show "No tickets in this stage."

Alert Notification: a settings/log panel with two toggles only — "Send WhatsApp Alert" and "Send System Message Alert" — plus a log list of alert events, empty state.

Do not add any other views to this module (no SLA reporting, no analytics dashboards, no asset linkage — these are not in scope).

Module 3: CCTV Surveillance Management

Build exactly these three pieces:

Node Health Monitor: a grid of camera nodes as status cards (Camera ID, Location, status indicator dot: green=online/red=offline/grey=unknown), a "Run Ping Sweep" button, and a "WhatsApp Notification Alert on Node Down" toggle. Empty state: "No cameras registered."

Incident Trigger and Entry: a table (Incident ID, Camera/Location, Type, Reported By, Timestamp, Status), "+ Log Incident" button opening a form, empty state.

Week-Wise CCTV Report Generation: a week selector plus a "Generate Report" button producing a report placeholder card (title, date range, download icon). Empty state before generation.

Do not add any other views to this module (no live video feed, no facial recognition, no analytics beyond the report — these are not in scope).

Module 4: Audit and Compliance

Build exactly these two engines, plus a visible slot for future ones:

NAAC Analytics Engine: dashboard showing "Criteria Four Metrics" as metric cards/gauges (circular progress rings, empty/0% state), "+ Add Metric Data" button.

NBA Compliance Engine: a department-wise table of Lab Uptime (Department, Lab, Uptime %, Last Audited), empty state, "+ Add Compliance Record" button.

A third, clearly labeled placeholder card — "+ Add Compliance Engine" — indicating more engines will be added later (do not invent what they are).

Behavior Notes for Lovable

Build only the four modules and the exact sections listed above — do not add extra modules, extra menu items, or extra features not described in this brief.

Do not pre-populate any table, card, or list with sample/mock records — every data view must render its true empty state with an icon, a short message, and the relevant "add/create" call-to-action button.

All forms, filters, dropdowns, the priority matrix, the approval stepper, and the Kanban board should be interactive/functional in the UI (state changes, drag-and-drop, modal open/close) even without a backend — just don't fabricate data to display.

Keep the same header/search/module-grid shell consistent across every page — each module is entered by clicking its card and returning via a back arrow or breadcrumb next to the search bar.

Fully responsive down to tablet width.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/39e0aff2-69a6-45aa-ab73-af93020081f4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
