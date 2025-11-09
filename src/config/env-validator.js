// Environment Variable Validator
// Ensures all required configuration is present and valid

import dotenv from 'dotenv';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

// Environment variable definitions
const ENV_VARIABLES = {
  // Server Configuration
  NODE_ENV: {
    required: false,
    default: 'development',
    validate: (val) => ['development', 'production', 'test'].includes(val),
    description: 'Application environment',
  },
  PORT: {
    required: false,
    default: '3000',
    validate: (val) => !isNaN(parseInt(val)) && parseInt(val) > 0 && parseInt(val) < 65536,
    description: 'Server port number',
  },

  // Payment Integration (Critical)
  STRIPE_SECRET_KEY: {
    required: true,
    validate: (val) => val.startsWith('sk_'),
    description: 'Stripe secret key for payment processing',
    example: 'sk_test_...',
  },
  STRIPE_PUBLISHABLE_KEY: {
    required: false,
    validate: (val) => val.startsWith('pk_'),
    description: 'Stripe publishable key',
    example: 'pk_test_...',
  },
  STRIPE_WEBHOOK_SECRET: {
    required: true,
    validate: (val) => val.startsWith('whsec_'),
    description: 'Stripe webhook signing secret',
    example: 'whsec_...',
  },

  // AI Features (Critical)
  OPENAI_API_KEY: {
    required: true,
    validate: (val) => val.startsWith('sk-'),
    description: 'OpenAI API key for GPT-4 features',
    example: 'sk-...',
  },

  // POD Integration (Critical)
  PRINTFUL_API_KEY: {
    required: true,
    validate: (val) => val.length > 10,
    description: 'Printful API key for product fulfillment',
    example: 'your_printful_api_key',
  },

  // Email Configuration (Important)
  SMTP_HOST: {
    required: true,
    validate: (val) => val.includes('.'),
    description: 'SMTP server hostname',
    example: 'smtp.gmail.com',
  },
  SMTP_PORT: {
    required: false,
    default: '587',
    validate: (val) => !isNaN(parseInt(val)),
    description: 'SMTP server port',
  },
  SMTP_USER: {
    required: true,
    validate: (val) => val.includes('@'),
    description: 'SMTP username (email)',
    example: 'your@email.com',
  },
  SMTP_PASS: {
    required: true,
    validate: (val) => val.length > 5,
    description: 'SMTP password or app password',
    example: 'your_app_password',
  },
  SMTP_FROM: {
    required: false,
    default: process.env.SMTP_USER,
    validate: (val) => val.includes('@'),
    description: 'Email sender address',
  },

  // Database (Production)
  POSTGRES_URL: {
    required: false,
    validate: (val) => val.startsWith('postgres://') || val.startsWith('postgresql://'),
    description: 'PostgreSQL connection string (for Vercel/production)',
    example: 'postgresql://user:pass@host:5432/db',
  },
  SUPABASE_URL: {
    required: false,
    validate: (val) => val.startsWith('https://'),
    description: 'Supabase project URL',
    example: 'https://xxx.supabase.co',
  },
  SUPABASE_ANON_KEY: {
    required: false,
    validate: (val) => val.length > 20,
    description: 'Supabase anonymous key',
  },
  MONGODB_URI: {
    required: false,
    validate: (val) => val.startsWith('mongodb'),
    description: 'MongoDB connection string',
  },
  DB_TYPE: {
    required: false,
    default: 'sqlite',
    validate: (val) => ['sqlite', 'postgres', 'supabase', 'mongodb'].includes(val),
    description: 'Database type to use',
  },

  // Frontend Configuration
  FRONTEND_URL: {
    required: false,
    default: 'http://localhost:3000',
    validate: (val) => val.startsWith('http'),
    description: 'Frontend application URL',
  },

  // Optional Integrations
  CANVA_API_KEY: {
    required: false,
    description: 'Canva API key for design automation',
  },
  CANVA_BRAND_TEMPLATE_ID: {
    required: false,
    description: 'Canva brand template ID',
  },
  SHOPIFY_API_KEY: {
    required: false,
    description: 'Shopify API key',
  },
  SHOPIFY_API_SECRET: {
    required: false,
    description: 'Shopify API secret',
  },
  ETSY_API_KEY: {
    required: false,
    description: 'Etsy API key',
  },
  WOOCOMMERCE_CONSUMER_KEY: {
    required: false,
    description: 'WooCommerce consumer key',
  },
  WOOCOMMERCE_CONSUMER_SECRET: {
    required: false,
    description: 'WooCommerce consumer secret',
  },
};

