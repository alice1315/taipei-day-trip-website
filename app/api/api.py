from flask import request
from flask import make_response
from flask import jsonify

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
                r_id = result["id"]
                r_name = result["name"]
                r_email = result["email"]

                auth_token = Auth.encode_auth_token(r_id, r_name, r_email)
                
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

        # Check next page if exists
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

@api_.app_errorhandler(500)
def handle_500(err):
    result_dict = {"error": True, "message": "Internal server error"}
    return make_response(jsonify(result_dict), 500)
    