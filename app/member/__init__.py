from flask import Blueprint

member = Blueprint("member", __name__, template_folder = "templates")

from . import views