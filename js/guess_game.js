'use strict';
const LOWER_LIMIT = 1;
const UPPER_LIMIT = 100;
const UPPER_LIMIT_MAX = 10000;

const upperLimitInput = document.getElementById('upper-limit');
const upperLimitMax = isValid(upperLimitInput.max, LOWER_LIMIT + 1, Infinity) ?
  +upperLimitInput.max : UPPER_LIMIT_MAX;
console.log('Max possible upper limit is: ' + upperLimitMax);

const errorMessage = document.getElementsByClassName('error-message')[0];
errorMessage.textContent += ' ' + upperLimitMax;

let upperLimit;
if (isValid(upperLimitInput.value, LOWER_LIMIT + 1, upperLimitMax)) {
  upperLimit = upperLimitInput.value;
} else {
  upperLimitInput.value = upperLimit = UPPER_LIMIT;
}

const upperLimitText = document.getElementsByClassName('upper-limit-text')[0];
upperLimitText.textContent = 'до ' + upperLimit + '.';

const startBtn = document.getElementsByClassName('start-btn')[0];

upperLimitInput.addEventListener('input', function () {
  if (isValid(this.value, LOWER_LIMIT + 1, upperLimitMax)) {
    upperLimit = +this.value;
    console.log('User set upper limit to: ' + upperLimit);

    upperLimitText.textContent = 'до ' + upperLimit + '.';
    errorMessage.classList.add('error-hidden');
    startBtn.removeAttribute('disabled');
  } else {
    console.log('Upper limit is invalid! Input value: ' + this.value);

    errorMessage.classList.remove('error-hidden');
    startBtn.setAttribute('disabled', 'disabled');
  }
});

const startBlock = document.getElementsByClassName('start-block')[0];
let game;
const userGuessInput = document.getElementById('user-guess');
const guessError = document.getElementsByClassName('guess-error')[0];
const leftAttempts = document.getElementsByClassName('left-attempts')[0];
const guessBtn = document.getElementsByClassName('guess-btn')[0];

startBtn.addEventListener('click', function () {
  if (this.hasAttribute('disabled')) return;

  startBlock.classList.add('transparent');
  console.log('Class .transparent added to start-block');

  game = new Game(LOWER_LIMIT, upperLimit);
  console.log('New game started (constructor): ' + game.__proto__.constructor.name);

  leftAttempts.textContent = 'Осталось попыток: ' + game.leftAttempts();
  userGuessInput.max = game.getUpperLimit();
  guessError.textContent += ' ' + game.getUpperLimit();

  if (!isValid(userGuessInput.value, game.getLowerLimit(), game.getUpperLimit())) {
    guessBtn.setAttribute('disabled', 'disabled');
    guessError.classList.remove('error-hidden');
  }

});

const gameBlock = document.getElementsByClassName('game-block')[0];
startBlock.addEventListener('transitionend', function (event) {
  if (this !== event.target) return;

  this.classList.add('hide');
  console.log('Start-block trasition finished. Class .hide added to start-block');

  gameBlock.classList.remove('hide');
  console.log('Class .hide removed from game-block');

  // без setTimeout не происходит плавного появления
  setTimeout(function () {
    gameBlock.classList.remove('transparent');
    console.log('Class .transparent removed from game-block');
  }, 0);
});

userGuessInput.addEventListener('input', function () {
  if (isValid(this.value, game.getLowerLimit(), game.getUpperLimit())) {
    guessBtn.removeAttribute('disabled');
    guessError.classList.add('error-hidden');

    console.log('Your guess will be: ' + this.value);
  } else {

    console.log('Guess is invalid! Input value: ' + this.value);

    guessBtn.setAttribute('disabled', 'disabled');
    guessError.classList.remove('error-hidden');
  }
});

const promptingText = document.getElementsByClassName('prompting-text')[0];
const pic = document.getElementsByClassName('pic')[0];
const restartBtn = document.getElementsByClassName('restart-btn')[0];
guessBtn.addEventListener('click', function () {
  if (this.hasAttribute('disabled')) return;

  let result = game.nextRound(+userGuessInput.value);
  console.log('Round result: ' + result + '. Attempts left: ' + ' ' + game.leftAttempts());

  leftAttempts.textContent = 'Осталось попыток: ' + game.leftAttempts();
  let randPath = './images/cat' + randInt(1, 4) + '.jpg';
  console.log('Random cat picture: ' + randPath);

  function prepareRestart() {
    guessBtn.classList.add('hide');
    document.getElementsByClassName('user-guess-wrapper')[0].classList.add('hide');
    leftAttempts.classList.add('hide');
    restartBtn.classList.remove('hide');
  }

  switch (result) {
    case 'lose':
      promptingText.textContent = 'Очень жаль, но ты проиграл. Не хочешь попробовать еще раз?';
      pic.setAttribute('src', './images/cat-loser.jpg');
      prepareRestart();
      break;

    case 'win':
      promptingText.textContent = 'Невероятно \u2014 ты победил! Но может проверишь удачу еще разок?';
      pic.setAttribute('src', './images/cat-winner.jpg');
      prepareRestart();
      break;

    case 'greater':
      promptingText.textContent = 'Ха-ха \u2014 не угадал! Загаданное число больше.'
      pic.setAttribute('src', randPath);
      break;

    case 'less':
      promptingText.textContent = 'Ха-ха \u2014 не угадал! Загаданное число меньше.'
      pic.setAttribute('src', randPath);
      break;
  }
});

restartBtn.addEventListener('click', function () {
  location.reload();
});

function isValid(value, min, max) {
  return !isNaN(parseFloat(value))
    && Number.isInteger(+value)
    && +value >= min
    && +value <= max;
}

function randInt(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function Game(lowerLimit, upperLimit) {
  console.log('Game function called');

  const secret = randInt(lowerLimit, upperLimit);
  let numOfAttempts = Math.ceil(Math.log(upperLimit - lowerLimit + 1) / Math.LN2);

  console.log('Secret number generated: ' + secret);
  console.log('Number of attempts: ' + numOfAttempts);

  this.nextRound = function (guess) {
    if (numOfAttempts > 0) numOfAttempts--;
    else return 'lose';

    if (numOfAttempts === 0 && secret !== guess) return 'lose';
    if (secret === guess) return 'win';
    if (secret > guess) return 'greater';
    if (secret < guess) return 'less';
  };

  this.leftAttempts = () => numOfAttempts;
  this.getLowerLimit = () => lowerLimit;
  this.getUpperLimit = () => upperLimit;
};
