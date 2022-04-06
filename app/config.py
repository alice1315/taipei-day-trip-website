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

APP_ID = 124039
APP_KEY = "app_RMLknzGTJatrHEEvYsMcWbFpiYvoiWlBqN4KQw3TLcp2Pd9g5164wJOrlsXr"
