import jwt
import datetime

from ..config import SECRET_KEY

class Auth:
    def __init__(self):
        pass

    @staticmethod
    def encode_auth_token(id, name, email):
        payload = {
            "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=30),
            "iat": datetime.datetime.utcnow(),
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
            payload = jwt.decode(auth_token, SECRET_KEY, options={"verify_exp": False})

            if ("data" in payload and "id" in payload["data"]):
                return payload
            else:
                raise jwt.invalidTokenError
        except jwt.ExpiredSignatureError:
            return "Token 過期"
        except jwt.invalidTokenError:
            return "Token 無效"
