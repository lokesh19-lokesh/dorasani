# DORASANI Production Deployment Guide

This guide covers deployment instructions for the **DORASANI** e-commerce platform, including the React frontend, Supabase PostgreSQL database, and Deno Edge Functions.

---

## 1. Pre-Deployment Verification Checklist

Before deploying to production, execute the local verification suite:
```bash
# 1. Type check and build bundle
npm run build

# 2. Verify all 19 saree & dress records are present in Supabase
node -e "
  const { Client } = require('pg');
  const client = new Client({ connectionString: 'postgresql://postgres:Nagaraju%4099@db.irtvutkwjdjkghobnnct.supabase.co:5432/postgres' });
  client.connect().then(async () => {
    const res = await client.query('SELECT count(*) FROM products');
    console.log('Total Products in PostgreSQL:', res.rows[0].count);
    await client.end();
  });
"
```

---

## 2. Frontend Deployment (Vercel / Netlify / Cloudflare Pages)

### Build Settings
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Node.js Version:** `20.x` or `22.x`

### Environment Variables
Configure the following environment variables in your hosting provider's dashboard:
```env
VITE_SUPABASE_URL=https://irtvutkwjdjkghobnnct.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_p8c_Mt_NwzFdxH9wDrNF2Q_aIRKXU3R
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydHZ1dGt3amRqa2dob2JubmN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM4NjU4NDcsImV4cCI6MjEwOTQ0MTg0N30.leSnUlVywuJ1EXXlA3l5dEsVF01oqDJZmBIhEQfrRrM
```

### SPA Routing Configuration
For Vercel (`vercel.json`):
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

For Netlify (`public/_redirects`):
```
/*    /index.html   200
```

---

## 3. Supabase Edge Functions Deployment

Deploy Edge Functions using the Supabase CLI:
```bash
# Log in to Supabase CLI
supabase login

# Link the production project
supabase link --project-ref irtvutkwjdjkghobnnct

# Deploy functions
supabase functions deploy create-checkout --no-verify-jwt
supabase functions deploy payment-webhook --no-verify-jwt
supabase functions deploy get-homepage --no-verify-jwt
supabase functions deploy admin-analytics
```

---

## 4. Post-Deployment Smoke Tests

1. **Catalog Integrity:** Visit `/sarees` and verify that the 19 traditional saree products render with high-res imagery and pricing.
2. **Product Detail Page:** Click on any saree card (e.g. `/product/kanjivaram-silk-saree-crimson`) to verify rich specs, zari details, and color switchers.
3. **Cart & Atomic Checkout:** Add an item to the bag, apply coupon `DORASANI10`, proceed to checkout, and complete order placement. Confirm the order appears in `/account` and in PostgreSQL `orders`.
4. **Admin Suite:** Visit `/admin` to verify real-time order visibility and inventory ledger updates.

