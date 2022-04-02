var count;
var keywordUrl = ``;
var indexData;

var loadingObserver;
var observer;
var loadingGif = document.getElementById("loading");

async function indexInit (){
    await initIndexData(0);
    renderIndexPage();
    infiniteScroll();
}

async function initIndexData (page){
    let indexUrl = `/api/attractions?page=` + page + keywordUrl;
    count = page;

    await fetch(indexUrl)
    .then((resp) => {
        return resp.json();
    }).then((result) => {
        indexData = result;
    });
}

function renderIndexPage (){
    let spots = indexData["data"];

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

    let keyword = document.getElementById("search-word").value;
    if (keyword != ``){
        keywordUrl = `&keyword=${keyword}`;
    } else{
        keywordUrl = ``;
    };

    document.getElementById("content").innerHTML = ``;

    await initIndexData(0);
    renderIndexPage();
    infiniteScroll();
}

function infiniteScroll (){
    loadingObserver = document.querySelector(".observer");
    
    async function loadNextPage (){
        let nextPage = indexData["nextPage"];
        if (nextPage != null && nextPage != count){
            await initIndexData(nextPage);
            renderIndexPage();
            loadingGif.classList.add("hide");
        } else if (nextPage == null){
            loadingGif.classList.add("hide");
            observer.unobserve(loadingObserver);
        } else {

        };
    }
    
    function callback ([entry]){
        if (entry && entry.isIntersecting){
            loadingGif.classList.remove("hide");
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
