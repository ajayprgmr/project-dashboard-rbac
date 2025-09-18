# Fixl Solutions Project Management SaaS

A Jira-inspired project management dashboard featuring role-based access, Kanban and table task views, team controls, and analytics – all built with React, Redux Toolkit, and Vite. State is persisted to `localStorage`, allowing mock users to pick up where they left off.

## Feature Highlights
- **Authentication & Roles** – Mock login via Formik + Yup with persisted sessions for Admin, Project Manager, Developer, and Viewer personas. Admins can impersonate any account.
- **Projects Workspace** – Card/table views with filters, role-aware CRUD, and quick member insights.
- **Tasks Board** – Drag-and-drop Kanban (planner, in-progress, review, done) plus a sortable table view with filters and developer-only status updates.
- **Teams Hub** – Project-level rosters with role badges, task counts, and assignment dialog (admin + owning PM control).
- **Reports & Analytics** – Recharts dashboards for completion trends, project status mix, and top contributors, driven by async mock API calls.
- **Global UI Polish** – Responsive MUI shell with sidebar navigation, dark/light toggle, global search, and toast notifications for key actions.

## Tech Stack
- **Framework:** React 18 + Vite
- **State:** Redux Toolkit, Redux Thunks, localStorage persistence
- **UI:** Material UI, custom theme, responsive layout
- **Drag & Drop:** `@hello-pangea/dnd`
- **Forms & Validation:** Formik + Yup
- **Charts:** Recharts
- **Date Utilities:** date-fns

## Getting Started
```bash
npm install
npm run dev
```

The app runs on [http://localhost:5173](http://localhost:5173) by default. To create a production build:
```bash
npm run build
npm run preview
```

## Mock Credentials
| Role | Name | Email | Password |
| --- | --- | --- | --- |
| Admin | Aarav Sharma | `aarav.sharma@fixl.test` | `admin123` |
| Project Manager | Maya Patel | `maya.patel@fixl.test` | `manager123` |
| Project Manager | Rohan Iyer | `rohan.iyer@fixl.test` | `manager123` |
| Developer | Neha Singh | `neha.singh@fixl.test` | `dev123` |
| Developer | Kabir Mehta | `kabir.mehta@fixl.test` | `dev123` |
| Viewer | Ananya Rao | `ananya.rao@fixl.test` | `viewer123` |

## Role-Based Access Matrix
| Module | Admin | Project Manager | Developer | Viewer |
| --- | --- | --- | --- | --- |
| Authentication | ✓ full | ✓ own | ✓ own | ✓ own |
| Impersonation | ✓ | ✗ | ✗ | ✗ |
| Projects | CRUD all | CRUD own projects | View assigned | View assigned |
| Tasks | CRUD all | CRUD within managed projects | Update status on assigned | Read-only |
| Teams | Manage all rosters | Manage owned rosters | Read-only | Read-only |
| Reports | Full access | Full access | Read-only | Read-only |

## Project Structure
```
src/
├─ assets/           # Static images/icons if needed
├─ components/       # Shared, feature-agnostic UI (dialogs, notifications)
├─ data/             # Mock JSON seeds for users/projects/tasks
├─ features/         # Domain logic (slices, async thunks, feature components)
├─ hooks/            # Reusable hooks (`useRedux`, etc.)
├─ layouts/          # Application shell / navigational chrome
├─ pages/            # Route-level screens wiring features together
├─ routes/           # Router + route guards
├─ store/            # Redux Toolkit store configuration & persistence
└─ utils/            # Mock API + localStorage helpers
```

## State Persistence & Mock API
- State slices are persisted via `store.subscribe` to `localStorage`.
- `src/utils/mockApi.js` simulates server calls with latency, hydrated from persisted state to keep mock data and Redux in sync.
- Async thunks wrap these calls to keep UI responsive and realistic.

## Suggested Next Steps
1. Deploy to Vercel or Netlify (`npm run build` ➜ upload `dist/`).
2. Add automated tests (React Testing Library) to cover role guards and reducers.
3. Wire optional bonus features: activity log, GraphQL mock, or websocket simulation.

Happy shipping! 🎯
