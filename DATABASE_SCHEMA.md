# DORASANI Database Schema Specification

This document provides a comprehensive reference for the PostgreSQL database powering the **DORASANI** Indian traditional clothing e-commerce platform hosted on Supabase.

---

## 1. Architectural Highlights

- **Platform:** Supabase PostgreSQL 15+
- **Project Ref:** `irtvutkwjdjkghobnnct`
- **Region:** AWS ap-south-1 (Mumbai)
- **Primary Key Convention:** UUID v4 (`gen_random_uuid()`)
- **Naming Convention:** `snake_case` for all tables, columns, indexes, and constraints
- **Concurrency Control:** Atomic checkout with row-level pessimistic locking (`FOR UPDATE`) in PostgreSQL functions to eliminate race conditions and stock overselling
- **Full Text Search & Fuzzy Indexing:** PostgreSQL `pg_trgm` GIN indexes for Indian textile names and saree weaves

---

## 2. PostgreSQL Enumerated Types

### `user_role_type`
Controls role-based access control (RBAC):
- `super_admin`
- `admin`
- `catalog_manager`
- `inventory_manager`
- `order_manager`
- `support_agent`
- `customer`

### `order_status_type`
Lifecycle of traditional attire orders:
- `pending`
- `confirmed`
- `processing`
- `packed`
- `shipped`
- `out_for_delivery`
- `delivered`
- `cancelled`
- `returned`
- `refunded`

### `payment_status_type`
Payment state transitions:
- `pending`
- `authorized`
- `paid`
- `failed`
- `refunded`
- `partially_refunded`

---

## 3. Core Tables and Relationships

### A. Customers & RBAC
1. **`profiles`**: Linked 1:1 with `auth.users.id`.
   - `id UUID PRIMARY KEY REFERENCES auth.users(id)`
   - `full_name TEXT NOT NULL`
   - `email TEXT NOT NULL`
   - `phone TEXT`, `avatar_url TEXT`, `date_of_birth DATE`, `preferred_language TEXT`
   - `whatsapp_opt_in BOOLEAN DEFAULT true`
   - `created_at TIMESTAMPTZ`, `updated_at TIMESTAMPTZ`

2. **`user_roles`**: Protected role assignments.
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
   - `role user_role_type NOT NULL DEFAULT 'customer'`
   - `UNIQUE(user_id, role)`

3. **`customer_addresses`**: Customer shipping and billing addresses.
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
   - `address_type VARCHAR(20) DEFAULT 'Home'` ('Home' | 'Work' | 'Other')
   - `full_name TEXT NOT NULL`, `phone VARCHAR(20) NOT NULL`
   - `street_address TEXT NOT NULL`, `landmark TEXT`, `city VARCHAR(100) NOT NULL`, `state VARCHAR(100) NOT NULL`, `pincode VARCHAR(10) NOT NULL`
   - `is_default BOOLEAN DEFAULT false`

