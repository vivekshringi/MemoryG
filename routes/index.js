// ...existing code...
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise'); // use promise API for async/await
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('dotenv').config();
const { body, validationResult } = require('express-validator');

// use a pool instead of a single connection
const pool = mysql.createPool({
  host: env.parsed.DB_HOST,
  user: env.parsed.DB_USER,
  password: env.parsed.DB_PASSWORD,
  database: env.parsed.DB_NAME,
  waitForConnections: true,
  connectionLimit: env.parsed.CONNECTION_LIMIT || 10,
});

let mysecret = env.parsed.JWT_SECRET || 'default_secret';

// Simple validator helper
function isValidString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}
router.get('/form', (req, res) => {
  res.render('user', { title: 'user' });
});

router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

router.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});

router.post(
  '/api/register',
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
      const result = await pool.execute('INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)', [
        username.trim(),
        hashedPassword.trim(),
        email.trim(),
        role.trim(),
      ]);
      return res.status(201).json({ message: 'User is registered', insertId: result.insertId });
    } catch (err) {
      res.status(500).json({ message: 'Error registering user', error: err.message });
    }
  },
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
    const token = jwt.sign({ id: user._id }, mysecret, { expiresIn: '1h' });
    res.cookie('Authorization', token, { expires: new Date(Date.now() + 300000), httpOnly: true, secure: true });
    res.cookie('role', user[0][0].role, { httpOnly: true, secure: true });
    res
      .status(200)
      .json({ token, message: 'Logged in successfully', user: user[0][0].role, username: user[0][0].username });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
});

