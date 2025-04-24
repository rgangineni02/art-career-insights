const express = require('express');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const usersFile = './data/users.json';
const secretKey = 'your_secret_key';

const loadUsers = () => JSON.parse(fs.readFileSync(usersFile));
const saveUsers = (users) => fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

// Signup route
router.post('/signup', (req, res) => {
  const { email, password, name } = req.body;
  const users = loadUsers();
  const exists = users.find(u => u.email === email);
  if (exists) return res.status(400).json({ message: 'User already exists' });

  const hashed = bcrypt.hashSync(password, 10);
  users.push({ name, email, password: hashed });
  saveUsers(users);
  res.status(201).json({ message: 'User registered successfully' });
});

// Login route
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const users = loadUsers();
  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  const match = bcrypt.compareSync(password, user.password);
  if (!match) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ email: user.email }, secretKey, { expiresIn: '1h' });
  res.json({ token });
});

module.exports = router;