4. **`customer_activity_logs`**: Audit trail for customer actions.
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE`
   - `activity_type VARCHAR(50) NOT NULL`, `details JSONB DEFAULT '{}'`

---

### B. Catalog & Saree Specifications
5. **`categories`**: Multi-tier hierarchical taxonomy.
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `name TEXT NOT NULL`, `slug VARCHAR(255) UNIQUE NOT NULL`
   - `parent_id UUID REFERENCES categories(id) ON DELETE SET NULL`
   - `description TEXT`, `image_url TEXT`, `display_order INT DEFAULT 0`, `is_active BOOLEAN DEFAULT true`

6. **`products`**: Primary master table for all traditional garments.
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `title TEXT NOT NULL`, `slug VARCHAR(255) UNIQUE NOT NULL`, `sku VARCHAR(120) UNIQUE`
   - `product_type VARCHAR(50) DEFAULT 'saree'`
   - `category_id UUID REFERENCES categories(id) ON DELETE RESTRICT`
   - `short_description TEXT`, `description TEXT NOT NULL`
   - `price_inr NUMERIC(10,2) NOT NULL`, `mrp_inr NUMERIC(10,2) NOT NULL`, `discount_percent INT DEFAULT 0`
   - **Textile Specifics:** `fabric TEXT`, `weaving_style TEXT`, `occasion TEXT`, `pattern TEXT`, `color_name TEXT`, `color_hex VARCHAR(10)`
   - **Saree Specifics:** `saree_length TEXT DEFAULT '6.3 meters'`, `blouse_included BOOLEAN DEFAULT true`, `blouse_description TEXT`, `zari_details TEXT`
   - `stock_quantity INT DEFAULT 10`, `in_stock BOOLEAN DEFAULT true`, `is_featured BOOLEAN DEFAULT false`, `is_bestseller BOOLEAN DEFAULT false`, `is_new BOOLEAN DEFAULT false`
   - `specifications JSONB DEFAULT '{}'`

7. **`product_variants`**: Colors, blouse tailoring sizes, and options.
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `product_id UUID REFERENCES products(id) ON DELETE CASCADE`
   - `sku VARCHAR(120) UNIQUE`, `color_name TEXT`, `color_hex VARCHAR(10)`, `size VARCHAR(50) DEFAULT 'Free Size'`
   - `stock_quantity INT DEFAULT 10`, `price_adjustment_inr NUMERIC(10,2) DEFAULT 0`

8. **`product_media`**: High-resolution gallery images.
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `product_id UUID REFERENCES products(id) ON DELETE CASCADE`
   - `url TEXT NOT NULL`, `alt_text TEXT`, `display_order INT DEFAULT 0`, `is_primary BOOLEAN DEFAULT false`

9. **`collections` & `collection_products`**: Curated landing collections (e.g., *A Symbol of Tradition*, *Royal Heritage Kanjivaram*, *Banarasi Splendor*).

---

### C. Inventory Ledger & Movements
10. **`inventory_movements`**: Immutable append-only audit ledger for stock tracking.
    - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
    - `product_id UUID NOT NULL REFERENCES products(id)`
    - `variant_id UUID REFERENCES product_variants(id)`
    - `previous_quantity INT NOT NULL`
    - `quantity_changed INT NOT NULL`
    - `new_quantity INT NOT NULL`
    - `reason VARCHAR(50) NOT NULL` ('initial_stock', 'sale_deduction', 'admin_adjustment', 'order_cancellation_return')
    - `order_id UUID REFERENCES orders(id)`
    - `created_at TIMESTAMPTZ DEFAULT now()`

---

### D. Cart, Orders & Transactions
11. **`carts` & `cart_items`**: Persistent multi-device customer cart.
12. **`orders`**: Master order record with Indian currency pricing.
    - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
    - `order_number VARCHAR(50) UNIQUE NOT NULL`
    - `user_id UUID REFERENCES auth.users(id)`
    - `customer_name TEXT NOT NULL`, `customer_email TEXT NOT NULL`, `customer_phone TEXT NOT NULL`
    - `billing_address JSONB NOT NULL`, `shipping_address JSONB NOT NULL`
    - `subtotal_inr NUMERIC(10,2) NOT NULL`, `discount_inr NUMERIC(10,2) DEFAULT 0`, `shipping_fee_inr NUMERIC(10,2) DEFAULT 0`, `total_inr NUMERIC(10,2) NOT NULL`
    - `coupon_code VARCHAR(50)`
    - `order_status order_status_type DEFAULT 'confirmed'`
    - `payment_status payment_status_type DEFAULT 'paid'`
    - `payment_method VARCHAR(50) DEFAULT 'upi'`
    - `delivery_option VARCHAR(50) DEFAULT 'standard'`
    - `idempotency_key VARCHAR(100) UNIQUE`
    - `courier_name VARCHAR(100) DEFAULT 'Delhivery'`, `tracking_id VARCHAR(100)`

13. **`order_items`**: Line items for orders preserving historical price snapshots.
14. **`coupons`**: Discount codes (`percentage` or `fixed_inr`) with minimum order value and validity periods.

---

### E. Content Management & Storefront
15. **`banners`**: Hero and promotional visual banners.
16. **`service_benefits`**: Trust signals (Cash on Delivery, Free Shipping, 7-Day Easy Returns, Silk Mark Assurance).
17. **`site_settings`**: Global store key-value configurations.
18. **`admin_audit_logs`**: Administrative audit trail.

---

## 4. PostgreSQL Functions & Security

### `process_checkout_atomic`
- **Execution Mode:** `SECURITY DEFINER`
- **Functionality:**
  1. Checks idempotency key to prevent double charges.
  2. Acquires row locks (`SELECT ... FOR UPDATE`) on all cart products.
  3. Validates stock availability. Fails transaction if stock is insufficient.
  4. Validates coupon code and applies discount rules.
  5. Inserts order and all order line items atomically.
  6. Decrements product inventory and writes immutable movement entries into `inventory_movements`.
  7. Returns complete order JSON.

### `is_admin`
- Returns `true` if `auth.uid()` has `super_admin` or `admin` in `user_roles`.

