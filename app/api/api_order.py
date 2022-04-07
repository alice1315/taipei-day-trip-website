from flask import request
from flask import make_response
from flask import jsonify

import requests
import json

from . import api_
from .. import db
from app.models.auth import Auth

# Order
@api_.route("/orders", methods = ["POST"])
def make_orders():
    access_token = request.cookies.get("access_token")
    if access_token:
        user_id = Auth.decode_auth_token(access_token)["data"]["id"]

        data = request.get_json()

        prime = data["prime"]

        # number = 
        attraction_id = data["order"]["trip"]["attraction"]["id"]
        attraction_name = data["order"]["trip"]["attraction"]["name"]
        attraction_address = data["order"]["trip"]["attraction"]["address"]
        attraction_image = data["order"]["trip"]["attraction"]["image"]
        contact_name = data["order"]["contact"]["name"]
        contact_email = data["order"]["contact"]["email"]
        contact_phone = data["order"]["contact"]["phone"]
        date = data["order"]["trip"]["date"]
        time = data["order"]["trip"]["time"]
        price = data["order"]["price"]
        status = "未付款"

        sql = ("INSERT INTO orders (user_id, attraction_id, attraction_name, attraction_address, attraction_image, contact_name, contact_email, contact_phone, date, time, price, status) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)")
        sql_data = (user_id, attraction_id, attraction_name, attraction_address, attraction_image, contact_name, contact_email, contact_phone, date, time, price, status)

        db.execute_sql(sql, sql_data, "one")
        db.cnx.commit()

        # requests
        post_url = "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime"
        post_headers = {
            "Content-Type": "application/json",
            "x-api-key": "partner_pq2MUqpSrPTi2wLbhegU5y8ZLOLDNCnrYJXBa53dA8luh4WA3ex4T6RT"
        }

        post_data = {
                "prime": prime,
                "partner_key": "partner_pq2MUqpSrPTi2wLbhegU5y8ZLOLDNCnrYJXBa53dA8luh4WA3ex4T6RT",
                "merchant_id": "vientoa13_CTBC",
                "details":"TapPay Test",
                "amount": 1,
                "cardholder": {
                    "phone_number": contact_phone,
                    "name": contact_name,
                    "email": contact_email,
                },
                "remember": False
            }

        # INSERT INTO payment 付款紀錄
        resp = requests.post(post_url, data = json.dumps(post_data), headers = post_headers)
        payment_result = resp.json()

        if payment_result:
            if payment_result["status"] == 0:
                # 修改payment紀錄為成功、orders記錄為已付款、刪除shopping_cart
                result_dict = {"data": {"number": "12345", "payment": {"status": 0, "message": "付款成功"}}}
                return jsonify(result_dict)
            else:
                result_dict = {"data": {"number": "12345", "payment": {"status": payment_result["status"], "message": payment_result["msg"]}}}
                return jsonify(result_dict)
        else:
            result_dict = {"error": True, "message": "訂單建立失敗"}
            return make_response(jsonify(result_dict), 400)

    else:
        result_dict = {"error": True, "message": "未登入系統"}
        return make_response(jsonify(result_dict), 403)
