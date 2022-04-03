var attractionUrl = `/api` + window.location["pathname"];
var attractionData;
var imageIndex = 1;

async function attractionInit(){
    await initAttractionData();
    renderAttractionPage();
    showImages(imageIndex);
    makeBooking();
}

async function initAttractionData (){
    await fetch(attractionUrl, {method: "GET"})
    .then((resp) => {
        return resp.json();
    }).then((result) => {
        attractionData = result;
    });
}

function renderAttractionPage(){
    let spot = attractionData["data"];

    for (let i = 0; i < spot["images"].length; i++){
        let imgItem = document.createElement("div");
        let img = document.createElement("img");
        let dot = document.createElement("span");

        imgItem.setAttribute("class", "image fade");
        dot.setAttribute("class", "dot");
        dot.onclick = function(){
            currentSlide(i + 1);
        };

        img.src = spot["images"][i];

        document.getElementById("slideshow-container").appendChild(imgItem);
        imgItem.appendChild(img);
        document.getElementById("dots").appendChild(dot);
    }

    let name = document.getElementById("name");
    let cat = document.getElementById("cat");
    let mrt = document.getElementById("mrt");
    let description = document.getElementById("description");
    let address = document.getElementById("address");
    let transport = document.getElementById("transport");

    name.innerText = spot["name"];
    cat.innerText = spot["category"];
    mrt.innerText = spot["mrt"];
    description.innerText = spot["description"];
    address.innerText = spot["address"];
    transport.innerText = spot["transport"];
}

function showImages(n) {
    let i;
    let images = document.querySelectorAll(".image");
    let dots = document.querySelectorAll(".dot");
  
    if (n > images.length){
        imageIndex = 1;
    } else if(n < 1){
        imageIndex = images.length;
    }

    for (i = 0; i < images.length; i++) {
        images[i].style.display = "none"; 
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }

    images[imageIndex-1].style.display = "block"; 
    dots[imageIndex-1].className += " active";
}

function plusSlides(n) {
    showImages(imageIndex += n);
}

function currentSlide(n) {
    showImages(imageIndex = n);
}

function changePrice(e){
    let price = document.getElementById("price");

    switch (e){
        case "morning":
            price.innerText = "2000";
            break;
        case "afternoon":
            price.innerText = "2500";
            break;
    }
}
