#!/usr/bin/env node
/**
 * Test script to reproduce the cache issue:
 * 1. Creates a scenario with old HTML referencing old asset hashes
 * 2. Tests if the service worker network-first strategy fixes it
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const distDir = join(process.cwd(), 'dist');
const indexPath = join(distDir, 'index.html');

if (!existsSync(indexPath)) {
  console.error('❌ dist/index.html not found. Run "yarn build" first.');
  process.exit(1);
}

// Read current HTML
let html = readFileSync(indexPath, 'utf-8');

// Simulate old HTML with old asset hashes (like the error shows)
const oldHashes = {
  js: 'index-BFV-Z1OC.js',
  css: 'index-BJwTGF3x.css',
  manifest: 'manifest-Dq4qqR1l.json'
};

console.log('📝 Simulating old cached HTML with old asset hashes...');
console.log(`   Old JS: ${oldHashes.js}`);
console.log(`   Old CSS: ${oldHashes.css}`);
console.log(`   Old Manifest: ${oldHashes.manifest}`);

// Replace current hashes with old ones
html = html.replace(/index-[a-zA-Z0-9]+\.js/g, oldHashes.js);
html = html.replace(/index-[a-zA-Z0-9]+\.css/g, oldHashes.css);
html = html.replace(/manifest-[a-zA-Z0-9]+\.json/g, oldHashes.manifest);

// Save as index-old.html for testing
const oldIndexPath = join(distDir, 'index-old.html');
writeFileSync(oldIndexPath, html, 'utf-8');

console.log('✅ Created index-old.html with old asset hashes');
console.log('\n🧪 To test:');
console.log('   1. Start server: yarn serve');
console.log('   2. Open: http://localhost:8888/index-old.html');
console.log('   3. Check console for 404 errors');
console.log('   4. The service worker should fetch fresh HTML on next navigation');
console.log('\n💡 The fix: Service worker uses network-first for HTML,');
console.log('   so even if old HTML is cached, it will fetch fresh HTML on next load.');
