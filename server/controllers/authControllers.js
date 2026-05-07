const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');

const register = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const existing = await userModel.findByUsername(username);
    if (existing) {
      return res.status(409).json({ error: 'Username already taken.' });
    }

    const user = await userModel.create(username, password);
    req.session.userId = user.user_id;
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const user = await userModel.findByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    req.session.userId = user.user_id;
    res.json({ user_id: user.user_id, username: user.username });
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json(null);
    }
    const user = await userModel.findById(req.session.userId);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

const logout = (req, res) => {
  req.session = null;
  res.json({ message: 'Logged out.' });
};

module.exports = { register, login, me, logout };