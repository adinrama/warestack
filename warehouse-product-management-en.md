# 📦 Warehouse Product Management System — Project Specification

> **Document Purpose:** This document is a complete technical specification used as a guideline for developing a warehouse product management system. It is designed to be directly understandable and executable by an AI coding assistant.

---

## 1. Project Overview

### 1.1 System Description

This system is a web-based **Warehouse Product Management** application that allows warehouse teams to manage product data in a structured and controlled manner based on user role hierarchy. Each **Staff Lead** has an isolated product workspace and manages their own team of Staff.

### 1.2 Actors & Roles

| Role | Role Code | Capabilities |
|------|----------|-------------|
| **Staff Lead** | `STAFF_LEAD` | CRUD products, assign/remove staff members, can only view their own products |
| **Staff** | `STAFF` | Read & update products from their assigned Staff Lead |

---

### 1.3 Core Business Rules

1. Each **Staff Lead** can only see products they created.
2. Each **Staff** must be assigned to a Staff Lead to access products.
3. A **Staff can only belong to one Staff Lead**.
4. A **Staff Lead can have a maximum of 5 Staff members**.
5. Only the **respective Staff Lead** can assign/remove staff.
6. **Staff can only Read & Update**.
7. All product and team endpoints must be authenticated.

---

## 2. Tech Stack

### 2.1 Frontend

- Next.js
- TailwindCSS
- shadcn/ui
- NextAuth.js
- React Hook Form
- Zod
- Axios / Fetch

### 2.2 Backend

- Express.js
- Prisma ORM
- MySQL
- bcryptjs
- jsonwebtoken
- dotenv
- cors
- express-validator

---

## 3. Database Rules

- `staffLeadId` in users only valid for STAFF → STAFF_LEAD
- `staffLeadId` in products must refer to STAFF_LEAD
- Max 5 staff per Staff Lead

---

## 4. Authentication

- NextAuth.js (frontend)
- JWT (backend)
- Credentials login

---

## 5. API Summary

### Auth
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me`

### Products
- GET `/api/products`
- GET `/api/products/:id`
- POST `/api/products`
- PUT `/api/products/:id`
- DELETE `/api/products/:id`

### Team
- GET `/api/team/members`
- GET `/api/team/available-staff`
- POST `/api/team/assign`
- DELETE `/api/team/remove/:staffId`

---

## 6. Frontend Pages

- Login
- Dashboard
- Products List
- Create Product
- Edit Product
- Team Management

---

## 7. Key Features

- Role-based access control
- Product isolation per Staff Lead
- Max 5 team members
- Staff limited permissions
- Secure authentication

---

## 8. Environment Variables

### Frontend
```
BACKEND_URL=http://localhost:5000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret
```

### Backend
```
DATABASE_URL=mysql://...
JWT_SECRET=...
PORT=5000
```

---

## 9. Setup

### Backend
```
npm install
npx prisma migrate dev
npm run dev
```

### Frontend
```
npm install
npm run dev
```

---

## 10. User Flow

1. Staff Lead registers
2. Adds products
3. Assigns staff
4. Staff updates stock
5. Staff removed → loses access

---

## 11. Error Handling

- Unauthorized → 401
- Forbidden → 403
- Duplicate SKU → 400
- Team full → 400

---

## 12. Checklist

### Backend
- Auth
- Product logic
- Team logic

### Frontend
- Pages
- Auth
- UI
