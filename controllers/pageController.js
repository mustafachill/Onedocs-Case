const nodemailer = require('nodemailer');
const sanitizeHtml = require('sanitize-html');
const User = require('../models/User');
const mongoose = require('mongoose');

// MAIN PAGE FUNCTION
exports.getIndexPage = (req, res) => {
  res.render('index', {
    user: req.session.user
  });
};

exports.getLoginPage = (req, res) => {
  res.render('login');
};

exports.getRegisterPage = (req, res) => {
  res.render('register');
};

// for saving xss attack
async function htmlChecker(subject) {
  controlledInfo = sanitizeHtml(subject, {
    allowedTags: [], // Etiketleri kaldırır
    allowedAttributes: {}, // Tüm HTML özelliklerini kaldırır
  });
  return controlledInfo;
}

