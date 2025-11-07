//   Author: Sydney Stalker  
//   Class: CST 336 - Internet Programming  
//   Date: 11/12/2025  
//   Assignment: HW2 - US Geography Quiz 
//   File: script.js  
//   Abstract:



//Event Listener
document.querySelector("button").addEventListener("click", gradeQuiz);


function gradeQuiz(){
 console.log("Grading quiz…");
 let q1Response = document.querySelector("#q1").value;
 console.log(q1Response);
}


