# DoorDesk Handoff

## Current State

DoorDesk is a greenfield internal sales tool in `/Users/nazarpetrushka/Documents/CRUD Tool`.

The app is implemented as a Next.js App Router project with:

- Next.js 15.5.x, React 19, TypeScript strict
- Tailwind CSS v4
- Local shadcn-style primitives in `components/ui`
- Prisma 6.19.x with PostgreSQL/Neon
- Auth.js/NextAuth v5 credentials auth
- Zod validation
- Server actions for CRUD mutations
- API route only for product import
- PWA support via `next-pwa`
- Vitest tests

The original user requested the locked stack as Next.js 14+, Tailwind v4, Prisma, Neon Postgres, Auth.js v5, Zod, Vercel, and PWA. Do not add Express, tRPC, Drizzle, MongoDB, Firebase, Docker/VPS deployment, or a separate backend.

## Local Environment

The `.env` file exists locally and is gitignored. It should contain:

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

Admin credentials come from `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Do not hardcode or expose the password. The seed script creates/updates the first active admin.

Useful commands:

```bash
npm run dev -- --port 3000
npm run prisma:migrate
npm run prisma:seed
npm test
npm run typecheck
npm run lint
npm run build
```

The dev server was last restarted at `http://localhost:3000`.

## Git / Repo Notes

This repo appears to have no committed baseline yet; `git status --short` shows the app files as untracked. Do not assume a clean working tree.

Important rule for future agents: do not revert user changes. Stage or commit only if the user asks.

## Database Schema

Prisma models are in `prisma/schema.prisma`:

- `User`
- `Client`
- `Order`
- `OrderItem`
- `Product`

Enums:

- `UserRole`: `ADMIN`, `SALES`
- `ClientStatus`: `ACTIVE`, `PAST`, `PROSPECT`
- `OrderStatus`: `DRAFT`, `SUBMITTED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`
- `Handing`: `LEFT`, `RIGHT`

Notable details:

- IDs use `cuid()`.
- Every model has `createdAt` and `updatedAt`.
- `Client.uniqueClientId` uses values like `CLT-00042`.
- `Order.orderNumber` uses values like `ORD-00001`.
- `Client.archivedAt` implements soft archive.
- `Product` stores Shopify/import catalog rows. `OrderItem` intentionally copies/customizes specs and is not linked to `Product`.

Migrations:

- `prisma/migrations/20260521000000_initial/migration.sql`
- `prisma/migrations/20260521000100_remaining_phases/migration.sql`

## Implemented Features

### Auth And App Shell

- Credentials login at `/login`.
- Inactive users are blocked.
- Session includes user role.
- Route protection via middleware and server guards.
- Admin-only guard via `requireAdmin`.
- Authenticated app shell with desktop sidebar and mobile bottom nav.
- PWA manifest/service worker setup.

Key files:

- `auth.ts`
- `middleware.ts`
- `lib/auth-guards.ts`
- `components/app-nav.tsx`
- `app/(auth)/login/page.tsx`

### Admin Panel

Route: `/admin`

Implemented:

- List users
- Add users
- Set role
- Activate/deactivate users
- Reset passwords
- No hard delete

Key files:

- `app/(dashboard)/admin/page.tsx`
- `app/actions/user-actions.ts`
- `components/user-create-form.tsx`
- `components/user-status-form.tsx`
- `components/password-reset-form.tsx`

### Client Management

Routes:

- `/clients`
- `/clients/[id]`

Implemented:

- Search/filter/sort/paginated client list
- Add client
- Edit client
- Client detail with orders
- Soft archive/restore using `archivedAt`
- Archived clients hidden by default, with archived filter support

Key files:

- `app/(dashboard)/clients/page.tsx`
- `app/(dashboard)/clients/[id]/page.tsx`
- `app/actions/client-actions.ts`
- `components/client-form.tsx`
- `components/client-archive-form.tsx`
- `lib/client-id.ts`
- `lib/client-archive.ts`

### Orders

Routes:

- `/orders/new`
- `/orders`
- `/orders/[id]`

Implemented:

- Quick-add order form
- Existing client select
- Quick-create client
- Multiple door line items
- Duplicate/remove line items
- Family/style/core suggestions from imported products
- Free-text fallback fields
- Door dimensions, quantity, handing, line notes, order notes
- Draft creation
- Order list filters
- Order detail/edit
- Status transitions
- Sales users scoped to own orders; admins see all

Key files:

- `app/(dashboard)/orders/new/page.tsx`
- `app/(dashboard)/orders/page.tsx`
- `app/(dashboard)/orders/[id]/page.tsx`
- `app/actions/order-actions.ts`
- `components/order-form.tsx`
- `components/order-status-form.tsx`
- `lib/order-number.ts`
- `lib/order-status.ts`

