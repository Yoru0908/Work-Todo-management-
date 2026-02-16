// Script to create test user
// Run: npx tsx e2e/tests/init-user.ts

import { drizzle } from 'drizzle-orm/d1';
import { users } from '../src/schema';
import * as bcrypt from 'bcryptjs';

async function main() {
  // This is a placeholder - in real test, use wrangler to get the D1 database
  console.log('To create test user, run this SQL in your D1 database:');
  console.log(`
-- Create admin user (password: admin123)
INSERT INTO users (username, display_name, password_hash, role)
VALUES ('admin', 'Administrator', '${await bcrypt.hash('admin123', 10)}', 'admin');
  `);
}

main().catch(console.error);
