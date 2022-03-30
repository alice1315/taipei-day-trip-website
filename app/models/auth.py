import jwt
import datetime

from ..config import SECRET_KEY

class Auth:
    def __init__(self):
        pass

    @staticmethod
    def encode_auth_token(id, name, email):
        payload = {
            "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=60),
            "iat": datetime.datetime.now(datetime.timezone.utc),
            "data": {
                "id": id,
                "name": name,
                "email": email
            }
        }
        return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

    @staticmethod
    def decode_auth_token(auth_token):
        try:
            payload = jwt.decode(auth_token, SECRET_KEY, algorithms=["HS256"])

            if ("data" in payload and "id" in payload["data"]):
                return payload
            else:
                raise jwt.InvalidTokenError

        except jwt.ExpiredSignatureError:
            return {"error": True, "message": "登入已逾時"}
        except jwt.InvalidTokenError:
            return {"error": True, "message": "無效登入"}
