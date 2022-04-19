from flask import Flask

from .models.database import Database
from .config import MYSQL_CONFIG

db = Database(MYSQL_CONFIG)

def create_app():
    app = Flask(__name__, static_folder = "static", static_url_path = "/")
    app.config["JSON_AS_ASCII"] = False
    app.config["TEMPLATES_AUTO_RELOAD"] = True

    from .home import home as home_blueprint
    from .member import member as member_blueprint
    from .api import api_ as api_blueprint

    app.register_blueprint(home_blueprint)
    app.register_blueprint(member_blueprint)
    app.register_blueprint(api_blueprint, url_prefix="/api")

    return app
