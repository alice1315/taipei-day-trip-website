var page;
var nextPage;

var keywordUrl = ``;
var reqUrl;
var data;

var loadingObserver;
var observer;

async function init (){
    page = 0;
    await initData();
    renderPage();
    infiniteScroll();
}

function initData (){
    reqUrl = `/api/attractions?page=${page}${keywordUrl}`

    return fetch(reqUrl)
    .then((resp) => {
        return resp.json();
    }).then((result) => {
        data = result;
    });
}

function renderPage (){
    let spots = data["data"];

    if(spots.length > 0){
        for (let i = 0; i < spots.length; i++){
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

            let spotId = spots[i]["id"];
            spotItem.onclick = function(){
                location.href = `/attraction/${spotId}`;
            };
        }
    } else{
        document.getElementById("content").innerText = `查無資訊`;
    }
}

async function searchKeyword (){
    observer.unobserve(loadingObserver);
    page = 0;

    let keyword = document.getElementById("search-word").value;
    if (keyword != ``){
        keywordUrl = `&keyword=${keyword}`;
    } else{
        keywordUrl = ``;
    };

    let content = document.getElementById("content");
    content.innerHTML = ``;

    await initData();
    renderPage();
    infiniteScroll();
}

function infiniteScroll (){
    loadingObserver = document.querySelector(".observer");
    
    async function loadNextPage (){
        nextPage = data["nextPage"];
        if (nextPage != null && nextPage != page){
            page = nextPage;
            await initData();
            renderPage();
        } else if (nextPage == null){
            observer.unobserve(loadingObserver);
        } else {

        };
    }
    
    function callback ([entry]){
        if (entry && entry.isIntersecting){
            checkImgOnLoad(function(){
                loadNextPage();
            });
        };
    }

    observer = new IntersectionObserver(callback, {threshold: 0.75});
    observer.observe(loadingObserver);
}

function checkImgOnLoad (event){
    let container = document.getElementsByTagName("body")[0];
    let imgs = container.getElementsByTagName("img");

    let loaded = imgs.length;
    for (let i = 0; i < imgs.length; i++){
        if (imgs[i].complete){
            loaded --;
        }
        else{
            imgs[i].addEventListener("load", function(){
                loaded --;
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
