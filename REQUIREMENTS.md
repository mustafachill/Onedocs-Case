# 📋 OneDocs Bot System - Requirements & Setup

**Version**: 1.0.0  
**Last Updated**: Ocak 2025  
**Minimum Setup Time**: 15-30 dakika

## 🎯 Quick Start

```bash
# Clone the project
git clone <repository-url>
cd onedocs-bot-system

# Install dependencies and setup environment
npm install
npm run setup

# Start development
npm run dev
```

---

## 🖥️ System Requirements

### **Minimum Requirements**

| Component | Version | Required | Notes |
|-----------|---------|----------|--------|
| **Node.js** | 18.0.0+ | ✅ | LTS version recommended |
| **NPM** | 8.0.0+ | ✅ | Package manager |
| **MongoDB** | 6.0+ | ✅ | Database server |
| **Git** | 2.0+ | ✅ | Version control |

### **Recommended System Specs**

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| **RAM** | 4GB | 8GB+ |
| **Storage** | 2GB free | 5GB+ free |
| **CPU** | 2 cores | 4+ cores |
| **OS** | Windows 10, macOS 10.15, Ubuntu 18.04 | Latest versions |

---

## 📦 Dependencies

### **Production Dependencies**

```json
{
  "axios": "^1.10.0",           // HTTP client for external APIs
  "bcrypt": "^6.0.0",           // Password hashing
  "botbuilder": "^4.17.0",      // Microsoft Teams Bot Framework
  "connect-flash": "^0.1.1",    // Flash messages
  "connect-mongo": "^5.1.0",    // MongoDB session store
  "dotenv": "^17.2.0",          // Environment variables
  "ejs": "^3.1.10",             // Template engine
  "express": "^5.1.0",          // Web framework
  "express-fileupload": "^1.5.2", // File upload handling
  "express-session": "^1.18.2", // Session management
  "express-validator": "^7.2.1", // Input validation
  "method-override": "^3.0.0",  // HTTP method override
  "moment": "^2.30.1",          // Date manipulation
  "mongoose": "^8.16.4",        // MongoDB ODM
  "node-cron": "^4.2.1",        // Scheduled jobs
  "nodemailer": "^7.0.5",       // Email sending
  "sanitize-html": "^2.17.0",   // XSS protection
  "slugify": "^1.6.6"           // URL slug generation
}
```

### **Development Dependencies**

```json
{
  "nodemon": "^3.1.10"          // Development auto-restart
}
```

---

## 🔧 Installation Guide

### **1. Install System Requirements**

#### **Windows:**
```powershell
# Install Node.js (https://nodejs.org/)
# Install MongoDB (https://www.mongodb.com/try/download/community)
# Install Git (https://git-scm.com/)

# Verify installations
node --version
npm --version
mongod --version
git --version
```

#### **macOS:**
```bash
# Using Homebrew
brew install node
brew install mongodb-community
brew install git

# Verify installations
node --version
npm --version
mongod --version
git --version
```

#### **Ubuntu/Linux:**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install Git
sudo apt-get install git

# Verify installations
node --version
npm --version
mongod --version
git --version
```

### **2. Project Setup**

```bash
# Clone repository
git clone <your-repo-url>
cd onedocs-bot-system

# Install dependencies and run comprehensive setup
npm run setup
```

### **3. Environment Configuration**

The setup script creates a `.env` file. **You MUST update these values:**

```bash
# Required Updates:
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
SLACK_SIGNING_SECRET=your-slack-signing-secret
MICROSOFT_APP_ID=your-teams-app-id
MICROSOFT_APP_PASSWORD=your-teams-app-password
SESSION_SECRET=your-unique-session-secret
```

### **4. Database Setup**

```bash
# Start MongoDB
mongod

# Seed database with test data
npm run seed
```

### **5. Start Development**

```bash
# Development mode (auto-restart)
npm run dev

# Production mode
npm run prod

# Health check
node scripts/health-check.js
```

---

## 🚀 Platform Setup Guides

### **Slack Bot Setup**

1. **Create Slack App**: https://api.slack.com/apps
2. **Enable Features**:
   - Slash Commands: `/gorevlerim`, `/hatirlatmalarim`, `/belge`, `/yardim`
   - Interactive Components: Enable
   - Bot Token Scopes: `chat:write`, `commands`, `users:read`
3. **Set Webhook URLs**:
   - Slash Commands: `https://your-domain.com/api/integrations/slack/commands`
   - Interactive Components: `https://your-domain.com/api/integrations/slack/interactive`
