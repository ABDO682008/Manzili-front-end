# Manzili — Egyptian Home Services Marketplace

## Overview
React + TypeScript frontend for Manzili, a marketplace for home services in Egypt. Connects to a live backend API at `http://manzili-app.runasp.net/api`.

## Tech Stack
- **React 19** + **TypeScript** + **Vite** (port 5000)
- **TailwindCSS v3** — design tokens: brand-600 `#4f46e5`, accent `#ec4899`, surface scale
- **Framer Motion** — page/card animations
- **Zustand** — auth state (persisted in localStorage as `manzili-auth`)
- **React Router v7** — lazy-loaded routes with role-based guards
- **Axios** — HTTP, with 401 refresh interceptor
- **React Hot Toast** — notifications

## Architecture

### API Layer (`src/api/`)
All API files use a local `normalize()` helper that converts any response shape `{success, data}`, `{success, message}`, or raw data into a uniform `{success, data, message?}` object.

| File | Endpoints |
|------|-----------|
| `auth.api.ts` | POST /auth/login, /auth/register, /auth/refresh |
| `services.api.ts` | GET /services/home/{no}, /services, /services/name/{name}, /services/{id} |
| `categories.api.ts` | GET /categories |
| `orders.api.ts` | POST /orders/request; GET /orders, /order/payment-summary; POST /orders/submit-payment |
| `seller.api.ts` | GET /seller/dashboard, /seller/services; POST /seller/services; PUT/DELETE /seller/services/{id} |

### Auth Store (`src/stores/authStore.ts`)
- Persists `user`, `refreshToken`, `isAuthenticated`, `role` to localStorage
- `setAuth(accessToken, refreshToken, apiRole)` — decodes JWT, maps `Provider → Seller`
- `role` field: `'Buyer' | 'Seller' | 'Admin' | 'DeliveryAgent'`

### Role Guards (`src/guards/RoleGuard.tsx`)
- `BuyerGuard`, `SellerGuard`, `AdminGuard`, `DeliveryGuard`, `PublicOnlyGuard`
- Redirects unauthenticated users to `/signin`

## Key Pages & Flows

### Buyer Flow
1. `/home` — Hero + category strip + 4 home sections (topDiscounts, recommended, mostPurchased, regular)
2. `/services` — Browse/search with debounced search (`/services/name/{name}`) + category filter
3. `/services/:id` — Service details with option group selection → POST `/orders/request`
4. `/requests` — View requests by status (Pending/Accepted/Paid/Rejected)
5. `/payment/summary` → `/payment/method` → `/payment/success` — full payment flow with base64 screenshot upload

### Seller Flow
1. `/seller/dashboard` — KPI stats from GET `/seller/dashboard`
2. `/seller/services` — List from GET `/seller/services` (PascalCase response: `{Items:[{Id,Title,...}]}`)
3. `/seller/services/create` — Categories from API + multipart form → POST `/seller/services`
4. `/seller/services/:id/edit` — Update service

## API Response Patterns
- Most endpoints: `{success: bool, data: T, message?: string}`
- Home sections: raw `{topDiscounts, recommended, mostPurchased, regular}` — normalized in API function
- Login: raw `{accessToken, refreshToken, role}` — handled in SignInPage
- Seller services: PascalCase `{Items: [{Id, Title, BasePrice, ...}]}`

## Design System
- **Brand**: `#4f46e5` (brand-600), `#4338ca` (brand-700)
- **Accent**: `#ec4899` (accent-500)
- **Gradient**: `linear-gradient(135deg, #4f46e5, #7c3aed)`
- **Surface**: `#fafafa` bg, `#18181b` text
- Cards use `boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 2px 8px rgba(0,0,0,0.05)'`
- `border-[1.5px]` on inputs, `rounded-2xl` on cards, `rounded-xl` on buttons

## Development
```bash
npm run dev    # starts on port 5000
npm run build  # TypeScript check + Vite build
```
