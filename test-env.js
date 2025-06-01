// Test environment variable loading
import fs from "fs";
import path from "path";

console.log('🧪 Testing .env file loading...\n');

// Manually load .env file to avoid CommonJS/ESM issues
try {
  const envPath = path.join(process.cwd(), '.env');
  console.log('Looking for .env file at:', envPath);
  
  if (fs.existsSync(envPath)) {
    console.log('✅ .env file exists');
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('📄 .env file content:');
    console.log(envContent);
    
    console.log('\n🔧 Processing environment variables...');
    envContent.split('\n').forEach((line, index) => {
      const trimmedLine = line.trim();
      console.log(`Line ${index + 1}: "${trimmedLine}"`);
      
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          process.env[key.trim()] = value;
          console.log(`  ✅ Set ${key.trim()} = ${value.substring(0, 10)}...`);
        }
      }
    });
  } else {
    console.log('❌ .env file does not exist');
  }
} catch (error) {
  console.warn('❌ Error loading .env file:', error);
}

// Check environment variables
console.log('\n🔍 Environment variables after loading:');
console.log('GITHUB_TOKEN:', process.env.GITHUB_TOKEN ? 'Set (length: ' + process.env.GITHUB_TOKEN.length + ')' : 'Not set');
console.log('GITHUB_OWNER:', process.env.GITHUB_OWNER || 'Not set');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');
console.log('PORT:', process.env.PORT || 'Not set');
