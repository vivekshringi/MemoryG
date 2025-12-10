const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('dotenv').config();
const { body, validationResult } = require('express-validator');

// ===== CONFIG =====
const pool = mysql.createPool({
  host: env.parsed.DB_HOST,
  user: env.parsed.DB_USER,
  password: env.parsed.DB_PASSWORD,
  database: env.parsed.DB_NAME,
  waitForConnections: true,
  connectionLimit: env.parsed.CONNECTION_LIMIT || 10,
});

const JWT_SECRET = env.parsed.JWT_SECRET || 'default_secret';

// ===== UTILITIES =====
function isValidString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function asyncHandler(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

function chooseRandomRole() {
  return Math.random() < 0.5 ? 'admin' : 'user';
}

function getRandomMaritalStatus() {
  const statuses = ['Single', 'Married', 'Divorced', 'Widowed'];
  return statuses[Math.floor(Math.random() * statuses.length)];
}

function getRandomCompanyName() {
  const companies = ['apple', 'meta', 'google', 'amazon', 'microsoft', 'netflix', 'tesla', 'spotify', 'adobe', 'intel', 'ibm', 'oracle', 'salesforce', 'uber', 'airbnb'];
  return companies[Math.floor(Math.random() * companies.length)];
}

function randomInteger() {
  return Array.from({ length: 5 }, () => Math.floor(Math.random() * 100));
}

// ===== MIDDLEWARE =====
const authMiddleware = (req, res, next) => {
  const token = req.cookies['Authorization'];
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

const roleMiddleware = (requiredRole) => (req, res, next) => {
  const role = req.cookies['role'];
  if (role !== requiredRole) return res.status(403).json({ message: 'Access forbidden! you do not have sufficient rights' });
  next();
};

// ===== DATABASE FUNCTIONS =====
async function createUserWithRelatedData(pool, userData, personData, locationData) {
  const connection = await pool.getConnection();
  try {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    await connection.beginTransaction();

    const [userResult] = await connection.execute(
      'INSERT INTO users (username, password, email, image_url, role) VALUES (?, ?, ?, ?, ?)',
      [userData.username, hashedPassword, userData.email, userData.image, 'user'],
    );
    const userId = userResult.insertId;

    await connection.execute(
      'INSERT INTO persons (prefix, firstname, middlename, lastname, gender, birthdate, maritalstatus, jobtitle, phone, users_Id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [personData.prefix, personData.username, personData.middlename, personData.lastname, personData.gender, personData.dob, personData.maritalstatus, personData.jobtitle, personData.phonenumber, userId],
    );

    await connection.execute(
      'INSERT INTO locations (streetAddress, city, country, state, zipCode, latitude, longitude, timeZone, users_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [locationData.streetaddress, locationData.city, locationData.country, locationData.state, locationData.zipcode, locationData.latitude, locationData.longitude, locationData.timezone, userId],
    );

    await connection.commit();
    console.log('User created with ID:', userId);
    return userId;
  } catch (error) {
    await connection.rollback();
    console.error('Transaction failed:', error);
    throw error;
  } finally {
    await connection.release();
  }
}

async function updateUserWithRelatedData(pool, userId, userData, personData, locationData) {
  const connection = await pool.getConnection();
  try {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    await connection.beginTransaction();

    await connection.execute(
      'UPDATE users SET username = ?, password = ?, email = ?, image_url = ?, role = ? WHERE id = ?',
      [userData.username, hashedPassword, userData.email, userData.image, userData.role, userId],
    );

    await connection.execute(
      'UPDATE persons SET prefix = ?, firstname = ?, middlename = ?, lastname = ?, gender = ?, birthdate = ?, maritalstatus = ?, jobtitle = ?, phone = ? WHERE users_id = ?',
      [personData.prefix, personData.username, personData.middlename, personData.lastname, personData.gender, personData.dob, personData.maritalstatus, personData.jobtitle, personData.phonenumber, userId],
    );

    await connection.execute(
      'UPDATE locations SET streetAddress = ?, city = ?, country = ?, state = ?, zipCode = ?, latitude = ?, longitude = ?, timeZone = ? WHERE users_id = ?',
      [locationData.streetaddress, locationData.city, locationData.country, locationData.state, locationData.zipcode, locationData.latitude, locationData.longitude, locationData.timezone, userId],
    );

    await connection.commit();
    console.log('User updated with ID:', userId);
    return userId;
  } catch (error) {
    await connection.rollback();
    console.error('Update failed:', error);
    throw error;
  } finally {
    await connection.release();
  }
}

async function deleteUserWithRelatedData(pool, userId) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.execute('DELETE FROM locations WHERE users_id = ?', [userId]);
    await connection.execute('DELETE FROM persons WHERE users_id = ?', [userId]);
    const [result] = await connection.execute('DELETE FROM users WHERE id = ?', [userId]);

    await connection.commit();
    console.log('User deleted with ID:', userId);
    return result.affectedRows;
  } catch (error) {
    await connection.rollback();
    console.error('Delete failed:', error);
    throw error;
  } finally {
    await connection.release();
  }
}

// ===== AUTH ROUTES =====
router.post(
  '/api/register',
  [body('email').isEmail().withMessage('Enter a valid email'), body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute('INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)', [username.trim(), hashedPassword, email.trim(), role.trim()]);

    return res.status(201).json({ message: 'User registered successfully', insertId: result.insertId });
  }),
);

