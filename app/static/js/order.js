var orderData;
var orderMsg = document.getElementById("order-msg");

function tappaySetUp(){
    TPDirect.setupSDK(124039, "app_RMLknzGTJatrHEEvYsMcWbFpiYvoiWlBqN4KQw3TLcp2Pd9g5164wJOrlsXr", "sandbox");

    let fields = {
        number: {
            element: document.getElementById('card-number'),
            placeholder: '**** **** **** ****'
        },
        expirationDate: {
            element: document.getElementById('card-expiration-date'),
            placeholder: 'MM / YY'
        },
        ccv: {
            element: document.getElementById('card-ccv'),
            placeholder: 'ccv'
        }
    }
    
    TPDirect.card.setup({
        fields: fields,
        styles: {
            ':focus': {'color': '#666666'},
            '.valid': {'color': 'green'},
            '.invalid': {'color': 'red'},
        }
    })
}

function updateCardStatus(field, msg){
    switch(field){
        case 0:
            msg.innerText = "";
            break;
        case 1:
            msg.innerText = "請填寫資料";
            break;
        case 2:
            msg.innerText = "輸入資料有誤";
            break;
        case 3:
            msg.innerText = "";
            break;
        default:
            console.log("field error");
    }
}

function updateContactStatus(contact, msg){
    if (contact.value == ""){
        msg.innerText = "請填寫資料";
        return false
    } else{
        msg.innerText = "";
        return true;
    }
}

function checkStatus(){
    let tappayStatus = TPDirect.card.getTappayFieldsStatus();

    updateCardStatus(tappayStatus.status.number, document.getElementById("number-msg"));
    updateCardStatus(tappayStatus.status.expiry, document.getElementById("expiry-msg"));
    updateCardStatus(tappayStatus.status.ccv, document.getElementById("ccv-msg"));

    let con1 = updateContactStatus(contactName, document.getElementById("name-msg"));
    let con2 = updateContactStatus(contactEmail, document.getElementById("email-msg"));
    let con3 = updateContactStatus(contactPhone, document.getElementById("phone-msg"));
    
    if (tappayStatus.canGetPrime === false | !con1 | !con2 | !con3){
        orderMsg.innerText = "訂購資訊有誤，請再次確認";
        return false;
    } else{
        orderMsg.innerText = "";
        return true;
    }
}

async function initOrderData(orderUrl, fetchOptions){
    await fetch(orderUrl, fetchOptions)
    .then((resp) => {
        return resp.json();
    }).then((result) => {
        orderData = result;
    })
}

async function postOrderData(prime){
    let reqData = {
        "prime": prime,
        "order": {
            "price": document.getElementById("price").textContent,
            "trip": {
                "attraction": bookingData["data"]["attraction"],
                "date": bookingData["data"]["date"],
                "time": bookingData["data"]["time"]
            },
            "contact": {
                "name": contactName.value,
                "email": contactEmail.value,
                "phone": contactPhone.value
            }
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
    await initOrderData("/api/orders", fetchOptions);
}

function makeOrder(){
    function handleMakeOrder(){
        if(checkStatus()){
            TPDirect.card.getPrime(async (result) => {
                if (result.status !== 0){
                    console.log("get prime error " + result.msg);
                    return;
                }
                let prime = result.card.prime;
                await postOrderData(prime);
                
                if (orderData["data"]["payment"]["status"] == 0){
                    let order_number = orderData["data"]["number"];
                    location.href = `/thankyou?number=${order_number}`;
                } else{
                    orderMsg.innerText = "付款失敗，請重新確認信用卡資料，或洽信用卡發卡銀行處理";
                }
            })            
        }
    }

    let bookingBtn = document.getElementById("booking-btn");
    bookingBtn.addEventListener("click", handleMakeOrder);
}
