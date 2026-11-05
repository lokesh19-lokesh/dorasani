import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres:Nagaraju%4099@db.irtvutkwjdjkghobnnct.supabase.co:5432/postgres';

const BUCKETS = [
  { id: 'product-images', public: true, file_size_limit: 10485760, allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'] },
  { id: 'category-images', public: true, file_size_limit: 10485760, allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp'] },
  { id: 'homepage-banners', public: true, file_size_limit: 15728640, allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp'] },
  { id: 'collection-images', public: true, file_size_limit: 10485760, allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp'] },
  { id: 'customer-avatars', public: true, file_size_limit: 5242880, allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp'] },
  { id: 'review-images', public: true, file_size_limit: 5242880, allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp'] },
  { id: 'order-documents', public: false, file_size_limit: 10485760, allowed_mime_types: ['application/pdf', 'image/jpeg', 'image/png'] }
];

async function setupStorage() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to PostgreSQL database for storage initialization...');
    await client.connect();

    for (const b of BUCKETS) {
      console.log(`Creating/updating storage bucket: ${b.id} (public: ${b.public})...`);
      await client.query(`
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES ($1, $1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE 
        SET public = EXCLUDED.public,
            file_size_limit = EXCLUDED.file_size_limit,
            allowed_mime_types = EXCLUDED.allowed_mime_types;
      `, [b.id, b.public, b.file_size_limit, b.allowed_mime_types]);
    }

    // Storage Object Policies
    console.log('Setting up storage policies on storage.objects...');

    // Public read for public buckets
    await client.query(`
      DO $$ BEGIN
        CREATE POLICY "Public Access to Public Buckets"
          ON storage.objects FOR SELECT
          USING (bucket_id IN ('product-images', 'category-images', 'homepage-banners', 'collection-images', 'customer-avatars', 'review-images'));
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Admin full access to all storage
    await client.query(`
      DO $$ BEGIN
        CREATE POLICY "Admins have full access to storage"
          ON storage.objects FOR ALL
          USING (public.is_admin())
          WITH CHECK (public.is_admin());
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Authenticated users can upload avatars and review images
    await client.query(`
      DO $$ BEGIN
        CREATE POLICY "Authenticated users can upload avatars"
          ON storage.objects FOR INSERT
          WITH CHECK (bucket_id = 'customer-avatars' AND auth.uid() IS NOT NULL);
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE POLICY "Authenticated users can upload review images"
          ON storage.objects FOR INSERT
          WITH CHECK (bucket_id = 'review-images' AND auth.uid() IS NOT NULL);
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    console.log('Storage buckets and policies successfully configured.');
  } catch (err) {
    console.error('Storage setup failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupStorage();

