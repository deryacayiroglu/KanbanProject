# 📋 TaskFlow – Kanban Board Application

TaskFlow is a clean, minimal, and highly interactive Trello-like Kanban board application. It allows users to efficiently manage tasks using boards, columns, and cards with seamless drag-and-drop functionality. 

Designed for individuals and small teams, TaskFlow focuses on providing a frictionless user experience with a lightweight, distraction-free interface.

---

## 🚀 Live Demo

[View Live Demo](#) *(https://taskflow-rho-weld.vercel.app/)*

---

## ✨ Features

- **Authentication:** Secure login and registration powered by Supabase Auth with email confirmation flow.
- **Board & Column Management:** Full CRUD operations for boards, columns, and cards.
- **Advanced Drag-and-Drop:** Move cards within and across columns, and reorder entire columns seamlessly.
- **Fractional Ordering:** Highly efficient mathematical ordering system to prevent database bottlenecks during drag-and-drop.
- **Label System:** Assign multiple categorical tags (Bug, Feature, Urgent, Review) to cards.
- **Interactive Filtering:** Toggle-based label filtering directly from the board header.
- **Optimistic UI:** Instant visual feedback without waiting for server responses.
- **Responsive & Mobile-Friendly:** Clean interaction layers tailored for touch devices.
- **Smart Search:** Board search integrated into the header for quick navigation.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js (App Router)](https://nextjs.org/)
- **Library:** [React](https://reactjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Backend & Database:** [Supabase](https://supabase.com/) (Auth + PostgreSQL)
- **Drag and Drop:** [dnd-kit](https://dndkit.com/)

---

## 🖱️ Drag & Drop Approach

TaskFlow relies on **dnd-kit** for its drag-and-drop architecture. dnd-kit was chosen over older libraries (like react-beautiful-dnd) because it is lightweight, highly modular, accessible by default, and perfectly compatible with Next.js App Router and React Server Components.

- **Dual-Axis Sorting:** The board uses a horizontal sorting strategy for columns, and a vertical sorting strategy for cards within those columns.
- **Collision Detection:** A custom collision detection algorithm ensures predictable dropping behaviors when moving cards over empty columns.
- **Mobile Touch Handling:** Drag-and-drop includes custom sensor strategies (Touch, Mouse, Keyboard) with activation constraints (e.g., small pixel delays) to differentiate between a user scrolling the page versus attempting to drag a card.

---

## 🔢 Data & Ordering Strategy

Reordering items in a relational database can be computationally expensive if every item's position needs to be updated. TaskFlow solves this using **Fractional Ordering**.

- Cards and columns are assigned numeric `position` values (e.g., 100, 200, 300).
- When a card is moved between two existing cards (e.g., between 100 and 200), it is assigned the mathematical midpoint (e.g., 150).
- **Efficiency:** This allows 99% of drag-and-drop operations to require only **a single database update** for the moved item, completely avoiding full-column recalculations. Rebalancing only occurs automatically if fractional limits are reached.

---

## 🏗️ Architecture

TaskFlow utilizes a modern feature-based directory structure to maintain scalability:

- **Next.js App Router (`src/app`):** Handles layouts, page routing, and initial server-side data fetching.
- **Feature Modules (`src/features`):** Code is logically grouped by domain (`boards`, `columns`, `cards`). Each feature contains its own:
  - `components/` (UI elements)
  - `actions.ts` (Next.js Server Actions)
  - `queries.ts` (Server-side data fetching)
  - `types.ts` (TypeScript interfaces)
- **Separation of Concerns:** UI state is purely client-side optimistic, while persistence logic is safely delegated to Server Actions running securely on the backend.
- **Secure Auth Flow:** Email verification is handled via Supabase, with controlled redirects to maintain a consistent login-first access pattern.
---

## 🎨 UX Decisions

- **Minimalist Design:** Emphasizes white space, subtle borders, and smooth shadows to keep the focus purely on task data.
- **Dot Labels over Badges:** Trello-style text badges were replaced with sleek, colored dots. This provides a cleaner UI footprint while offering detailed text via native tooltips on hover.
- **Collapsible Filtering:** The label filter menu is an elegant, non-intrusive dropdown positioned in the header, opening dynamically only when required.
- **Optimistic Updates:** Dragging items instantly updates the local client state. Database syncing happens implicitly in the background to ensure zero perceived latency.
- **Safety Prompts:** Destructive actions (like deleting lists or cards) are protected by generic Confirm Dialog modals to prevent accidental data loss.
- **Authentication Flow:** Email confirmation redirects users to the login page instead of granting direct access, ensuring a secure and predictable authentication experience.
- **Clean Feedback:** Login interactions use lightweight loading states instead of intrusive toast notifications, keeping the experience minimal and focused.

---

## 💻 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/taskflow.git
cd taskflow
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

---

## 🔮 Future Improvements

While TaskFlow covers the core Kanban methodology, planned features for the roadmap include:
- **📅 Due Dates:** Assign and track deadlines for specific cards.
- **👤 Assignees:** Link users to tasks for team environments.
- **⚡ Real-time Collaboration:** Live board syncing across multiple active clients using Supabase Realtime.
- **📜 Activity History:** A unified timeline showing comments, moves, and edits on cards.

---