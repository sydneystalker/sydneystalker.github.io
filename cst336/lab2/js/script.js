  /* 
  Author: Sydney Stalker  
  Class: CST 336 - Internet Programming  
  Date: 11/16/2025  
  Assignment: Lab 2 - Sign Up Page 
  File: script.js  
  Abstract: Implements interactive behavior for the Sign Up page. Uses CSUMB Web APIs to display 
  city and coordinates based on ZIP, load all U.S. states on page load, and update counties 
  when a state is selected. Checks username availability, validates password length (≥6) and 
  matching fields, and shows a "ZIP code not found" message when necessary. Includes a 
  password suggestion feature and an inclusive gender selection that reveals a self-describe 
  input when chosen. 
  */

  //Event Listeners
  document.querySelector("#zip").addEventListener("change",displayCity);
  document.querySelector("#state").addEventListener("change",displayCounties);
  document.querySelector("#username").addEventListener("input", checkUsername);
  document.querySelector("#signupForm").addEventListener("submit", function(event){
    validateForm(event);
  });
  document.querySelector("#retypePassword").addEventListener("input", validateForm);
  document.querySelector("#password").addEventListener("focus", displaySuggestedPassword);

    document.querySelectorAll('input[name="gender"]').forEach(r => {
    r.addEventListener('change', () => {
        let show = r.value === 'self';
        document.getElementById('genderSelfWrap').style.display = show ? 'inline-flex' : 'none';
    });
    });


  //Functions

  //Displaying city from web API after entering a zip
  //1) City, longitude and latitude are updated when entering a zip code (10 pts)
  //2) A "Zip code not found" message is displayed next to its text box, if that's the case (10 pts)
  async function displayCity(){
    let zipCode = document.querySelector("#zip").value;
    let zipError = document.querySelector("#zipError");
    let url = `https://csumb.space/api/cityInfoAPI.php?zip=${zipCode}`;
    let response = await fetch(url);
    let data = await response.json();
    console.log(data);

    zipError.innerHTML = "";

    if (!data.city) {
        zipError.innerHTML = "Zip code not found.";
        zipError.style.color = "red";
        document.querySelector("#city").innerHTML = "";
        document.querySelector("#latitude").innerHTML = "";
        document.querySelector("#longitude").innerHTML = "";
    } else {
        document.querySelector("#city").innerHTML = data.city;
        document.querySelector("#latitude").innerHTML = data.latitude;
        document.querySelector("#longitude").innerHTML = data.longitude;
    }
  }

  //Displaying Counties from web API bases on the two-letter abbreviation of a state
  // 3) The list of counties is updated properly when selecting a State (10 pts)
async function displayCounties(){
  let state = document.querySelector("#state").value.toUpperCase();
  let countyList = document.querySelector("#county");
  countyList.innerHTML = '<option value="">Select a county</option>'; 

  let url = `https://csumb.space/api/countyListAPI.php?state=${state}`;
  let response = await fetch(url);
  let data = await response.json();
  for (let i = 0; i < data.length; i++) {
    countyList.innerHTML += `<option value="${data[i].county}">${data[i].county}</option>`;
  }
}

  //Displaying list of all US states when the page loads
  // 6) When the page loads, the list of all US states is displayed in the dropdown menu (10pts)
    async function displayStates() {
    let url = "https://csumb.space/api/allStatesAPI.php";
    let response = await fetch(url);
    let data = await response.json();

    let stateList = document.querySelector("#state");
    stateList.innerHTML = '<option value="">Select One</option>'; 

    for (let i = 0; i < data.length; i++) {
        stateList.innerHTML += `<option value="${data[i].usps.toLowerCase()}">${data[i].state}</option>`;
    }
    }


displayStates();



  //Check to see if the username is avaliable
  //4) Upon typing the username, a color-coded message indicates whether it is available or not (10 pts)
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
    function validateForm(e) {
    let isValid = true;

    // Username validation
    let username = document.querySelector("#username").value;
    if (username.length === 0) {
        document.querySelector("#usernameError").innerHTML = "Username required.";
        isValid = false;
    }

    // Password validation
    // 8) There is validation for Password having at least 6 characters   (10 pts)
    // 9) There is validation for Password matching "Retype Password"  (10 pts)
    let password = document.querySelector("#password").value;
    let retype = document.querySelector("#retypePassword").value;
    let passwordError = document.querySelector("#passwordError");

    if (password.length < 6) {
        passwordError.innerHTML = "Password must be at least 6 characters.";
        passwordError.style.color = "red";
        isValid = false;
    } else if (password !== retype) {
        passwordError.innerHTML = "Passwords do not match.";
        passwordError.style.color = "red";
        isValid = false;
    } else {
        passwordError.innerHTML = "";
    }

    // Prevent form submission if invalid
    if (!isValid) {
        e.preventDefault();
    }
    }
// 5) Upon clicking on the Password text box, a suggested password is displayed next to it (10pts)
function displaySuggestedPassword() {
  let suggestedPwd = document.querySelector("#suggestedPwd");
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  suggestedPwd.innerHTML = "Suggested password: " + password;
  suggestedPwd.style.color = "green";
}


