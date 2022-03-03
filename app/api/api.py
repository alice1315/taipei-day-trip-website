import json

from flask import request
from flask import Response

from . import api_
from .. import db


@api_.route("/attractions", methods = ["GET"])
def show_attractions():
    page = request.args.get("page", type = int)
    keyword = request.args.get("keyword", type = str)

    if type(page) == int and page >= 0:
        item_start_n = 1 + 12 * page

        if keyword:
            sql = ("SELECT name, category, description, address, transport, mrt, latitude, longitude, images FROM spots WHERE name LIKE %s LIMIT %s, %s")
            sql_data = ("%" + keyword + "%", item_start_n - 1, 12)
        else:
            sql = ("SELECT name, category, description, address, transport, mrt, latitude, longitude, images FROM spots LIMIT %s, %s")
            sql_data = (item_start_n - 1, 12)

        results = db.execute_sql(sql, sql_data, "all")
        for result in results:
            result["images"] = result["images"].split(",")
        
        if results:
            result_dict = {"nextPage": int(page) + 1, "data": results}
        else:
            result_dict = {"nextPage": None, "data": results}

        return json.dumps(result_dict)
    else:
        result_dict = {"error": True, "message": "Page requested invalid"}
        return Response(json.dumps(result_dict), status = "400")
        

@api_.route("/attraction/<attractionId>", methods = ["GET"])
def show_single_attraction(attractionId):
    sql = ("SELECT name, category, description, address, transport, mrt, latitude, longitude, images FROM spots WHERE id=%s")
    sql_data = (attractionId, )

    results = db.execute_sql(sql, sql_data, "one")
    if results:
        result_dict = {"data": results}
        return json.dumps(result_dict)
    else:
        result_dict = {"error": True, "message": "Attraction id requested invalid"}
        return Response(json.dumps(result_dict), status = "400")

@api_.app_errorhandler(500)
def handle_500(err):
    result_dict = {"error": True, "message": "Internal server error"}
    return Response(json.dumps(result_dict), status = "500")
    