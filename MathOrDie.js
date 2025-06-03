/*
* Bo Jun Xu
* Math Or Die Game
* June 1, 2025
* Sources:
* - https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement
* - https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
* - https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event
* - https://developer.mozilla.org/en-US/docs/Web/API/Element/focus
* - https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout
* - https://developer.mozilla.org/en-US/docs/Web/API/Window/clearInterval
* - https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval
* - https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML
* - https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild
* - https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/ended_event
* - https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
*/
// load audio files for different game events
const cockingAudio = new Audio('cocking.mp3');      // audio for cocking the gun
const gunshotAudio = new Audio('gunFire.mp3');      // audio for gunshot
const failedShotAudio = new Audio('failedFire.mp3'); // audio for failed shot

// enitialize game state variables
let correctAnswer = null;        // stores the correct answer to the current equation
let timerInterval = null;        // reference to the timer interval for clearing
let score = 0;                   // player's current score
let rouletteInProgress = false;  // flag to prevent multiple roulette rounds at once

// generates a random math equation and sets the correct answer
function generateRandomEquation() {
    const operators = ['+', '-', '*', '/']; // possible operators
    const num1 = Math.floor(Math.random() * 10) + 1; // random number 1-10
    const num2 = Math.floor(Math.random() * 10) + 1; // random number 1-10
    const operator = operators[Math.floor(Math.random() * operators.length)]; // random operator

    let equation;
    // build equation string and set correct answer based on operator
    switch (operator) {
        case '+':
            equation = `${num1} + ${num2}`;
            correctAnswer = num1 + num2;
            break;
        case '-':
            equation = `${num1} - ${num2}`;
            correctAnswer = num1 - num2;
            break;
        case '*':
            equation = `${num1} * ${num2}`;
            correctAnswer = num1 * num2;
            break;
        case '/':
            equation = `${num1} / ${num2}`;
            correctAnswer = Math.round(num1 / num2); // rounded division
            break;
    }
    return equation; // return the equation as a string
}
// shows only the specified section of the game
function showSection(sectionId) {
    const sections = ['main-menu', 'game-section', 'tutorial-section', 'roulette-section']; // all sections of the program
    for (let i=0; i < sections.length; i++) {
        const el = document.getElementById(sections[i]); // get section element
        if (el) {
            if (sections[i] === sectionId) {
                el.style.display = 'block'; // show the specified section
            } else {
                el.style.display = 'none'; // hide all other sections
            }
        }
    }
}
// starts a new game session
function startGame() {
    score = 0; // reset score
    document.getElementById('score').textContent = score; // update score display
    document.getElementById('answer').value = ''; // clear answer input
    document.getElementById('result').textContent = ''; // clear result message
    showSection('game-section'); // show game section
    showEquation(); // show first equation
    startTimer(3); // start timer
    document.getElementById('answer').focus(); // focus answer input
}
// displays a new equation on the page
function showEquation() {
    document.getElementById('submit-button').disabled = false; // ensure submit is enabled
    let actualEquation = generateRandomEquation(); // generate equation and set correctAnswer
    let questionP = document.getElementById('question'); // get question element
    if (questionP) {
        questionP.textContent = actualEquation; // display equation
    }
}
// starts the countdown timer for answering
function startTimer(duration/* seconds */) {
    const timerBar = document.getElementById('timer-bar'); // get timer bar element
    timerBar.innerHTML = ""; // clear timer bar
    const timerFill = document.createElement('div'); // create fill element
    timerBar.appendChild(timerFill); // add fill to timer bar
    timerFill.style.width = '100%'; // start at full width
    const interval = 10; // timer update interval (ms)
    const decrement = 100 / (duration * 1000 / interval); // amount to decrease per tick

    let currentWidth = 100; // start at 100%

    if (timerInterval) {
        clearInterval(timerInterval); // clear any existing timer
    } 
    timerInterval = setInterval(() => { // start new timer
        currentWidth -= decrement; // decrease width
        if (currentWidth <= 0) { // if time runs out
            currentWidth = 0;
            clearInterval(timerInterval); // stop timer
            playRoulette(); // start roulette
        }
        timerFill.style.width = currentWidth + '%'; // update fill width
    }, interval);
}
// checks the users answer when submitted
function checkAnswer() {
    const submitBtn = document.getElementById('submit-button'); // get submit button
    // if submit button is disabled, do not check answer
    if (submitBtn.disabled) {
        return; // prevent spamming enter when answer is correct
    }
    // if roulette is in progress, do not check answer
    if (rouletteInProgress) {
        return; // prevent checking answer during roulette
    }
    const answerInput = document.getElementById('answer'); // get answer input box
    const inputValue = answerInput.value.trim(); // get and trim input value
    if (inputValue === "") { // if input is empty, treat as incorrect
        clearInterval(timerInterval); // stop timer
        localStorage.setItem('score', score); // save score
        playRoulette(); // start roulette
        return;
    }
    let userAnswer = Number(inputValue); // convert input to number
    if (userAnswer === correctAnswer) { // if correct
        clearInterval(timerInterval); // stop timer
        score++; // increment score
        document.getElementById('score').textContent = score; // update score display
        document.getElementById('result').textContent = "Correct!"; // show correct message
        document.getElementById('submit-button').disabled = true; // disable submit button to prevent free points
        setTimeout(() => { // after a short delay
            document.getElementById('result').textContent = ""; // clear result message
            showEquation(); // show new equation
            answerInput.value = ''; // clear input
            answerInput.focus(); // focus input
            document.getElementById('submit-button').disabled = false; // re-enable submit button
            startTimer(3); // restart timer
        }, 1200);
    } else { // if incorrect
        clearInterval(timerInterval); // stop timer
        localStorage.setItem('score', score); // save score
        playRoulette(); // start roulette
    }
}
// handles the russian roulette sequence after a wrong answer or timeout
function playRoulette() {
    if (rouletteInProgress) {
        return;// prevent multiple roulettes from happening at the same time
    }
    rouletteInProgress = true; // set flag

    showSection('roulette-section'); // show roulette section
    document.getElementById('fire').style.display = 'none'; // hide fire button
    document.getElementById('play-again').style.display = 'none'; // hide play again button
    const finalScoreDiv = document.getElementById('final-score'); // get final score element
    finalScoreDiv.style.display = 'none'; // hide final score
    const nextQuestionBtn = document.getElementById('next-question'); // get next question button
    nextQuestionBtn.style.display = 'none'; // hide next question button
    nextQuestionBtn.disabled = true; // disable next question button

    cockingAudio.currentTime = 0; // reset cocking audio
    cockingAudio.play(); // play cocking sound

    setTimeout(function() { // after cocking sound
        if (Math.floor(Math.random() * 3) === 0) { // 1 in 3 chance of death
            document.getElementById('fire').style.display = 'block'; // show fire
            document.getElementById('play-again').style.display = 'block'; // show play again button
            finalScoreDiv.textContent = `Final Score: ${score}`; // show final score
            finalScoreDiv.style.display = 'block'; // display final score
            gunshotAudio.currentTime = 0; // reset gunshot audio
            gunshotAudio.play(); // play gunshot sound
            gunshotAudio.onended = function() { // after sound ends
                rouletteInProgress = false; // allow new roulette
            };
        } else { // survived
            finalScoreDiv.style.display = 'none'; // hide final score
            failedShotAudio.currentTime = 0; // reset failed shot audio
            failedShotAudio.play(); // play failed shot sound
            failedShotAudio.onended = function() { // after sound ends
                nextQuestionBtn.style.display = 'block'; // show next question button
                nextQuestionBtn.disabled = false; // enable next question button
                rouletteInProgress = false; // allow new roulette
            };
        }
    }, 1000); // wait 1 second after cocking
}
// moves to the next question after surviving roulette
function nextQuestionAfterRoulette() {
    showSection('game-section'); // show game section
    showEquation(); // show new equation
    startTimer(3); // start timer
    document.getElementById('answer').value = ''; // clear answer input
    document.getElementById('result').textContent = ''; // clear result message
    document.getElementById('answer').focus(); // focus answer input
}

// runs when the page loads
window.onload = function () {
    showSection('main-menu'); // show main menu
    document.getElementById('submit-button').onclick = checkAnswer; // set submit button handler
    document.getElementById('answer').onkeydown = function (e) { // set Enter key handler
        // if the user presses enter in the input field, automatically check the answer
        if (e.key === "Enter") {
            checkAnswer();
        }
    };
};
