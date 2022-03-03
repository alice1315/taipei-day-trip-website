from flask import Blueprint

api_ = Blueprint("api", __name__)

from . import api
