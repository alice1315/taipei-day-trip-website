var userUrl = "/api/user";
var userData;

var modal = document.getElementById("modal");
var signInForm = document.getElementById("signin-form");
var signUpForm = document.getElementById("signup-form");
var signInMsg = document.getElementById("signin-msg");
var signUpMsg = document.getElementById("signup-msg");

var signBtn = document.getElementById("header-sign-btn");
var signOutBtn = document.getElementById("header-signout-btn");
var toSignInBtn = document.getElementById("open-signin");
var toSignUpBtn = document.getElementById("open-signup");
var closeBtn = document.querySelectorAll(".close");

async function baseInit(){
    toggleHeaderSign();
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

async function isSignedIn(){
    let fetchOptions = {method: "GET"};
    await initUserData(fetchOptions);

    if (userData["data"]){
        return true;
    } else{
        return false;
    }
}

async function toggleHeaderSign(){
    if (await isSignedIn()){
        toggleBlock(signBtn, signOutBtn);
    }
}

// Sign In
function signIn(){
    async function handleSignInSubmit(event){
        event.preventDefault();
    
        let data = {
            "email": document.getElementById("signin-email").value,
            "password": document.getElementById("signin-pwd").value
        }
    
        let formData = JSON.stringify(data);
    
        let fetchOptions = {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: formData
        }
    
        await initUserData(fetchOptions);
        showMessage(signInMsg);

        if (userData["ok"]){
            location.reload();
        }
    }

    signInForm.addEventListener("submit", handleSignInSubmit);
}

// Sign Up
function signUp(){
    async function handleSignUpSubmit(event){
        event.preventDefault();
    
        let data = {
            "name": document.getElementById("signup-name").value,
            "email": document.getElementById("signup-email").value,
            "password": document.getElementById("signup-pwd").value
        }
    
        let formData = JSON.stringify(data);
    
        let fetchOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }, 
            body: formData
        };
    
        await initUserData(fetchOptions);
        showMessage(signUpMsg);
    }

    signUpForm.addEventListener("submit", handleSignUpSubmit);
}

// Sign Out
function signOut(){
    async function handleSignOutSubmit(){
        let fetchOptions = {method: "DELETE"};
        await initUserData(fetchOptions);
    
        if (userData["ok"]){
            location.reload();
        }
    }

    signOutBtn.addEventListener("click", handleSignOutSubmit);
}

// Message
function showMessage(target){
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
    signBtn.addEventListener("click", handleSignBtn);
    toSignInBtn.addEventListener("click", handleToSignBtn);
    toSignUpBtn.addEventListener("click", handleToSignBtn);
    closeBtn.forEach(e => e.addEventListener("click", handleCloseBtn))
}
