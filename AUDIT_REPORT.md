# DORASANI E-COMMERCE — BACKEND AUDIT REPORT

**Project Reference:** `irtvutkwjdjkghobnnct`  
**Supabase URL:** `https://irtvutkwjdjkghobnnct.supabase.co`  
**Audit Timestamp:** 2026-11-05T15:20:00+05:30  
**Auditor:** Principal Backend & Database Architect

---

## 1. Executive Summary

A comprehensive live audit of the Supabase PostgreSQL database `irtvutkwjdjkghobnnct` was conducted via direct PostgreSQL client connection and Supabase REST endpoints.

| Component | Current State | Findings & Gaps |
| :--- | :--- | :--- |
| **PostgreSQL Schemas** | `public`, `auth`, `storage`, `realtime`, `vault`, `extensions`, `graphql` | Standard Supabase system schemas are present. |
| **Public Tables** | **0 tables** | No application tables currently exist in `public`. |
| **Existing Product Data** | **19 Products / 9 Categories** | Stored in `src/data/products.ts`. Must be mapped and seeded into the new PostgreSQL schema with 100% fidelity. |
| **Row Level Security (RLS)** | Enabled by default (`rls_auto_enable` trigger) | No custom RLS policies exist yet in `public`. |
| **Storage Buckets** | **0 buckets** | No storage buckets are initialized in `storage.buckets`. |
| **Auth Users** | **0 registered users** | User authentication is initialized but has 0 users. |
| **Edge Functions** | **0 deployed functions** | Functions endpoint returns 404. |

---

## 2. PostgreSQL Schema & Database Inspection

### A. Schemas Present
- `auth`: Supabase GoTrue authentication engine tables (`users`, `identities`, `sessions`, `refresh_tokens`, `mfa_*`, etc.).
- `storage`: Supabase Storage engine tables (`buckets`, `objects`, `s3_multipart_uploads`, etc.).
- `public`: Empty. Default application schema.
- `realtime`: Supabase Realtime broadcast and presence tables.
- `vault`: Supabase Vault for encrypted secrets management.
- `extensions`: PostgreSQL extensions schema (`pg_stat_statements`).

### B. Public Tables & Columns
- **Status:** Empty (`0` tables).
- A draft migration file was found in local git history (`supabase/migrations/20261022000000_dorasani_schema.sql`), but it was never applied to this live database. Furthermore, that draft lacked several critical tables specified in the production brief (e.g. `user_roles`, `customer_activity_logs`, `inventory_movements`, `homepage_sections`, `banners`, `admin_audit_logs`, `shipping_zones`, `return_requests`, etc.).

---

## 3. Product Catalogue & Asset Inventory (Data Preservation)

All 19 traditional saree, dress, lehenga, and kurti product records and 9 category records currently powering the frontend are defined in `src/data/products.ts`. These represent the core business catalogue and **must be preserved without any loss of data**.

### A. Category Inventory (9 Categories)
1. **Sarees** (`sarees`): 8 Subcategories (Kanjivaram, Banarasi, Organza, Chanderi, Cotton, Festive, Wedding, Tissue)
2. **Silk Sarees** (`silk-sarees`): Dedicated pure silk destination
3. **Ethnic Wear** (`ethnic-wear`): 6 Subcategories (Kurtis, Anarkali Sets, Sharara Sets, Salwar Suits, Ethnic Gowns, Co-ord Sets)
4. **Kurthis** (`kurtis`): 4 Subcategories (Silk, Anarkali, Straight, Festive)
5. **Lehengas** (`lehengas`): 6 Subcategories (Bridal, Wedding, Reception, Festive, Designer, Pastel)
6. **Kids Wear** (`kids-wear`): 4 Subcategories (Pattu Pavadai, Girls Lehengas, Boys Kurta, Dhoti Sets)
7. **Festive Collection** (`festive-collection`): 6 Subcategories (Navratri, Diwali, Pongal, Wedding Guest, Engagement, Festive Sarees)
8. **New Arrivals** (`new-arrivals`): Fresh drops and seasonal weaves
9. **Bestsellers** (`bestsellers`): Proven customer favorites

