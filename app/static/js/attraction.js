var reqUrl = `/api` + window.location["pathname"];
var data;
var image_index = 0;

async function init(){
    await initData();
    render();
    changeImg();
}

function initData (){
    return fetch(reqUrl)
    .then((resp) => {
        return resp.json();
    }).then((result) => {
        data = result;
    });
}

function render(){
    let spot = data["data"];

    let imgs = document.getElementById("spot-img");
    let name = document.getElementById("name");
    let cat = document.getElementById("cat");
    let mrt = document.getElementById("mrt");
    let description = document.getElementById("description");
    let address = document.getElementById("address");
    let transport = document.getElementById("transport");

    imgs.src = spot["images"][0];
    name.innerText = spot["name"];
    cat.innerText = spot["category"];
    mrt.innerText = spot["mrt"];
    description.innerText = spot["description"];
    address.innerText = spot["address"];
    transport.innerText = spot["transport"];
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

function changeImg(){
    let rightBtn = document.getElementById("right");
    let leftBtn = document.getElementById("left");
    let imgContainer = document.getElementById("spot-img");
    let images = data["data"]["images"];
    console.log(images.length);

    handlerRight = function(){
        if (image_index < images.length - 1){
            image_index ++;
            imgContainer.src = images[image_index];
        } else if (image_index = images.length){
            image_index = 0;
            imgContainer.src = images[image_index];
        }
    }

    handlerLeft = function(){
        if (0 < image_index){
            image_index --;
            imgContainer.src = images[image_index];
        } else if (image_index = 1){
            image_index = images.length - 1;
            imgContainer.src = images[image_index];
        }
    }

    rightBtn.addEventListener("click", handlerRight);
    leftBtn.addEventListener("click", handlerLeft);
}
