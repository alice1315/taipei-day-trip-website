from flask import request
from flask import make_response
from flask import jsonify

from datetime import datetime

from . import api_
from .. import db
from app.models.auth import Auth

# Users
@api_.route("/user", methods = ["GET"])
def auth():
    access_token = request.cookies.get("access_token")
    if access_token:
        result_dict = Auth.decode_auth_token(access_token)
        return jsonify(result_dict)
    else:
        result_dict = {"data": None}
        return jsonify(result_dict)

@api_.route("/user", methods = ["PATCH"])
def sign_in():
    data = request.get_json()

    email = data["email"]
    password = data["password"]

    if (not email or not password):
        result_dict = {"error": True, "message": "請輸入登入資料"}
        return make_response(jsonify(result_dict), 400)

    else:
        sql = ("SELECT id, name, email, password FROM member WHERE email=%s")
        sql_data = (email, )
        result = db.execute_sql(sql, sql_data, "one")

        if result == None:
            result_dict = {"error": True, "message": "此Email尚未註冊"}
            return make_response(jsonify(result_dict), 400)
        else:
            if password == result["password"]:
                auth_token = Auth.encode_auth_token(result["id"], result["name"], result["email"])
                
                result_dict = {"ok": True}
                response = make_response(jsonify(result_dict))
                response.set_cookie("access_token", auth_token)
                return response
            else:
                result_dict = {"error": True, "message": "密碼輸入錯誤"}
                return make_response(jsonify(result_dict), 400)

@api_.route("/user", methods = ["POST"])
def sign_up():
    data = request.get_json()

    name = data["name"]
    email = data["email"]
    password = data["password"]

    if (not name or not email or not password):
        result_dict = {"error": True, "message": "請輸入註冊資料"}
        return make_response(jsonify(result_dict), 400)

    else:
        sql = ("SELECT id FROM member WHERE email=%s")
        sql_data = (email, )
        result = db.execute_sql(sql, sql_data, "one")

        if result:
            result_dict = {"error": True, "message": "Email 已經註冊帳戶"}
            return make_response(jsonify(result_dict), 400)
        else:
            sql = ("INSERT INTO member (name, email, password) VALUES (%s, %s, %s)")
            sql_data = (name, email, password)
            db.execute_sql(sql, sql_data, "one")
            db.cnx.commit()

            result_dict = {"ok": True}
            return jsonify(result_dict)

@api_.route("/user", methods = ["DELETE"])
def sign_out():
    access_token = request.cookies.get("access_token")
    if access_token:
        result_dict = {"ok": True}
        response = make_response(jsonify(result_dict))
        response.set_cookie("access_token", "", expires=0)
        return response


# Attractions
@api_.route("/attractions", methods = ["GET"])
def show_attractions():
    page = request.args.get("page", type = int)
    keyword = request.args.get("keyword", type = str)

    if type(page) == int and page >= 0:
        start_index = 12 * page

        if keyword:
            sql = ("SELECT id, name, category, description, address, transport, mrt, latitude, longitude, images FROM spots WHERE name LIKE %s LIMIT %s, %s")
            sql_data = ("%" + keyword + "%", start_index, 12)

            # Check if next page exists
            count_sql = ("SELECT id FROM spots WHERE name LIKE %s ORDER BY id LIMIT %s, %s")
            count_sql_data = ("%" + keyword + "%", start_index + 12, 1)

        else:
            sql = ("SELECT id, name, category, description, address, transport, mrt, latitude, longitude, images FROM spots LIMIT %s, %s")
            sql_data = (start_index, 12)

            # Check if next page exists
            count_sql = ("SELECT id FROM spots ORDER BY id LIMIT %s, %s")
            count_sql_data = (start_index + 12, 1)

        results = db.execute_sql(sql, sql_data, "all")
        for result in results:
            result["images"] = result["images"].split(",")

        # Check if next page exists
        count = db.execute_sql(count_sql, count_sql_data, "one")
        
        if count:
            result_dict = {"nextPage": page + 1, "data": results}
        else:
            result_dict = {"nextPage": None, "data": results}

        return jsonify(result_dict)

    else:
        result_dict = {"error": True, "message": "Page requested invalid"}
        return make_response(jsonify(result_dict), 400)

@api_.route("/attraction/<attractionId>", methods = ["GET"])
def show_single_attraction(attractionId):
    sql = ("SELECT id, name, category, description, address, transport, mrt, latitude, longitude, images FROM spots WHERE id=%s")
    sql_data = (attractionId, )

    result = db.execute_sql(sql, sql_data, "one")
    result["images"] = result["images"].split(",")

    if result:
        result_dict = {"data": result}
        return jsonify(result_dict)
    else:
        result_dict = {"error": True, "message": "Attraction id requested invalid"}
        return make_response(jsonify(result_dict), 400)


# Booking
@api_.route("/booking", methods= ["GET"])
def get_booking():
    access_token = request.cookies.get("access_token")
    if access_token:
        user_id = Auth.decode_auth_token(access_token)["data"]["id"]

        sql = ("SELECT s.id, s.name, s.address, s.images, c.date, c.time, c.price FROM spots s, shopping_cart c WHERE c.user_id=%s and c.attraction_id=s.id")
        sql_data = (user_id, )

        result = db.execute_sql(sql, sql_data, "one")

        if result:
            result["image"] = result["images"].split(",")[0]
            result.pop("images")

            result_dict = {
                "data": {
                    "attraction":{
                        "id": result["id"],
                        "name": result["name"],
                        "address": result["address"],
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
            x = lambda a: "早上 9 點至 12 點" if a == "morning" else "下午 1 點至 4 點"
            time = x(data["time"])
            price = data["price"]

            sql = ("INSERT INTO shopping_cart (user_id, attraction_id, date, time, price) VALUES (%s, %s, %s, %s, %s) ON DUPLICATE KEY UPDATE attraction_id=%s, date=%s, time=%s, price=%s")
            sql_data = (user_id, attraction_id, date, time, price, attraction_id, date, time, price)

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
    

@api_.app_errorhandler(500)
def handle_500(err):
    result_dict = {"error": True, "message": "Internal server error"}
    return make_response(jsonify(result_dict), 500)
