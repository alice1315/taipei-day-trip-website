from flask import request, make_response, jsonify

import requests
import json
from datetime import datetime

from . import api_
from .. import db
from ..config import PARTNER_KEY
from app.models.auth import Auth

# Order
@api_.route("/orders", methods = ["POST"])
def make_order():
    access_token = request.cookies.get("access_token")
    if access_token:
        user_id = Auth.decode_auth_token(access_token)["data"]["id"]

        # Get request body
        data = request.get_json()
        prime = data["prime"]
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

        # Set order number
        result = set_order_number()
        if not result:
            order_number = datetime.now().strftime("%Y%m%d") + "0001"
        else:
            order_number = result["order_number"] + 1

        # Make an order
        sql = ("INSERT INTO orders (order_number, user_id, attraction_id, attraction_name, attraction_address, attraction_image, contact_name, contact_email, contact_phone, date, time, price, status) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)")
        sql_data = (order_number, user_id, attraction_id, attraction_name, attraction_address, attraction_image, contact_name, contact_email, contact_phone, date, time, price, status)
        db.execute_sql(sql, sql_data, "one", commit=True)

        sql = ("DELETE FROM shopping_cart WHERE user_id=%s")
        sql_data = (user_id, )
        db.execute_sql(sql, sql_data, "one", commit=True)

        # Make a payment
        payment_result = make_payment(prime, order_number, contact_phone, contact_name, contact_email)

        if payment_result:
            if payment_result["status"] == 0:
                sql = ("UPDATE orders SET status='已付款' WHERE order_number=%s")
                sql_data = (order_number, )
                db.execute_sql(sql, sql_data, "one", commit=True)

                result_dict = {"data": {"number": order_number, "payment": {"status": 0, "message": "付款成功"}}}
                return jsonify(result_dict)
            else:
                result_dict = {"data": {"number": order_number, "payment": {"status": payment_result["status"], "message": payment_result["msg"]}}}
                return jsonify(result_dict)
        else:
            result_dict = {"error": True, "message": "訂單建立失敗"}
            return make_response(jsonify(result_dict), 400)

    else:
        result_dict = {"error": True, "message": "未登入系統"}
        return make_response(jsonify(result_dict), 403)

@api_.route("/order/<orderNumber>", methods = ["GET"])
def show_order(orderNumber):
    access_token = request.cookies.get("access_token")
    if access_token:
        Auth.decode_auth_token(access_token)["data"]["id"]

        sql = ("SELECT order_number, attraction_id, attraction_name, attraction_address, attraction_image, contact_name, contact_email, contact_phone, date, time, price, status FROM orders WHERE order_number=%s")
        sql_data = (orderNumber, )
        result = db.execute_sql(sql, sql_data, "one")

        y = lambda x: 0 if x == "已付款" else 1
        if result:
            result_dict = {
                "data": {
                    "number": result["order_number"],
                    "price": result["price"],
                    "trip": {
                        "attraction": {
                            "id": result["attraction_id"],
                            "name": result["attraction_name"],
                            "address": result["attraction_address"],
                            "image": result["attraction_image"]
                        },
                        "date": datetime.strftime(result["date"], "%Y-%m-%d"),
                        "time": result["time"]
                    },
                    "contact": {
                        "name": result["contact_name"],
                        "email": result["contact_email"],
                        "phone": result["contact_phone"]
                    },
                    "status": y(result["status"]) 
                }
            }
            return jsonify(result_dict)

        else:
            result_dict = {"data": None}
            return jsonify(result_dict)

    else:
        result_dict = {"error": True, "message": "未登入系統"}
        return make_response(jsonify(result_dict), 403)

