// Environment Configuration Checker for Production Debugging
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

console.log('=== ENVIRONMENT CONFIGURATION CHECK ===\n');

// Check NODE_ENV
console.log('NODE_ENV:', process.env.NODE_ENV);

// Try to load .env.production if in production
if (process.env.NODE_ENV === 'production') {
  const prodEnvPath = path.join(__dirname, '.env.production');
  if (fs.existsSync(prodEnvPath)) {
    console.log('✅ Found .env.production file');
    dotenv.config({ path: prodEnvPath });
  } else {
    console.log('⚠️  .env.production file not found');
  }
} else {
  // Load regular .env for development
  dotenv.config();
}

// Check critical environment variables
const criticalVars = [
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET',
  'BASE_URL',
  'FRONTEND_URL',
  'MIDTRANS_SERVER_KEY',
  'MIDTRANS_CLIENT_KEY',
  'PUPPETEER_EXECUTABLE_PATH'
];

console.log('\n=== CRITICAL ENVIRONMENT VARIABLES ===');
criticalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Mask sensitive values
    const masked = varName.includes('PASSWORD') || varName.includes('SECRET') || varName.includes('KEY')
      ? '***' + value.slice(-4)
      : value;
    console.log(`✅ ${varName}: ${masked}`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
  }
});

// Check database connectivity
console.log('\n=== DATABASE CONNECTION TEST ===');
const mysql = require('mysql2/promise');

async function testDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Database connection successful');
    
    // Check tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`✅ Found ${tables.length} tables in database`);
    
    // Check store verification status
    const [stores] = await connection.execute('SELECT id, name, is_verified FROM stores');
    console.log(`\n=== STORE VERIFICATION STATUS ===`);
    stores.forEach(store => {
      console.log(`Store ${store.id}: ${store.name} - is_verified: ${store.is_verified}`);
    });
    
    await connection.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

testDatabase().then(() => {
  console.log('\n=== CHECK COMPLETE ===');
  process.exit(0);
}).catch(error => {
  console.error('Check failed:', error);
  process.exit(1);
});
