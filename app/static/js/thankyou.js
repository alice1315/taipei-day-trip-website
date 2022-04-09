var orderNumber;
var orderNumberUrl = "/api/order/";
var orderNumberData;

async function thankyouInit(){
    getOrderNumber();
    await initOrderNumberData();
    renderThankyouPage();
}

async function initOrderNumberData(){
    await fetch(orderNumberUrl + orderNumber, {method: ["GET"]})
    .then((resp) => {
        return resp.json();
    }).then((result) => {
        orderNumberData = result;
    })
}

function renderThankyouPage(){
    if (isSignedIn() & orderNumberData["data"] != null){
        document.getElementById("content").classList.remove("hide");
        document.getElementById("order-number").innerText = orderNumberData["data"]["number"];
    } else{
        window.location.href = "/";
    }
}

function getOrderNumber(){
    let url = new URL(window.location.href);
    orderNumber = url.searchParams.get("number");
}
