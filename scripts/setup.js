#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🚀 Setting up 3D E-Commerce Cameroon...\n');

// Check if .env exists
const envPath = '.env';
const envExamplePath = '.env.example';

if (!existsSync(envPath)) {
  if (existsSync(envExamplePath)) {
    const envExample = readFileSync(envExamplePath, 'utf8');
    writeFileSync(envPath, envExample);
    console.log('✅ Created .env file from .env.example');
    console.log('⚠️  Please update .env with your Supabase credentials before continuing.\n');
  } else {
    console.log('❌ .env.example not found. Please create your .env file manually.\n');
    process.exit(1);
  }
}

// Check for required environment variables
try {
  const envContent = readFileSync(envPath, 'utf8');
  const hasSupabaseUrl = envContent.includes('VITE_SUPABASE_URL=') && !envContent.includes('your_supabase_project_url_here');
  const hasSupabaseKey = envContent.includes('VITE_SUPABASE_ANON_KEY=') && !envContent.includes('your_supabase_anon_key_here');

  if (!hasSupabaseUrl || !hasSupabaseKey) {
    console.log('⚠️  Environment variables not configured properly.');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Go to https://supabase.com and create a free account');
    console.log('2. Create a new project');
    console.log('3. Go to Settings → API');
    console.log('4. Copy your Project URL and anon public key');
    console.log('5. Update the .env file with these values');
    console.log('6. Run "npm run setup" again');
    console.log('');
    process.exit(0);
  }
} catch (error) {
  console.log('❌ Could not read .env file:', error.message);
  process.exit(1);
}

console.log('✅ Environment configuration looks good!');
console.log('');
console.log('🗄️  Next: Set up your Supabase database');
console.log('');
console.log('📋 Database setup steps:');
console.log('1. Go to your Supabase project dashboard');
console.log('2. Navigate to the SQL Editor');
console.log('3. Copy and paste the schema from /supabase/schema.sql');
console.log('4. Run the SQL to create tables and policies');
console.log('5. Run "npm run seed" to add demo data');
console.log('');
console.log('🎉 Then run "npm run dev" to start the application!');