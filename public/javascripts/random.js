let randomNumbers = [];
let index = 0;
let selectedNumber = [0, 0, 0, 0, 0];
const circle = document.querySelector('.circle');
const p = document.querySelector('p');
function loadText(elem, text) {
  elem.textContent = text;
}

function requestData() {
  fetch('/admin/random') 
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.status);
      }
      return response.json(); 
    })
    .then(data => {
      randomNumbers = data;
      console.log('API response data:', randomNumbers);
    })
    .catch(error => {
      console.error('Fetch error:', error);
    });
}

function countOccurrences(arr, val) {
  return arr.reduce((a, v) => (v === val ? a + 1 : a), 0);
}

function convertToArray(str) {
  return str ? str.split(',') : [];
}

function convertToInt(str) {
  return parseInt(str); 
}

function getStorageItem(key) {
  return localStorage.getItem(key);
}

function setStorageItem(key, value) {
  return localStorage.setItem(key, value);
}

window.addEventListener('DOMContentLoaded', function () {
  let getRandomNumbers = getStorageItem('randomNumbers');
  let getSelected = getStorageItem('selected');
  let getIndex = getStorageItem('index');
  if (getSelected && getIndex && getRandomNumbers) {
    let randomNumbers = convertToArray(getRandomNumbers);
    let getIndexInt = convertToInt(getIndex);
    console.log('Loaded from localStorage:', getSelected, getIndex, randomNumbers[getIndexInt]);
    let selectedArrayString = this.localStorage.getItem('selectedArray');
    selectedNumber = convertToArray(selectedArrayString);
    correctGuess = randomNumbers[getIndexInt];
    if (getSelected === correctGuess) {
      circle.textContent = 'Correct!';
      console.log('Correct!');
    } else {
      circle.textContent = 'Wrong!';
      console.log('InCorrect!');
    }
   selectedNumber.forEach((num, i) => {
      if (selectedNumber[i]!= 0) {
        buttons[i].textContent = selectedNumber[i];
        if(selectedNumber[i] === randomNumbers[i]) {
          buttons[i].style.backgroundColor = 'green';
          buttons[i].disabled = true;
          console.log(`Button ${buttons[i]} text set to:`+ selectedNumber[i] + 'Correct');
        } else {
          buttons[i].style.backgroundColor = 'red';
          p.textContent = `The correct number was ${randomNumbers[i]}.`;
          buttons[i].disabled = true;
          console.log(`Button ${buttons[i]} text set to:`+ selectedNumber[i] + ' Wrong');
        }
         buttons[i].textContent = selectedNumber[i];
         this.setTimeout(() => {
          if (countOccurrences(selectedNumber, '0') > 0) {
           p.textContent = `You have ${countOccurrences(selectedNumber, '0')} more to guess!`;
         }
          else{
          circle.textContent = 'Click!';  
          p.textContent = 'Game Over! Click to Restart if you want to play again.';
          }
        }, 2000);
        }
    });
    index = randomNumbers.length;
    console.log('Final index set to:', index);
  } else {
    requestData();
  }
});

circle.addEventListener('click', function () {
   console.log('Click index to:', index);
  if (index < 5) {
    circle.innerHTML = randomNumbers[index];
    p.textContent = `${countOccurrences(selectedNumber) < 4 ? 'Remember this number and click again!' : 'This is the last number, click again!'}  You have seen ${index + 1} out of 5 numbers.`;
    index++;
  } 
  else if (countOccurrences(selectedNumber, 0) === 0) {
       localStorage.clear();
       window.location.href = '/admin';
  }
  else {
    circle.textContent = 'Guess!';
        p.textContent = `Click one of the buttons below to select the number you remember in squence.`;
    localStorage.setItem('randomNumbers', randomNumbers);
  }
});

const buttons = document.querySelectorAll('.button-group button');
buttons.forEach((button, buttonIndex) => {
  button.addEventListener('click', () => {
    if (index < 5) {
      console.error('Try to see random number first!');
      console.error(index);
    }
   else {
      console.log('selected number:', selectedNumber);
      setStorageItem('index', buttonIndex);
      setStorageItem('selectedArray', selectedNumber);
      window.location.href = '/admin/guess';
    }
  });
});
