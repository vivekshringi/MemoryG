var express = require('express');
var router = express.Router();
var mysql = require('mysql2');

// Create a connection pool (recommended for production)
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'pets',
});

// Example route to query the database
router.get('/users', (req, res) => {
  pool.query('SELECT * FROM cats', (error, results) => {
    if (error) return res.status(500).json({ error });
    console.error(res.json(results));
  });
  console.log('Database queried for all users');
});

router.get('/users/:id', (req, res) => {
  pool.query(`SELECT * FROM cats where id =${id}`, (error, results) => {
    if (error) return res.status(404).json({ error });
    console.error(res.json(results));
  });
});


router.post('/users', (req, res) => {
  let data = req.body;
  pool.query(
    'INSERT INTO cats (name, owner, birth) VALUES (?, ?, ?)',
    [data.name, data.owner, data.birth],
    (error, results) => {
      if (error) {
        console.log(error);
        console.log(results);
        res.status(error.status);
        res.render('error');
      }
    },
  );
});

router.put('/users', (req, res) => {
  let data = req.body;
  pool.query(
    'UPDATE cats SET name = ?, owner = ? birth =? WHERE CustomerID = (SELECT ID from cats WHERE name = ?)',
    [data.name, data.owner, data.birth, data.name],
    (error, results) => {
      if (error) return res.status(500).json({ error });
      console.error(res.json(results));
    },
  );
});

router.delete('/users', (req, res) => {
  let data = req.body;
  pool.query('DELETE FROM cats where name = ?', data.name, (error, results) => {
    if (error) res.locals.message = error.message;
    // render the error page
    res.status(error.status);
    res.render('error');
  });
});
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});




module.exports = router;