@api_.route("/orders", methods = ["GET"])
def get_member_orders():
    access_token = request.cookies.get("access_token")
    if access_token:
        user_id = Auth.decode_auth_token(access_token)["data"]["id"]

        sql = ("SELECT order_time, order_number, attraction_id, attraction_name, attraction_address, attraction_image, contact_name, contact_email, contact_phone, date, time, price, status FROM orders  WHERE user_id=%s ORDER BY order_number DESC")
        sql_data = (user_id, )
        results = db.execute_sql(sql, sql_data, "all")

        if results:
            order_list = []
            for result in results:
                new_result = {
                    "order_date": datetime.strftime(result["order_time"], "%Y-%m-%d"),
                    "number": result["order_number"],
                    "price": result["price"],
                    "trip": {
                        "attraction": {
                            "id": result["attraction_id"],
                            "name": result["attraction_name"],
                            "address": result["attraction_address"],
                            "image": result["attraction_image"]
                        },
                        "date": datetime.strftime(result["date"], "%Y-%m-%d"),
                        "time": result["time"]
                    },
                    "contact": {
                        "name": result["contact_name"],
                        "email": result["contact_email"],
                        "phone": result["contact_phone"]
                    },
                    "status": result["status"]
                }

                order_list.append(new_result)

            result_dict = {
                "data": {
                    "user_id": user_id,
                    "order_data": order_list
                }
            }
            return jsonify(result_dict)

        else:
            result_dict = {"data": None}
            return jsonify(result_dict)
    
    else:
        result_dict = {"error": True, "message": "未登入系統"}
        return make_response(jsonify(result_dict), 403)

@api_.route("/order/<orderNumber>", methods = ["DELETE"])
def delete_order(orderNumber):
    access_token = request.cookies.get("access_token")
    if access_token:
        user_id = Auth.decode_auth_token(access_token)["data"]["id"]

        sql = ("UPDATE orders SET status='已取消' WHERE user_id=%s and order_number=%s")
        sql_data = (user_id, orderNumber)
        rowcount = db.execute_sql(sql, sql_data, "rowcount", commit=True)

        if rowcount == 1:
            result_dict = {"ok": True}
            return jsonify(result_dict)
        else:
           result_dict = {"error": True, "message": "訂單取消失敗"}
           return make_response(jsonify(result_dict), 400)

    else:
        result_dict = {"error": True, "message": "未登入系統"}
        return make_response(jsonify(result_dict), 403)

@api_.route("/orders/repay", methods = ["POST"])
def repay_order():
    access_token = request.cookies.get("access_token")
    if access_token:
        user_id = Auth.decode_auth_token(access_token)["data"]["id"]

        # Get request body
        data = request.get_json()
        prime = data["prime"]
        order_number = data["order"]["number"]

        sql = ("SELECT contact_name, contact_email, contact_phone FROM orders WHERE user_id=%s and order_number=%s")
        sql_data = (user_id, order_number)
        result = db.execute_sql(sql, sql_data, "one")

        contact_name = result["contact_name"]
        contact_email = result["contact_email"]
        contact_phone = result["contact_phone"]

        # Make a payment
        payment_result = make_payment(prime, order_number, contact_phone, contact_name, contact_email)

        if payment_result:
            if payment_result["status"] == 0:
                sql = ("UPDATE orders SET status='已付款' WHERE order_number=%s")
                sql_data = (order_number, )
                db.execute_sql(sql, sql_data, "one", commit=True)

                result_dict = {"data": {"number": order_number, "payment": {"status": 0, "message": "付款成功"}}}
                return jsonify(result_dict)
            else:
                result_dict = {"data": {"number": order_number, "payment": {"status": payment_result["status"], "message": payment_result["msg"]}}}
                return jsonify(result_dict)
        else:
            result_dict = {"error": True, "message": "重新付款失敗"}
            return make_response(jsonify(result_dict), 400)

    else:
        result_dict = {"error": True, "message": "未登入系統"}
        return make_response(jsonify(result_dict), 403)

# Utils
def make_payment(prime, order_number, phone, name, email):
        url = "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime"
        headers = {
            "Content-Type": "application/json",
            "x-api-key": PARTNER_KEY
        }

        data = {
                "prime": prime,
                "partner_key": PARTNER_KEY,
                "merchant_id": "vientoa13_CTBC",
                "details":"TapPay Test",
                "amount": 1,
                "cardholder": {
                    "phone_number": phone,
                    "name": name,
                    "email": email,
                },
                "remember": False
            }

        resp = requests.post(url, data = json.dumps(data), headers = headers)
        payment_result = resp.json()

        y = lambda x: "成功" if x["status"] == 0 else "失敗"

        sql = ("INSERT INTO payment (order_number, status) VALUES (%s, %s)")
        sql_data = (order_number, y(payment_result))
        db.execute_sql(sql, sql_data, "one", commit=True)

        return payment_result

def set_order_number():
    sql = ("SELECT user_id, order_number, status FROM orders WHERE DATE(order_time)=CURDATE() ORDER BY order_number DESC LIMIT 0,1")
    sql_data = ()
    result = db.execute_sql(sql, sql_data, "one")
    return result
