import pg from 'pg';
const { Client } = pg;

// Direct PostgreSQL Connection String provided by user:
// postgresql://postgres:Nagaraju@99@db.irtvutkwjdjkghobnnct.supabase.co:5432/postgres
// Since the password contains '@', the encoded password is Nagaraju%4099
const connectionString = 'postgresql://postgres:Nagaraju%4099@db.irtvutkwjdjkghobnnct.supabase.co:5432/postgres';

async function runAudit() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Supabase PostgreSQL database...');
    await client.connect();
    console.log('Successfully connected to database.\n');

    // 1. Schemas
    const schemasRes = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY schema_name;
    `);
    console.log('=== SCHEMAS ===');
    console.log(schemasRes.rows.map(r => r.schema_name));

    // 2. Tables in public (and other relevant schemas)
    const tablesRes = await client.query(`
      SELECT table_schema, table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema IN ('public', 'storage', 'auth')
      ORDER BY table_schema, table_name;
    `);
    console.log('\n=== TABLES (public, storage, auth) ===');
    console.table(tablesRes.rows);

    // Specifically tables in public:
    const publicTables = tablesRes.rows.filter(r => r.table_schema === 'public').map(r => r.table_name);
    console.log('\nPublic tables found:', publicTables);

    // 3. For each public table, inspect columns, row count, constraints, RLS
    for (const tableName of publicTables) {
      console.log(`\n--------------------------------------------------`);
      console.log(`TABLE: public.${tableName}`);
      console.log(`--------------------------------------------------`);

      // Columns
      const colsRes = await client.query(`
        SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `, [tableName]);
      console.log('Columns:');
      console.table(colsRes.rows);

      // Constraints
      const consRes = await client.query(`
        SELECT tc.constraint_name, tc.constraint_type, kcu.column_name,
               ccu.table_schema AS foreign_table_schema,
               ccu.table_name AS foreign_table_name,
               ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints tc
        LEFT JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
        LEFT JOIN information_schema.constraint_column_usage ccu
          ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
        WHERE tc.table_schema = 'public' AND tc.table_name = $1;
      `, [tableName]);
      console.log('Constraints:');
      console.table(consRes.rows);

      // Indexes
      const idxRes = await client.query(`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE schemaname = 'public' AND tablename = $1;
      `, [tableName]);
      console.log('Indexes:');
      console.table(idxRes.rows);

      // RLS status
      const rlsRes = await client.query(`
        SELECT relrowsecurity, relforcerowsecurity
        FROM pg_class
        JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
        WHERE pg_namespace.nspname = 'public' AND relname = $1;
      `, [tableName]);
      console.log('RLS Status:', rlsRes.rows[0]);

      // Count
      try {
        const countRes = await client.query(`SELECT COUNT(*) as count FROM public."${tableName}";`);
        console.log(`Row count: ${countRes.rows[0].count}`);

        // If table has records, sample the first 20 records
        if (parseInt(countRes.rows[0].count, 10) > 0) {
          const sampleRes = await client.query(`SELECT * FROM public."${tableName}" LIMIT 20;`);
          console.log(`Sample records (up to 20):`);
          console.log(JSON.stringify(sampleRes.rows, null, 2));
        }
      } catch (err) {
        console.error(`Error querying public."${tableName}":`, err.message);
      }
    }

    // 4. RLS Policies
    const policiesRes = await client.query(`
      SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
      FROM pg_policies
      WHERE schemaname = 'public';
    `);
    console.log('\n=== RLS POLICIES (public) ===');
    console.table(policiesRes.rows);

    // 5. Database Functions in public
    const funcsRes = await client.query(`
      SELECT routine_name, routine_type, data_type
      FROM information_schema.routines
      WHERE routine_schema = 'public';
    `);
    console.log('\n=== DATABASE FUNCTIONS (public) ===');
    console.table(funcsRes.rows);

    // 6. Storage Buckets
    try {
      const bucketsRes = await client.query(`
        SELECT id, name, public, created_at, updated_at
        FROM storage.buckets;
      `);
      console.log('\n=== STORAGE BUCKETS ===');
      console.table(bucketsRes.rows);

      const objectsCount = await client.query(`
        SELECT bucket_id, count(*) as object_count
        FROM storage.objects
        GROUP BY bucket_id;
      `);
      console.log('\n=== STORAGE OBJECTS COUNT ===');
      console.table(objectsCount.rows);
    } catch (err) {
      console.log('\nStorage check error (might not be initialized):', err.message);
    }

    // 7. Auth users check (count only, preserve privacy)
    try {
      const authCount = await client.query(`
        SELECT count(*) as user_count FROM auth.users;
      `);
      console.log('\n=== AUTH USERS COUNT ===');
      console.log(`Total users registered: ${authCount.rows[0].user_count}`);
    } catch (err) {
      console.log('\nAuth check error:', err.message);
    }

    // 8. Specific Search for saree / dress products in ANY table
    console.log('\n=== SEARCHING FOR SAREE / DRESS RECORDS ACROSS ALL TABLES ===');
    for (const tableName of publicTables) {
      try {
        const textCols = (await client.query(`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = $1
            AND data_type IN ('text', 'character varying', 'character')
        `, [tableName])).rows.map(r => r.column_name);

        if (textCols.length > 0) {
          const conditions = textCols.map(c => `"${c}" ILIKE '%saree%' OR "${c}" ILIKE '%dress%'`).join(' OR ');
          const matchRes = await client.query(`
            SELECT * FROM public."${tableName}" WHERE ${conditions} LIMIT 50;
          `);
          if (matchRes.rows.length > 0) {
            console.log(`\n>>> MATCHES FOUND IN public."${tableName}" (${matchRes.rows.length} rows):`);
            console.log(JSON.stringify(matchRes.rows, null, 2));
          }
        }
      } catch (err) {
        // ignore
      }
    }

  } catch (err) {
    console.error('Audit failed with error:', err);
  } finally {
    await client.end();
  }
}

runAudit();

