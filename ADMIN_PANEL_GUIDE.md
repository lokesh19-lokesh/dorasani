# DORASANI Administrator Dashboard Guide

The **DORASANI Admin Management Suite** provides a complete operations panel for store managers, fulfillment teams, and administrators.

---

## 1. Accessing the Dashboard

1. Navigate to: `http://localhost:5173/admin` (or `https://your-domain.com/admin`)
2. Sign in with an account assigned the `admin` or `super_admin` role in `user_roles`.
3. In local development or staging, the dashboard allows review and management with fallback previews.

---

## 2. Dashboard Sections & Workflows

### A. Overview & Real-Time Analytics
- **Total Revenue (INR):** Aggregate revenue across confirmed and delivered orders.
- **Order Pipeline:** Immediate counters for Pending, Processing, Shipped, and Delivered orders.
- **Inventory Health:** Alert counters for low-stock and out-of-stock items.
- **Export Reports:** One-click CSV export of order data for finance, GST filing, and logistics audits.

---

### B. Product Catalog Management (`/admin` → Products Tab)
- **Add Product:** Modal form supporting full textile specifications:
  - Title, SKU, Category, Price (INR), MRP (INR).
  - Fabric (Pure Kanjivaram Silk, Banarasi, Chanderi, Organza).
  - Weaving style (Zari Weave, Handloom, Jacquard).
  - Saree length, Blouse piece included flag, Occasion.
  - Multi-angle image URLs and stock count.
- **Edit Product:** Inline updates to prices, descriptions, and active status.
- **Delete Product:** Safeguarded removal cascading through media tables.

---

### C. Order Fulfillment & Logistics (`/admin` → Orders Tab)
- **Status Lifecycle Transitions:**
  - `confirmed` → `processing` (Item picked & inspected)
  - `processing` → `packed` (Gift packaging & QC completed)
  - `packed` → `shipped` (Handed over to courier partner)
  - `shipped` → `delivered` (Successfully delivered to patron)
- **Dispatch Assignment:**
  - Select courier partner (e.g., Delhivery, Blue Dart, DTDC).
  - Enter consignment tracking ID.
  - The customer's order history updates in real-time.

---

### D. Inventory Control & Stock Ledger (`/admin` → Inventory Tab)
- Review stock counts for each product.
- **Quick Stock Adjustment:** Add or remove stock with mandatory audit reasons:
  - `Restock Arrival`
  - `Warehouse Damage`
  - `Inventory Audit Correction`
- Every adjustment creates an immutable entry in the `inventory_movements` ledger table with before and after stock levels.

---

### E. Categories & Taxonomy (`/admin` → Categories Tab)
- Manage top-level categories (Sarees, Ethnic Wear, Lehengas, Festive Collection) and subcategories.
- Configure category arch images and display sequence.

---

### F. Promotional Coupons (`/admin` → Coupons Tab)
- Create discount codes:
  - Code (e.g., `DORASANI10`, `FESTIVE2000`)
  - Discount type (`percentage` or `fixed_inr`)
  - Minimum order value in INR
  - Validity start and end timestamps
- Real-time active / inactive toggle.

---

### G. CMS Banners & Storefront Announcements (`/admin` → CMS Tab)
- Update desktop and mobile hero carousel slides.
- Edit headlines, sub-taglines, and button destinations without redeploying frontend code.

