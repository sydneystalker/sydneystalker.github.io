//   Author: Sydney Stalker  
//   Class: CST 336 - Internet Programming  
//   Date: 11/12/2025  
//   Assignment: HW2 - US Geography Quiz 
//   File: script.js  
//   Abstract: Grades a 10-question US Geography quiz—validates inputs, shuffles choices,
//   updates feedback with icons, computes score, and tracks attempts via localStorage. 

//Event Listener
document.querySelector("button").addEventListener("click", gradeQuiz);

//Global Variables
var score = 0;
var attempts = Number(localStorage.getItem("total_attempts")) || 0;
const POINTS_PER_Q = 10;

displayQ4Choices();
displayQ7Choices();

//Functions
function displayQ4Choices(){
  let arr = _.shuffle(["Maine","Rhode Island","Maryland","Delaware"]);
  const wrap = document.querySelector("#q4Choices");
  wrap.innerHTML = "";
  arr.forEach(val => {
    const id = `q4_${val.replace(/\s+/g, "_")}`;
    wrap.innerHTML +=
      ` <input type="radio" name="q4" id="${id}" value="${val}">
        <label for="${id}">${val}</label>`;
  });
}

function displayQ7Choices(){
  let arr = _.shuffle(["Virginia","Ohio","New York","Massachusetts"]);
  const wrap = document.querySelector("#q7Choices");
  wrap.innerHTML = "";
  arr.forEach(val => {
    const id = `q7_${val.replace(/\s+/g, "_")}`;
    wrap.innerHTML +=
      ` <input type="radio" name="q7" id="${id}" value="${val}">
        <label for="${id}">${val}</label>`;
  });
}

function isFormValid() {
    let missing = [];

    // Question 1 (text)
    if (document.querySelector("#q1").value.trim() === "") missing.push(1);

    // Question 2 (select)
    if (document.querySelector("#q2").value === "") missing.push(2);

    // Question 3 (checkboxes)
    if (
        !document.querySelector("#Jackson").checked &&
        !document.querySelector("#Franklin").checked &&
        !document.querySelector("#Jefferson").checked &&
        !document.querySelector("#Roosevelt").checked
    ) missing.push(3);

    // Question 4 (radio)
    if (!document.querySelector("input[name=q4]:checked")) missing.push(4);

    // Question 5 (number)
    if (document.querySelector("#q5").value === "") missing.push(5);

    // Question 6 (dropdown)
    if (document.querySelector("#q6").value === "") missing.push(6);

    // Question 7 (radio)
    if (!document.querySelector("input[name=q7]:checked")) missing.push(7);

    // Question 8 (datalist/text)
    if (document.querySelector("#q8").value.trim() === "") missing.push(8);

    // Question 9 (number)
    if (document.querySelector("#q9").value === "") missing.push(9);

    // Question 10 (checkboxes)
    if (
        !document.querySelector("#Michigan").checked &&
        !document.querySelector("#Montana").checked &&
        !document.querySelector("#Alaska").checked &&
        !document.querySelector("#Ohio").checked
    ) missing.push(10);

    // Display message if any unanswered
    if (missing.length > 0) {
        document.querySelector("#validationFdbk").innerHTML =
            "Please answer all questions before submitting.";
        return false;
    }

    document.querySelector("#validationFdbk").innerHTML = "";
    return true;
}

//Right Answer
function rightAnswer(index){
    document.querySelector(`#q${index}Feedback`).innerHTML = "Correct!";
    document.querySelector(`#q${index}Feedback`).className = "bg-success text-white";
    document.querySelector(`#markImg${index}`).innerHTML = "<img src= 'img/checkmark.png' alt='Checkmark'>";
    score += POINTS_PER_Q;
}

//Wrong Answer
function wrongAnswer(index){
    document.querySelector(`#q${index}Feedback`).innerHTML = "Incorrect!";
    document.querySelector(`#q${index}Feedback`).className = "bg-success text-white";
    document.querySelector(`#markImg${index}`).innerHTML = "<img src= 'img/xmark.png' alt='Xmark'>";
}

function gradeQuiz(){
 console.log("Grading quiz…");
 document.querySelector("#validationFdbk").innerHTML = "";
if(!isFormValid()){
 return;
}

//Variables
score = 0;
let q1Response = document.querySelector("#q1").value.toLowerCase();
let q2Response = document.querySelector("#q2").value;
let q4Response = document.querySelector("input[name=q4]:checked").value;
let q5Response = parseInt(document.querySelector("#q5").value);
let q6Response = document.querySelector("#q6").value;
let q7Selected = document.querySelector("input[name=q7]:checked");
let q8Response = document.querySelector("#q8").value.trim().toLowerCase();
let q9Response = parseInt(document.querySelector("#q9").value);



//Grading question 1
if(q1Response == "sacramento"){
    rightAnswer(1); 
}else{
    wrongAnswer(1);
}

//Grading question 2
if(q2Response == "mo"){
    rightAnswer(2); 
}else{
    wrongAnswer(2);
}

//Grading question 3
if(document.querySelector("#Jefferson").checked && 
document.querySelector("#Roosevelt").checked &&
!document.querySelector("#Jackson").checked && 
!document.querySelector("#Franklin").checked){
    rightAnswer(3); 
}else{
    wrongAnswer(3);
}

//Grading question 4
if(q4Response == "Rhode Island"){
    rightAnswer(4); 
}else{
    wrongAnswer(4);
}

//Grading question 5
if (q5Response === 4) { // California, Arizona, New Mexico, Texas
  rightAnswer(5);
} else {
  wrongAnswer(5);
}

//Grading question 6
if (q6Response === "1959") {
  rightAnswer(6);
} else {
  wrongAnswer(6);
}

//Grading question 7 
if (q7Selected && q7Selected.value === "Virginia") {
  rightAnswer(7);
} else {
  wrongAnswer(7);
}

//Grading question 8
if (q8Response === "lake superior") {
  rightAnswer(8);
} else {
  wrongAnswer(8);
}

//Grading question 9
if (q9Response === 27) { // 27 U.S. states are landlocked
  rightAnswer(9);
} else {
  wrongAnswer(9);
}

//Grading question 10
if (document.querySelector("#Michigan").checked &&
  document.querySelector("#Montana").checked &&
  document.querySelector("#Alaska").checked &&
  !document.querySelector("#Ohio").checked
) {
  rightAnswer(10);
} else {
  wrongAnswer(10);
}


//Display total score and attempts
document.querySelector("#totalScore").innerHTML = `Total Score: ${score}`; 
document.querySelector("#totalAttempts").innerHTML = `Total Attempts: ${++attempts}`;
localStorage.setItem("total_attempts", attempts);

//Change score color based on performance
const scoreEl = document.querySelector("#totalScore");
scoreEl.classList.remove("text-info", "text-success", "text-danger");

if (score < 80) {
    scoreEl.classList.add("text-danger"); 
    scoreEl.innerHTML += "<br>Keep practicing!";
} else {
    scoreEl.classList.add("text-success");
    scoreEl.innerHTML += "<br>🎉 Great job! You passed!";
}


}


