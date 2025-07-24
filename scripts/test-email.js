#!/usr/bin/env node

/**
 * Email Service Test Script
 * Tests email functionality with environment variables
 */

require('dotenv').config();
const { sendTaskAssignmentEmail, sendDocumentAssignmentEmail } = require('../utils/emailService');

async function testEmailService() {
  console.log('📧 Testing Email Service...\n');

  // Check environment variables
  console.log('🔍 Environment Variables:');
  console.log(`SMTP_HOST: ${process.env.SMTP_HOST || 'Not set'}`);
  console.log(`SMTP_PORT: ${process.env.SMTP_PORT || 'Not set'}`);
  console.log(`SMTP_USER: ${process.env.SMTP_USER || 'Not set'}`);
  console.log(`SMTP_PASS: ${process.env.SMTP_PASS ? '✅ Set' : '❌ Not set'}`);

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('\n❌ Email service not configured!');
    console.log('📋 Please set these environment variables in .env:');
    console.log('   SMTP_USER=your-email@gmail.com');
    console.log('   SMTP_PASS=your-app-password');
    console.log('\n💡 Gmail App Password: https://support.google.com/accounts/answer/185833');
    process.exit(1);
  }

  // Test data
  const testUser = {
    name: 'Test User',
    email: process.env.SMTP_USER // Send to yourself for testing
  };

  const testTask = {
    title: 'Test Email Notification',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
  };

  const testDocument = {
    title: 'Test Document',
    documentId: 'TEST001',
    category: 'test',
    dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000) // Day after tomorrow
  };

  try {
    console.log('\n📤 Testing Task Assignment Email...');
    const taskResult = await sendTaskAssignmentEmail(testUser, testTask);
    
    if (taskResult.success) {
      console.log('✅ Task email sent successfully!');
      console.log(`📧 Message ID: ${taskResult.messageId}`);
    } else {
      console.log(`❌ Task email failed: ${taskResult.error}`);
    }

    console.log('\n📤 Testing Document Assignment Email...');
    const docResult = await sendDocumentAssignmentEmail(testUser, testDocument);
    
    if (docResult.success) {
      console.log('✅ Document email sent successfully!');
      console.log(`📧 Message ID: ${docResult.messageId}`);
    } else {
      console.log(`❌ Document email failed: ${docResult.error}`);
    }

    console.log('\n🎉 Email service test completed!');
    console.log('📬 Check your inbox for test emails.');

  } catch (error) {
    console.error('\n❌ Email test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your Gmail App Password');
    console.log('2. Verify SMTP settings in .env');
    console.log('3. Ensure 2-Step Verification is enabled on Gmail');
    process.exit(1);
  }
}

// Run the test
testEmailService().catch(console.error); 