// Validation results
class ValidationResult {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.info = [];
    this.isValid = true;
  }

  addError(message) {
    this.errors.push(message);
    this.isValid = false;
  }

  addWarning(message) {
    this.warnings.push(message);
  }

  addInfo(message) {
    this.info.push(message);
  }
}

// Validate environment variables
export function validateEnvironment(options = {}) {
  const { strict = false, exitOnError = false } = options;
  const result = new ValidationResult();
  const isProduction = process.env.NODE_ENV === 'production';
  const isVercel = process.env.VERCEL === '1';

  console.log('🔍 Validating environment configuration...\n');

  // Check each environment variable
  for (const [key, config] of Object.entries(ENV_VARIABLES)) {
    const value = process.env[key];

    // Check if required variable is missing
    if (config.required && !value) {
      result.addError(`Missing required variable: ${key}`);
      console.error(`❌ ${key}: MISSING (required)`);
      if (config.description) {
        console.error(`   Description: ${config.description}`);
      }
      if (config.example) {
        console.error(`   Example: ${config.example}`);
      }
      continue;
    }

    // Set default if not provided
    if (!value && config.default) {
      process.env[key] = config.default;
      result.addInfo(`${key}: Using default value "${config.default}"`);
      console.log(`ℹ️  ${key}: Using default "${config.default}"`);
      continue;
    }

    // Skip if optional and not provided
    if (!value && !config.required) {
      result.addInfo(`${key}: Not configured (optional)`);
      console.log(`⚪ ${key}: Not configured (optional)`);
      continue;
    }

    // Validate value if validator exists
    if (value && config.validate) {
      try {
        if (!config.validate(value)) {
          result.addWarning(`${key}: Invalid format`);
          console.warn(`⚠️  ${key}: Invalid format`);
          if (config.example) {
            console.warn(`   Expected format: ${config.example}`);
          }
        } else {
          console.log(`✅ ${key}: Valid`);
        }
      } catch (error) {
        result.addWarning(`${key}: Validation error - ${error.message}`);
        console.warn(`⚠️  ${key}: Validation error`);
      }
    } else if (value) {
      console.log(`✅ ${key}: Configured`);
    }
  }

  // Additional validation for production
  if (isProduction || isVercel) {
    console.log('\n🏭 Production environment detected');

    // Check for cloud database in production
    const hasCloudDb = process.env.POSTGRES_URL || process.env.SUPABASE_URL || process.env.MONGODB_URI;
    if (!hasCloudDb) {
      result.addError('Production requires a cloud database (POSTGRES_URL, SUPABASE_URL, or MONGODB_URI)');
      console.error('❌ No cloud database configured for production');
      console.error('   SQLite will not work on Vercel/serverless environments');
    }

    // Check for production Stripe keys
    if (process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')) {
      result.addWarning('Using Stripe TEST keys in production');
      console.warn('⚠️  Using Stripe TEST keys in production environment');
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 VALIDATION SUMMARY');
  console.log('='.repeat(70));

  if (result.errors.length > 0) {
    console.log(`\n❌ Errors: ${result.errors.length}`);
    result.errors.forEach(err => console.log(`   • ${err}`));
  }

  if (result.warnings.length > 0) {
    console.log(`\n⚠️  Warnings: ${result.warnings.length}`);
    result.warnings.forEach(warn => console.log(`   • ${warn}`));
  }

  console.log(`\n✅ Valid configuration: ${result.isValid ? 'YES' : 'NO'}`);
  console.log('='.repeat(70) + '\n');

  // Exit if validation failed and exitOnError is true
  if (!result.isValid && exitOnError) {
    console.error('💥 Environment validation failed. Exiting...\n');
    console.error('To fix:');
    console.error('1. Copy .env.example to .env');
    console.error('2. Fill in all required variables');
    console.error('3. Restart the application\n');
    process.exit(1);
  }

  return result;
}

// Generate .env template with all variables
export function generateEnvTemplate() {
  let template = '# Environment Configuration\n';
  template += '# Copy this file to .env and fill in your values\n\n';

  const categories = {
    'Server Configuration': ['NODE_ENV', 'PORT'],
    'Payment Integration (Required)': ['STRIPE_SECRET_KEY', 'STRIPE_PUBLISHABLE_KEY', 'STRIPE_WEBHOOK_SECRET'],
    'AI Features (Required)': ['OPENAI_API_KEY'],
    'POD Integration (Required)': ['PRINTFUL_API_KEY'],
    'Email Configuration (Required)': ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'],
    'Database (Production Only)': ['POSTGRES_URL', 'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'MONGODB_URI', 'DB_TYPE'],
    'Frontend Configuration': ['FRONTEND_URL'],
    'Optional Integrations': ['CANVA_API_KEY', 'CANVA_BRAND_TEMPLATE_ID', 'SHOPIFY_API_KEY', 'SHOPIFY_API_SECRET', 'ETSY_API_KEY', 'WOOCOMMERCE_CONSUMER_KEY', 'WOOCOMMERCE_CONSUMER_SECRET'],
  };

  for (const [category, vars] of Object.entries(categories)) {
    template += `\n# ${category}\n`;
    for (const varName of vars) {
      const config = ENV_VARIABLES[varName];
      if (!config) continue;

      if (config.description) {
        template += `# ${config.description}\n`;
      }
      if (config.required) {
        template += `# REQUIRED\n`;
      }
      if (config.example) {
        template += `${varName}=${config.example}\n`;
      } else if (config.default) {
        template += `${varName}=${config.default}\n`;
      } else {
        template += `${varName}=\n`;
      }
      template += '\n';
    }
  }

  return template;
}

// Check for .env file and create if missing
export function ensureEnvFile() {
  const envPath = join(process.cwd(), '.env');
  const examplePath = join(process.cwd(), '.env.example');

  if (!existsSync(envPath)) {
    console.log('⚠️  No .env file found');

    if (existsSync(examplePath)) {
      console.log('📄 Found .env.example - please copy it to .env and configure');
      console.log('   Command: cp .env.example .env');
    } else {
      console.log('📝 Creating .env.example template...');
      const template = generateEnvTemplate();
      try {
        writeFileSync(examplePath, template);
        fs.writeFileSync(examplePath, template);
        console.log('✅ Created .env.example - copy to .env and configure');
      } catch (error) {
        console.error('❌ Failed to create .env.example:', error.message);
      }
    }
    return false;
  }
  return true;
}

// Export environment info for debugging
export function getEnvironmentInfo() {
  return {
    nodeVersion: process.version,
    platform: process.platform,
    environment: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isVercel: process.env.VERCEL === '1',
    hasDatabase: !!(process.env.POSTGRES_URL || process.env.SUPABASE_URL || process.env.MONGODB_URI),
    configuredServices: {
      stripe: !!process.env.STRIPE_SECRET_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      printful: !!process.env.PRINTFUL_API_KEY,
      smtp: !!process.env.SMTP_HOST,
      canva: !!process.env.CANVA_API_KEY,
      shopify: !!process.env.SHOPIFY_API_KEY,
      etsy: !!process.env.ETSY_API_KEY,
    },
  };
}

export default {
  validateEnvironment,
  generateEnvTemplate,
  ensureEnvFile,
  getEnvironmentInfo,
  ENV_VARIABLES,
};
