---
title: "OneDocs Bot API Dokümantasyonu"
author: "OneDocs Development Team"
date: "Ocak 2025"
version: "1.0.0"
---

# **OneDocs Bot API Dokümantasyonu**

**v1.0.0** | **Production Environment**  
**Base URL**: `https://onedocs-bot-api.com`  
**Developed by**: OneDocs Development Team  
**Date**: Ocak 2025

---

## 📋 **İçindekiler**

1. [Genel Bakış](#genel-bakış)
2. [Authentication](#authentication)
3. [Error Handling](#error-handling)
4. [Rate Limiting](#rate-limiting)
5. [Internal API Endpoints](#internal-api-endpoints)
6. [Platform Integration Endpoints](#platform-integration-endpoints)
7. [Data Models](#data-models)
8. [Webhook Events](#webhook-events)
9. [Security Considerations](#security-considerations)
10. [Deployment Architecture](#deployment-architecture)

---

## 🔍 **Genel Bakış**

OneDocs Bot API'si, Slack ve Microsoft Teams platformlarına entegre çalışan chatbot sisteminin backend servislerini sağlar. API, doküman yönetimi, görev takibi ve kullanıcı etkileşimlerini destekleyen RESTful endpoint'ler sunar.

### **Temel Özellikler**

| Özellik | Durum | Açıklama |
|---------|-------|----------|
| **Multi-platform Destek** | ✅ | Slack, Teams, Web entegrasyonu |
| **Real-time Webhook Processing** | ✅ | Anında mesaj işleme |
| **Otomatik Email Bildirimleri** | ✅ | Görev/belge atamasında email |
| **Cross-platform User Resolution** | ✅ | Tek kullanıcı, çoklu platform |
| **Validation & Error Handling** | ✅ | Kapsamlı input doğrulama |
| **Production-ready Security** | ✅ | API key, signature verification |

### **Teknik Stack**

| Katman | Teknoloji | Versiyon |
|--------|-----------|----------|
| **Runtime** | Node.js | 18+ |
| **Framework** | Express.js | 5.x |
| **Database** | MongoDB | 6.x |
| **Authentication** | API Key + Platform Signatures | - |
| **Validation** | express-validator | 7.x |
| **Session Store** | connect-mongo + Redis | - |

---

## 🔐 **Authentication**

### **API Key Authentication (Internal APIs)**

Tüm `/api/v1/*` endpoint'leri API key authentication gerektirir.

**Header Requirements:**
```http
X-API-Key: your-api-key-here
Content-Type: application/json
```

**Geçerli API Keys:**

| Environment | API Key | Kullanım Alanı |
|-------------|---------|----------------|
| Development | `dev-internal-key-123` | Local development |
| Web Client | `web-client-key-456` | Frontend client |
| Production | `prod-internal-key-789` | Production services |

### **Platform Authentication (Webhooks)**

#### **Slack Authentication**
```http
X-Slack-Signature: v0=signature
X-Slack-Request-Timestamp: timestamp
Content-Type: application/x-www-form-urlencoded
```

#### **Teams Authentication**
```http
Authorization: Bearer teams-bot-token
Content-Type: application/json
```

### **Session Authentication (Web Interface)**
Web arayüzü session-based authentication kullanır.

---

## 🚫 **Error Handling**

### **Standard Error Response Format**
```json
{
  "success": false,
  "message": "İnsan dostu hata mesajı",
  "errors": [
    {
      "field": "title",
      "message": "Görev başlığı zorunludur"
    }
  ],
  "code": "VALIDATION_ERROR",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### **HTTP Status Codes**

| Code | Status | Açıklama |
|------|--------|----------|
| `200` | Success | İşlem başarılı |
| `201` | Created | Kaynak oluşturuldu |
| `400` | Bad Request | Validation hatası |
| `401` | Unauthorized | Kimlik doğrulama hatası |
| `403` | Forbidden | Yetki hatası |
| `404` | Not Found | Kaynak bulunamadı |
| `429` | Rate Limit Exceeded | İstek limiti aşıldı |
| `500` | Internal Server Error | Sunucu hatası |

---

## ⏱️ **Rate Limiting**

### **Rate Limits by Endpoint Type**

| Endpoint Tipi | Limit | Açıklama |
|---------------|-------|----------|
| **Internal API** | 1000 req/hour | API key başına |
| **Slack Webhooks** | 100 req/minute | Workspace başına |
| **Teams Webhooks** | 50 req/minute | Tenant başına |
| **Web Chat** | 200 req/hour | Session başına |

---

## 🔧 **Internal API Endpoints**

### **Chat & Interaction**

#### **POST** `/api/v1/chat`
Web chatbot ile etkileşim endpoint'i.

**Request:**
```json
{
  "message": "gorevlerim"
}
```

**Response:**
```json
{
  "success": true,
  "message": "📋 Görevleriniz:\n• Proje sunumu hazırla - ⏰ 20.01.2025\n• API dokümantasyonu - ⏰ 22.01.2025"
}
```

**Desteklenen Komutlar:**

| Komut | Açıklama |
|-------|----------|
| `gorevlerim` | Atanmış görevleri listeler |
| `hatirlatmalarim` | Yaklaşan görevleri gösterir |
| `belge <ID>` | Belge detaylarını getirir (Örnek: `belge DOC001`) |
| `yardim` | Yardım menüsünü gösterir |

---

### **Task Management**

#### **POST** `/api/v1/tasks`
Yeni görev oluşturur ve otomatik email gönderir.

**Request:**
```json
{
  "title": "API dokümantasyonu hazırla",
  "dueDate": "2025-01-22T23:59:59Z",
  "userIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
  "assignedBy": "Proje Yöneticisi"
}
```

**Validation Rules:**

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| `title` | String | ✅ | Görev başlığı, boş olamaz |
| `dueDate` | ISO8601 Date | ✅ | Son tarih (örn: 2025-01-22T23:59:59Z) |
| `userIds` | Array[ObjectId] | ✅ | Minimum 1 kullanıcı ID'si |
| `assignedBy` | String | ❌ | Görevi atayan kişi |

**Response:**
```json
{
  "success": true,
  "message": "Görev başarıyla oluşturuldu. 2 kullanıcıya email bildirim gönderildi.",
  "task": {
    "id": "507f1f77bcf86cd799439013",
    "title": "API dokümantasyonu hazırla",
    "dueDate": "2025-01-22T23:59:59Z",
    "assignedUsers": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "Ahmet Yılmaz",
        "email": "ahmet@company.com"
      },
      {
        "id": "507f1f77bcf86cd799439012",
        "name": "Ayşe Demir",
        "email": "ayse@company.com"
      }
    ]
  }
}
```

#### **GET** `/api/v1/tasks`
Tüm görevleri listeler.

**Response:**
```json
{
  "success": true,
  "tasks": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "title": "API dokümantasyonu hazırla",
      "dueDate": "2025-01-22T23:59:59Z",
      "status": "pending",
      "assignedBy": "Proje Yöneticisi",
      "userIds": [
        {
          "_id": "507f1f77bcf86cd799439011",
          "name": "Ahmet Yılmaz",
          "email": "ahmet@company.com",
          "username": "ahmet.yilmaz"
        }
      ],
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T10:30:00Z"
    }
  ]
}
```

#### **GET** `/api/v1/tasks/user/{userId}`
Belirli kullanıcının görevlerini getirir.

**Parameters:**
- `userId`: MongoDB ObjectId

**Response:** Yukarıdaki `GET /tasks` ile aynı format

---

### **Document Management**

#### **POST** `/api/v1/documents`
Yeni belge oluşturur ve atanan kullanıcılara email gönderir.

**Request:**
```json
{
  "title": "Müşteri Sözleşmesi #2025-001",
  "documentId": "SOZLESME2025001",
  "description": "ABC Şirketi ile yapılan hizmet sözleşmesi",
  "dueDate": "2025-02-01T23:59:59Z",
  "category": "sozlesme",
  "userIds": ["507f1f77bcf86cd799439011"],
  "fileUrl": "https://docs.company.com/contracts/2025-001.pdf"
}
```

**Validation Rules:**

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| `title` | String | ✅ | Belge başlığı |
| `documentId` | String | ✅ | Unique ID, sadece [A-Z0-9] karakterler |
| `description` | String | ❌ | Belge açıklaması |
| `dueDate` | ISO8601 Date | ❌ | Son işlem tarihi |
| `category` | Enum | ❌ | sozlesme, teklif, eposta, fatura, diğer |
| `userIds` | Array[ObjectId] | ✅ | Minimum 1 kullanıcı ID'si |
| `fileUrl` | URL | ❌ | Belge dosyasının URL'i |

**Response:**
```json
{
  "success": true,
  "message": "Belge başarıyla oluşturuldu. 1 kullanıcıya email bildirim gönderildi.",
  "document": {
    "id": "507f1f77bcf86cd799439014",
    "title": "Müşteri Sözleşmesi #2025-001",
    "documentId": "SOZLESME2025001",
    "category": "sozlesme",
    "dueDate": "2025-02-01T23:59:59Z",
    "assignedUsers": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "Ahmet Yılmaz",
        "email": "ahmet@company.com"
      }
    ]
  }
}
```

#### **GET** `/api/v1/documents`
Tüm belgeleri listeler.

**Response:**
```json
{
  "success": true,
  "documents": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "title": "Müşteri Sözleşmesi #2025-001",
      "documentId": "SOZLESME2025001",
      "description": "ABC Şirketi ile yapılan hizmet sözleşmesi",
      "dueDate": "2025-02-01T23:59:59Z",
      "category": "sozlesme",
      "fileUrl": "https://docs.company.com/contracts/2025-001.pdf",
      "userIds": [
        {
          "_id": "507f1f77bcf86cd799439011",
          "name": "Ahmet Yılmaz",
          "email": "ahmet@company.com",
          "username": "ahmet.yilmaz"
        }
      ],
      "createdBy": {
        "_id": "507f1f77bcf86cd799439015",
        "name": "Yönetici",
        "email": "admin@company.com",
        "username": "admin"
      },
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T10:30:00Z"
    }
  ]
}
```

#### **GET** `/api/v1/documents/user/{userId}`
Belirli kullanıcının belgelerini getirir.

---

### **User Management**

#### **GET** `/api/v1/users`
Aktif kullanıcıları listeler.

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Ahmet Yılmaz",
      "email": "ahmet@company.com",
      "username": "ahmet.yilmaz",
      "role": "user"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Ayşe Demir",
      "email": "ayse@company.com",
      "username": "ayse.demir",
      "role": "manager"
    }
  ]
}
```

---

### **Web Interface Endpoints**

#### **GET** `/api/v1/gorevlerim`
Session tabanlı kullanıcı görevleri (EJS render).

#### **GET** `/api/v1/hatirlatmalarim`
Session tabanlı kullanıcı hatırlatmaları (EJS render).

#### **GET** `/api/v1/belge/{id}`
Belge detay sayfası (EJS render).

---

## 🔗 **Platform Integration Endpoints**

### **Slack Integration**

#### **POST** `/api/integrations/slack/commands`
Slack slash command handler.

**Request Headers:**
```
X-Slack-Signature: v0=signature
X-Slack-Request-Timestamp: timestamp
Content-Type: application/x-www-form-urlencoded
```

**Request Body:**
```
command=/gorevlerim&user_id=U1234567890&team_id=T1234567890&text=
```

**Desteklenen Slash Komutları:**

| Komut | Açıklama | Format |
|-------|----------|--------|
| `/gorevlerim` | Kullanıcı görevlerini listeler | Block Kit ile zengin görünüm |
| `/hatirlatmalarim` | Yaklaşan görevleri gösterir | Interactive button'lar ile |
| `/belge <ID>` | Belge detaylarını getirir | Örnek: `/belge DOC001` |
| `/yardim` | Interactive yardım menüsü | Quick action button'ları |

**Response:**
```json
{
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "📋 Görevleriniz"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "🟡 *API dokümantasyonu hazırla*\n📅 *Son Tarih:* 22.01.2025\n⏳ *Durum:* Bekliyor"
      },
      "accessory": {
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": "✅ Tamamla"
        },
        "action_id": "complete_task_507f1f77bcf86cd799439013",
        "value": "507f1f77bcf86cd799439013"
      }
    }
  ]
}
```

#### **POST** `/api/integrations/slack/interactive`
Slack interactive component handler (button clicks, select menus).

**Request Body:**
```
payload={
  "type": "block_actions",
  "user": {
    "id": "U1234567890",
    "name": "ahmet.yilmaz"
  },
  "actions": [
    {
      "action_id": "complete_task_507f1f77bcf86cd799439013",
      "value": "507f1f77bcf86cd799439013"
    }
  ],
  "response_url": "https://hooks.slack.com/actions/..."
}
```

**Desteklenen Interactive Actions:**

| Action ID | Açıklama | Davranış |
|-----------|----------|----------|
| `complete_task_{taskId}` | Görevi tamamla | Task status'ü completed yapar |
| `snooze_task_{taskId}` | Görevi 1 gün ertele | Due date'i +1 gün yapar |
| `show_reminders` | Hatırlatmaları göster | Yaklaşan görevleri listeler |
| `quick_tasks` | Hızlı görev listesi | Ana görev listesini gösterir |
| `quick_reminders` | Hızlı hatırlatmalar | 3 günlük hatırlatma listesi |

#### **POST** `/api/integrations/slack/events`
Slack Event API handler.

**Desteklenen Event Tipleri:**

| Event Type | Açıklama |
|------------|----------|
| `url_verification` | Webhook doğrulama (Slack verification) |
| `message` (DM) | Direkt mesaj handling |
| `app_mention` | Bot mention'ları (@bot ile etiketleme) |

---

### **Microsoft Teams Integration**

#### **POST** `/api/integrations/teams/messages`
Teams Bot Framework mesaj handler.

**Request Headers:**
```
Authorization: Bearer teams-bot-token
Content-Type: application/json
```

**Request Body (Bot Framework Activity):**
```json
{
  "type": "message",
  "id": "1234567890",
  "timestamp": "2025-01-15T10:30:00Z",
  "from": {
    "id": "29:user-aad-object-id",
    "aadObjectId": "user-aad-object-id"
  },
  "conversation": {
    "id": "19:meeting-conversation-id"
  },
  "text": "gorevlerim"
}
```

**Desteklenen Komutlar:**

| Komut | Açıklama |
|-------|----------|
| `gorevlerim` | Kullanıcı görevlerini listeler |
| `hatirlatmalarim` | Yaklaşan görevleri gösterir |
| `belge <ID>` | Belge detaylarını getirir |
| `yardim` | Yardım menüsü |

**Response:** Bot Framework automatically handles response

---

## 📊 **Data Models**

### **Task Model**
```javascript
{
  _id: ObjectId,
  title: String, // required
  dueDate: Date, // required
  status: Enum['pending', 'completed', 'overdue'], // default: 'pending'
  userIds: [ObjectId], // ref: 'User'
  userPlatformMap: {
    slack: String, // Slack user ID
    teams: String, // Teams AAD Object ID
    web: ObjectId  // Web user reference
  },
  assignedBy: String, // default: 'Sistem'
  createdAt: Date,
  updatedAt: Date
}
```

### **Document Model**
```javascript
{
  _id: ObjectId,
  title: String, // required
  documentId: String, // required, unique, [A-Z0-9] pattern
  description: String,
  dueDate: Date,
  category: Enum['sozlesme', 'teklif', 'eposta', 'fatura', 'diğer'], // default: 'diğer'
  fileUrl: String,
  userIds: [ObjectId], // ref: 'User'
  createdBy: ObjectId, // ref: 'User'
  createdAt: Date,
  updatedAt: Date
}
```

### **User Model**
```javascript
{
  _id: ObjectId,
  name: String, // required
  username: String, // required, unique, lowercase
  email: String, // required, unique, lowercase
  password: String, // required, bcrypt hashed
  platformIds: {
    slack: String,    // Slack user ID (U1234567890)
    teams: String,    // Teams AAD Object ID
    web: ObjectId     // Web user reference
  },
  role: Enum['user', 'admin', 'manager'], // default: 'user'
  isActive: Boolean, // default: true
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔔 **Webhook Events**

### **Automatic Email Notifications**

**Task Assignment Email:**
- **Trigger**: Yeni Task oluşturulduğında
- **Recipients**: task.userIds içindeki tüm kullanıcılar
- **Content**: Görev detayları, son tarih, atayan kişi

**Document Assignment Email:**
- **Trigger**: Yeni Document oluşturulduğında
- **Recipients**: document.userIds içindeki tüm kullanıcılar
- **Content**: Belge detayları, kategori, son tarih

### **Cron Job Reminders**

**Daily Reminder Job:**
- **Schedule**: Her gün saat 08:00
- **Function**: Yaklaşan (3 gün içinde) görev ve belgeleri tespit eder
- **Action**: Kullanıcılara platform-specific bildirim gönderir

---

## 🔒 **Security Considerations**

### **Input Validation**
- express-validator ile tüm input'lar validate edilir
- SQL injection protection (NoSQL injection)
- XSS protection (sanitize-html)
- File upload validation

### **Authentication & Authorization**
- API key rotation policy (30 günde bir)
- Platform signature verification
- Rate limiting per API key/platform
- Session security (httpOnly, secure cookies)

### **Data Protection**
- Password bcrypt hashing (salt rounds: 10)
- Sensitive data encryption at rest
- CORS configuration
- Security headers (Helmet.js)

### **Monitoring & Logging**
- Request/response logging
- Error tracking (Sentry integration)
- Performance monitoring
- Audit logs for data modifications

---

## 🚀 **Deployment Architecture**

### **Production Environment**
```
Load Balancer (CloudFlare)
        ↓
    API Gateway (NGINX)
        ↓
    Node.js Application (PM2 Cluster)
        ↓
    MongoDB Replica Set (3 nodes)
        ↓
    Redis Cache (Session Store)
```

### **Infrastructure Requirements**

| Bileşen | Spesifikasyon | Açıklama |
|---------|---------------|----------|
| **Server** | 2 vCPU, 4GB RAM, SSD | Node.js application server |
| **Database** | MongoDB 6.x, 50GB | Primary data store |
| **Cache** | Redis 7.x, 1GB | Session store & caching |
| **SSL** | Let's Encrypt wildcard | HTTPS/TLS termination |
| **Monitoring** | Winston + Sentry + New Relic | Logging & performance |

### **Environment Variables**
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/onedoccase
REDIS_URL=redis://localhost:6379

# Authentication
API_KEYS=dev-internal-key-123,web-client-key-456
SESSION_SECRET=your-super-secret-session-key

# Slack Integration
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
SLACK_SIGNING_SECRET=your-slack-signing-secret

# Teams Integration
MICROSOFT_APP_ID=your-teams-app-id
MICROSOFT_APP_PASSWORD=your-teams-app-password

# Email Service
SMTP_HOST=smtp.company.com
SMTP_PORT=587
SMTP_USER=noreply@company.com
SMTP_PASS=your-smtp-password

# Application
NODE_ENV=production
PORT=3000
BASE_URL=https://onedocs-bot-api.com
```

### **Deployment Checklist**

| Görev | Durum | Açıklama |
|-------|-------|----------|
| Environment variables configured | ⭕ | .env dosyası hazır |
| Database indexes created | ⭕ | MongoDB performance optimization |
| SSL certificates installed | ⭕ | HTTPS/TLS configuration |
| Rate limiting configured | ⭕ | DDoS protection |
| Monitoring tools setup | ⭕ | Logging & alerting |
| Backup strategy implemented | ⭕ | Data protection |
| CI/CD pipeline tested | ⭕ | Automated deployment |
| Security audit completed | ⭕ | Security assessment |

---

## 📚 **Additional Resources**

### **Development Guidelines**
- [Slack Block Kit Builder](https://app.slack.com/block-kit-builder)
- [Teams Bot Framework Documentation](https://docs.microsoft.com/en-us/azure/bot-service/)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Schema Design Patterns](https://www.mongodb.com/blog/post/building-with-patterns-a-summary)

### **API Testing**
```bash
# Test API with curl
curl -X POST https://onedocs-bot-api.com/api/v1/tasks \
  -H "X-API-Key: dev-internal-key-123" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test görevi",
    "dueDate": "2025-01-25T23:59:59Z",
    "userIds": ["507f1f77bcf86cd799439011"]
  }'
```

### **Postman Collection**
Import edilebilir Postman collection: `OneDocs_Bot_API.postman_collection.json`

---

**© 2025 OneDocs Development Team**  
**Version**: 1.0.0 | **Last Updated**: Ocak 2025  
**Contact**: api-support@onedocs.com | **Documentation**: https://docs.onedocs-bot-api.com 