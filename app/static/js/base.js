var userUrl = "/api/user";
var userData;

var modal = document.getElementById("modal");
var signInForm = document.getElementById("signin-form");
var signUpForm = document.getElementById("signup-form");
var signInMsg = document.getElementById("signin-msg");
var signUpMsg = document.getElementById("signup-msg");

var signBtn = document.getElementById("header-sign-btn");
var signOutBtn = document.getElementById("header-signout-btn");

async function baseInit(){
    checkSignedIn();
    handleBtns();
    signIn();
    signUp();
    signOut();
}

async function initUserData(fetchOptions){
    await fetch(userUrl, fetchOptions)
    .then((resp) => {
        return resp.json();
    }).then((result) => {
        userData = result;
    })
}

async function checkSignedIn(){
    let fetchOptions = {method: "GET"};
    await initUserData(fetchOptions);
    if(isSignedIn()){
        toggleBlock(signBtn, signOutBtn);
    }
}

function isSignedIn(){
    if (userData["data"]){
        return true;
    } else{
        return false;
    }
}

// Sign In
function signIn(){
    async function handleSignInSubmit(event){
        event.preventDefault();
    
        let reqData = {
            "email": document.getElementById("signin-email").value,
            "password": document.getElementById("signin-pwd").value
        }
    
        let formData = JSON.stringify(reqData);
    
        let fetchOptions = {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: formData
        }
    
        await initUserData(fetchOptions);
        showUserMessage(signInMsg);

        if (userData["ok"]){
            location.reload(true);
        }
    }

    signInForm.addEventListener("submit", handleSignInSubmit);
}

// Sign Up
function signUp(){
    async function handleSignUpSubmit(event){
        event.preventDefault();
    
        let reqData = {
            "name": document.getElementById("signup-name").value,
            "email": document.getElementById("signup-email").value,
            "password": document.getElementById("signup-pwd").value
        }
    
        let formData = JSON.stringify(reqData);
    
        let fetchOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }, 
            body: formData
        };
    
        await initUserData(fetchOptions);
        showUserMessage(signUpMsg);
    }

    signUpForm.addEventListener("submit", handleSignUpSubmit);
}

// Sign Out
function signOut(){
    async function handleSignOutSubmit(){
        let fetchOptions = {method: "DELETE"};
        await initUserData(fetchOptions);
    
        if (userData["ok"]){
            location.reload(true);
        }
    }

    signOutBtn.addEventListener("click", handleSignOutSubmit);
}

// User Message
function showUserMessage(target){
    if (!userData){
        target.innerText = "";
    }else if (userData["error"]){
        target.innerText = userData["message"];
    }else if(userData["ok"]){
        if(target = signUpMsg){
            target.innerText = "註冊成功！請重新登入";
        }    
    }
}

// Button handler
function toggleBlock(...targets){
    targets.forEach(target => target.classList.toggle("hide"))
}

function hideBlock(...targets){
    targets.forEach(target => target.classList.add("hide"))
}

function resetForm(targetForm, targetMsg){
    targetForm.reset();
    targetMsg.innerText = "";
}

function handleSignBtn(){
    toggleBlock(modal, signInForm);
    signInForm.classList.add("slidein");
}

function handleBookingBtn(){
    if (isSignedIn()){
        location.href = "/booking";
    } else{
        handleSignBtn();
    }
}

function handleToSignBtn(){
    signInForm.classList.remove("slidein");
    toggleBlock(signInForm, signUpForm);
    resetForm(signInForm, signInMsg);
    resetForm(signUpForm, signUpMsg);
}

function handleCloseBtn(){
    hideBlock(modal, signInForm, signUpForm); 
    resetForm(signInForm, signInMsg);
    resetForm(signUpForm, signUpMsg);
}

function handleBtns(){   
    let bookingBtn = document.getElementById("header-booking-btn");
    let toSignInBtn = document.getElementById("open-signin");
    let toSignUpBtn = document.getElementById("open-signup");
    let closeBtn = document.querySelectorAll(".close");

    signBtn.addEventListener("click", handleSignBtn);
    bookingBtn.addEventListener("click", handleBookingBtn);
    toSignInBtn.addEventListener("click", handleToSignBtn);
    toSignUpBtn.addEventListener("click", handleToSignBtn);
    closeBtn.forEach(e => e.addEventListener("click", handleCloseBtn))
}
