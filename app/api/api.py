from flask import request
from flask import make_response
from flask import jsonify

from . import api_
from .. import db


@api_.route("/attractions", methods = ["GET"])
def show_attractions():
    page = request.args.get("page", type = int)
    keyword = request.args.get("keyword", type = str)

    if type(page) == int and page >= 0:
        start_index = 12 * page

        if keyword:
            sql = ("SELECT name, category, description, address, transport, mrt, latitude, longitude, images FROM spots WHERE name LIKE %s LIMIT %s, %s")
            sql_data = ("%" + keyword + "%", start_index, 12)

            # Check if next page exists
            count_sql = ("SELECT id FROM spots WHERE name LIKE %s ORDER BY id LIMIT %s, %s")
            count_sql_data = ("%" + keyword + "%", start_index + 12, 1)

        else:
            sql = ("SELECT name, category, description, address, transport, mrt, latitude, longitude, images FROM spots LIMIT %s, %s")
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
    sql = ("SELECT name, category, description, address, transport, mrt, latitude, longitude, images FROM spots WHERE id=%s")
    sql_data = (attractionId, )

    results = db.execute_sql(sql, sql_data, "one")
    if results:
        result_dict = {"data": results}
        return jsonify(result_dict)
    else:
        result_dict = {"error": True, "message": "Attraction id requested invalid"}
        return make_response(jsonify(result_dict), 400)

@api_.app_errorhandler(500)
def handle_500(err):
    result_dict = {"error": True, "message": "Internal server error"}
    return make_response(jsonify(result_dict), 500)
    