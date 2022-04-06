from flask import request
from flask import make_response
from flask import jsonify

from . import api_
from .. import db

# Order
@api_.route("/orders", methods = ["POST"])
def make_orders():
    data = request.get_json()

    

    return data