  /* 
  Author: Sydney Stalker  
  Class: CST 336 - Internet Programming  
  Date: 11/1/2025  
  Assignment: Lab 2 - Sign Up Page 
  File: script.js  
  Abstract: 
  */

  //Event Listeners
  document.querySelector("#zip").addEventListener("change",displayCity);
  document.querySelector("#state").addEventListener("change",displayCounties);
  document.querySelector("#username").addEventListener("change",checkUsername);
  document.querySelector("#signupForm").addEventListener("submit", function(event){
    validateForm(event);
  });

  //Functions

  //Displaying city from web API after entering a zip
  async function displayCity(){
    let zipCode = document.querySelector("#zip").value;
    //console.log(zipCode);
    let url = `https://csumb.space/api/cityInfoAPI.php?zip=${zipCode}`;
    let response = await fetch(url);
    let data = await response.json();
    console.log(data);
    document.querySelector("#city").innerHTML = data.city;
    document.querySelector("#latitude").innerHTML = data.latitude;
    document.querySelector("#longitude").innerHTML = data.longitude;
  }

  //Displaying Counties from web API bases on the two-letter abbreviation of a state
  async function displayCounties(){
    let state = document.querySelector("#state").value;
    let url = `https://csumb.space/api/countyListAPI.php?state=${state}`;
    let response = await fetch(url);
    let data = await response.json();
    let countyList = document.querySelector("#county");

    for(let i=0; i < data.length; i++){
        countyList.innerHTML += `<option> ${data[i].county}</option>`;
    }
  }

  //Check to see if the username is avaliable
  async function checkUsername(){
    let username = document.querySelector("#username").value;
    let url = `https://csumb.space/api/usernamesAPI.php?username=${username}`;
    let response = await fetch(url);
    let data = await response.json();
    let usernameError = document.querySelector("#usernameError");

    if(data.available){
        usernameError.innerHTML = "Username available!";
        usernameError.style.color = "green";
    }else{
        usernameError.innerHTML = "Username taken:(";
        usernameError.style.color = "red";
    }
  }

  //Validating form data
  function validateForm(e){
    let isValid = true;
    let username = document.querySelector("#username").value;
    if(username.length == 0){
        document.querySelector("#usernameError").innerHTML = "Username Required";
        isValid = false;
    } 

    if(!isValid){
        e.preventDefault();   
    }    
  }
