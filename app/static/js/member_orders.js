var memberOrdersData;

async function memberOrdersInit(){
    await initMemberOrdersData("/api/orders", {method: "GET"});
    renderMemberOrdersPage();
}

async function initMemberOrdersData(url, fetchOptions){
    await fetch(url, fetchOptions)
    .then((resp) => {
        return resp.json()
    }).then((result) => {
        memberOrdersData = result;
    })
}

function renderMemberOrdersPage(){
    if(isSignedIn()){
        if (memberOrdersData["data"] != null){   
            let orders = memberOrdersData["data"]["order_data"]; 

            for(let i = 0; i < orders.length; i++){
                // Set block, btns
                let block = document.createElement("div");
                let orderDate = document.createElement("div");
                let orderNumber = document.createElement("div");
                let attractionName1Con = document.createElement("div");
                let attractionName1 = document.createElement("span");
                let moreImg = document.createElement("img");
                let status = document.createElement("div");

                let btns = document.createElement("div");
                let repayBtn = document.createElement("button");
                let cancelOrderBtn = document.createElement("button");

                block.setAttribute("class", "block");
                attractionName1Con.setAttribute("class", "order-items order-items-1");
                moreImg.setAttribute("class", "more");
                repayBtn.setAttribute("class", "order-btn");
                cancelOrderBtn.setAttribute("class", "order-btn");

                orderDate.textContent = orders[i]["order_date"];
                orderNumber.textContent = orders[i]["number"];
                attractionName1Con.textContent = "台北一日遊： ";
                attractionName1.textContent = orders[i]["trip"]["attraction"]["name"];
                moreImg.src = "/img/btn_down.png";
                status.textContent = orders[i]["status"];
                repayBtn.innerHTML = "重新付款";
                cancelOrderBtn.innerHTML = "取消訂單";

                // Set order info
                let orderInfo = document.createElement("div");
                let attractionImgCon = document.createElement("div");
                let attractionImg = document.createElement("img");
                let attractionName2Con = document.createElement("div");
                let attractionName2 = document.createElement("span");

                let orderDetails = document.createElement("div");
                let detailDate = document.createElement("div");
                let detailTime = document.createElement("div");
                let detailPrice = document.createElement("div");
                let detailAddress = document.createElement("div");
                let br = document.createElement("br");
                let contactName = document.createElement("div");
                let contactEmail = document.createElement("div");
                let contactPhone = document.createElement("div");
                
                orderInfo.setAttribute("class", "order-info hide");
                attractionImgCon.setAttribute("class", "attraction-img");
                attractionName2Con.setAttribute("class", "order-items order-items-2");

                let detailList = [detailDate, detailTime, detailPrice, detailAddress, contactName, contactEmail, contactPhone];
                detailList.forEach( e => e.setAttribute("class", "text"));
                attractionImg.src = orders[i]["trip"]["attraction"]["image"];
                attractionName2Con.textContent = "台北一日遊： ";
                attractionName2.textContent = orders[i]["trip"]["attraction"]["name"];
                detailDate.textContent = "日期： " + orders[i]["trip"]["date"];

                if (orders[i]["trip"]["time"] == "morning"){
                    detailTime.textContent = "時間： 早上 9 點至 12 點";
                } else{
                    detailTime.textContent = "時間： 下午 1 點至 4 點";
                }

                detailPrice.textContent = "費用： 新台幣 " + orders[i]["price"] + " 元";
                detailAddress.textContent = "地址： " + orders[i]["trip"]["attraction"]["address"];
                contactName.textContent = "聯絡姓名： " + orders[i]["contact"]["name"];
                contactEmail.textContent = "聯絡信箱： " + orders[i]["contact"]["email"];
                contactPhone.textContent = "聯絡電話： " + orders[i]["contact"]["phone"];

                // Render
                document.getElementById("content").appendChild(block);
                block.appendChild(orderDate);
                block.appendChild(orderNumber);
                block.appendChild(attractionName1Con);
                attractionName1Con.appendChild(attractionName1);
                block.appendChild(moreImg);
                block.appendChild(status);
                block.appendChild(orderInfo);
                orderInfo.appendChild(attractionImgCon);
                attractionImgCon.appendChild(attractionImg);
                orderInfo.appendChild(attractionName2Con);
                attractionName2Con.appendChild(attractionName2);
                orderInfo.appendChild(orderDetails);
                orderDetails.appendChild(detailDate);
                orderDetails.appendChild(detailTime);
                orderDetails.appendChild(detailPrice);
                orderDetails.appendChild(detailAddress);
                orderDetails.appendChild(br);
                orderDetails.appendChild(contactName);
                orderDetails.appendChild(contactEmail);
                orderDetails.appendChild(contactPhone);
                orderInfo.appendChild(btns);

                // Check if payment successed or not
                if (orders[i]["status"] == "未付款"){
                    status.style.color = "#CF4B49";
                    btns.appendChild(repayBtn);
                    btns.appendChild(cancelOrderBtn);
                } else if (orders[i]["status"] == "已付款"){
                    status.style.color = "#0C874A";
                    btns.appendChild(cancelOrderBtn);
                } else{
                }

                toggleOrderInfo(moreImg, orderInfo);
                cancelOrder(cancelOrderBtn, orders[i]["number"]);
                repayOrder(repayBtn, orders[i]["number"]);
            }
        } else{
            let orderMsg = document.getElementById("orders-msg");
            orderMsg.innerText = "查無訂單資料";
        }
    } else{
        document.body.innerHTML = "";
        window.location.href = "/";
    }
}

function toggleOrderInfo(btn, target){
    btn.addEventListener("click", function(){
        target.classList.toggle("hide");
    });
}

function cancelOrder(btn, orderNumber){
    btn.addEventListener("click", async function(){
        await initMemberOrdersData("/api/order/" + orderNumber, {method: "DELETE"});
        if (memberOrdersData["ok"]){
            renderWindowMsg("訂單取消成功", "可至訂單查詢確認", "reload");
        } else{
            renderWindowMsg("訂單取消失敗", "請重新操作或聯絡客服人員", "reload");
        }
    });
}

function repayOrder(btn, orderNumber){
    btn.addEventListener("click", function(){
        document.body.innerHTML = "";
        location.href = `/member/orders/repay?number=${orderNumber}`;
    })
}
