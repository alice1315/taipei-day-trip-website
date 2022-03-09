let init = () => {
    let reqUrl = `/api/attractions?page=0`;

    fetch(reqUrl)
    .then(resp => resp.json())
    .then(function(datas){
        getSpots(datas);
        infiniteScroll(datas);
    })
}

let getSpots = (jsonObj) => {
    let spots = jsonObj["data"];

    for (i = 0; i < spots.length; i++){
        let spotItem = document.createElement("div");
        let spotPic = document.createElement("div");
        let spotImg = document.createElement("img");
        let spotName = document.createElement("div");
        let spotInfo = document.createElement("div");
        let spotMrt = document.createElement("div");
        let spotCat = document.createElement("div");

        spotItem.setAttribute("class", "item");
        spotPic.setAttribute("class", "pic");
        spotName.setAttribute("class", "name");
        spotInfo.setAttribute("class", "info");
        
        let imgUrl = spots[i]["images"][0];
        spotImg.src = imgUrl;

        spotName.textContent = spots[i]["name"];
        spotMrt.textContent = spots[i]["mrt"];
        spotCat.textContent = spots[i]["category"];

        document.getElementById("content").appendChild(spotItem);
        spotItem.appendChild(spotPic);
        spotPic.appendChild(spotImg);
        spotItem.appendChild(spotName);
        spotItem.appendChild(spotInfo);
        spotInfo.appendChild(spotMrt);
        spotInfo.appendChild(spotCat);
    }
}

let infiniteScroll = (jsonObj) => {
    let loadingObserver = document.querySelector(".observer");
    let page = jsonObj["nextPage"];

    let fetchPage = () => {
        if (page !== null){
            let reqUrl = `/api/attractions?page=${page}`;
            fetch(reqUrl)
            .then(resp => resp.json())
            .then(function(datas){
                getSpots(datas);
                page = datas["nextPage"];
            })
        } else{
            observer.unobserve(loadingObserver);
        }
    }
    
    let callback = (entries) => {
        if (entries[0].isIntersecting){
            setTimeout(fetchPage, 3000);
        }
    }

    let observer = new IntersectionObserver(callback);

    observer.observe(loadingObserver);
}

// let getSearchSpots = () => {
//     let searchWord = document.getElementById("search-word").value;
//     let reqUrl = `/api/attractions?page=0&keyword=${searchWord}`;

//     let content = document.getElementById("content");

//     fetch(reqUrl)
//     .then(resp => resp.json())
//     .then(function(datas){
//         content.innerHTML = "";
//         getSpots(datas);
//         infiniteScroll(datas);
//     })
//     return false;
// }
