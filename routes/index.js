// ...existing code...
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise'); // use promise API for async/await
const {faker} = require('@faker-js/faker');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// use a pool instead of a single connection
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'pets',
  waitForConnections: true,
  connectionLimit: 10,
});

// Simple validator helper
function isValidString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}
router.get('/form', (req, res) => {
  res.render('index', { title: 'Cat world' });
});

router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

router.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});



router.post('/api/register', 
  [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ], 
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { username, email, password, role } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await pool.execute('INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',[username.trim(), hashedPassword.trim(), email.trim(), role.trim()]);
      return res.status(201).json({ message: 'User is registered', insertId: result.insertId });
    } catch (err) {
      res.status(500).json({ message: 'Error registering user', error: err.message });
    }
  }
);

router.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
   if (![email, password].every(isValidString)) {
    return res.status(400).json({ error: 'Missing or invalid fields: email, password' });
  }
  try {
    const user = await pool.query('SELECT * FROM users WHERE email = ?', email);
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user[0][0].password);
    console.log(isMatch);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, 'your_secret_key', { expiresIn: '1h' });
    res.cookie('Authorization', token, { expires: new Date(Date.now() + 300000), httpOnly: true, secure: true });
    res.cookie('role', user[0][0].role,{ httpOnly: true , secure: true });
    res.status(200).json({ token, message: 'Logged in successfully', user: user[0][0].role, username: user[0][0].username });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
});

const authMiddleware = (req, res, next) => {
  const token = req.cookies['Authorization'];
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });
  try {
    const decoded = jwt.verify(token, 'your_secret_key');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

const roleMiddleware = (requiredRole) => (req, res, next) => {
  const role = req.cookies['role'];
  if (role !== requiredRole) return res.status(403).json({ message: 'Access forbidden' });
  next();
};

router.get('/api/user', authMiddleware, (req, res) => {
  console.log(req.cookies);
  res.status(200).json({ message: 'Welcome to the user dashboard', user: req.user });
});

router.get('/api/admin', [authMiddleware, roleMiddleware('admin')], (req, res) => {
  res.status(200).json({ message: 'Welcome to the admin dashboard', user: req.user });
});

router.get('/randomCat', (req, res) => {
    try {
    const row = {
      "name" : faker.animal.cat(),
      "owner": faker.person.fullName(),
      "birth": faker.date.birthdate().toISOString().slice(0, 10)
    }
    console.log(row)
    return res.status(200).json(row); // return single object
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

function chooseRandomRole() {
  return Math.random() < 0.5 ? 'admin' : 'user';
}

router.get('/randomUser', (req, res) => {
    try {
    const row = {
      "username": faker.person.firstName(),
      "email": faker.internet.email(),
      "password": faker.internet.password(),
      "role": chooseRandomRole()
    }
    console.log(row)
    return res.status(200).json(row); // return single object
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
// GET /users
router.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM cats');
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /users/:id
router.get('/users/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  try {
    const [rows] = await pool.query('SELECT * FROM cats WHERE id = ?', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Not found' });
    return res.json(rows[0]); // return single object
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /users
router.post('/users', async (req, res) => {
  const { name, owner, birth } = req.body || {};
  if (![name, owner, birth].every(isValidString)) {
    return res.status(400).json({ error: 'Missing or invalid fields: name, owner, birth' });
  }
  try {
    const [result] = await pool.execute(
      'INSERT INTO cats (name, owner, birth) VALUES (?, ?, ?)',
      [name.trim(), owner.trim(), birth.trim()],
    );
    return res.status(201).json({ message: 'Created', insertId: result.insertId });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /users/:id
router.put('/users/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name, owner, birth } = req.body || {};
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
  if (![name, owner, birth].every(isValidString)) {
    return res.status(400).json({ error: 'Missing or invalid fields: name, owner, birth' });
  }

  try {
    const [result] = await pool.execute(
      'UPDATE cats SET name = ?, owner = ?, birth = ? WHERE id = ?',
      [name.trim(), owner.trim(), birth.trim(), id],
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    return res.json({ message: 'Updated', affectedRows: result.affectedRows });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /users/:id
router.delete('/users/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  try {
    const [result] = await pool.execute('DELETE FROM cats WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    return res.json({ message: 'Deleted', affectedRows: result.affectedRows });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// optional: basic page


module.exports = router;
// ...existing code...