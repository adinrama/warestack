# 📦 WareStack — Warehouse Product Management System

A full-stack web application for warehouse product management with role-based access control.

---

## 🏗 Architecture

```
warehouse-app/
├── backend/          # Express.js REST API
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── productController.js
│       │   └── teamController.js
│       ├── middleware/
│       │   └── auth.js
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── productRoutes.js
│       │   └── teamRoutes.js
│       └── server.js
└── frontend/         # Next.js 14 App Router
    └── src/
        ├── app/
        │   ├── (dashboard)/
        │   │   ├── dashboard/     # /dashboard
        │   │   ├── products/      # /products + /products/:id + /products/create
        │   │   └── team/          # /team (Staff Lead only)
        │   ├── api/auth/          # NextAuth.js handler
        │   └── login/             # /login
        ├── components/
        │   └── layout/Sidebar.tsx
        ├── lib/
        │   ├── api.ts             # Axios client
        │   └── utils.ts
        └── types/
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8+ running locally

### 1. Database Setup
```sql
CREATE DATABASE warehouse_db;
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials

npm install
npx prisma migrate dev --name init
node src/prisma/seed.js   # Creates demo accounts
npm run dev               # Starts on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
cp .env.local.example .env.local
# Edit .env.local if needed

npm install
npm run dev               # Starts on http://localhost:3000
```

---

## 🔑 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| **Staff Lead** | lead@warehouse.com | password123 |
| **Staff** | staff1@warehouse.com | password123 |

---

## 👥 Role Permissions

| Feature | Staff Lead | Staff |
|---------|-----------|-------|
| View products | ✅ (own) | ✅ (lead's) |
| Create product | ✅ | ❌ |
| Edit full product | ✅ | ❌ |
| Update quantity only | ✅ | ✅ |
| Delete product | ✅ | ❌ |
| View team | ✅ | ❌ |
| Add staff | ✅ (max 5) | ❌ |
| Remove staff | ✅ | ❌ |

---

## 🌐 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register as Staff Lead |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | ✅ | Get current user |

### Products
| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/api/products` | ✅ | Both |
| GET | `/api/products/:id` | ✅ | Both |
| POST | `/api/products` | ✅ | Staff Lead |
| PUT | `/api/products/:id` | ✅ | Both (Staff: qty only) |
| DELETE | `/api/products/:id` | ✅ | Staff Lead |

**Query params for GET /api/products:** `search`, `category`, `page`, `limit`

### Team
| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/api/team/members` | ✅ | Staff Lead |
| GET | `/api/team/available-staff` | ✅ | Staff Lead |
| POST | `/api/team/assign` | ✅ | Staff Lead |
| DELETE | `/api/team/remove/:staffId` | ✅ | Staff Lead |

---

## 🔐 Business Rules Enforced

1. Each Staff Lead can only see their own products (`staffLeadId` isolation)
2. Staff can only view products from their assigned lead
3. Staff can only belong to one Staff Lead
4. Maximum **5 staff** per Staff Lead
5. Only the respective Staff Lead can assign/remove staff
6. Staff can only read & update stock quantity
7. All product and team endpoints require JWT authentication
8. Duplicate SKU detection with 400 error

---

## 🛠 Tech Stack

### Backend
- **Express.js** — REST API framework
- **Prisma ORM** — Type-safe database client
- **MySQL** — Relational database
- **bcryptjs** — Password hashing
- **jsonwebtoken** — JWT authentication
- **express-validator** — Request validation
- **cors** + **dotenv**

### Frontend
- **Next.js 14** (App Router)
- **TailwindCSS** — Styling
- **NextAuth.js** — Session management
- **React Hook Form** + **Zod** — Form validation
- **Axios** — HTTP client
- **Lucide React** — Icons
- **Sonner** — Toast notifications

---

## ⚠️ Error Codes

| Code | Meaning |
|------|---------|
| 400 | Validation error / Duplicate SKU / Team full |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (insufficient role) |
| 404 | Resource not found |
| 500 | Server error |
