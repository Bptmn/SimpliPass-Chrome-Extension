#!/usr/bin/env node

/**
 * Environment Variables Validation Script
 * 
 * Validates that all required environment variables are set.
 * This script can be run before building or starting the application.
 */

const fs = require('fs');
const path = require('path');

// Required environment variables
const REQUIRED_VARS = {
  // Firebase Configuration
  VITE_FIREBASE_API_KEY: 'Firebase API Key',
  VITE_FIREBASE_AUTH_DOMAIN: 'Firebase Auth Domain',
  VITE_FIREBASE_PROJECT_ID: 'Firebase Project ID',
  VITE_FIREBASE_STORAGE_BUCKET: 'Firebase Storage Bucket',
  VITE_FIREBASE_MESSAGING_SENDER_ID: 'Firebase Messaging Sender ID',
  VITE_FIREBASE_APP_ID: 'Firebase App ID',
  
  // AWS Cognito Configuration
  VITE_COGNITO_USER_POOL_ID: 'AWS Cognito User Pool ID',
  VITE_COGNITO_CLIENT_ID: 'AWS Cognito Client ID',
  VITE_COGNITO_REGION: 'AWS Cognito Region',
};

// Optional environment variables (for tests)
const OPTIONAL_VARS = {
  TEST_USER_EMAIL: 'Test User Email (for E2E tests)',
  TEST_USER_PASSWORD: 'Test User Password (for E2E tests)',
  TEST_MFA_USER_EMAIL: 'MFA Test User Email (for E2E tests)',
  TEST_MFA_USER_PASSWORD: 'MFA Test User Password (for E2E tests)',
  TEST_MFA_CODE: 'MFA Test Code (for E2E tests)',
  HEADLESS: 'Headless mode for tests',
  SLOWMO: 'Slow motion for tests',
};

// Load .env file if it exists
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        // Remove quotes if present
        const cleanValue = value.replace(/^["']|["']$/g, '');
        process.env[key.trim()] = cleanValue;
      }
    }
  });
}

// Validate environment variables
function validateEnv() {
  const missing = [];
  const warnings = [];
  
  // Check required variables
  for (const [key, description] of Object.entries(REQUIRED_VARS)) {
    const value = process.env[key];
    if (!value || value === '' || value.startsWith('your-')) {
      missing.push({ key, description });
    }
  }
  
  // Check optional variables (warnings only)
  for (const [key, description] of Object.entries(OPTIONAL_VARS)) {
    const value = process.env[key];
    if (!value || value === '') {
      warnings.push({ key, description });
    }
  }
  
  // Print results
  if (missing.length > 0) {
    console.error('\n❌ Missing or invalid required environment variables:\n');
    missing.forEach(({ key, description }) => {
      console.error(`  - ${key}: ${description}`);
    });
    console.error('\n💡 Copy documentation/setup/env.exemple to .env and fill in your values.\n');
    process.exit(1);
  }
  
  if (warnings.length > 0) {
    console.warn('\n⚠️  Optional environment variables not set (may affect tests):\n');
    warnings.forEach(({ key, description }) => {
      console.warn(`  - ${key}: ${description}`);
    });
    console.warn('');
  }
  
  console.log('✅ All required environment variables are set!\n');
  return true;
}

// Run validation
if (require.main === module) {
  validateEnv();
}

module.exports = { validateEnv, REQUIRED_VARS, OPTIONAL_VARS };
