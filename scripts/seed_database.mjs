import pg from 'pg';
import { CATEGORIES, PRODUCTS } from '../src/data/products.ts';
const { Client } = pg;

const connectionString = 'postgresql://postgres:Nagaraju%4099@db.irtvutkwjdjkghobnnct.supabase.co:5432/postgres';

async function seedDatabase() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to PostgreSQL database...');
    await client.connect();

    console.log('Beginning data migration & preservation transaction...');
    await client.query('BEGIN');

    // 1. Seed Categories & Subcategories
    console.log(`Seeding ${CATEGORIES.length} primary categories and subcategories...`);
    const categoryMap = new Map(); // slug -> UUID

    for (let i = 0; i < CATEGORIES.length; i++) {
      const cat = CATEGORIES[i];
      const catRes = await client.query(`
        INSERT INTO public.categories (name, slug, description, image_url, display_order, is_active)
        VALUES ($1, $2, $3, $4, $5, true)
        ON CONFLICT (slug) DO UPDATE 
        SET name = EXCLUDED.name, image_url = EXCLUDED.image_url, display_order = EXCLUDED.display_order
        RETURNING id, slug;
      `, [
        cat.name,
        cat.slug,
        `${cat.name} Collection by Dorasani Sarees — A Symbol of Tradition.`,
        cat.imageUrl || null,
        i + 1
      ]);
      const parentId = catRes.rows[0].id;
      categoryMap.set(cat.slug, parentId);

      // Seed Subcategories as child categories
      if (cat.subcategories && cat.subcategories.length > 0) {
        for (let j = 0; j < cat.subcategories.length; j++) {
          const sub = cat.subcategories[j];
          const subRes = await client.query(`
            INSERT INTO public.categories (name, slug, description, image_url, parent_id, display_order, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, true)
            ON CONFLICT (slug) DO UPDATE 
            SET name = EXCLUDED.name, parent_id = EXCLUDED.parent_id, image_url = EXCLUDED.image_url
            RETURNING id, slug;
          `, [
            sub.name,
            sub.slug,
            `${sub.name} — Curated traditional designs from the ${cat.name} collection.`,
            sub.imageUrl || null,
            parentId,
            j + 1
          ]);
          categoryMap.set(sub.slug, subRes.rows[0].id);
        }
      }
    }
    console.log(`Categories seeded. Total category entries mapped: ${categoryMap.size}`);

    // 2. Seed Collections
    console.log('Seeding curated collections...');
    const collectionsToSeed = [
      { slug: 'new-arrivals', title: 'New Arrivals', description: 'Fresh weaves and seasonal arrivals crafted by master artisans.' },
      { slug: 'bestsellers', title: 'Bestsellers', description: 'Our most cherished and highest-rated traditional designs.' },
      { slug: 'festive-collection', title: 'Festive Collection', description: 'Glorious drapes and regal ensembles for sacred celebrations.' },
      { slug: 'sarees', title: 'Sarees Collection', description: 'Authentic handlooms, pure mulberry silks, and royal gold zari drapes.' },
      { slug: 'lehengas', title: 'Festive Lehengas', description: 'Opulent kalis, tailored flair, and handcrafted heritage embroidery.' },
      { slug: 'ethnic-wear', title: 'Ethnic Wear', description: 'Graceful silhouettes for festive gatherings and family celebrations.' }
    ];

    const collectionMap = new Map();
    for (let i = 0; i < collectionsToSeed.length; i++) {
      const col = collectionsToSeed[i];
      const colRes = await client.query(`
        INSERT INTO public.collections (title, slug, description, display_order, is_active)
        VALUES ($1, $2, $3, $4, true)
        ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description
        RETURNING id, slug;
      `, [col.title, col.slug, col.description, i + 1]);
      collectionMap.set(col.slug, colRes.rows[0].id);
    }

    // 3. Seed Products, Variants, Media, Inventory
    console.log(`Seeding ${PRODUCTS.length} products...`);
    for (const p of PRODUCTS) {
      const categoryId = categoryMap.get(p.categorySlug) || null;
      const sku = `DOR-${p.categorySlug.toUpperCase().substring(0, 3)}-${p.slug.toUpperCase().substring(0, 8)}`;
      const stock = p.stock || 25;

      const prodRes = await client.query(`
        INSERT INTO public.products (
          title, slug, sku, subtitle, short_description, description, product_type,
          category_id, brand, fabric, occasion, weaving_style, care_instructions,
          blouse_included, saree_length, specifications, price_inr, mrp_inr,
          discount_percent, status, is_featured, is_new, is_bestseller, is_festive,
          in_stock, stock_quantity, rating, reviews_count, sold_count
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12, $13,
          $14, $15, $16, $17, $18,
          $19, $20, $21, $22, $23, $24,
          $25, $26, $27, $28, $29
        )
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          price_inr = EXCLUDED.price_inr,
          mrp_inr = EXCLUDED.mrp_inr,
          discount_percent = EXCLUDED.discount_percent,
          stock_quantity = EXCLUDED.stock_quantity,
          in_stock = EXCLUDED.in_stock
        RETURNING id;
      `, [
        p.title,
        p.slug,
        sku,
        p.subtitle || null,
        p.description || null,
        p.description || null,
        p.categorySlug === 'sarees' ? 'saree' : p.categorySlug === 'lehengas' ? 'lehenga' : 'ethnic_wear',
        categoryId,
        'DORASANI',
        p.fabric || 'Pure Silk',
        p.occasion || 'Wedding & Festive',
        p.weave || 'Traditional Handloom',
        p.careInstructions || 'Dry Clean Only',
        p.blouseIncluded !== false,
        p.length || '6.3 meters (including blouse)',
        JSON.stringify({
          subCategory: p.subCategory,
          colors: p.colors || [],
          sizes: p.sizes || ['Free Size'],
          tags: p.tags || []
        }),
        p.price,
        p.mrp,
        p.discountPercent || Math.round(((p.mrp - p.price) / p.mrp) * 100),
        'active',
        p.isFeatured || false,
        p.isNew || false,
        p.isBestseller || false,
        p.categorySlug === 'festive' || p.occasion === 'Festive' || false,
        p.inStock !== false,
        stock,
        p.rating || 4.8,
        p.reviewsCount || 45,
        p.soldCount || 120
      ]);

      const productId = prodRes.rows[0].id;

      // Seed Product Media
      if (p.images && p.images.length > 0) {
        for (let idx = 0; idx < p.images.length; idx++) {
          const imgUrl = p.images[idx];
          await client.query(`
            INSERT INTO public.product_media (product_id, url, alt_text, display_order, is_primary)
            VALUES ($1, $2, $3, $4, $5);
          `, [
            productId,
            imgUrl,
            `${p.title} - View ${idx + 1}`,
            idx,
            idx === 0
          ]);
        }
      }

      // Seed Product Variants (from colors)
      if (p.colors && p.colors.length > 0) {
        for (let cIdx = 0; cIdx < p.colors.length; cIdx++) {
          const c = p.colors[cIdx];
          const variantSku = `${sku}-COL-${cIdx + 1}`;
          const varRes = await client.query(`
            INSERT INTO public.product_variants (
              product_id, variant_name, color_name, color_hex, size, sku, stock_quantity, is_active
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, true)
            ON CONFLICT (sku) DO NOTHING
            RETURNING id;
          `, [
            productId,
            `${p.title} - ${c.name}`,
            c.name,
            c.hex,
            p.sizes && p.sizes[0] ? p.sizes[0] : 'Free Size',
            variantSku,
            Math.max(5, Math.floor(stock / p.colors.length))
          ]);

          if (varRes.rows[0]) {
            // Inventory movement ledger
            await client.query(`
              INSERT INTO public.inventory_movements (
                product_id, variant_id, previous_quantity, quantity_changed, new_quantity, reason
              ) VALUES ($1, $2, 0, $3, $3, 'initial_stock');
            `, [productId, varRes.rows[0].id, Math.max(5, Math.floor(stock / p.colors.length))]);
          }
        }
      } else {
        // Default single variant
        const defaultVarRes = await client.query(`
          INSERT INTO public.product_variants (
            product_id, variant_name, size, sku, stock_quantity, is_active
          ) VALUES ($1, $2, $3, $4, $5, true)
          ON CONFLICT (sku) DO NOTHING
          RETURNING id;
        `, [
          productId,
          `${p.title} - Standard`,
          'Free Size',
          sku,
          stock
        ]);

        if (defaultVarRes.rows[0]) {
          await client.query(`
            INSERT INTO public.inventory_movements (
              product_id, variant_id, previous_quantity, quantity_changed, new_quantity, reason
            ) VALUES ($1, $2, 0, $3, $3, 'initial_stock');
          `, [productId, defaultVarRes.rows[0].id, stock]);
        }
      }

      // Link to collections
      if (p.isNew && collectionMap.has('new-arrivals')) {
        await client.query(`
          INSERT INTO public.collection_products (collection_id, product_id)
          VALUES ($1, $2) ON CONFLICT DO NOTHING;
        `, [collectionMap.get('new-arrivals'), productId]);
      }
      if (p.isBestseller && collectionMap.has('bestsellers')) {
        await client.query(`
          INSERT INTO public.collection_products (collection_id, product_id)
          VALUES ($1, $2) ON CONFLICT DO NOTHING;
        `, [collectionMap.get('bestsellers'), productId]);
      }
      if ((p.categorySlug === 'festive' || p.occasion === 'Festive') && collectionMap.has('festive-collection')) {
        await client.query(`
          INSERT INTO public.collection_products (collection_id, product_id)
          VALUES ($1, $2) ON CONFLICT DO NOTHING;
        `, [collectionMap.get('festive-collection'), productId]);
      }
      if (p.categorySlug === 'sarees' && collectionMap.has('sarees')) {
        await client.query(`
          INSERT INTO public.collection_products (collection_id, product_id)
          VALUES ($1, $2) ON CONFLICT DO NOTHING;
        `, [collectionMap.get('sarees'), productId]);
      }
      if (p.categorySlug === 'lehengas' && collectionMap.has('lehengas')) {
        await client.query(`
          INSERT INTO public.collection_products (collection_id, product_id)
          VALUES ($1, $2) ON CONFLICT DO NOTHING;
        `, [collectionMap.get('lehengas'), productId]);
      }
    }
    console.log('All products, variants, and media seeded successfully.');

    // 4. Seed Coupons
    console.log('Seeding coupons...');
    const coupons = [
      { code: 'DORASANI10', type: 'percentage', value: 10, min_amount: 1999, max_discount: 1000 },
      { code: 'ROYAL15', type: 'percentage', value: 15, min_amount: 4999, max_discount: 2500 },
      { code: 'FESTIVE500', type: 'fixed', value: 500, min_amount: 2999, max_discount: 500 },
      { code: 'BRIDAL2000', type: 'fixed', value: 2000, min_amount: 9999, max_discount: 2000 }
    ];
    for (const c of coupons) {
      await client.query(`
        INSERT INTO public.coupons (code, discount_type, discount_value, min_order_amount_inr, max_discount_inr, is_active)
        VALUES ($1, $2, $3, $4, $5, true)
        ON CONFLICT (code) DO NOTHING;
      `, [c.code, c.type, c.value, c.min_amount, c.max_discount]);
    }

    // 5. Seed Homepage Banners & CMS
    console.log('Seeding CMS and banners...');
    const banners = [
      {
        type: 'hero',
        tagline: 'THE ROYAL HERITAGE EDIT',
        title1: 'Woven in Tradition.',
        title2: 'Adorned in Royalty.',
        desc: 'Discover the timeless beauty of South Indian fashion, where heritage, artistry and elegance come together.',
        p_cta: 'Explore the Collection',
        p_link: '/shop',
        s_cta: 'Discover Our Heritage',
        s_link: '/heritage',
        d_img: '/assets/hero/desktop/h11.png',
        m_img: '/assets/hero/mobile/h1.png',
        order: 1
      },
      {
        type: 'hero',
        tagline: 'BRIDAL KANJIVARAM SILKS',
        title1: 'Sacred Threads.',
        title2: 'Blessed for Eternity.',
        desc: 'Authentic 24k gold zari handlooms woven with centuries of Dravidian craftsmanship for your auspicious wedding rituals.',
        p_cta: 'Explore Bridal Silks',
        p_link: '/collections/sarees',
        s_cta: 'View Bridal Lookbook',
        s_link: '/shop',
        d_img: '/assets/hero/desktop/h21.png',
        m_img: '/assets/hero/mobile/h2.png',
        order: 2
      },
      {
        type: 'hero',
        tagline: 'TIMELESS HEIRLOOM WEAVES',
        title1: 'Adorned in Grace.',
        title2: 'Cherished Forever.',
        desc: 'Directly from hereditary master looms to your sacred occasions — carrying the prayers and living art of South India.',
        p_cta: 'Shop Festive Silks',
        p_link: '/collections/festive',
        s_cta: 'Our Weaver Story',
        s_link: '/about',
        d_img: '/assets/hero/desktop/h31.png',
        m_img: '/assets/hero/mobile/h3.png',
        order: 3
      }
    ];

    for (const b of banners) {
      await client.query(`
        INSERT INTO public.banners (
          banner_type, tagline, title_line_1, title_line_2, description,
          primary_cta_label, primary_cta_link, secondary_cta_label, secondary_cta_link,
          desktop_image_url, mobile_image_url, display_order, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true);
      `, [
        b.type, b.tagline, b.title1, b.title2, b.desc,
        b.p_cta, b.p_link, b.s_cta, b.s_link,
        b.d_img, b.m_img, b.order
      ]);
    }

    // 6. Seed Service Benefits
    const benefits = [
      { icon: 'Sparkles', title: 'Thoughtfully Curated Fashion', desc: 'Premium fabrics and timeless designs', order: 1 },
      { icon: 'ShieldCheck', title: 'Secure Payments', desc: '100% safe and encrypted', order: 2 },
      { icon: 'Truck', title: 'Reliable Delivery', desc: 'Pan India shipping with care', order: 3 },
      { icon: 'Headphones', title: 'Dedicated Guidance', desc: 'Here to help always in-store & online', order: 4 }
    ];
    for (const b of benefits) {
      await client.query(`
        INSERT INTO public.service_benefits (icon_name, title, description, display_order, is_active)
        VALUES ($1, $2, $3, $4, true);
      `, [b.icon, b.title, b.desc, b.order]);
    }

    // 7. Seed Site Settings
    const settings = [
      { key: 'store_name', value: '"Dorasani Sarees"' },
      { key: 'tagline', value: '"A Symbol of Tradition"' },
      { key: 'support_phone', value: '"+91 7780673360"' },
      { key: 'support_email', value: '"dorasanisarees@gmail.com"' },
      { key: 'currency', value: '"INR"' },
      { key: 'free_shipping_threshold', value: '1999' },
      { key: 'standard_shipping_fee', value: '99' },
      { key: 'express_shipping_fee', value: '199' },
      { key: 'gst_rate_apparel', value: '5' }
    ];
    for (const s of settings) {
      await client.query(`
        INSERT INTO public.site_settings (key, value)
        VALUES ($1, $2::jsonb)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
      `, [s.key, s.value]);
    }

    await client.query('COMMIT');
    console.log('\nData migration and seeding completed successfully! All 19 saree and dress records are now live in PostgreSQL.');
  } catch (err) {
    console.error('Seeding failed. Rolling back:', err);
    try {
      await client.query('ROLLBACK');
    } catch (e) {
      // ignore
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedDatabase();