### Dashboard

Route: `/`

Implemented:

- Active clients count
- Orders this month
- Pending orders
- Recent 20 orders
- Client status breakdown
- Admin sees all; sales sees own order-oriented data

Key file:

- `app/(dashboard)/page.tsx`

### Shopify Product Import

Route: `/admin/import`

API route:

- `/api/admin/import/products`

Implemented:

- Admin-only upload
- Accepts `.csv`, `.xlsx`, `.xls`
- Preview before confirm
- Parses Shopify-style columns and provided Excel sample shape
- Maps `Title`, `Handle`, `Variant SKU`, option values, tags, custom metafields, and raw row JSON
- Upserts by real Shopify/variant ID when present, otherwise by SKU
- Shows created/updated/skipped summary

Important bug fixed:

- The importer originally treated Shopify `Handle` as a unique `shopifyId`.
- That was wrong because Shopify handles are product-level and repeat across variants.
- Result: the import collapsed 215 variants into 9 product rows.
- Fix: do not use `Handle` as `shopifyId`; keep it in `rawData` and use SKU as the unique key unless an actual variant/product ID column exists.
- Current database was repaired by re-importing the provided workbook: 206 created, 9 updated, 0 skipped, 215 products total.

Key files:

- `app/(dashboard)/admin/import/page.tsx`
- `app/api/admin/import/products/route.ts`
- `components/product-import-form.tsx`
- `lib/product-import.ts`
- `lib/shopify.ts`
- `tests/product-import.test.ts`

## Verification Last Run

The latest checks passed:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

Latest observed test result:

- 8 test files passed
- 19 tests passed

Browser smoke check:

- `/orders/new` loaded
- Catalog dropdown had 215 imported product options
- Example options included Caiman Bifold SKUs with dimensions

## Important Implementation Notes

- `next.config.mjs` includes `serverExternalPackages: ["xlsx"]`. Keep this. It avoids production build failures when using `xlsx`.
- Prisma is pinned to v6 because Prisma v7 datasource/env behavior caused issues during setup.
- Next is pinned to 15.5.x. The original request said Next 14+, so this is within range.
- `next-pwa` disables itself in development, which is expected.
- Server actions return structured results like `{ success, error, data }`; keep this pattern.
- CRUD mutations should stay in server actions. Use API routes only for upload/import or future external integrations.
- Product import may take 20-25 seconds for the 215-row workbook because it currently does individual upserts.

## Known Risks / Gaps

- The app is functionally broad, but still first-pass internal tooling. Expect UX refinement work.
- No full automated browser/e2e test suite yet.
- Product import is not optimized for large catalogs; batching/transactions could improve speed.
- `xlsx` has known npm audit noise. Do not run `npm audit fix --force` without user approval.
- Catalog picker is a native select and may become unwieldy beyond a few hundred products. A searchable combobox would be a strong next improvement.
- Order creation/editing has form-level validation, but the fastest mobile workflow can still be improved.
- No deployment configuration has been finalized beyond standard Vercel expectations.

## Suggested Next Work

High priority:

1. Add a proper searchable product picker on `/orders/new` and `/orders/[id]`.
2. Add browser/e2e smoke tests for login, client create/edit/archive, order create/edit/status transition, and product import.
3. Improve product import performance with `upsert` batching or a transaction strategy that still reports created/updated counts accurately.
4. Add an admin product catalog page so imported products are visible outside the order form.
5. Add better import diagnostics: duplicate SKU report, parse warnings, and row-level skipped/reason download.

Medium priority:

1. Polish the mobile quick-add order workflow: larger touch targets, easier duplicate/edit flow, sticky submit/action bar.
2. Add pagination to order/client tables where missing or refine current pagination UX.
3. Add role-aware empty states and clearer unauthorized handling.
4. Add dashboard date filters and a “my orders/all orders” toggle for admins.
5. Add seed/sample data helpers for local development only.

Later / out of scope unless user asks:

- QuickBooks integration
- Email notifications
- File attachments
- Customer portal
- Realtime/websocket features
- Multi-tenancy
- Docker/VPS deployment

## How To Resume

1. Start from `/Users/nazarpetrushka/Documents/CRUD Tool`.
2. Check `git status --short`.
3. Start dev server with `npm run dev -- --port 3000`.
4. If database schema changes are needed, edit `prisma/schema.prisma`, then run `npm run prisma:migrate`.
5. Keep changes scoped and verify with test/typecheck/lint/build before handing back.
