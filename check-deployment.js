#!/usr/bin/env node

/**
 * Pre-deployment check script
 * Validates that the app is ready for deployment
 */

import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Running pre-deployment checks...\n');

let hasErrors = false;
let hasWarnings = false;

// Check 1: Environment file
console.log('1️⃣  Checking environment configuration...');
const envLocalPath = join(__dirname, '.env.local');
const envExamplePath = join(__dirname, '.env.example');

if (!existsSync(envLocalPath)) {
    console.log('   ⚠️  WARNING: .env.local not found');
    console.log('   💡 Copy .env.example to .env.local and add your GEMINI_API_KEY');
    hasWarnings = true;
} else {
    const envContent = readFileSync(envLocalPath, 'utf-8');
    if (!envContent.includes('GEMINI_API_KEY') || envContent.includes('your_api_key_here')) {
        console.log('   ⚠️  WARNING: GEMINI_API_KEY not configured in .env.local');
        hasWarnings = true;
    } else {
        console.log('   ✅ Environment file configured');
    }
}

// Check 2: Required files
console.log('\n2️⃣  Checking required files...');
const requiredFiles = [
    'package.json',
    'vite.config.ts',
    'tsconfig.json',
    'index.html',
    'index.tsx',
    'App.tsx'
];

for (const file of requiredFiles) {
    if (!existsSync(join(__dirname, file))) {
        console.log(`   ❌ ERROR: Missing required file: ${file}`);
        hasErrors = true;
    }
}

if (!hasErrors) {
    console.log('   ✅ All required files present');
}

// Check 3: Deployment configs
console.log('\n3️⃣  Checking deployment configurations...');
const deploymentConfigs = [
    { file: 'vercel.json', platform: 'Vercel' },
    { file: 'netlify.toml', platform: 'Netlify' }
];

for (const config of deploymentConfigs) {
    if (existsSync(join(__dirname, config.file))) {
        console.log(`   ✅ ${config.platform} config found`);
    }
}

// Check 4: Package.json scripts
console.log('\n4️⃣  Checking build scripts...');
const packageJson = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf-8'));

if (!packageJson.scripts) {
    console.log('   ❌ ERROR: No scripts found in package.json');
    hasErrors = true;
} else {
    const requiredScripts = ['dev', 'build', 'preview'];
    for (const script of requiredScripts) {
        if (!packageJson.scripts[script]) {
            console.log(`   ❌ ERROR: Missing script: ${script}`);
            hasErrors = true;
        }
    }

    if (!hasErrors) {
        console.log('   ✅ All build scripts configured');
    }
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
    console.log('❌ Pre-deployment check FAILED');
    console.log('   Please fix the errors above before deploying.');
    process.exit(1);
} else if (hasWarnings) {
    console.log('⚠️  Pre-deployment check completed with WARNINGS');
    console.log('   Review warnings above. You can still deploy, but may need to configure environment variables on your hosting platform.');
    process.exit(0);
} else {
    console.log('✅ Pre-deployment check PASSED');
    console.log('   Your app is ready to deploy!');
    console.log('\n📚 Next steps:');
    console.log('   1. Run "npm install" to install dependencies');
    console.log('   2. Run "npm run build" to test the build');
    console.log('   3. Run "npm run preview" to preview the production build');
    console.log('   4. See DEPLOYMENT.md for deployment instructions');
    process.exit(0);
}
