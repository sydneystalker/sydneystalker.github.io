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

let q1Response = document.querySelector("#q1").value;
 console.log(q1Response);


}


