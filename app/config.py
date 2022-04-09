import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.urandom(64)

MYSQL_CONFIG = {
    'user': os.getenv("user"), 
    'password': os.getenv("password"),
    'host': '127.0.0.1',
    'database': 'taipei_attractions'
}

APP_ID = os.getenv("app_id")
APP_KEY = os.getenv("app_key")
PARTNER_KEY = os.getenv("partner_key")
