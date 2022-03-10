var reqUrl;
var keywordUrl = ``;

let init = () => {
    reqUrl = `/api/attractions?page=0`;
    fetchPage(reqUrl);
}

let fetchPage = async(reqUrl) => {
    await fetch(reqUrl)
    .then(resp => resp.json())
    .then(function(datas){
        getSpots(datas);
        infiniteScroll(datas);
    }).catch((error) => {
        console.log(error);
    })
}

let getSpots = (jsonObj) => {
    let spots = jsonObj["data"];

    if(spots.length > 0){
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
    } else{
        document.getElementById("content").innerText = `查無資訊`;
    }
}

let showSearchSpots = () => {
    checkOnLoad(function(){
        let searchWord = document.getElementById("search-word").value;
        if (searchWord != ``){
            keywordUrl = `&keyword=${searchWord}`;
        } else{
            keywordUrl = ``;
        }
        
        reqUrl = `/api/attractions?page=0` + keywordUrl;

        let content = document.getElementById("content");
        content.innerHTML = ``;

        fetchPage(reqUrl);
    });
}

let infiniteScroll = (jsonObj) => {
    let loadingObserver = document.querySelector(".observer");
    let nextPage = jsonObj["nextPage"];

    let loadNextPage = async() => {
        if (nextPage !== null){
            reqUrl = `/api/attractions?page=${nextPage}` + keywordUrl;
            await fetch(reqUrl)
            .then(resp => resp.json())
            .then(function(datas){
                getSpots(datas);
                nextPage = datas["nextPage"];
            }).catch((error) => {
                console.log(error);
            })
        } else{
            observer.unobserve(loadingObserver);
        }
    }
    
    let callback = (entries) => {
        if (entries[0].isIntersecting){
            checkOnLoad(function(){
                loadNextPage();
            });
        }
    }

    let observer = new IntersectionObserver(callback);
    observer.observe(loadingObserver);
}

let checkOnLoad = (event) => {
    let container = document.getElementsByTagName("body")[0];
    let imgs = container.getElementsByTagName("img");

    let loaded = imgs.length;
    for (let i = 0; i < imgs.length; i++){
        if (imgs[i].complete){
            loaded--;
        }
        else{
            imgs[i].addEventListener("load", function(){
                loaded--;
                if (loaded == 0){
                    event();
                }
            });
        }
        if (loaded == 0){
            event();
        }
    }
}
