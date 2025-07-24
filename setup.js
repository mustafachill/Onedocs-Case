#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 OneDocs Bot System Setup Started...\n');

// ANSI colors for better output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkRequirement(name, command, minVersion = null) {
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    const version = output.trim();
    log(`✅ ${name}: ${version}`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${name}: Not found or not working`, 'red');
    return false;
  }
}

// 1. Check System Requirements
log('🔍 Checking System Requirements...', 'bold');
log('==========================================', 'cyan');

const requirements = [
  ['Node.js', 'node --version'],
  ['NPM', 'npm --version'],
  ['MongoDB', 'mongod --version'],
  ['Git', 'git --version']
];

let allReqsMet = true;
requirements.forEach(([name, command]) => {
  if (!checkRequirement(name, command)) {
    allReqsMet = false;
  }
});

if (!allReqsMet) {
  log('\n❌ Some system requirements are missing!', 'red');
  log('📋 Please install the missing components:', 'yellow');
  log('   • Node.js 18+: https://nodejs.org/', 'yellow');
  log('   • MongoDB 6+: https://mongodb.com/download', 'yellow');
  log('   • Git: https://git-scm.com/', 'yellow');
  process.exit(1);
}

// 1.5. Install NPM Dependencies
log('\n📦 Installing NPM Dependencies...', 'bold');
log('===================================', 'cyan');

try {
  log('⏳ Running npm install...', 'yellow');
  execSync('npm install', { 
    stdio: ['inherit', 'pipe', 'pipe'],
    encoding: 'utf8'
  });
  log('✅ Dependencies installed successfully', 'green');
} catch (error) {
  log('❌ npm install failed:', 'red');
  log(error.message, 'red');
  log('💡 Try running "npm cache clean --force" and try again', 'yellow');
  process.exit(1);
}

// 2. Create Environment Configuration
log('\n🔧 Setting up Environment Configuration...', 'bold');
log('==============================================', 'cyan');

const envTemplate = `# OneDocs Bot System Environment Configuration
# Database
MONGODB_URI=mongodb://localhost:27017/onedoccase
REDIS_URL=redis://localhost:6379

# Application
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000

# Session Security
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# API Authentication
API_KEYS=dev-internal-key-123,web-client-key-456,prod-internal-key-789

# Email Service (SMTP Configuration)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Slack Integration
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
SLACK_SIGNING_SECRET=your-slack-signing-secret
SLACK_APP_TOKEN=xapp-your-slack-app-token

# Microsoft Teams Integration
MICROSOFT_APP_ID=your-teams-app-id
MICROSOFT_APP_PASSWORD=your-teams-app-password
MICROSOFT_APP_TENANT_ID=your-tenant-id

# Cron Jobs
ENABLE_CRON_JOBS=true
REMINDER_CRON_SCHEDULE=0 8 * * *

# Security
BCRYPT_ROUNDS=10
JWT_SECRET=your-jwt-secret-key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Features
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_SLACK_INTEGRATION=true
ENABLE_TEAMS_INTEGRATION=true
ENABLE_WEB_CHAT=true
`;

if (!fs.existsSync('.env')) {
  fs.writeFileSync('.env', envTemplate);
  log('✅ Created .env file with default configuration', 'green');
  log('⚠️  Please update .env file with your actual values!', 'yellow');
} else {
  log('⚠️  .env file already exists, skipping...', 'yellow');
}

// 3. Create Required Directories
log('\n📁 Creating Required Directories...', 'bold');
log('=====================================', 'cyan');

const requiredDirs = [
  'logs',
  'uploads',
  'temp',
  'public/uploads',
  'views/partials',
  'tests',
  'docs'
];

requiredDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    log(`✅ Created directory: ${dir}`, 'green');
  } else {
    log(`⚠️  Directory already exists: ${dir}`, 'yellow');
  }
});

// 4. Create Missing View Templates
log('\n🎨 Creating Missing View Templates...', 'bold');
log('======================================', 'cyan');

const viewTemplates = {
  'views/gorevlerim.ejs': `<!DOCTYPE html>
<html>
<head>
    <title>Görevlerim - OneDocs</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <h1>📋 Görevlerim</h1>
    <% if (tasks && tasks.length > 0) { %>
        <ul class="task-list">
            <% tasks.forEach(task => { %>
                <li class="task-item">
                    <h3><%= task.title %></h3>
                    <p>Son Tarih: <%= task.dueDate.toLocaleDateString('tr-TR') %></p>
                    <span class="status <%= task.status %>"><%= task.status %></span>
                </li>
            <% }); %>
        </ul>
    <% } else { %>
        <p>Henüz görev bulunmuyor.</p>
    <% } %>
    <a href="/">← Ana Sayfa</a>
</body>
</html>`,

  'views/hatirlatmalarim.ejs': `<!DOCTYPE html>
<html>
<head>
    <title>Hatırlatmalarım - OneDocs</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <h1>⏰ Hatırlatmalarım</h1>
    <% if (tasks && tasks.length > 0) { %>
        <ul class="reminder-list">
            <% tasks.forEach(task => { %>
                <li class="reminder-item urgent">
                    <h3>⚠️ <%= task.title %></h3>
                    <p>Son Tarih: <%= task.dueDate.toLocaleDateString('tr-TR') %></p>
                </li>
            <% }); %>
        </ul>
    <% } else { %>
        <p>Yaklaşan görev bulunmuyor.</p>
    <% } %>
    <a href="/">← Ana Sayya</a>
</body>
</html>`,

  'views/belge.ejs': `<!DOCTYPE html>
<html>
<head>
    <title><%= document.title %> - OneDocs</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <h1>📄 <%= document.title %></h1>
    <div class="document-details">
        <p><strong>Belge ID:</strong> <%= document.documentId %></p>
        <p><strong>Kategori:</strong> <%= document.category %></p>
        <% if (document.description) { %>
            <p><strong>Açıklama:</strong> <%= document.description %></p>
        <% } %>
        <% if (document.dueDate) { %>
            <p><strong>Son Tarih:</strong> <%= document.dueDate.toLocaleDateString('tr-TR') %></p>
        <% } %>
        <% if (document.fileUrl) { %>
            <p><a href="<%= document.fileUrl %>" target="_blank">📎 Dosyayı Görüntüle</a></p>
        <% } %>
    </div>
    <a href="/">← Ana Sayfa</a>
</body>
</html>`
};

Object.entries(viewTemplates).forEach(([filePath, content]) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    log(`✅ Created view template: ${filePath}`, 'green');
  } else {
    log(`⚠️  View template already exists: ${filePath}`, 'yellow');
  }
});

// 5. Database Connection Test
log('\n🗄️  Testing Database Connection...', 'bold');
log('===================================', 'cyan');

try {
  const mongoose = require('mongoose');
  mongoose.connect('mongodb://localhost:27017/onedoccase', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
  }).then(() => {
    log('✅ MongoDB connection successful', 'green');
    mongoose.disconnect();
  }).catch((err) => {
    log(`❌ MongoDB connection failed: ${err.message}`, 'red');
    log('💡 Make sure MongoDB is running: mongod', 'yellow');
  });
} catch (error) {
  log(`❌ MongoDB test failed: ${error.message}`, 'red');
}

// 6. Create Development Scripts
log('\n📝 Creating Development Scripts...', 'bold');
log('==================================', 'cyan');

const devScripts = {
  'scripts/dev-start.js': `// Development startup script
require('dotenv').config();
const { execSync } = require('child_process');

console.log('🚀 Starting OneDocs Bot in Development Mode...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT || 3000);
console.log('Database:', process.env.MONGODB_URI);

// Start the application
execSync('npm run dev', { stdio: 'inherit' });`,

  'scripts/health-check.js': `// Health check script
const mongoose = require('mongoose');
require('dotenv').config();

async function healthCheck() {
  console.log('🏥 OneDocs Bot Health Check...');
  
  try {
    // Database check
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database: Connected');
    mongoose.disconnect();
    
    // Environment check
    const requiredEnvVars = ['MONGODB_URI', 'SESSION_SECRET'];
    const missing = requiredEnvVars.filter(env => !process.env[env]);
    
    if (missing.length === 0) {
      console.log('✅ Environment: All required variables set');
    } else {
      console.log('❌ Environment: Missing variables:', missing.join(', '));
    }
    
    console.log('🎉 Health check completed!');
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    process.exit(1);
  }
}

healthCheck();`
};

Object.entries(devScripts).forEach(([filePath, content]) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    log(`✅ Created script: ${filePath}`, 'green');
  }
});

// 7. Setup Complete
log('\n🎉 Setup Complete!', 'bold');
log('==================', 'cyan');

log('\n📋 Next Steps:', 'bold');
log('1. Update .env file with your actual configuration', 'yellow');
log('2. Start MongoDB: mongod', 'yellow');
log('3. Seed database: npm run seed', 'yellow');
log('4. Start development: npm run dev', 'yellow');
log('5. Health check: node scripts/health-check.js', 'yellow');

log('\n🔗 Useful Commands:', 'bold');
log('• npm run setup         - Run this setup again', 'cyan');
log('• npm run dev           - Start development server', 'cyan');
log('• npm run prod          - Start production server', 'cyan');
log('• npm run seed          - Seed database with test data', 'cyan');
log('• npm run health-check  - Check system health', 'cyan');

log('\n📚 Documentation:', 'bold');
log('• API Documentation: See API_DOCUMENTATION.md', 'cyan');
log('• Environment Setup: Check .env file', 'cyan');
log('• Project Structure: See README.md', 'cyan');

log('\n✨ OneDocs Bot System is ready for development!', 'green'); 