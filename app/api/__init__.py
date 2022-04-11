from flask import Blueprint

api_ = Blueprint("api", __name__)

from . import api_user, api_attraction, api_booking, api_order
