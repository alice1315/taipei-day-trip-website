from flask import request, make_response, jsonify

from . import api_
from .. import db
from app.models.auth import Auth

# User
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
    

@api_.app_errorhandler(500)
def handle_500(err):
    result_dict = {"error": True, "message": "Internal server error"}
    return make_response(jsonify(result_dict), 500)
