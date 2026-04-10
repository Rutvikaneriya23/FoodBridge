// Quick Google OAuth Configuration Check
import dotenv from 'dotenv';
dotenv.config();

console.log('\n========================================');
console.log('🔍 Google OAuth Configuration Check');
console.log('========================================\n');

console.log('✅ Backend Configuration:');
console.log('   GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✓ Set' : '✗ NOT SET');
console.log('   Client ID:', process.env.GOOGLE_CLIENT_ID);

console.log('\n📋 Next Steps in Google Cloud Console:');
console.log('   1. Go to: https://console.cloud.google.com/apis/credentials');
console.log('   2. Click your OAuth 2.0 Client ID');
console.log('   3. Under "Authorized JavaScript origins", ADD:');
console.log('      → http://localhost:3000');
console.log('      → http://localhost:5000');
console.log('   4. Under "Authorized redirect URIs", ADD:');
console.log('      → http://localhost:3000');
console.log('      → http://localhost:3000/login');
console.log('   5. Click SAVE');
console.log('   6. Wait 5 minutes for changes to take effect');

console.log('\n========================================\n');
