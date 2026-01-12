# Terrier Eats 🍽️

*A mobile-first dining analytics & budgeting app built to help students manage and understand their campus meal plans*

Terrier Eats is a product-driven web application that helps Boston University students track dining usage, analyze spending patterns, and manage weekly budgets for campus dining systems. The app is designed as a **PM-coded prototype**, emphasizing user pain points, data modeling, and UX logic rather than production integrations.

This project was built with **Next.js App Router**, **Supabase**, and **Tailwind CSS**, and closely follows the original Figma prototype.

---

## 🚀 Features Overview

### 🔐 Authentication
- Email/password authentication via Supabase  
- Secure server-side session handling  
- User-scoped data via Row Level Security (RLS)

---

### 🏠 Home Dashboard
- Snapshot of remaining:
  - Dining points
  - Convenience points
  - Swipes
- Quick visual overview for daily usage  
- Anchors the app around **“How much do I have left?”**

---

### 📅 Calendar + Dining View
- Date-based browsing of dining hall menus  
- Mock menu data structured to mirror real dining APIs  
- Meal breakdown by breakfast / lunch / dinner
- Daily nutrient intake logging (calories, macros, key nutrients)
- Aggregates nutrients across multiple meals per day
- Users can log meals multiple times per day (no artificial limits)

**Why this matters**  
Models real student behavior where meals are not discrete or capped. Allows students to keep track of their daily nutrient intake.

---

### 📊 Spending Analytics
- Dining vs Convenience toggle  
- Line graph of spending over time  
- Remaining balance + reminder context  
- Aggregates real transaction data from Supabase  
- Responsive chart sizing for mobile layouts  

**Product insight**  
Students don’t just want balances — they want trends and runway awareness.

---

### 💰 Budget Screen

The most PM-driven feature in the app.

**Current functionality**
- Weekly breakdown view  
- Category-level limits (Dining vs Convenience)  
- Remaining points visualization  
- Progress bars that fill as spending increases  
- Warning colors when approaching or exceeding limits  

**Planned extensions**
- Editable budget limits  
- Smart alerts when overspending  
- Carry-over logic between weeks  

**User pain point addressed**

> “I don’t know where my points are going until they’re gone.”

---

### 👤 Profile
- User info  
- Settings  
- Designed for extensibility (notifications, preferences, etc.)

---

## 🧠 Product Thinking Highlights
- No artificial restrictions on meal logging  
- Clear separation between swipes and points  
- Derived data (analytics, budgets) computed from raw transactions  
- UI prioritizes clarity over precision (student-friendly)

This project intentionally balances:
- Engineering correctness  
- Product intuition  
- Interview-ready storytelling  

---

## 🛠️ Tech Stack

| Layer | Technology |
|------|-----------|
| Frontend | Next.js 16 (App Router) |
| Styling | Tailwind CSS |
| Backend | Supabase (Postgres + Auth) |
| Charts | Recharts |
| Deployment | Vercel |
| Data Modeling | Supabase RLS + typed server actions |

---

## 📁 Project Structure

src/
├─ app/
│   ├─ (auth)/login
│   ├─ (app)/
│   │   ├─ home
│   │   ├─ calendar
│   │   ├─ analytics
│   │   ├─ budget
│   │   └─ profile
├─ data/
│   └─ mockMenus.ts
├─ lib/
│   └─ supabaseServer.ts
|   └─ supabaseClient.ts
├─ components/
└─ types/

---

## 🧪 Mock Data Philosophy
- Menus rotate deterministically by date  
- Transactions mimic real spending behavior  
- Budget & analytics logic is production-realistic  
- Data structures match what real campus APIs would provide  

---

## 🌱 Future Improvements
- Editable budgets with persistence  
- Push notifications for overspending  
- Real dining API integration  
- Weekly insights (e.g. *“You spent 30% more on weekends”*)  
- Exportable spending reports  

---

## 🎯 Why This Project Exists

Terrier Eats was built to demonstrate:
- End-to-end product thinking  
- PM-driven feature prioritization  
- Realistic data modeling  
- UI decisions grounded in user behavior  


---

## 📦 Deployment (coming soon)
- Hosted on Vercel  
- Supabase integrated via environment variables  
- Production-safe server actions and auth handling  

---