### B. Product Records Inventory (19 Preserved Records)
| ID | Product Name | Category | Subcategory | Price / MRP | Fabric |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `prod-kanjivaram-silk` | Kanjivaram Silk Saree | Sarees | Silk Sarees | ₹3,499 / ₹4,999 | Pure Mulberry Silk |
| `prod-organza-floral` | Organza Floral Saree | Sarees | Organza Sarees | ₹1,799 / ₹2,999 | Organza |
| `prod-banarasi-silk` | Banarasi Silk Saree | Sarees | Silk Sarees | ₹2,999 / ₹2,999 | Pure Katan Silk |
| `prod-chanderi-cotton` | Chanderi Cotton Saree | Sarees | Cotton Sarees | ₹1,499 / ₹1,999 | Chanderi Cotton |
| `prod-tussar-silk` | Tussar Silk Saree | Sarees | Silk Sarees | ₹2,699 / ₹2,999 | Tussar Wild Silk |
| `prod-organza-tissue` | Organza Tissue Saree | Sarees | Organza Sarees | ₹2,499 / ₹3,499 | Organza Tissue |
| `prod-kanchipuram-bridal` | Kanchipuram Bridal Saree | Sarees | Wedding Sarees | ₹5,999 / ₹7,999 | Heavy Mulberry Silk |
| `prod-linen-silk` | Linen Silk Saree | Sarees | Cotton Sarees | ₹1,999 / ₹2,799 | Organic Linen Silk |
| `prod-chanderi-kurti-set` | Chanderi Kurti Set | Ethnic Wear | Kurtis | ₹1,899 / ₹2,499 | Chanderi Silk |
| `prod-embroidered-anarkali`| Embroidered Anarkali Set | Ethnic Wear | Anarkali Sets | ₹2,799 / ₹3,999 | Georgette & Silk |
| `prod-silk-salwar-suit` | Royal Silk Salwar Suit | Ethnic Wear | Salwar Suits | ₹2,299 / ₹3,299 | Raw Silk |
| `prod-ethnic-gown` | Royal Velvet Ethnic Gown | Ethnic Wear | Ethnic Gowns | ₹3,499 / ₹4,999 | Micro Velvet |
| `prod-festive-coord-set` | Festive Brocade Co-ord Set| Ethnic Wear | Co-ord Sets | ₹2,199 / ₹2,999 | Brocade Silk |
| `prod-organza-sharara-set`| Organza Sharara Set | Ethnic Wear | Sharara Sets | ₹2,599 / ₹3,599 | Organza |
| `prod-bridal-silk-lehenga` | Bridal Silk Lehenga | Lehengas | Bridal Lehengas | ₹8,999 / ₹12,999 | Raw Silk & Zari |
| `prod-wedding-lehenga-set` | Royal Wedding Lehenga Set | Lehengas | Wedding Lehengas | ₹6,999 / ₹9,999 | Art Silk |
| `prod-reception-lehenga` | Twilight Blue Reception Lehenga| Lehengas | Reception Lehengas| ₹5,499 / ₹7,499 | Net & Satin |
| `prod-festive-lehenga` | Golden Mustard Festive Lehenga| Lehengas | Festive Lehengas | ₹4,299 / ₹5,999 | Chanderi & Georgette |
| `prod-designer-lehenga` | Emerald Bloom Designer Lehenga| Lehengas | Designer Lehengas| ₹7,499 / ₹10,499 | Velvet & Silk |

---

## 4. Security, RLS & Storage Audit

1. **Row Level Security (RLS):**
   - The Supabase database contains the `rls_auto_enable` trigger on event `ddl_command_end`, which automatically enables RLS on any newly created tables.
   - All newly designed tables must have explicit, granular policies for `SELECT`, `INSERT`, `UPDATE`, and `DELETE`.

2. **Supabase Storage Buckets:**
   - Currently `0` buckets.
   - Required buckets to create:
     - `product-images` (public read)
     - `category-images` (public read)
     - `homepage-banners` (public read)
     - `collection-images` (public read)
     - `customer-avatars` (public read, authenticated user write)
     - `review-images` (public read, authenticated customer write)
     - `order-documents` (private read, admin/owner write)

3. **Authentication & Roles:**
   - Supabase GoTrue Auth is active.
   - Role management must be implemented in a dedicated table `public.user_roles` with `super_admin`, `admin`, `catalog_manager`, `inventory_manager`, `order_manager`, `support_agent`, and `customer`.
   - Security Definer function `is_admin()` and `has_role()` must be implemented to prevent privilege escalation.

---

## 5. Implementation Roadmap

1. **Database Foundation (Migration `20261105000001_dorasani_production_schema.sql`):**
   - Apply production tables, UUID primary keys, check constraints, foreign keys, timestamps, and indexes.
   - Set up `TEXT` types for product names (up to 1,000 chars) and descriptions (up to 50,000 chars) with JSONB specifications.
   - Create inventory ledger, atomic checkout reservation functions, and RLS policies.
2. **Data Migration:**
   - Seed all 9 categories and 19 products with images, variants, colors, and stock into PostgreSQL.
3. **Storage Setup:**
   - Create all 7 buckets and their RLS policies.
4. **Backend Edge Functions & RPC Services:**
   - Deploy/configure API functions and transactional checkout RPC.
5. **Frontend Integration:**
   - Connect `src/lib/supabase.ts` with real URL and keys.
   - Build protected `/admin` dashboard routes with full CRUD for products, orders, inventory, customers, categories, coupons, and CMS.
   - Update frontend catalog, cart, wishlist, and checkout to fetch live Supabase data.

