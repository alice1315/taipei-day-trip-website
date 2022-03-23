var userUrl = "/api/user";
var userData;

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
    handleSignBlock();
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
        hideBlock(signBtn);
        showBlock(signOutBtn);
    } else {
        hideBlock(signOutBtn);
        showBlock(signBtn);
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
        handleMessage(signInMsg);
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
        handleMessage(signUpMsg);
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

// Message
function handleMessage(target){
    if (!userData){
        target.innerText = "";
    }else if (userData["error"]){
        target.innerText = userData["message"];
        userData = null;
    }else if(userData["ok"]){
        location.reload(true);
    }
}

// Block
function showBlock(target){
    target.classList.remove("hide");
}

function hideBlock(target){
    target.classList.add("hide");
}

function handleSignBlock(){   
    signBtn.addEventListener("click", function(){showBlock(signInForm)});
    toSignInBtn.addEventListener("click", function(){showBlock(signInForm); hideBlock(signUpForm);});
    toSignUpBtn.addEventListener("click", function(){showBlock(signUpForm); hideBlock(signInForm);});
    closeBtn.forEach(
        e => e.addEventListener("click", function(){
            hideBlock(signInForm); 
            hideBlock(signUpForm); 
            handleMessage(signInMsg); 
            handleMessage(signUpMsg);
        })
    )
}
