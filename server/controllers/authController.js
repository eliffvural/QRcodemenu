const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function createToken(user) {
  const payload = { sub: user._id, email: user.email };
  return jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
}

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'E‑posta ve şifre zorunludur' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Bu e‑posta ile hesap mevcut' });
    const user = await User.create({ name, email, passwordHash: hashPassword(password) });
    const token = createToken(user);
    res.status(201).json({ token, user: { _id: user._id, name: user.name, email: user.email } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Geçersiz bilgiler' });
    if (user.passwordHash !== hashPassword(password)) return res.status(401).json({ error: 'Geçersiz bilgiler' });
    const token = createToken(user);
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.me = async (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) return res.status(401).json({ error: 'Yetkisiz' });
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ error: 'Yetkisiz' });
    res.json({ _id: user._id, name: user.name, email: user.email });
  } catch (e) {
    res.status(401).json({ error: 'Yetkisiz' });
  }
};










