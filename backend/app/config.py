import os
from dotenv import load_dotenv

load_dotenv()

# ============================================================
# PROPÓSITO: Definir configuraciones base y por entorno.
# CRÍTICO: Se eliminaron los valores por defecto inseguros para SECRET_KEY. La aplicación ahora fallará explícitamente al iniciar si no se proporcionan, evitando despliegues accidentales con credenciales de desarrollo.
# ============================================================
class Config:
    SECRET_KEY = os.getenv('SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///taskflow.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    JWT_ACCESS_TOKEN_EXPIRES = 86400

    def __init__(self):
        if not self.SECRET_KEY or not self.JWT_SECRET_KEY:
            raise ValueError("SECRET_KEY y JWT_SECRET_KEY son variables de entorno obligatorias.")

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///testing.db'