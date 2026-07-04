/**
 * HTTP Security Headers Audit Script
 * Burger & Broaster Express
 *
 * Run this script in the browser console to verify
 * that security headers are correctly configured.
 *
 * Usage: Copy and paste this entire script into the browser console.
 */

(async function auditHeaders() {
  console.log('%c🔒 Starting Security Headers Audit...', 'font-size: 16px; font-weight: bold; color: #0A2240;');
  console.log('');

  const requiredHeaders = [
    {
      name: 'X-Frame-Options',
      expected: 'SAMEORIGIN',
      description: 'Prevents clickjacking attacks',
      critical: true
    },
    {
      name: 'X-Content-Type-Options',
      expected: 'nosniff',
      description: 'Prevents MIME type sniffing',
      critical: true
    },
    {
      name: 'X-XSS-Protection',
      expected: '1; mode=block',
      description: 'Enables XSS protection in legacy browsers',
      critical: false
    },
    {
      name: 'Referrer-Policy',
      expected: 'strict-origin-when-cross-origin',
      description: 'Controls referrer information leakage',
      critical: true
    },
    {
      name: 'Permissions-Policy',
      expected: 'camera=(), microphone=(), geolocation=(), payment=()',
      description: 'Restricts browser features',
      critical: false
    },
    {
      name: 'Content-Security-Policy',
      expected: 'default-src \'self\'',
      description: 'Prevents XSS and code injection',
      critical: true
    }
  ];

  let passed = 0;
  let failed = 0;
  let warnings = 0;

  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #0A2240;');
  console.log('%c📋 Checking HTTP Security Headers', 'color: #0A2240; font-weight: bold;');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #0A2240;');

  // Note: We can't directly read response headers from the page
  // but we can check if meta tags are set and suggest verification
  console.log('');
  console.log('%c⚠️ IMPORTANT:', 'color: #E8C94B; font-weight: bold;');
  console.log('Browser JS cannot read HTTP response headers directly.');
  console.log('This script checks meta tags and provides verification steps.');
  console.log('');

  // Check for CSP meta tag
  const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (cspMeta) {
    console.log('✅ CSP meta tag found');
    passed++;
  } else {
    console.log('⚠️ CSP meta tag not found (check server headers)');
    warnings++;
  }

  // Check for viewport meta
  const viewportMeta = document.querySelector('meta[name="viewport"]');
  if (viewportMeta) {
    console.log('✅ Viewport meta tag found');
    passed++;
  } else {
    console.log('⚠️ Viewport meta tag not found');
    warnings++;
  }

  // Check for external scripts (CSP concern)
  const externalScripts = document.querySelectorAll('script[src]');
  console.log(`\n📦 External scripts found: ${externalScripts.length}`);
  externalScripts.forEach(script => {
    console.log(`   - ${script.src}`);
  });

  // Check for inline scripts (CSP concern)
  const inlineScripts = document.querySelectorAll('script:not([src])');
  console.log(`📦 Inline scripts found: ${inlineScripts.length}`);

  // Check for external stylesheets (CSP concern)
  const externalStyles = document.querySelectorAll('link[rel="stylesheet"]');
  console.log(`📦 External stylesheets found: ${externalStyles.length}`);

  // SUMMARY
  console.log('');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #0A2240;');
  console.log('%c📊 HEADERS AUDIT SUMMARY', 'color: #0A2240; font-size: 16px; font-weight: bold;');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #0A2240;');
  console.log(`✅ Passed: ${passed}`);
  console.log(`⚠️ Warnings: ${warnings}`);
  console.log(`❌ Failed: ${failed}`);

  console.log('');
  console.log('%c📋 MANUAL VERIFICATION STEPS:', 'color: #3B82F6; font-weight: bold;');
  console.log('1. Open Chrome DevTools → Network tab');
  console.log('2. Reload the page');
  console.log('3. Click on the first request (document)');
  console.log('4. Check the "Response Headers" section');
  console.log('');
  console.log('Expected headers:');
  requiredHeaders.forEach(h => {
    console.log(`  ${h.critical ? '🔴' : '🟡'} ${h.name}: ${h.expected}`);
  });

  console.log('');
  console.log('%c📋 OR use this curl command:', 'color: #3B82F6; font-weight: bold;');
  console.log('curl -I https://your-domain.com');

  return { passed, warnings, failed, requiredHeaders };
})();
