from flask import request
from flask import make_response
from flask import jsonify

from datetime import datetime

from . import api_
from .. import db
from app.models.auth import Auth

# Booking
@api_.route("/booking", methods= ["GET"])
def get_booking():
    access_token = request.cookies.get("access_token")
    if access_token:
        user_id = Auth.decode_auth_token(access_token)["data"]["id"]

        sql = ("SELECT attraction_id, attraction_name, attraction_address, attraction_images, date, time, price FROM shopping_cart WHERE user_id=%s")
        sql_data = (user_id, )

        result = db.execute_sql(sql, sql_data, "one")

        if result:
            result["image"] = result["attraction_images"].split(",")[0]
            result.pop("attraction_images")

            result_dict = {
                "data": {
                    "attraction":{
                        "id": result["attraction_id"],
                        "name": result["attraction_name"],
                        "address": result["attraction_address"],
                        "image": result["image"]
                    },
                "date": datetime.strftime(result["date"], "%Y-%m-%d"),
                "time": result["time"],
                "price": result["price"]
                }
            }
            return jsonify(result_dict)

        else:
            result_dict = {"data": None}
            return jsonify(result_dict)
    else:
        result_dict = {"error": True, "message": "未登入系統"}
        return make_response(jsonify(result_dict), 403)

@api_.route("/booking", methods = ["POST"])
def make_booking():
    access_token = request.cookies.get("access_token")
    if access_token:
        user_id = Auth.decode_auth_token(access_token)["data"]["id"]

        data = request.get_json()
        date = datetime.strptime(data["date"], "%Y-%m-%d")
        if date > datetime.now():
            attraction_id = data["attractionId"]

            sql = ("SELECT name, address, images FROM spots WHERE id=%s")
            sql_data = (attraction_id,)
            result = db.execute_sql(sql, sql_data, "one")

            attraction_name = result["name"]
            attraction_address = result["address"]
            attraction_images = result["images"]
            time = data["time"]
            price = data["price"]

            sql = ("INSERT INTO shopping_cart (user_id, attraction_id, attraction_name, attraction_address, attraction_images, date, time, price) VALUES (%s, %s, %s, %s, %s, %s, %s, %s) ON DUPLICATE KEY UPDATE attraction_id=%s, attraction_name=%s, attraction_address=%s, attraction_images=%s, date=%s, time=%s, price=%s")
            sql_data = (user_id, attraction_id, attraction_name, attraction_address, attraction_images, date, time, price, attraction_id, attraction_name, attraction_address, attraction_images, date, time, price)

            db.execute_sql(sql, sql_data, "one")
            db.cnx.commit()

            result_dict = {"ok": True}
            return jsonify(result_dict)
        else:
            result_dict = {"error": True, "message": "無法選擇過去日期"}
            return make_response(jsonify(result_dict), 400)

    else:
        result_dict = {"error": True, "message": "未登入系統"}
        return make_response(jsonify(result_dict), 403)

@api_.route("/booking", methods = ["DELETE"])
def delete_booking():
    access_token = request.cookies.get("access_token")
    if access_token:
        user_id = Auth.decode_auth_token(access_token)["data"]["id"]

        sql = ("DELETE FROM shopping_cart WHERE user_id=%s")
        sql_data = (user_id, )

        db.execute_sql(sql, sql_data, "one")
        db.cnx.commit()

        result_dict = {"ok": True}
        return jsonify(result_dict)
    else:
        result_dict = {"error": True, "message": "未登入系統"}
        return make_response(jsonify(result_dict), 403)