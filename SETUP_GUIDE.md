# ⚡ OneDocs Bot - Quick Setup Guide

**Total Time**: 5-10 dakika

---

## 🚀 **Hızlı Başlangıç**

```bash
# 1. Otomatik setup çalıştır (dependencies dahil)
npm run setup

# 2. MongoDB'yi başlat (ayrı terminal)
mongod

# 3. Test verisi ekle
npm run seed

# 4. Development başlat
npm run dev
```

**Hazır! http://localhost:3000**

---

## ⚙️ **Gerekli Program Kurulumları**

### Windows:
```powershell
# Node.js - https://nodejs.org/
# MongoDB - https://www.mongodb.com/try/download/community
# Git - https://git-scm.com/
```

### macOS:
```bash
brew install node mongodb-community git
```

### Linux:
```bash
sudo apt install nodejs npm mongodb git
```

---

## 🔧 **Environment (.env) Düzenle**

Setup sonrası `.env` dosyasını aç ve güncelle:

```env
# Email için (Gmail App Password gerekli)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password

# Slack Bot için (api.slack.com/apps)
SLACK_BOT_TOKEN=xoxb-your-slack-token
SLACK_SIGNING_SECRET=your-slack-secret

# Teams Bot için (dev.botframework.com)
MICROSOFT_APP_ID=your-teams-app-id
MICROSOFT_APP_PASSWORD=your-teams-password

# Session güvenliği için (random string)
SESSION_SECRET=your-unique-session-secret-key-123
```

**🔐 Gmail App Password Alma:**
1. Google Hesap → Güvenlik → 2 Adımlı Doğrulama
2. Uygulama şifreleri → Mail → 16 karakterlik şifre al
3. Bu şifreyi `SMTP_PASS`'e koy

---

## 📱 **Platform Setup**

### Slack Bot:
1. https://api.slack.com/apps → Create New App
2. Slash Commands ekle: `/gorevlerim`, `/hatirlatmalarim`, `/belge`, `/yardim`
3. Bot Token Scopes: `chat:write`, `commands`, `users:read`
4. Webhook URL: `https://your-domain.com/api/integrations/slack/commands`

### Teams Bot:
1. https://dev.botframework.com/ → Create Bot
2. Teams App Studio'da manifest oluştur
3. Webhook URL: `https://your-domain.com/api/integrations/teams/messages`

---

## 🛠️ **Yararlı Komutlar**

```bash
# Development
npm run dev              # Server başlat
npm run seed            # Test verisi ekle
npm run setup           # Setup'ı tekrar çalıştır

# Production
npm run prod            # Production server

# Debug
node scripts/health-check.js    # Sistem kontrolü
mongod --version               # MongoDB kontrolü
node --version                # Node kontrolü
```

---

## 🚨 **Hızlı Problem Çözme**

| Problem | Çözüm |
|---------|-------|
| MongoDB bağlanamıyor | `mongod` komutunu çalıştır |
| Port 3000 kullanımda | `.env`'de PORT değiştir |
| npm install hata | `npm cache clean --force` |
| Slack komutları çalışmıyor | Webhook URL'leri kontrol et |

---

## ✅ **Test Et**

1. http://localhost:3000 - Web chat çalışıyor mu?
2. Slack'te `/gorevlerim` - Slash command çalışıyor mu?
3. Email gönderimi test et
4. `node scripts/health-check.js` - Herşey OK mi?

---

**🎉 Tamamlandı! Chatbot hazır kullanıma!** 