router.post(
  '/api/login',
  [body('email').isEmail().withMessage('Enter a valid email'), body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')],
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const [[user]] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.cookie('Authorization', token, { expires: new Date(Date.now() + 3600000), httpOnly: true, secure: true });
    res.cookie('role', user.role, { httpOnly: true, secure: true });

    return res.status(200).json({ token, message: 'Logged in successfully', user: user.role, username: user.username });
  }),
);

// ===== PROTECTED ROUTES =====
router.get('/api/user', authMiddleware, asyncHandler(async (req, res) => {
  const query = 'SELECT u.id, u.username, u.email, p.birthdate, p.gender, p.maritalstatus, p.jobtitle, p.phone FROM users u JOIN persons p ON u.id = p.users_Id';
  const [rows] = await pool.query(query);
  return res.json(rows);
}));

router.get('/api/user/:id', authMiddleware, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  const query = `SELECT u.id, u.username, u.email, u.role, u.image_url, p.prefix, p.firstname, p.middlename, p.lastname, p.gender, p.birthdate, p.maritalstatus, p.jobtitle, p.phone, l.streetAddress, l.city, l.state, l.zipCode, l.latitude FROM users u JOIN persons p ON u.id = p.users_id JOIN locations l ON p.users_id = l.users_id WHERE u.id = ?`;
  const [[row]] = await pool.query(query, [id]);

  if (!row) return res.status(404).json({ error: 'Not found' });
  return res.json(row);
}));

router.post(
  '/api/user',
  asyncHandler(async (req, res) => {
    const { prefix, username, password, email, lastname, middlename, dob, gender, maritalstatus, jobtitle, phonenumber, streetaddress, city, state, zipcode, country, latitude, longitude, timezone, image } = req.body || {};

    const fields = [username, password, email, prefix, middlename, lastname, gender, dob, maritalstatus, jobtitle, phonenumber, streetaddress, city, state, zipcode, country, latitude, longitude, timezone, image];

    if (!fields.every(isValidString)) {
      return res.status(400).json({ error: 'Missing or invalid fields' });
    }

    const userId = await createUserWithRelatedData(
      pool,
      { username, password, email, image },
      { prefix, username, middlename, lastname, gender, dob, maritalstatus, jobtitle, phonenumber },
      { streetaddress, city, country, state, zipcode, latitude, longitude, timezone },
    );

    return res.status(201).json({ message: 'User created', insertId: userId });
  }),
);

router.put(
  '/api/user/:id',
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

    const { username, password, email, image, role, prefix, middlename, lastname, gender, dob, maritalstatus, jobtitle, phonenumber, streetaddress, city, country, state, zipcode, latitude, longitude, timezone } = req.body || {};

    const fields = [username, password, email, image, role, prefix, middlename, lastname, gender, dob, maritalstatus, jobtitle, phonenumber, streetaddress, city, country, state, zipcode, latitude, longitude, timezone];

    if (!fields.every(isValidString)) {
      return res.status(400).json({ error: 'Missing or invalid fields' });
    }

    const userId = await updateUserWithRelatedData(
      pool,
      id,
      { username, password, email, role, image },
      { prefix, username, middlename, lastname, gender, dob, maritalstatus, jobtitle, phonenumber },
      { streetaddress, city, country, state, zipcode, latitude, longitude, timezone },
    );

    return res.status(200).json({ message: 'Updated', insertId: userId });
  }),
);

router.delete(
  '/api/user/:id',
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

    const affectedRows = await deleteUserWithRelatedData(pool, id);

    if (affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    return res.json({ message: 'Deleted', affectedRows });
  }),
);

// ===== FAKER/RANDOM ROUTES =====
router.get('/api/random', [authMiddleware, roleMiddleware('user')], (req, res) => {
  res.send(randomInteger());
});


router.get('/api/randomCat', asyncHandler(async (req, res) => {
  const row = {
    name: faker.animal.cat(),
    owner: faker.person.fullName(),
    birth: faker.date.birthdate().toISOString().slice(0, 10),
  };
  return res.status(200).json(row);
}));

router.get('/api/randomUser', asyncHandler(async (req, res) => {
  const sex = faker.person.sex();
  const username = faker.person.firstName(sex).toLowerCase();
  const lastname = faker.person.lastName(sex).toLowerCase();
  const company = getRandomCompanyName().toLowerCase();
  const email = `${username}.${lastname}@${company}.com`;

  const row = {
    username,
    email,
    password: faker.internet.password(),
    role: chooseRandomRole(),
    person: {
      prefix: faker.person.prefix(),
      gender: sex,
      zodiac: faker.person.zodiacSign(),
      avatar: faker.image.personPortrait({ sex }),
      birthdate: faker.date.birthdate().toISOString().slice(0, 10),
      maritalstatus: getRandomMaritalStatus(),
      jobtitle: faker.person.jobTitle(),
      phonenumber: faker.phone.number(),
      middlename: faker.person.middleName(sex),
      lastname,
    },
    location: {
      streetaddress: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zipcode: faker.location.zipCode(),
      latitude: faker.location.latitude().toString(),
      longitude: faker.location.longitude().toString(),
      timezone: faker.location.timeZone(),
      country: faker.location.country(),
    },
  };

  return res.status(200).json(row);
}));

// ===== PAGE ROUTES =====
router.get('/form', (req, res) => res.render('user', { title: 'user' }));
router.get('/login', (req, res) => res.render('login', { title: 'Login' }));
router.get('/register', (req, res) => res.render('register', { title: 'Register' }));


router.get('/memorygame', authMiddleware, (req, res) => {
  res.render('random', { title: randomInteger().toString() });
});

router.get('/guess', (req, res) => res.render('guess', { title: 'Guess' }));

module.exports = router;