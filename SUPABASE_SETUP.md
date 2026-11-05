# DORASANI Supabase Backend Setup & Configuration Guide

This guide details setup, migration execution, and bucket provisioning for the **DORASANI** Supabase backend (`irtvutkwjdjkghobnnct`).

---

## 1. Project Credentials & Environment Configuration

### Frontend Variables (`.env`)
Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=https://irtvutkwjdjkghobnnct.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_p8c_Mt_NwzFdxH9wDrNF2Q_aIRKXU3R
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydHZ1dGt3amRqa2dob2JubmN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM4NjU4NDcsImV4cCI6MjEwOTQ0MTg0N30.leSnUlVywuJ1EXXlA3l5dEsVF01oqDJZmBIhEQfrRrM
```

> **Security Rule:** Never include `service_role` secrets or direct database passwords in any client-facing `.env` file.

---

## 2. Supabase Storage Buckets

The project uses 7 dedicated Supabase Storage buckets configured with public read access and appropriate MIME constraints:

| Bucket Name | Purpose | Max Size | Allowed MIME Types |
| :--- | :--- | :--- | :--- |
| `product-images` | Saree, lehenga, and dress multi-angle photos | 10 MB | `image/jpeg`, `image/png`, `image/webp` |
| `category-images` | Taxonomy cards & arch banners | 10 MB | `image/jpeg`, `image/png`, `image/webp` |
| `homepage-banners` | High-res carousel slides & hero banners | 15 MB | `image/jpeg`, `image/png`, `image/webp` |
| `collection-images` | Curated landing collection assets | 10 MB | `image/jpeg`, `image/png`, `image/webp` |
| `customer-avatars` | Customer profile photos | 5 MB | `image/jpeg`, `image/png`, `image/webp` |
| `review-images` | Verified customer photo reviews | 8 MB | `image/jpeg`, `image/png`, `image/webp` |
| `order-documents` | Invoices and shipping manifests (Private) | 10 MB | `application/pdf`, `image/png` |

To verify or recreate the storage buckets programmatically:
```bash
node scripts/setup_storage.mjs
```

---

## 3. Database Schema Migrations

The full production schema is located at:
`supabase/migrations/20261105000001_dorasani_production_schema.sql`

### Option A: Using Direct PostgreSQL Connection
```bash
node scripts/apply_migration.mjs
```

### Option B: Using Supabase CLI
```bash
supabase link --project-ref irtvutkwjdjkghobnnct
supabase db push
```

---

## 4. Seeding Initial Catalog & Content

To seed all 40 categories, all 19 handwoven saree & ethnic wear products, 53 variants, hero banners, coupons, and site settings:
```bash
node scripts/seed_database.mjs
```

To sync all local public media assets to the live Supabase Storage buckets:
```bash
node scripts/upload_assets_to_storage.mjs
```

---

## 5. Deploying Supabase Edge Functions

Deploy individual Edge Functions using the Supabase CLI:
```bash
# Link project if not already linked
supabase link --project-ref irtvutkwjdjkghobnnct

# Deploy Edge Functions
supabase functions deploy create-checkout --no-verify-jwt
supabase functions deploy payment-webhook --no-verify-jwt
supabase functions deploy get-homepage --no-verify-jwt
supabase functions deploy admin-analytics
```

### Setting Edge Function Secrets
Set payment gateway and signing keys securely in Supabase:
```bash
supabase secrets set RAZORPAY_KEY_ID="rzp_live_xxx"
supabase secrets set RAZORPAY_KEY_SECRET="your_secret_key"
supabase secrets set PAYMENT_WEBHOOK_SECRET="whsec_xxx"
```

