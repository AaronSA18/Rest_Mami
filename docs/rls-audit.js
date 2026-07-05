/**
 * RLS (Row Level Security) Audit Script
 * Burger & Broaster Express
 *
 * Run this script in the browser console to verify
 * that Supabase RLS policies are correctly configured.
 *
 * Usage: Copy and paste this entire script into the browser console
 *        while on the site. It will test all database operations.
 */

(async function auditRLS() {
  const SUPABASE_URL = 'https://pqcrhfnwshrlyndhsvas.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxY3JoZm53c2hybHluZGhzdmFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMjY4MTEsImV4cCI6MjA5NjcwMjgxMX0.dfsnC1LSdBxSUNDCFuZ0MMNTLZHq0jp-Jx7wFPol-bo';

  const results = [];
  let passed = 0;
  let failed = 0;

  console.log('%c🔒 Starting RLS Audit...', 'font-size: 16px; font-weight: bold; color: #0A2240;');
  console.log('');

  function createClient() {
    return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  async function testQuery(name, operation) {
    try {
      const result = await operation();
      if (result.error) {
        const err = result.error;
        const isBlocked = err.code === '42501' || err.code === 'PGRST301' ||
                         err.message.includes('permission denied') ||
                         err.message.includes('RLS') ||
                         err.status === 401 || err.status === 403;

        if (isBlocked) {
          console.log(`🛡️ ${name}: BLOCKED (correct)`);
          results.push({ name, status: 'BLOCKED', correct: true });
          passed++;
        } else {
          console.log(`⚠️ ${name}: ERROR - ${err.message}`);
          results.push({ name, status: 'ERROR', correct: false, error: err.message });
          failed++;
        }
      } else {
        console.log(`✅ ${name}: PASS (${result.data?.length || 0} rows)`);
        results.push({ name, status: 'PASS', correct: true, rows: result.data?.length || 0 });
        passed++;
      }
    } catch (e) {
      const isBlocked = e.message.includes('permission denied') ||
                       e.message.includes('RLS') ||
                       e.status === 401 || e.status === 403;

      if (isBlocked) {
        console.log(`🛡️ ${name}: BLOCKED (correct)`);
        results.push({ name, status: 'BLOCKED', correct: true });
        passed++;
      } else {
        console.log(`❌ ${name}: FAIL - ${e.message}`);
        results.push({ name, status: 'FAIL', correct: false, error: e.message });
        failed++;
      }
    }
  }

  const supabase = createClient();

  // SELECT operations (should be ALLOWED)
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #10B981;');
  console.log('%c📋 TEST 1: SELECT Operations (should PASS)', 'color: #10B981; font-weight: bold;');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #10B981;');

  await testQuery('categories SELECT', () =>
    supabase.from('categories').select('*')
  );

  await testQuery('products SELECT', () =>
    supabase.from('products').select('*').eq('is_active', true)
  );

  await testQuery('combos SELECT', () =>
    supabase.from('combos').select('*').eq('is_active', true)
  );

  // INSERT operations (should be BLOCKED)
  console.log('');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #EF4444;');
  console.log('%c🛡️ TEST 2: INSERT Operations (should be BLOCKED)', 'color: #EF4444; font-weight: bold;');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #EF4444;');

  await testQuery('categories INSERT', () =>
    supabase.from('categories').insert({ name: 'test_hack', description: 'hacked' })
  );

  await testQuery('products INSERT', () =>
    supabase.from('products').insert({ name: 'test_product', price: 0, is_active: true })
  );

  await testQuery('combos INSERT', () =>
    supabase.from('combos').insert({ name: 'test_combo', price: 0 })
  );

  // UPDATE operations (should be BLOCKED)
  console.log('');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #EF4444;');
  console.log('%c🛡️ TEST 3: UPDATE Operations (should be BLOCKED)', 'color: #EF4444; font-weight: bold;');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #EF4444;');

  await testQuery('categories UPDATE', () =>
    supabase.from('categories').update({ name: 'hacked' }).eq('id', 1)
  );

  await testQuery('products UPDATE', () =>
    supabase.from('products').update({ price: 0 }).eq('id', 1)
  );

  await testQuery('combos UPDATE', () =>
    supabase.from('combos').update({ price: 0 }).eq('id', 1)
  );

  // DELETE operations (should be BLOCKED)
  console.log('');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #EF4444;');
  console.log('%c🛡️ TEST 4: DELETE Operations (should be BLOCKED)', 'color: #EF4444; font-weight: bold;');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #EF4444;');

  await testQuery('categories DELETE', () =>
    supabase.from('categories').delete().eq('id', 1)
  );

  await testQuery('products DELETE', () =>
    supabase.from('products').delete().eq('id', 1)
  );

  await testQuery('combos DELETE', () =>
    supabase.from('combos').delete().eq('id', 1)
  );

  // Storage bucket (should be PUBLIC for reading)
  console.log('');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #3B82F6;');
  console.log('%c📦 TEST 5: Storage Bucket (should be PUBLIC)', 'color: #3B82F6; font-weight: bold;');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #3B82F6;');

  await testQuery('storage list files', () =>
    supabase.storage.from('menu-images').list('imagen')
  );

  // SUMMARY
  console.log('');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #0A2240;');
  console.log('%c📊 RLS AUDIT SUMMARY', 'color: #0A2240; font-size: 16px; font-weight: bold;');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #0A2240;');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total:  ${passed + failed}`);
  console.log(`🎯 Score:  ${Math.round((passed / (passed + failed)) * 100)}%`);

  if (failed === 0) {
    console.log('%c\n🎉 RLS is correctly configured!', 'color: #10B981; font-size: 14px; font-weight: bold;');
  } else {
    console.log('%c\n⚠️ Some tests failed. Check Supabase RLS policies.', 'color: #EF4444; font-size: 14px; font-weight: bold;');
  }

  return results;
})();
