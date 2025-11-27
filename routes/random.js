var express = require('express');
var router = express.Router();

router.get('/random', function (request, response) {
  response.send(randomInteger());
});

router.get('/', (req, res) => {
  res.render('random', { title: randomInteger().toString() });
});

router.get('/guess', (req, res) => {
  res.render('guess', { title: 'Guess' });
});


function randomInteger() {
  let randomNumbers = [];
  for (let i = 0; i < 5; i++) {
   randomNumbers.push(Math.floor((Math.random() * 100)));
  }  
return randomNumbers;
}

module.exports = router;
