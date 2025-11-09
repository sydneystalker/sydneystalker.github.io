//   Author: Sydney Stalker  
//   Class: CST 336 - Internet Programming  
//   Date: 11/12/2025  
//   Assignment: HW2 - US Geography Quiz 
//   File: script.js  
//   Abstract:



//Event Listener
document.querySelector("button").addEventListener("click", gradeQuiz);

//Functions
function isFormValid(){
    let isValid = true;
    if(document.querySelector("#q1").value == ""){
        isVaild = false;
        document.querySelector("#validationFdbk").innerHTML = "Question 1 was not answered";
    }
    return isValid;
}


function gradeQuiz(){
 console.log("Grading quiz…");
 document.querySelector("#validationFdbk").innerHTML = "";
if(!isFormValid()){
 return;
}

//Variables
let score = 0;
let q1Response = document.querySelector("#q1").value.toLowerCase();
let q2Response = document.querySelector("#q2").value;
console.log(q2Response);

//Grading question 1
if(q1Response == "sacramento"){
    document.querySelector("#q1Feedback").innerHTML = "Correct!";
    document.querySelector("#q1Feedback").className = "bg-success text white";
    document.querySelector("#markImg1").innerHTML = "<img src= 'img/checkmark.png' alt='Checkmark'>";
    score +=20;
}else{
    document.querySelector("#q1Feedback").innerHTML = "Incorrect!";
    document.querySelector("#q1Feedback").className = "bg-warning text white";
    document.querySelector("#markImg1").innerHTML = "<img src= 'img/xmark.png' alt='Xmark'>";
}

//Grading question 2
if(q2Response == "mo"){
    document.querySelector("#q2Feedback").innerHTML = "Correct!";
    document.querySelector("#q2Feedback").className = "bg-success text white";
    document.querySelector("#markImg2").innerHTML = "<img src= 'img/checkmark.png' alt='Checkmark'>";
    score +=20;
}else{
    document.querySelector("#q2Feedback").innerHTML = "Incorrect!";
    document.querySelector("#q2Feedback").className = "bg-warning text white";
    document.querySelector("#markImg2").innerHTML = "<img src= 'img/xmark.png' alt='Xmark'>";
}





document.querySelector("#totalScore").innerHTML = `Total Score: ${score}`; 


}


