var bookingUrl = "/api/booking";

var bookingData;

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
        if (userData["data"]){
            let date = document.getElementById("date").value;

            if (date != ""){
                let reqData = {
                    "attractionId": data["data"]["id"],
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
                window.location.href = "/booking";

            } else{
                document.getElementById("date").style.border = "1px solid red";
            }
        } else{
            handleSignBtn();
        }
    }

    let btn = document.getElementById("booking-btn");

    btn.addEventListener("click", handleMakeBooking);
}