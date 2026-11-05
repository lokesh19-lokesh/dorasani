import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://irtvutkwjdjkghobnnct.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydHZ1dGt3amRqa2dob2JubmN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5Mzg2NTg0NywiZXhwIjoyMTA5NDQxODQ3fQ.w-z0wutmDHJtK_c-n00F-WRN44NfVKuiT4cdoTaMjS0';

const supabase = createClient(supabaseUrl, serviceKey);

async function uploadFolder(folderPath, bucketName) {
  if (!fs.existsSync(folderPath)) return;
  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    const fullPath = path.join(folderPath, file);
    const stat = fs.statSync(fullPath);
    if (stat.isFile() && !file.startsWith('.')) {
      const ext = path.extname(file).toLowerCase();
      let contentType = 'image/jpeg';
      if (ext === '.png') contentType = 'image/png';
      else if (ext === '.webp') contentType = 'image/webp';
      else if (ext === '.svg') contentType = 'image/svg+xml';

      const fileBuffer = fs.readFileSync(fullPath);
      console.log(`Uploading ${file} to ${bucketName}...`);
      const { error } = await supabase.storage
        .from(bucketName)
        .upload(file, fileBuffer, {
          contentType,
          upsert: true
        });

      if (error) {
        console.error(`Failed to upload ${file}:`, error.message);
      }
    }
  }
}

async function uploadAll() {
  console.log('Uploading product images...');
  await uploadFolder('public/assets/products', 'product-images');
  console.log('Uploading category images...');
  await uploadFolder('public/assets/categories', 'category-images');
  console.log('Uploading banner images...');
  await uploadFolder('public/assets/banners', 'homepage-banners');
  console.log('Finished uploading assets to Supabase Storage.');
}

uploadAll();

