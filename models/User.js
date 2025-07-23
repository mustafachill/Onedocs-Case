const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
    minlength: 6,
  },

  platformIds: {
    slack: { type: String, default: null }, // Slack user ID (Uxxxx)
    teams: { type: String, default: null }, // Teams AAD user ID
    web: { type: mongoose.Schema.Types.ObjectId, ref: 'WebUser', default: null }, // varsa ayrı Web kullanıcı modeli
  },

  role: {
    type: String,
    enum: ['user', 'admin', 'manager'],
    default: 'user',
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  lastLoginAt: {
    type: Date,
    default: null,
  },

}, { timestamps: true });


// 🔐 Şifreyi kaydetmeden önce hashle
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// 🔑 Şifre doğrulama fonksiyonu
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
