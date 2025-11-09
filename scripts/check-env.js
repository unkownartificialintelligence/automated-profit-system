#!/usr/bin/env node

// Environment Configuration Checker
// Run this to validate your environment setup without starting the server

import { validateEnvironment, getEnvironmentInfo, generateEnvTemplate } from '../src/config/env-validator.js';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';

const args = process.argv.slice(2);
const command = args[0];

console.log('╔══════════════════════════════════════════════════════════════════════╗');
console.log('║         🔍 ENVIRONMENT CONFIGURATION CHECKER                        ║');
console.log('╚══════════════════════════════════════════════════════════════════════╝\n');

switch (command) {
  case 'validate':
  case 'check':
  case undefined:
    // Validate environment
    console.log('Running environment validation...\n');
    const result = validateEnvironment({ exitOnError: false });

    if (result.isValid) {
      console.log('✅ Environment configuration is valid!\n');
      process.exit(0);
    } else {
      console.log('❌ Environment configuration has errors\n');
      console.log('Fix the errors above and run this check again.\n');
      process.exit(1);
    }
    break;

  case 'info':
    // Show environment info
    const info = getEnvironmentInfo();
    console.log('📊 Environment Information:\n');
    console.log(`Node Version:    ${info.nodeVersion}`);
    console.log(`Platform:        ${info.platform}`);
    console.log(`Environment:     ${info.environment}`);
    console.log(`Is Production:   ${info.isProduction ? 'Yes' : 'No'}`);
    console.log(`Is Vercel:       ${info.isVercel ? 'Yes' : 'No'}`);
    console.log(`Has Database:    ${info.hasDatabase ? 'Yes' : 'No'}`);
    console.log('\n🔌 Configured Services:');
    for (const [service, configured] of Object.entries(info.configuredServices)) {
      console.log(`  ${configured ? '✅' : '❌'} ${service.charAt(0).toUpperCase() + service.slice(1)}`);
    }
    console.log();
    break;

  case 'generate':
  case 'template':
    // Generate .env template
    console.log('📝 Generating .env.example template...\n');
    const template = generateEnvTemplate();
    const envExamplePath = join(process.cwd(), '.env.example');

    try {
      writeFileSync(envExamplePath, template);
      console.log('✅ Created .env.example\n');
      console.log('Next steps:');
      console.log('1. Copy .env.example to .env');
      console.log('2. Fill in your API keys and configuration');
      console.log('3. Run: npm run check:env\n');
    } catch (error) {
      console.error('❌ Failed to create .env.example:', error.message);
      process.exit(1);
    }
    break;

  case 'required':
    // Show only required variables
    console.log('📋 Required Environment Variables:\n');
    console.log('These MUST be configured for the app to work:\n');

    const required = [
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'OPENAI_API_KEY',
      'PRINTFUL_API_KEY',
      'SMTP_HOST',
      'SMTP_USER',
      'SMTP_PASS',
    ];

    for (const varName of required) {
      const isSet = !!process.env[varName];
      console.log(`  ${isSet ? '✅' : '❌'} ${varName}`);
      if (!isSet) {
        console.log(`     Set this in your .env file`);
      }
    }
    console.log();
    break;

  case 'production':
    // Check production readiness
    console.log('🏭 Production Readiness Check:\n');

    const prodChecks = {
      'Cloud Database': !!(process.env.POSTGRES_URL || process.env.SUPABASE_URL || process.env.MONGODB_URI),
      'Production Stripe Keys': process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_'),
      'All Required Variables': true, // Will be checked below
      'Email Configuration': !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
    };

    const requiredVars = ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'OPENAI_API_KEY', 'PRINTFUL_API_KEY'];
    prodChecks['All Required Variables'] = requiredVars.every(v => !!process.env[v]);

    let allPassed = true;
    for (const [check, passed] of Object.entries(prodChecks)) {
      console.log(`  ${passed ? '✅' : '❌'} ${check}`);
      if (!passed) allPassed = false;
    }

    console.log();
    if (allPassed) {
      console.log('✅ Ready for production deployment!\n');
      process.exit(0);
    } else {
      console.log('❌ Not ready for production. Fix issues above.\n');
      process.exit(1);
    }
    break;

  case 'help':
  default:
    // Show help
    console.log('Usage: node scripts/check-env.js [command]\n');
    console.log('Commands:');
    console.log('  validate, check    Validate all environment variables (default)');
    console.log('  info               Show environment information');
    console.log('  generate, template Generate .env.example template');
    console.log('  required           Show required variables only');
    console.log('  production         Check production readiness');
    console.log('  help               Show this help message\n');
    console.log('Examples:');
    console.log('  node scripts/check-env.js');
    console.log('  node scripts/check-env.js validate');
    console.log('  node scripts/check-env.js production');
    console.log('  npm run check:env\n');
    break;
}
