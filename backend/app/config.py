import os
from dotenv import load_dotenv

# Cargar variables de entorno desde el archivo .env
load_dotenv()

class Config:
    """Configuración base de la aplicación"""
    
    # Clave secreta para firmar cookies y tokens
    # ⚠️ En producción, usa una clave más segura y guárdala en .env
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # Configuración de la base de datos
    # Para desarrollo, usamos SQLite (archivo local)
    # Para producción, usaremos PostgreSQL en Render
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        'sqlite:///taskflow.db'  # Archivo SQLite en la carpeta backend/
    )
    
    # Desactivar tracking de modificaciones (ahorra recursos)
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Configuración de JWT (tokens de autenticación)
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = 86400  # 24 horas en segundos

class DevelopmentConfig(Config):
    """Configuración para desarrollo"""
    DEBUG = True

class ProductionConfig(Config):
    """Configuración para producción"""
    DEBUG = False

class TestingConfig(Config):
    """Configuración para testing"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///testing.db'