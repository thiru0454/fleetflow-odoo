# 🚛 FleetFlow — Intelligent Fleet Management System

> A modern, role-based fleet management platform built with React, TypeScript, and Supabase. Manage vehicles, drivers, trips, maintenance, expenses, and safety — all in one place.

---

## 🌐 Live Demo

<!-- Update this link after deployment -->
[fleetflow](https://fleettracker-odoo.netlify.app/)

---

## ✨ Features

### 🏠 Command Center Dashboard
- Real-time KPI cards (active trips, available vehicles, driver count, costs)
- Live system status indicator with pulse animation
- Recent trips overview with status highlights
- Quick actions: New Trip, Add Vehicle, Register Driver

### 🚗 Vehicle Management
- Full CRUD for fleet vehicles
- Real-time availability tracking (Available / On Trip / In Shop)
- Auto-status update when a trip is dispatched or completed
- Capacity and cargo weight tracking

### 👨‍✈️ Driver Management
- Complete driver profiles with license tracking
- License expiry warnings (30-day alert + blocking expired drivers from dispatch)
- Safety score, completion rate, and complaints tracking
- Status management: On Duty / Off Duty / Suspended
- Editable performance metrics with sliders

### 🗺️ Trip Dispatcher
- Create & dispatch trips with real-time vehicle/driver availability
- Auto cargo capacity validation (blocks overloaded trips)
- License expiry validation (blocks assigning expired drivers)
- Trip lifecycle: Scheduled → Active → Completed / Cancelled
- Auto vehicle & driver status sync on every status change

### 🔧 Maintenance Tracking
- Log maintenance with service type, cost, and status
- Auto-sets vehicle to `In Shop` when maintenance is logged
- Status progression: New → In Progress → Completed
- KPI bar: Vehicles In Shop, Active Services, Total Cost

### 💰 Expenses & Analytics
- Track fuel, maintenance, tolls, and other fleet expenses
- ROI calculation: `(Revenue − (Maintenance + Fuel)) / Acquisition Cost`
- Fuel efficiency tracking (km/L)
- Stacked bar charts, pie charts, and monthly trend lines
- CSV export for financial reporting

### 🛡️ Safety & Compliance
- Safety incident logging and tracking
- Vehicle inspection records
- Safety reports with trend analysis
- Role-restricted safety dashboard for Safety Officers

### 🔐 Role-Based Access Control (RBAC)
| Role | Access |
|---|---|
| **Fleet Manager** | Full access to all modules |
| **Dispatcher** | Trips only |
| **Safety Officer** | Drivers + Safety modules |
| **Financial Analyst** | Expenses + Analytics |

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| State | Zustand |
| Auth & DB | Supabase |
| Charts | Recharts |
| Icons | Lucide React |
| Routing | React Router v6 |
| Build | Vite |
| Forms | React Hook Form + Zod |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project

### 1. Clone the repo
```bash
git clone https://github.com/thiru0454/fleetflow-odoo.git
cd fleetflow-odoo
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
Create a `.env` file in the root:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set up the database
Run the SQL files in your Supabase SQL Editor in this order:
1. `COMPLETE_DATABASE_SETUP.sql` — Full schema setup
2. `SQL_SETUP.sql` — Role confirmation column

### 5. Start the dev server
```bash
npm run dev
```

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |

---

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ui/           # shadcn/ui base components
│   └── AppLayout.tsx # Main sidebar layout
├── pages/            # Route-level page components
├── store/            # Zustand state (auth + fleet)
├── lib/              # Utilities and Supabase client
└── hooks/            # Custom React hooks
```

---

## 🎨 Design System

- **Theme**: Dark mode, optimized for fleet operations centers
- **Primary Color**: Sky Blue `#0ea5e9`
- **Pattern**: Glass-morphism cards with backdrop blur
- **Animations**: Fade-in rows, scale-in cards, smooth hover transitions
- **Status Colors**: 🟢 Available · 🟠 On Trip / Active · 🔴 Maintenance / Suspended

---

## 🤝 Contributors

| Name |
|---|
| [thiru0454](https://github.com/thiru0454) |
| [Udithkumar71](https://github.com/Udithkumar71) |
| [SabariKarthick27](https://github.com/SabariKarthick27) |
| [abishekprof](https://github.com/abishekprof) |

---

## 📄 License

This project is for educational and hackathon purposes.

---