const authMiddleware = (req, res, next) => {
  const token = req.cookies['Authorization'];
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });
  try {
    const decoded = jwt.verify(token, mysecret);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

const roleMiddleware = requiredRole => (req, res, next) => {
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
      name: faker.animal.cat(),
      owner: faker.person.fullName(),
      birth: faker.date.birthdate().toISOString().slice(0, 10),
    };
    console.log(row);
    return res.status(200).json(row); // return single object
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

function chooseRandomRole() {
  return Math.random() < 0.5 ? 'admin' : 'user';
}

function getRandomMaritalStatus() {
  const statuses = ['Single', 'Married', 'Divorced', 'Widowed'];
  const randomIndex = Math.floor(Math.random() * statuses.length);
  return statuses[randomIndex];
}

function getRandomCompanyName() {
  const companies = [
    'apple',
    'meta',
    'google',
    'amazon',
    'microsoft',
    'netflix',
    'tesla',
    'spotify',
    'adobe',
    'intel',
    'ibm',
    'oracle',
    'salesforce',
    'uber',
    'airbnb',
  ];
  const randomIndex = Math.floor(Math.random() * companies.length);
  return companies[randomIndex];
}

router.get('/randomUser', (req, res) => {
  try {
    let sex = faker.person.sex();
    let username = faker.person.firstName(sex).toLowerCase();
    let lastname = faker.person.lastName(sex).toLowerCase();
    let company = getRandomCompanyName().toLowerCase();
    let email = `${username}.${lastname}@${company}.com`;
    const row = {
      username: username,
      email: email,
      password: faker.internet.password(),
      role: chooseRandomRole(),
      person: {
        prefix: faker.person.prefix(),
        gender: sex,
        zodiac: faker.person.zodiacSign(),
        avatar: faker.image.personPortrait({ sex: sex }),
        birthdate: faker.date.birthdate().toISOString().slice(0, 10),
        maritalstatus: getRandomMaritalStatus(),
        jobtitle: faker.person.jobTitle(),
        phonenumber: faker.phone.number(),
        middlename: faker.person.middleName(sex),
        lastname: lastname,
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
    console.log(row);
    return res.status(200).json(row); // return single object
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
// GET /users
router.get('/user', async (req, res) => {
  let query =
    'SELECT u.id, u.username, u.email, p.birthdate, p.gender, p.maritalstatus, p.jobtitle, p.phone FROM users u JOIN persons p ON u.id = p.users_Id;';
  try {
    const [rows] = await pool.query(query);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /users/:id
router.get('/user/:id', async (req, res) => {
  let query = `SELECT 
    u.id, u.username, u.email, u.role, u.image_url,
    p.prefix, p.firstname, p.middlename, p.lastname, p.gender, p.birthdate, p.maritalstatus, p.jobtitle, p.phone,
    l.streetAddress, l.city, l.state, l.zipCode, l.latitude
FROM users u
JOIN persons p ON u.id   = p.users_id
JOIN locations l ON p.users_id = l.users_id
WHERE u.id = ?;`;
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
  try {
    const [rows] = await pool.query(query, [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Not found' });
    return res.json(rows[0]); // return single object
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /users
router.post('/user', async (req, res) => {
  const {
    prefix,
    username,
    password,
    email,
    lastname,
    middlename,
    dob,
    gender,
    maritalstatus,
    jobtitle,
    phonenumber,
    streetaddress,
    city,
    state,
    zipcode,
    country,
    latitude,
    longitude,
    timezone,
    image,
  } = req.body || {};
  if (
    ![
      username,
      password,
      email,
      prefix,
      middlename,
      lastname,
      gender,
      dob,
      maritalstatus,
      jobtitle,
      phonenumber,
      streetaddress,
      city,
      state,
      zipcode,
      country,
      latitude,
      longitude,
      timezone,
      image,
    ].every(isValidString)
  ) {
    console.log(req.body);
    return res.status(400).json({ error: 'Missing or invalid fields: name, email, password, role' });
  }
  try {
    const insertId = await createUserWithRelatedData(
      pool,
      { username, password, email, image },
      { prefix, username, middlename, lastname, gender, dob, maritalstatus, jobtitle, phonenumber },
      { streetaddress, city, country, state, zipcode, latitude, longitude, timezone },
    );
    return res.status(201).json({ message: 'Created', insertId: insertId });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err.message });
  }
});

async function createUserWithRelatedData(pool, userData, personData, locationData) {
  try {
    const connection = await pool.getConnection();
    const ubcryptedPassword = await bcrypt.hash(userData.password, 10);
    userData.password = ubcryptedPassword;
    await connection.beginTransaction();
    console.log('Creating user with related data...');
    console.log(userData);
    // Step 1: Insert user (parent)
    const [userResult] = await connection.execute(
      'INSERT INTO users (username, password, email, image_url, role) VALUES (?, ?, ?, ?,?)',
      [userData.username, userData.password, userData.email, userData.image, 'user'],
    );
    const userId = userResult.insertId;
    console.log('Inserted user with ID:', userId);
    console.log(personData);
    // Step 2: Insert person (child)
    await connection.execute(
      'INSERT INTO persons (prefix, firstname, middlename, lastname, gender, birthdate, maritalstatus, jobtitle, phone, users_Id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        personData.prefix,
        personData.username,
        personData.middlename,
        personData.lastname,
        personData.gender,
        personData.dob,
        personData.maritalstatus,
        personData.jobtitle,
        personData.phonenumber,
        userId,
      ],
    );
    console.log('Inserted person for user ID:', userId);

    console.log(locationData);
    // Step 3: Insert location (child)
    await connection.execute(
      'INSERT INTO locations (streetAddress, city, country, state, zipCode, latitude, longitude, timeZone, users_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        locationData.streetaddress,
        locationData.city,
        locationData.country,
        locationData.state,
        locationData.zipcode,
        locationData.latitude,
        locationData.longitude,
        locationData.timezone,
        userId,
      ],
    );
    console.log('Inserted location for user ID:', userId);
    await connection.commit();
    console.log('Transaction committed successfully.');
    await connection.release();
    console.log('User with related data created successfully with ID:', userId);
    return userId;
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}

async function updateUserWithRelatedData(pool, user_id,  userData, personData, locationData) {
  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    console.log('update user with related data...');
    console.log(userData);
    // Step 1: Insert user (parent)
    const [userResult] = await connection.execute(
      `UPDATE users SET username = ?, password = ?, email = ?, image_url = ?, role =?  WHERE id = ?;`,[
        userData.username, userData.password, userData.email, userData.image, userData.role, user_id
      ],
    );
    console.log('Updated user with ID:', userResult.rowsAffected);
    console.log(personData);
    // Step 2: Insert person (child)
    await connection.execute(
      'UPDATE persons SET prefix = ? , firstname = ?, middlename = ?, lastname = ?, gender = ?, birthdate = ?, maritalstatus = ?, jobtitle = ?, phone  = ? Where users_id = ?;',
      [
        personData.prefix,
        personData.username,
        personData.middlename,
        personData.lastname,
        personData.gender,
        personData.dob,
        personData.maritalstatus,
        personData.jobtitle,
        personData.phonenumber,
        user_id
      ],
    );
    console.log('updated person for user ID:', user_id);

    console.log(locationData);
    // Step 3: Insert location (child)
   await connection.execute(
      'UPDATE locations SET streetAddress = ?,  city = ?, country =? , state = ?, zipCode = ?, latitude = ?,  longitude = ?,  timeZone = ? WHERE users_id = ?;',
      [
        locationData.streetaddress,
        locationData.city,
        locationData.country,
        locationData.state,
        locationData.zipcode,
        locationData.latitude,
        locationData.longitude,
        locationData.timezone,
        user_id
      ],
    );
    console.log('Updated location for user ID:', user_id);
    await connection.commit();
    console.log('Transaction committed successfully.');
    await connection.release();
    console.log('User with related data updated successfully with ID:', user_id);
    return user_id;
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}

async function deleteUserWithRelatedData(pool, user_id) {
  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    console.log('deleting user with related data...');
    // Step 1: Insert user (parent)
    await connection.execute(
      `DELETE FROM locations Where users_id = ?`,[user_id],);
    result = await connection.execute('SELECT ROW_COUNT() AS affected_rows;' );
    console.log('deleted locations with ID:', result);
    // Step 2: Insert person (child)
    await connection.execute(
      'DELETE FROM persons Where users_id = ?;',[user_id]
    );
    console.log('deleted person for user ID:', [user_id]);
    result = await connection.execute('SELECT ROW_COUNT() AS affected_rows;' );
    console.log('deleted rows in persons', result[0].affectedRows);
    // Step 3: Insert location (child)
   await connection.execute(
      'DELETE FROM users WHERE id = ?;',[user_id]
    );
    console.log('deleted user for user ID:', user_id);
    result = await connection.execute('SELECT ROW_COUNT() AS affected_rows;' );
    console.log('deleted rows in user', result.affectedRows);
    await connection.commit();
    console.log('Transaction committed successfully.');
    await connection.release();
    console.log('User with related data deleted successfully with ID:', user_id);
    return result;
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}

// PUT /users/:id
router.put('/users/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  console.log(req.body);
  const {
    username,
    password,
    email,
    image,
    role,
    prefix,
    middlename,
    lastname,
    gender,
    dob,
    maritalstatus,
    jobtitle,
    phonenumber,
    streetaddress,
    city,
    country,
    state,
    zipcode,
    latitude,
    longitude,
    timezone,
  } = req.body || {};
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
  if (![username,
    password,
    email,
    image,
    role,
    prefix,
    middlename,
    lastname,
    gender,
    dob,
    maritalstatus,
    jobtitle,
    phonenumber,
    streetaddress,
    city,
    country,
    state,
    zipcode,
    latitude,
    longitude,
    timezone].every(isValidString)) {
    return res.status(400).json({ error: 'Missing or invalid fields' });
  }
  try {
    const resultId = await updateUserWithRelatedData(
      pool,
      id,
      { username, password, email, role, image},
      { prefix, username, middlename, lastname, gender, dob, maritalstatus, jobtitle, phonenumber},
      { streetaddress, city, country, state, zipcode, latitude, longitude, timezone },
    );
    console.log(resultId);
    if (resultId === 0) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json({ message: 'Updated', insertId: resultId });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /users/:id
router.delete('/users/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  try {
    const [result] = await deleteUserWithRelatedData(pool, id);
    console.log(result);
    if (result === 0) return res.status(404).json({ error: 'Not found' });
    return res.json({ message: 'Deleted', affectedRows: result.affectedRows });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/random', [authMiddleware, roleMiddleware('admin')], function (request, response) {
  response.send(randomInteger());
});

router.get('/memorygame', authMiddleware, (req, res) => {
  res.render('random', { title: randomInteger().toString() });
});

router.get('/guess', (req, res) => {
  res.render('guess', { title: 'Guess' });
});

function randomInteger() {
  let randomNumbers = [];
  for (let i = 0; i < 5; i++) {
    randomNumbers.push(Math.floor(Math.random() * 100));
  }
  return randomNumbers;
}

module.exports = router;
