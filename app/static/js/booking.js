var bookingUrl = "/api/booking";
var bookingData;

var contactName = document.getElementById("contact-name");
var contactEmail = document.getElementById("contact-email");
var contactPhone = document.getElementById("contact-phone");

async function bookingInit(){
    await initBookingData({method: "GET"});
    renderBookingPage();
    deleteBooking();
    tappaySetUp();
    makeOrder();
}

async function initBookingData(fetchOptions){
    await fetch(bookingUrl, fetchOptions)
    .then((resp) => {
        return resp.json();
    }).then((result) => {
        bookingData = result;
    })
}

function makeBooking(){
    async function handleMakeBooking(){
        if (isSignedIn()){
            let date = document.getElementById("date").value;

            if (date != ""){
                let reqData = {
                    "attractionId": attractionData["data"]["id"],
                    "date": date,
                    "time": document.querySelector("input[name='time']:checked").value,
                    "price": document.getElementById("price").textContent
                }

                let formData = JSON.stringify(reqData);

                let fetchOptions = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: formData
                }

                await initBookingData(fetchOptions);
                if (bookingData["ok"]){
                    window.location.href = "/booking";
                } else{
                    showDateMessage(bookingData["message"]);
                }

            } else{
                showDateMessage("請選擇日期");
            }
        } else{
            handleSignBtn();
        }
    }

    let btn = document.getElementById("booking-btn");
    btn.addEventListener("click", handleMakeBooking);
}

function renderBookingPage(){
    if (isSignedIn()){
        document.getElementById("top").classList.remove("hide");
        let name = document.getElementById("name");
        name.innerText = userData["data"]["name"];

        if (bookingData["data"]){
            document.getElementById("booking").classList.remove("hide");
            let data = bookingData["data"];

            let img = document.getElementById("image");
            let attractionName = document.getElementById("attraction-name");
            let date = document.getElementById("date");
            let time = document.getElementById("time");
            let price = document.getElementById("price");
            let address = document.getElementById("address");
            let totalPrice = document.getElementById("total-price");
            
            img.src = data["attraction"]["image"];
            attractionName.innerText = data["attraction"]["name"];
            date.innerText = data["date"];
            if (data["time"] == "morning"){
                time.innerText = "早上 9 點至 12 點";
            } else{
                time.innerText = "下午 1 點至 4 點";
            }
            price.innerText = data["price"];
            address.innerText = data["attraction"]["address"];
            totalPrice.innerText = data["price"];

            contactName.setAttribute("value", userData["data"]["name"]);
            contactEmail.setAttribute("value", userData["data"]["email"]);
        } else{
            document.getElementById("booking-msg").innerText = "目前沒有任何待預定的行程";
        }
    } else{
        window.location.href = "/";
    }
}

function deleteBooking(){
    async function handleDeleteBooking(){
        await initBookingData({method: "DELETE"});
        if (bookingData["ok"]){
            location.reload(true);
        }
    }

    let btn = document.getElementById("delete");
    btn.addEventListener("click", handleDeleteBooking);
}

function showDateMessage(msg){
    document.getElementById("date").style.border = "2px solid #CF4B49";
    document.getElementById("date-msg").innerText = msg;
}
