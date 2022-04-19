var orderNumber;
var repayData;
var repayMsg = document.getElementById("repay-msg");

async function repayInit(){
    getOrderNumber();
    await initRepayData("/api/order/" + orderNumber, {method: "GET"});
    renderRepayPage();
    tappaySetUp();
    repayOrder();
}

async function initRepayData(url, fetchOptions){
    await fetch(url, fetchOptions)
    .then((resp) => {
        return resp.json();
    }).then((result) => {
        repayData = result;
    })
}

function renderRepayPage(){
    if (isSignedIn()){
        document.getElementById("top").classList.remove("hide");
        let name = document.getElementById("name");
        name.innerText = userData["data"]["name"];

        
        document.getElementById("booking").classList.remove("hide");
        let data = repayData["data"];

        let orderNumber = document.getElementById("order-number");
        let img = document.getElementById("image");
        let attractionName = document.getElementById("attraction-name");
        let date = document.getElementById("date");
        let time = document.getElementById("time");
        let price = document.getElementById("price");
        let address = document.getElementById("address");
        let contactName = document.getElementById("contact-name");
        let contactEmail = document.getElementById("contact-email");
        let contactPhone = document.getElementById("contact-phone");
        let totalPrice = document.getElementById("total-price");
        
        orderNumber.innerText = data["number"]
        img.src = data["trip"]["attraction"]["image"];
        attractionName.innerText = data["trip"]["attraction"]["name"];
        date.innerText = data["trip"]["date"];
        if (data["trip"]["time"] == "morning"){
            time.innerText = "早上 9 點至 12 點";
        } else{
            time.innerText = "下午 1 點至 4 點";
        }
        price.innerText = data["price"];
        address.innerText = data["trip"]["attraction"]["address"];
        totalPrice.innerText = data["price"];

        contactName.innerText = data["contact"]["name"];
        contactEmail.innerText = data["contact"]["email"];
        contactPhone.innerText = data["contact"]["phone"];
        
    } else{
        document.body.innerHTML = "";
        window.location.href = "/";
    }
}

function checkRepayStatus(){
    let tappayStatus = TPDirect.card.getTappayFieldsStatus();

    updateCardStatus(tappayStatus.status.number, document.getElementById("number-msg"));
    updateCardStatus(tappayStatus.status.expiry, document.getElementById("expiry-msg"));
    updateCardStatus(tappayStatus.status.ccv, document.getElementById("ccv-msg"));
    
    if (tappayStatus.canGetPrime === false){
        repayMsg.innerText = "訂購資訊有誤，請再次確認";
        return false;
    } else{
        repayMsg.innerText = "";
        return true;
    }
}

async function postRepayData(prime){
    let reqData = {
        "prime": prime,
        "order": {
            "number": orderNumber,
        }
    }

    let formData = JSON.stringify(reqData);

    let fetchOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: formData
    }
    await initRepayData("/api/orders/repay", fetchOptions);
}

function repayOrder(){
    function handleRepayOrder(){
        if(checkRepayStatus()){
            TPDirect.card.getPrime(async (result) => {
                if (result.status !== 0){
                    console.log("get prime error " + result.msg);
                    return;
                }
                let prime = result.card.prime;
                await postRepayData(prime);
                
                if (repayData["data"]["payment"]["status"] == 0){
                    document.body.innerHTML = "";
                    location.href = `/thankyou?number=${orderNumber}`;
                } else{
                    renderPaymentMsg(orderNumber);
                }
            })            
        }
    }

    let repayBtn = document.getElementById("repay-btn");
    repayBtn.addEventListener("click", handleRepayOrder)
}

function getOrderNumber(){
    let url = new URL(window.location.href);
    orderNumber = url.searchParams.get("number");
}