// Author: Sydney Stalker 
// Class: CST 336 Internet Programming
// Date: 11/10/2025
// Assignment: Lab 2 - Guess the Number
// File: scripts.js
// Abstract: This script controls the game logic for "Guess the Number." It generates a random number,
// tracks player attempts, and provides feedback on each guess. It also updates the number
// of attempts left, total wins and losses, and manages game reset functionality and keyboard input.


//Event Listeners
document.querySelector("#guessBtn").addEventListener("click", checkGuess);
document.querySelector("#resetBtn").addEventListener("click", initializeGame);
document.querySelector("#guessBtn").addEventListener("click", checkGuess);
document.querySelector("#resetBtn").addEventListener("click", initializeGame);


let input = document.querySelector("#playerGuess");
input.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();  
    checkGuess();           
  }
});

//Global variables
let randomNumber;
let attempts = 0;
let maxAttempts = 7;
let wins = 0;
let losses = 0;

initializeGame();

function initializeGame() {
    randomNumber = Math.floor(Math.random() * 99) + 1;
    console.log("randomNumber: " + randomNumber);
    attempts = 0;

    //Hide Reset, show Guess
    document.querySelector("#resetBtn").style.display = "none";
    document.querySelector("#guessBtn").style.display = "inline";
    document.querySelector("#playerGuess").disabled = false;

    //Clear input, feedback, and guesses
    let playerGuess = document.querySelector("#playerGuess");
    playerGuess.value = "";
    playerGuess.focus();

    let feedback = document.querySelector("#feedback");
    feedback.textContent = "";

    document.querySelector("#guesses").textContent = "";

    //Show attempts left
    document.querySelector("#attemptsLeft").textContent = maxAttempts - attempts;

    //Update scoreboard display
    updateScoreboard();
}


function checkGuess(){
    let feedback = document.querySelector("#feedback");
    feedback.textContent = "";

    let guess = document.querySelector("#playerGuess").value;
    console.log("Player guess: " + guess);

    if(isNaN(guess) || guess < 1 || guess > 99){
        feedback.textContent = "Enter a number between 1 and 99";
        feedback.style.color = "red";       
        return;
    }

    attempts++;
    console.log("Attempts: " + attempts);
    feedback.style.color = "orange";

    if(guess == randomNumber){
        feedback.textContent = "You Won! :)";
        feedback.style.color = "darkgreen";
        wins++;
        gameOver();
    }else{
        document.querySelector("#guesses").textContent += guess + " ";
        if (attempts === maxAttempts){
            feedback.textContent = "Sorry, you lost:("
            feedback.style.color = "red";
            losses++;
            gameOver();
        }else if(guess > randomNumber){
            feedback.textContent = "Guess was high."
        }else{
            feedback.textContent = "Guess was low."
        }
    }

    //Update attempts left
    document.querySelector("#attemptsLeft").textContent = maxAttempts - attempts;
}

function gameOver(){
    let guessBtn = document.querySelector("#guessBtn"); 
    let resetBtn = document.querySelector("#resetBtn"); 
    guessBtn.style.display = "none";
    resetBtn.style.display = "inline";
    document.querySelector("#playerGuess").disabled = true;

    updateScoreboard();
}

function updateScoreboard() {
    document.querySelector("#wins").textContent = wins;
    document.querySelector("#losses").textContent = losses;
}


