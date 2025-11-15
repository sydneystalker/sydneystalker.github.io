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
  document.querySelector("#retypePassword").addEventListener("input", validateForm);
  document.querySelector("#password").addEventListener("focus", displaySuggestedPassword);


  //Functions

  //Displaying city from web API after entering a zip
  //1) City, longitude and latitude are updated when entering a zip code (10 pts)
  //2) A "Zip code not found" message is displayed next to its text box, if that's the case (10 pts)
  async function displayCity(){
    let zipCode = document.querySelector("#zip").value;
    let zipError = document.querySelector("#zipError");
    let url = `http://csumb.space/api/cityInfoAPI.php?zip=${zipCode}`;
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
  //3) The list of counties is updated properly when selecting a State (10 pts)
  async function displayCounties(){
    let state = document.querySelector("#state").value;
    let url = `http://csumb.space/api/countyListAPI.php?state=${state}`;
    let response = await fetch(url);
    let data = await response.json();
    let countyList = document.querySelector("#county");

    for(let i=0; i < data.length; i++){
        countyList.innerHTML += `<option> ${data[i].county}</option>`;
    }
  }

  //Displaying list of all US states when the page loads
  // 6) When the page loads, the list of all US states is displayed in the dropdown menu (10pts)
async function displayStates() {
  let stateList = document.querySelector("#state");
  stateList.innerHTML = '<option value="">Select One</option>';
  try {
    let response = await fetch("http://csumb.space/api/stateListAPI.php");
    let data = await response.json();
    for (let i = 0; i < data.length; i++) {
      stateList.innerHTML += `<option value="${data[i].usps.toLowerCase()}">${data[i].state}</option>`;
    }
  } catch (err) {
    console.error("State API failed:", err);
    let fallback = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
    for (let code of fallback) {
      stateList.innerHTML += `<option value="${code.toLowerCase()}">${code}</option>`;
    }
  }
}

displayStates();


  //Check to see if the username is avaliable
  //4) Upon typing the username, a color-coded message indicates whether it is available or not (10 pts)
  async function checkUsername(){
    let username = document.querySelector("#username").value;
    let url = `http://csumb.space/api/usernamesAPI.php?username=${username}`;
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


