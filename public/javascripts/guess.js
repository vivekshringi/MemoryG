const buttons = document.querySelectorAll('button.num-button');
const numberElement = document.querySelector('.circle-number');
let getRandomNumbers = localStorage.getItem('randomNumbers');
let selectedArrayString = localStorage.getItem('selectedArray');
let selectedNumber = selectedArrayString ? selectedArrayString.split(',') : [];
let getIndex = localStorage.getItem('index');
buttons.forEach((button, index) => {
    let getNumber = button.textContent;
    button.addEventListener('click', () => {
    localStorage.setItem('selected', getNumber);
    selectedNumber[parseInt(getIndex)] = getNumber;
    localStorage.setItem('selectedArray', selectedNumber);
    window.location.href = '/admin';
  });
});

