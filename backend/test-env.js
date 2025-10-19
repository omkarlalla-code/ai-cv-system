require('dotenv').config();

console.log('🚀 CVSite Environment Test');
console.log('=====================================');
console.log('Node.js version:', process.version);
console.log('Current directory:', process.cwd());
console.log('');

console.log('Environment Variables:');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('- PORT:', process.env.PORT || '3000');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? '✅ Loaded' : '❌ Missing');
console.log('- CLAUDE_API_KEY:', process.env.CLAUDE_API_KEY ? '✅ Loaded' : '❌ Missing (add your key)');
console.log('- DB_HOST:', process.env.DB_HOST || 'localhost');
console.log('- DB_NAME:', process.env.DB_NAME || 'bettercv_db');
console.log('- DB_USER:', process.env.DB_USER || 'bettercv_user');
console.log('- DB_PASSWORD:', process.env.DB_PASSWORD ? '✅ Set' : '❌ Missing');
console.log('');

console.log('Dependencies Check:');
try {
    require('express');
    console.log('- Express: ✅ Installed');
} catch (e) {
    console.log('- Express: ❌ Missing');
}

try {
    require('pg');
    console.log('- PostgreSQL (pg): ✅ Installed');
} catch (e) {
    console.log('- PostgreSQL (pg): ❌ Missing');
}

try {
    require('jsonwebtoken');
    console.log('- JWT: ✅ Installed');
} catch (e) {
    console.log('- JWT: ❌ Missing');
}

try {
    require('bcryptjs');
    console.log('- Bcrypt: ✅ Installed');
} catch (e) {
    console.log('- Bcrypt: ❌ Missing');
}

console.log('');
console.log('Directory Structure:');
const fs = require('fs');
const path = require('path');

const checkDir = (dirPath, name) => {
    if (fs.existsSync(dirPath)) {
        console.log(`- ${name}: ✅ Exists`);
    } else {
        console.log(`- ${name}: ❌ Missing`);
    }
};

checkDir('./uploads', 'uploads/');
checkDir('./uploads/cvs', 'uploads/cvs/');
checkDir('./routes', 'routes/');
checkDir('./services', 'services/');
checkDir('./middleware', 'middleware/');
checkDir('../frontend', 'frontend/');

console.log('');
console.log('Environment setup complete! 🎉');
console.log('Next steps:');
console.log('1. Add your Claude API key to .env file');
console.log('2. Set up PostgreSQL database');
console.log('3. Run: npm start');
