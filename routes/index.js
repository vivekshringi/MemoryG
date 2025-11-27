// ...existing code...
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise'); // use promise API for async/await
const {faker} = require('@faker-js/faker')

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
  res.render('index', { title: 'Express' });
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