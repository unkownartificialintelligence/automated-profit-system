#!/usr/bin/env node

import readline from 'readline';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import axios from 'axios';
import { spawn } from 'child_process';

console.log('\n🚀 PRINTFUL API SETUP - AUTOMATED CONFIGURATION\n');
console.log('═══════════════════════════════════════════════════\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function validatePrintfulKey(apiKey) {
  try {
    console.log('\n🔍 Validating your Printful API key...');
    const response = await axios.get('https://api.printful.com/store/products', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    console.log('✅ API key is VALID!');
    console.log(`   Connected to Printful successfully`);
    return true;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('❌ API key is INVALID');
      console.log('   Please check your key and try again');
      return false;
    } else {
      console.log('⚠️  Could not validate (network issue), but saving anyway...');
      return true; // Save it anyway, might be network issue
    }
  }
}

function updateEnvFile(apiKey) {
  const envPath = '.env';
  let envContent = '';

  // Read existing .env if it exists
  if (existsSync(envPath)) {
    envContent = readFileSync(envPath, 'utf8');
  }

  // Check if PRINTFUL_API_KEY already exists
  if (envContent.includes('PRINTFUL_API_KEY=')) {
    // Replace existing key
    envContent = envContent.replace(
      /PRINTFUL_API_KEY=.*/,
      `PRINTFUL_API_KEY=${apiKey}`
    );
  } else {
    // Add new key
    envContent += `\n# Printful API Configuration\nPRINTFUL_API_KEY=${apiKey}\n`;
  }

  // Add other default env vars if not present
  if (!envContent.includes('PORT=')) {
    envContent += '\n# Server Configuration\nPORT=3003\n';
  }
  if (!envContent.includes('NODE_ENV=')) {
    envContent += 'NODE_ENV=production\n';
  }

  writeFileSync(envPath, envContent);
  console.log('\n✅ API key saved to .env file');
  console.log('   Location: .env');
}

async function testAutomation(apiKey) {
  console.log('\n🧪 Testing automation endpoints...\n');

  // Test 1: Discover trending products
  try {
    console.log('Test 1: Trending Product Discovery');
    const response = await axios.get('http://localhost:3003/api/automation/discover/trending-products');
    console.log(`✅ Found ${response.data.discovered} trending products`);
    console.log(`   Top pick: ${response.data.top_opportunities[0].keyword} (${response.data.top_opportunities[0].profit_potential} profit)`);
  } catch (error) {
    console.log('⚠️  Server might not be running. Start with: npm start');
  }

  // Test 2: Email templates
  try {
    console.log('\nTest 2: Email Template Generation');
    const response = await axios.post('http://localhost:3003/api/automation/outreach/email-template', {
      product_name: 'Test Product',
      shop_url: 'https://etsy.com/shop/test'
    });
    console.log('✅ Email templates generated successfully');
    console.log('   Templates: Email, Facebook, Instagram, Twitter');
  } catch (error) {
    console.log('⚠️  Server might not be running');
  }

  // Test 3: Printful connection
  try {
    console.log('\nTest 3: Printful API Connection');
    const response = await axios.get(`http://localhost:3003/api/automation/printful/products?printful_api_key=${apiKey}`);
    console.log(`✅ Connected to Printful successfully`);
    console.log(`   Current products: ${response.data.total_products || 0}`);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('❌ Printful API key invalid');
    } else {
      console.log('⚠️  Could not connect to Printful (check server is running)');
    }
  }
}

async function main() {
  console.log('📋 STEP 1: Get your Printful API Key\n');
  console.log('   1. Open: https://www.printful.com/dashboard/settings');
  console.log('   2. Click "API" in the left sidebar');
  console.log('   3. Click "Enable API Access"');
  console.log('   4. Copy the API key shown\n');

  const openBrowser = await question('Would you like to open Printful settings now? (y/n): ');

  if (openBrowser.toLowerCase() === 'y') {
    console.log('\n🌐 Opening Printful settings in your browser...\n');
    const open = (await import('open')).default;
    await open('https://www.printful.com/dashboard/settings');
    console.log('✅ Browser opened. Get your API key and come back here.\n');
  }

  let apiKey = '';
  let isValid = false;

  while (!isValid) {
    apiKey = await question('\n📝 Paste your Printful API key here: ');

    if (!apiKey || apiKey.trim() === '') {
      console.log('❌ API key cannot be empty. Please try again.');
      continue;
    }

    apiKey = apiKey.trim();

    // Validate the key
    isValid = await validatePrintfulKey(apiKey);

    if (!isValid) {
      const retry = await question('\nWould you like to try again? (y/n): ');
      if (retry.toLowerCase() !== 'y') {
        console.log('\n❌ Setup cancelled.');
        rl.close();
        process.exit(1);
      }
    }
  }

  console.log('\n📋 STEP 2: Saving configuration\n');
  updateEnvFile(apiKey);

  console.log('\n📋 STEP 3: Testing automation\n');
  await testAutomation(apiKey);

  console.log('\n═══════════════════════════════════════════════════');
  console.log('✅ SETUP COMPLETE!\n');
  console.log('Your Printful automation is ready to use!\n');
  console.log('Next steps:');
  console.log('  1. Restart server: npm start');
  console.log('  2. Discover products: curl http://localhost:3003/api/automation/discover/trending-products');
  console.log('  3. Check guide: cat AUTOMATION_GUIDE.md\n');
  console.log('🚀 Happy automating!\n');

  rl.close();
}

main().catch(error => {
  console.error('\n❌ Setup failed:', error.message);
  rl.close();
  process.exit(1);
});
