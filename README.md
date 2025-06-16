
# 🚍 RouteAura Bus Booking Platform

> **Modern fleet & route management, online ticketing, and content control—all in one powerful system.**

---

## ✨ Table of Contents

- [Overview](#overview)
- [How The Platform Works](#how-the-platform-works)
- [Key Features](#key-features)
- [🧑‍💻 Admin System](#admin-system)
  - [Admin Dashboard Breakdown](#admin-dashboard-breakdown)
  - [Superadmin vs. Branch Admin](#superadmin-vs-branch-admin)
  - [Admin Content Management](#admin-content-management)
- [🧑‍🦰 Passengers/Users](#passengersusers)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Authentication & Roles](#authentication--roles)
- [📈 Analytics & Reporting](#-analytics--reporting)
- [🌈 UI/UX Design](#-uiux-design)
- [🛠️ Local Development Setup](#️-local-development-setup)
- [📝 Contribution](#-contribution)
- [FAQ & Troubleshooting](#faq--troubleshooting)
- [License](#license)
- [Support & Resources](#support--resources)

---

## Overview

**RouteAura** is an advanced bus booking and fleet management platform enabling seamless online seat booking for passengers and robust back-office operations for transport company admins.

- **Passengers:** Discover, book, and manage bus journeys.
- **Admins:** Manage bookings, buses, routes, schedules, receipts, content, and analytics.
- **Future-Facing:** Driver login/dashboard, multi-branch support, role-based permissions, live analytics.

---

## How The Platform Works

### For Passengers (Frontend)

1. **Landing Page:** 
   - Hero section with search form for locations/routes.
   - Key selling points, features, fleet preview, testimonials.

2. **Journey Booking Flow:**
   - Search/browse available routes with real-time seat selection.
   - Register/Login for personalized bookings.
   - Book and receive tickets/receipts by email and dashboard.

3. **Manage Bookings:**
   - See upcoming/past journeys, reschedule or request a change, download receipts.

4. **Company Info:**
   - About page, company values, milestones, team, and stats—all editable via admin CMS.

---

### For Admins (Back Office)

1. **Login:**  
   - Superadmins have all-system access; branch admins see only assigned branch data.

2. **Dashboard:**  
   - High-level KPIs, charts (bookings, revenue, routes, users).

3. **Management Modules** *(see below)*:
   - Bookings, manual bookings, fleet, schedules, locations, drivers, users, receipts, content, branches.

4. **Content Management:**  
   - Powerful, live CMS for About/team/values/timeline/stats.

5. **Branch System:**
   - Each admin is tied to a branch; superadmins can manage all branches and assign admins.

6. **Analytics & Data Export:**  
   - Built-in analytics; CSV/XLS export for all tables.

---

## Key Features

- **Online Booking:** Real-time seat map, OTP/auth, digital tickets.
- **Comprehensive Admin:** Booking management, schedules, receipts, branches, super roles.
- **Live Content Edits:** About, team, values, company stats—instant updates.
- **Global Site Configuration:** Manage site name, logo, navigation links, and footer content directly from the admin panel.
- **Multi-branch:** All entities (routes, fleet, bookings, users) are branch-tied.
- **Security:** RLS on all sensitive tables, robust Supabase authentication.
- **Modern UI:** Mobile-first, beautiful Tailwind + shadcn/ui, instant toasts, and iconography.
- **Export & Audit:** Download reports, analytics dashboards, data visibility by role.

---

## 🧑‍💻 Admin System

Admin dashboard is available at:

```
/route-aura-booking-admin-page/dashboard
```

### Admin Dashboard Breakdown

> **Navigation Sidebar:**
>
> | Module             | Path                                      | Description                                            |
> |--------------------|-------------------------------------------|--------------------------------------------------------|
> | Overview           | `/dashboard`                              | Main stats, charts, KPIs                               |
> | Bookings           | `/dashboard/bookings`                     | Manage all bookings                                    |
> | Manual Bookings    | `/dashboard/manual-bookings`              | Create bookings offline/manual                         |
> | Reschedule Req.    | `/dashboard/reschedule-requests`          | Handle reschedule requests                             |
> | Receipts           | `/dashboard/receipts`                     | Issue/verify receipts                                  |
> | Receipt Templates  | `/dashboard/receipt-templates`            | Set up custom receipt formats                          |
> | Users              | `/dashboard/users`                        | All passengers/users                                   |
> | Fleet              | `/dashboard/fleet`                        | Manage buses/fleet data                                |
> | Schedules          | `/dashboard/bus-schedules`                | Trip timings and bus schedule                          |
> | Routes             | `/dashboard/routes`                       | Create/edit routes                                     |
> | Locations          | `/dashboard/locations`                    | Manage stop points                                     |
> | Drivers            | `/dashboard/drivers`                      | Onboard and assign drivers                             |
> | Reviews            | `/dashboard/reviews`                      | Manage customer reviews                                |
> | Messages (Inbox)   | `/dashboard/messages`                     | Contact/inbox system                                   |
> | FAQs               | `/dashboard/faqs`                         | Site FAQ management                                    |
> | Offices            | `/dashboard/offices`                      | Branch office addresses                                |

<details>
<summary>Superadmin Only Tabs</summary>

| Module             | Path                            | Description                             |
|--------------------|---------------------------------|-----------------------------------------|
| Branches           | `/dashboard/branches`           | Add/edit branch data                    |
| Content Management | `/dashboard/content-management` | About/Team/Stats live editor            |
| Site Settings      | `/dashboard/site-settings`      | Manage branding, navigation, and footer |
| Data Export        | `/dashboard/data-management`    | Export all system data                  |
| Admin Users        | `/dashboard/admin-users`        | Create new branch admins                |

</details>

---

### Superadmin vs. Branch Admin

- **Superadmin:**  
  - Unrestricted control, ALL branches/tables visible.
  - Assign new admins, manage all company data/content.
  - RLS bypass for top-level operations.
- **Branch Admin:**  
  - Only see/edit their assigned branch (bookings, users, receipts).
  - Cannot edit company-wide settings, export all data, or create new admins.

## Admin Content Management

*Powerful CMS available at `/dashboard/content-management` for Superadmins*  
- All "About", "Values", "Team", "Milestones", and "Statistics" data editable via sleek forms.
- Changes go live instantly; past versions auditable via RLS policies.

---

## 🧑‍🦰 Passengers/Users

**Landing:** `/`  
Explore available routes, company info, fleet, and more.

### Booking Flow:

1. **Search:** Input origin/destination, select branch/location.
2. **Select Route & Seat:** Live seat maps using real-time DB sync.
3. **Login/Signup:** Secure OTP/email or password login.
4. **Pay/Confirm:** (Payment gateway integration future-proofed—currently confirmation for demo)
5. **Receive Ticket/Receipt:** Via email & on dashboard.
6. **Manage Bookings:** View, reschedule, cancel, or download receipt.

---

## System Architecture

```mermaid
graph TD
A[Frontend: React/Vite] -->|REST| B[Supabase (API/DB/auth)]
B -->|Storage| C[Files/Images]
B -->|Edge Functions| D[Custom Backend Logic]
B -->|RLS| E[Auth/Branch Logic]
A -->|Realtime| B
```

- **Frontend:** React + Vite + Tanstack React Query for data, cache, and state.
- **Backend:** Supabase Postgres + direct row-level security + Edge Functions.
- **Storage:** Supabase for all booking, user, fleet, and static content.
- **Realtime:** Bus seat selection, booking status.

---

## Tech Stack

| Layer      | Tech |
|------------|------|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui |
| **Auth**  | Supabase Auth (Admin, Branch admin, Passenger) |
| **Backend** | Supabase Postgres (w/ RLS) + Edge Functions |
| **Data**  | @tanstack/react-query, Recharts (analytics) |
| **UI**    | Lucide icons, Sonner toasts, date-fns (utils) |

---

## Project Structure

```
src/
├── components/
│   ├── admin/              # All admin dashboard, tab modules, content mgmt
│   ├── booking/            # Booking-related step flows
│   ├── ui/                 # shadcn/ui and re-used primitives
│   └── layout/             # Navbar, footer, wrappers
├── contexts/               # Auth, branch, theme, etc.
├── hooks/                  # Custom hooks (data fetching, utils)
├── integrations/           # Supabase client & types
├── pages/                  # All routed pages (home, about, admin, etc.)
├── utils/                  # Utility functions
public/                     # Static assets (images/icons)
```
Special care:  
- All major admin features are split into focused files in `components/admin/`
- Pages for navigation/routing in `pages/`
- Reusable UI in `components/ui/`, based on shadcn/ui.

---

## Authentication & Roles

- **Supabase Auth:**  
  All API calls secured. Only admins with proper roles access sensitive tabs.
- **RLS Policies:**  
  All DB tables protected to prevent unauthorized reads/writes.
- **Route Guard:**  
  React Router checks plus context guards for specific admin pages.

---

## 📈 Analytics & Reporting

- **Charts:**  
  Real-time bookings, usage, revenue, and occupancy visits (Recharts).
- **Export:**  
  Superadmin can export bookings, users, receipts, analytics as CSV/XLS instantly from any dashboard.
- **Custom Reports:**  
  Data filtered by branch, date, route, and booking type.

---

## 🌈 UI/UX Design

- **Responsive:**  
  Mobile-first, touch-optimized, fully adaptive layout.
- **shadcn/ui:**  
  Consistent buttons, forms, tabs, switchers, skeletons, and more.
- **Toasts:**  
  All CRUD ops give instant Sonner-based feedback.

---

## 🛠️ Local Development Setup

**1. Clone & Install**

```bash
git clone <repo-url>
cd <project-dir>
npm install
```

**2. Configure Supabase**

- Update keys at `src/integrations/supabase/client.ts` if self-hosted.
- Review `.sql` migrations in `/supabase/migrations` for RLS and table structure.

**3. Run App**

```bash
npm run dev
```
Visit [http://localhost:5173](http://localhost:5173)

---

## 📝 Contribution

- Keep code modular, favor small focused files.
- Use TypeScript types.
- Stick to existing design system (shadcn/ui + Tailwind).
- For backend: add new `.sql` migrations, do NOT change existing ones.
- Always run and test before pushing a PR.

---

## FAQ & Troubleshooting

<details>
<summary>I'm not seeing admin routes after login!</summary>

Check your admin role and assigned branch. Only superadmins see all tabs.
</details>

<details>
<summary>How do I add/edit content for the About or Team page?</summary>

Login as superadmin, open "Content Management" in the admin sidebar.
</details>

<details>
<summary>How do I export report data?</summary>

Data export is under the "Data Management" tab for superadmins.
</details>

<details>
<summary>Can I connect a custom domain?</summary>

Yes! After deploying on Lovable, open Settings > Domains.
</details>

---

## License

MIT

---

## Support & Resources

- [Lovable documentation](https://docs.lovable.dev)
- [Supabase documentation](https://supabase.com/docs)
- [shadcn/ui components](https://ui.shadcn.com/)
- [Community Discord](https://discord.gg/lovable)

---

> _RouteAura—making route, fleet, and journey management delightful for both company and customers._ 🚎✨

