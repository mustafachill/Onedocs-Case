const nodemailer = require('nodemailer');
const sanitizeHtml = require('sanitize-html');

// Load environment variables
require('dotenv').config();

// Validate required environment variables for email service
if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.warn('⚠️  Email service disabled: SMTP_USER and SMTP_PASS environment variables are required');
}

// XSS protection function
async function htmlChecker(subject) {
  const controlledInfo = sanitizeHtml(subject, {
    allowedTags: [], // Remove all HTML tags
    allowedAttributes: {}, // Remove all HTML attributes
  });
  return controlledInfo;
}

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 465,
  secure: process.env.SMTP_SECURE === 'true', // true for port 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // Gmail account from environment
    pass: process.env.SMTP_PASS, // Gmail app password from environment
  },
});

// Send task assignment notification
exports.sendTaskAssignmentEmail = async (user, task) => {
  try {
    // Check if email service is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('📧 Email service not configured, skipping task notification email');
      return { success: false, error: 'Email service not configured' };
    }

    const userName = await htmlChecker(user.name);
    const userEmail = await htmlChecker(user.email);
    const taskTitle = await htmlChecker(task.title);
    const dueDate = task.dueDate ? task.dueDate.toLocaleDateString('tr-TR') : 'Belirtilmemiş';

    const outputMessage = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; max-width: 600px; margin: auto; background-color: #ffffff; border: 1px solid #dce3ea; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 123, 255, 0.1);">
      
      <!-- Logo Section -->
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background-color: #eaf4ff; padding: 20px; border-radius: 8px;">
          <h2 style="color: #0056b3; margin: 0;">📋 OneDocs</h2>
        </div>
      </div>

      <!-- Title -->
      <h2 style="color: #0056b3; text-align: center; margin-bottom: 30px;">YENİ GÖREV ATAMASI</h2>

      <!-- User Info -->
      <p style="color: #333; font-size: 16px;">Merhaba <strong>${userName}</strong>,</p>
      <p style="color: #555;">Size yeni bir görev atanmıştır:</p>

      <!-- Task Details -->
      <div style="background-color: #f0f8ff; padding: 20px; border-left: 5px solid #007bff; margin: 20px 0; border-radius: 5px;">
        <ul style="list-style: none; padding: 0; margin: 0;">
          <li style="margin-bottom: 15px;">
            <strong style="color: #333;">Görev:</strong>
            <span style="color: #555;">${taskTitle}</span>
          </li>
          <li style="margin-bottom: 15px;">
            <strong style="color: #333;">Son Tarih:</strong>
            <span style="color: #555;">${dueDate}</span>
          </li>
          <li style="margin-bottom: 15px;">
            <strong style="color: #333;">Durum:</strong>
            <span style="color: #555;">Bekliyor</span>
          </li>
        </ul>
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin: 30px 0;">
        <p style="color: #555;">Görevlerinizi görüntülemek için OneDocs sistemine giriş yapın.</p>
      </div>

      <!-- Footer -->
      <footer style="text-align: center; margin-top: 40px; font-size: 0.9em; color: #888;">
        <p>Bu e-posta <strong>OneDocs</strong> sistem tarafından otomatik olarak gönderilmiştir.</p>
      </footer>
    </div>
    `;

    const info = await transporter.sendMail({
      from: `"OneDocs Sistem" <${process.env.SMTP_USER}>`, // sender address from environment
      to: userEmail, // user's email
      subject: `🔔 Yeni Görev Atandı: ${taskTitle}`, // Subject line
      html: outputMessage, // html body
    });

    console.log(`📧 Task notification email sent to ${userEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Task email notification failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Send document assignment notification
exports.sendDocumentAssignmentEmail = async (user, document) => {
  try {
    // Check if email service is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('📧 Email service not configured, skipping document notification email');
      return { success: false, error: 'Email service not configured' };
    }
    const userName = await htmlChecker(user.name);
    const userEmail = await htmlChecker(user.email);
    const documentTitle = await htmlChecker(document.title);
    const documentId = await htmlChecker(document.documentId);
    const dueDate = document.dueDate ? document.dueDate.toLocaleDateString('tr-TR') : 'Belirtilmemiş';
    const category = document.category || 'Belirtilmemiş';

    const outputMessage = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; max-width: 600px; margin: auto; background-color: #ffffff; border: 1px solid #dce3ea; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 123, 255, 0.1);">
      
      <!-- Logo Section -->
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background-color: #eaf4ff; padding: 20px; border-radius: 8px;">
          <h2 style="color: #0056b3; margin: 0;">📄 OneDocs</h2>
        </div>
      </div>

      <!-- Title -->
      <h2 style="color: #0056b3; text-align: center; margin-bottom: 30px;">YENİ BELGE ATAMASI</h2>

      <!-- User Info -->
      <p style="color: #333; font-size: 16px;">Merhaba <strong>${userName}</strong>,</p>
      <p style="color: #555;">Size yeni bir belge atanmıştır:</p>

      <!-- Document Details -->
      <div style="background-color: #f0f8ff; padding: 20px; border-left: 5px solid #007bff; margin: 20px 0; border-radius: 5px;">
        <ul style="list-style: none; padding: 0; margin: 0;">
          <li style="margin-bottom: 15px;">
            <strong style="color: #333;">Belge:</strong>
            <span style="color: #555;">${documentTitle}</span>
          </li>
          <li style="margin-bottom: 15px;">
            <strong style="color: #333;">Belge ID:</strong>
            <span style="color: #555;">${documentId}</span>
          </li>
          <li style="margin-bottom: 15px;">
            <strong style="color: #333;">Kategori:</strong>
            <span style="color: #555;">${category}</span>
          </li>
          <li style="margin-bottom: 15px;">
            <strong style="color: #333;">Son Tarih:</strong>
            <span style="color: #555;">${dueDate}</span>
          </li>
        </ul>
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin: 30px 0;">
        <p style="color: #555;">Belgelerinizi görüntülemek için OneDocs sistemine giriş yapın.</p>
      </div>

      <!-- Footer -->
      <footer style="text-align: center; margin-top: 40px; font-size: 0.9em; color: #888;">
        <p>Bu e-posta <strong>OneDocs</strong> sistem tarafından otomatik olarak gönderilmiştir.</p>
      </footer>
    </div>
    `;

    const info = await transporter.sendMail({
      from: `"OneDocs Sistem" <${process.env.SMTP_USER}>`, // sender address from environment
      to: userEmail, // user's email
      subject: `📄 Yeni Belge Atandı: ${documentTitle}`, // Subject line
      html: outputMessage, // html body
    });

    console.log(`📧 Document notification email sent to ${userEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Document email notification failed:', error.message);
    return { success: false, error: error.message };
  }
}; 