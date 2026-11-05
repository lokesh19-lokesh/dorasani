# DORASANI Backend API Documentation

This document covers all backend interfaces available in the DORASANI platform:
1. Client Service Layer (Supabase JS SDK v2)
2. PostgreSQL Remote Procedure Calls (RPC)
3. Supabase Edge Functions (Deno / TypeScript)

---

## 1. Client Service Layer

### Product Service (`src/services/productService.ts`)

#### `getProducts(filters?: ProductFilterParams): Promise<{ products: Product[]; total: number }>`
Retrieves catalog items with server-side filtering, searching, and pagination.
- **Parameters:**
  - `categorySlug?: string` — Filter by category slug (e.g., `'sarees'`, `'lehengas'`)
  - `fabric?: string` — Filter by fabric type (e.g., `'Pure Silk'`, `'Cotton'`)
  - `occasion?: string` — Filter by occasion (e.g., `'Wedding'`, `'Festive'`)
  - `minPrice?: number` & `maxPrice?: number` — Price range in INR
  - `search?: string` — Fuzzy search query across titles and descriptions
  - `sortBy?: 'featured' | 'newest' | 'price-low-high' | 'price-high-low' | 'popular'`
  - `page?: number` & `limit?: number` — Pagination controls

#### `getProductBySlug(slug: string): Promise<Product | null>`
Fetches complete product record by unique slug, including multi-angle images and variants.

#### `getCategories(): Promise<Category[]>`
Fetches all active top-level categories and their subcategories in display order.

#### `getHeroBanners(): Promise<Banner[]>`
Fetches active carousel slides and banner promotions.

---

### Checkout Service (`src/services/checkoutService.ts`)

#### `validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; discount: number; message: string }>`
Validates coupon existence, active window, and minimum order requirements against `coupons` table.

#### `processOrder(payload: CheckoutPayload): Promise<{ success: boolean; orderId?: string; orderNumber?: string; error?: string }>`
Executes atomic checkout via `process_checkout_atomic` PostgreSQL function.
- Automatically handles row-level stock locks and inventory updates.
- Records customer delivery details and payment references.

#### `getCustomerOrders(userId: string): Promise<Order[]>`
Fetches order history with ordered line items, tracking status, and delivery milestones.

---

### Authentication Service (`src/services/authService.ts`)

#### `signUp(email: string, password: string, fullName: string, phone?: string)`
Creates Supabase Auth user and auto-provisions profile record via database trigger.

#### `signIn(email: string, password: string)`
Authenticates customer and returns session JWT.

#### `signOut()`
Invalidates current session and clears persisted tokens.

#### `checkIsAdmin(): Promise<boolean>`
Invokes database `is_admin()` RPC to securely verify caller's administrative privileges.

---

### Admin Service (`src/services/adminService.ts`)

- `getDashboardMetrics()`: Total sales (INR), order counts by status, customer counts, product counts.
- `getProducts(options)`: Filterable product management list with stock status.
- `createProduct(input)`: Inserts product, gallery media, and initial stock ledger movement.
- `updateProduct(id, updates)`: Updates pricing, descriptions, stock, or status.
- `deleteProduct(id)`: Removes product and cascades media.
- `getOrders(options)`: Administrative order fulfillment list.
- `updateOrderStatus(orderId, status, courierName?, trackingId?)`: Updates fulfillment status.
- `adjustInventory(productId, quantityDelta, reason)`: Modifies stock and records movement ledger.
- `createCoupon(input)`: Creates promotional discount codes.

---

## 2. PostgreSQL Functions (RPC)

### `process_checkout_atomic`
- **Method:** `POST /rest/v1/rpc/process_checkout_atomic`
- **Headers:** `apikey: <anon_key>`, `Authorization: Bearer <user_token>`
- **Arguments:**
```json
{
  "p_user_id": "UUID | null",
  "p_customer_name": "Maddiboina Lokesh",
  "p_customer_email": "lokesh@example.com",
  "p_customer_phone": "+91 9988776655",
  "p_billing_address": {
    "streetAddress": "Plot 42, Jubilee Hills",
    "city": "Hyderabad",
    "state": "Telangana",
    "pincode": "500033"
  },
  "p_shipping_address": { ... },
  "p_cart_items": [
    { "product_id": "UUID", "variant_id": null, "quantity": 1 }
  ],
  "p_coupon_code": "DORASANI10",
  "p_payment_method": "upi",
  "p_delivery_option": "standard",
  "p_idempotency_key": "idem-1793865847"
}
```
- **Returns:**
```json
{
  "success": true,
  "order": {
    "id": "c1f7b059-e16e-44ef-9689-532e8bfbb250",
    "order_number": "DOR-20261105-0001",
    "total_inr": 22491,
    "discount_inr": 2499,
    "shipping_fee_inr": 0
  }
}
```

---

## 3. Supabase Edge Functions

### `POST /functions/v1/create-checkout`
- **Purpose:** Pre-checkout validation and payment gateway initialization.
- **Request Body:** Checkout cart items, customer info, delivery option.
- **Response:**
```json
{
  "success": true,
  "orderId": "UUID",
  "orderNumber": "DOR-20261105-0001",
  "total": 22491,
  "paymentGateway": {
    "provider": "razorpay",
    "gatewayOrderId": "rzp_order_DOR-20261105-0001",
    "amountInPaise": 2249100,
    "currency": "INR",
    "keyId": "rzp_test_xxxx"
  }
}
```

### `POST /functions/v1/payment-webhook`
- **Purpose:** Idempotent payment capture webhook handler.
- **Headers:** `x-razorpay-signature` or `stripe-signature`
- **Actions:** Transitions order from `pending` to `paid` and marks status `confirmed`.

### `GET /functions/v1/get-homepage`
- **Purpose:** Consolidated, edge-cached JSON payload containing active banners, featured products, bestsellers, and store settings.
- **Response Headers:** `Cache-Control: public, s-maxage=120, stale-while-revalidate=300`

### `GET /functions/v1/admin-analytics`
- **Purpose:** Authenticated administrative metrics and revenue velocity.
- **Headers:** `Authorization: Bearer <admin_jwt>`
- **Response:** Revenue aggregates, average order value, stock alert counts, and order distribution.

