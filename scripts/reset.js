#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { createReadStream } from 'fs';
import readline from 'readline';

// Load environment variables
const envPath = '.env';
let supabaseUrl, supabaseAnonKey;

try {
  const envContent = readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  
  for (const line of envLines) {
    if (line.startsWith('VITE_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1];
    }
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
      supabaseAnonKey = line.split('=')[1];
    }
  }
} catch (error) {
  console.log('❌ Could not read .env file. Please run "npm run setup" first.');
  process.exit(1);
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ Supabase credentials not configured. Please update your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Confirmation prompt
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚨 WARNING: This will DELETE ALL DATA from your database!');
console.log('This action cannot be undone.');
console.log('');

rl.question('Are you sure you want to reset the database? (type "RESET" to confirm): ', async (answer) => {
  if (answer !== 'RESET') {
    console.log('❌ Reset cancelled.');
    rl.close();
    process.exit(0);
  }

  console.log('\n🗑️  Resetting database...');

  try {
    // Delete in correct order to avoid foreign key constraints
    console.log('Deleting order items...');
    await supabase.from('order_items').delete().neq('id', '');

    console.log('Deleting orders...');
    await supabase.from('orders').delete().neq('id', '');

    console.log('Deleting products...');
    await supabase.from('products').delete().neq('id', '');

    console.log('Deleting categories...');
    await supabase.from('categories').delete().neq('id', '');

    console.log('✅ All data deleted successfully');
    console.log('\n🌱 Reseeding database...');

    // Import and run seed script
    const seedModule = await import('./seed.js');
    
    console.log('\n🎉 Database reset and reseeded successfully!');
    
  } catch (error) {
    console.error('❌ Reset failed:', error);
  }

  rl.close();
});