4. **Install to Workspace**

### **Microsoft Teams Bot Setup**

1. **Register Bot**: https://dev.botframework.com/
2. **Create Teams App**:
   - App Studio or Developer Portal
   - Bot configuration
   - Manifest upload
3. **Set Webhook URL**: `https://your-domain.com/api/integrations/teams/messages`
4. **Deploy to Teams**

---

## 🔒 Security Configuration

### **Production Security Checklist**

```bash
# Environment variables
✅ SESSION_SECRET - Strong random string
✅ BCRYPT_ROUNDS - Set to 12+ for production
✅ API_KEYS - Generate secure random keys
✅ JWT_SECRET - Unique secret for token signing

# Database security
✅ MongoDB authentication enabled
✅ Database connection with credentials
✅ Network access restrictions

# Application security
✅ HTTPS enabled (NODE_ENV=production)
✅ Rate limiting configured
✅ Input validation on all endpoints
✅ CORS policy set
```

### **Development vs Production**

| Setting | Development | Production |
|---------|-------------|------------|
| `NODE_ENV` | development | production |
| `SESSION_SECRET` | default | strong random |
| `SLACK_AUTH` | bypassed | enabled |
| `RATE_LIMITING` | disabled | enabled |
| `LOGGING_LEVEL` | debug | error |
| `HTTPS` | false | true |

---

## 📊 Performance Requirements

### **Database Indexes**

```javascript
// Required MongoDB indexes
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "username": 1 }, { unique: true })
db.users.createIndex({ "platformIds.slack": 1 })
db.users.createIndex({ "platformIds.teams": 1 })
db.tasks.createIndex({ "userIds": 1, "status": 1, "dueDate": 1 })
db.documents.createIndex({ "userIds": 1, "dueDate": 1 })
db.documents.createIndex({ "documentId": 1 }, { unique: true })
```

### **Load Testing**

```bash
# Install load testing tools
npm install -g autocannon

# Test API endpoints
autocannon -c 10 -d 30 http://localhost:3000/api/v1/tasks
autocannon -c 5 -d 30 http://localhost:3000/api/integrations/slack/commands
```

---

## 🐛 Troubleshooting

### **Common Issues**

| Problem | Solution |
|---------|----------|
| **MongoDB connection failed** | Start MongoDB: `mongod` |
| **Port 3000 already in use** | Change PORT in .env or kill process |
| **npm install fails** | Clear cache: `npm cache clean --force` |
| **Slack commands not working** | Check webhook URLs and ngrok |
| **Email sending fails** | Verify SMTP credentials |
| **Session errors** | Clear browser data and restart |

### **Debug Commands**

```bash
# Check system health
node scripts/health-check.js

# Test database connection
node -e "require('mongoose').connect('mongodb://localhost:27017/onedoccase').then(() => console.log('✅ DB OK')).catch(console.error)"

# Test email configuration
node -e "require('./utils/emailService').sendTaskAssignmentEmail({name:'Test',email:'test@example.com'},{title:'Test Task',dueDate:new Date()})"

# Check environment variables
node -e "require('dotenv').config(); console.log(Object.keys(process.env).filter(k => k.includes('SLACK') || k.includes('TEAMS') || k.includes('SMTP')))"
```

---

## 📚 Development Workflow

### **Daily Development**

```bash
# 1. Start MongoDB
mongod

# 2. Start development server
npm run dev

# 3. Run tests (when available)
npm test

# 4. Check health periodically
node scripts/health-check.js
```

### **Before Deployment**

```bash
# 1. Update environment for production
cp .env .env.production
# Edit .env.production with production values

# 2. Run health check
NODE_ENV=production node scripts/health-check.js

# 3. Test production build
NODE_ENV=production npm run prod
```

---

## 🆘 Support & Resources

### **Documentation**
- **API Documentation**: `API_DOCUMENTATION.md`
- **Code Architecture**: See `/docs` folder after setup
- **Environment Variables**: `.env` file comments

### **External Resources**
- **Slack API**: https://api.slack.com/
- **Teams Bot Framework**: https://dev.botframework.com/
- **MongoDB Documentation**: https://docs.mongodb.com/
- **Express.js Guide**: https://expressjs.com/

### **Help Commands**

```bash
# Setup help
npm run setup

# List all available scripts
npm run

# Project information
npm info

# Dependency audit
npm audit
```

---

**✨ Ready to build amazing chatbot experiences!**

For additional support, check the documentation or create an issue in the repository. 