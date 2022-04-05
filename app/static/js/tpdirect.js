var prime;
var bookingBtn = document.getElementById("booking-btn");

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
    
    TPDirect.card.onUpdate(function(update){
        if (update.canGetPrime){
            console.log("Can get");
        } else{
            console.log("Can not get");
        }
    })
}

function onSubmit(){
    const tappayStatus = TPDirect.card.getTappayFieldsStatus()

    if (tappayStatus.canGetPrime === false){
        console.log("Can not get Prime");
        return;
    }

    TPDirect.card.getPrime((result) => {
        if (result.status !== 0){
            console.log("get prime error " + result.msg);
            return;
        }

        prime = result.card.prime;
        console.log(prime);
    })
}

function makePaying(){
    bookingBtn.addEventListener("click", onSubmit);
}


