import os
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO
from .config import Config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
socketio = SocketIO()

# ============================================================
# PROPÓSITO: Función fábrica para inicializar la aplicación Flask.
# CRÍTICO: Se unificó la configuración de CORS y SocketIO para evitar la sobrescritura accidental que dejaba el origen como "*" (vulnerabilidad de origen cruzado).
# ============================================================
def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
    allowed_origins = [frontend_url, "http://localhost:5173",  "https://taskflow-frontend-six-zeta.vercel.app"]
    
    CORS(app, 
        origins=allowed_origins,
        supports_credentials=True,
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"]
        )
    # socketio.init_app(app, cors_allowed_origins=allowed_origins)
    socketio.init_app(app, cors_allowed_origins=allowed_origins, async_mode='eventlet')

       # ✅ LOG para debug
    print(f"🔒 CORS configurado para: {allowed_origins}")
    print(f"🔒 FRONTEND_URL desde env: {frontend_url}")

    from .routes.auth import auth_bp
    from .routes.projects import projects_bp
    from .routes.tasks import tasks_bp
    from .routes.users import users_bp
    from .routes.comments import comments_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(projects_bp, url_prefix='/api/projects')
    app.register_blueprint(tasks_bp, url_prefix='/api')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(comments_bp, url_prefix='/api')

    @app.route('/api/health')
    def health_check():
        return jsonify({'status': 'ok', 'message': 'TaskFlow API is running!'})

    from . import socket_handlers

        # Importar los handlers de WebSocket
    from . import socket_handlers  

    # ✅ NUEVO: Verificar y crear tablas en la base de datos al iniciar
    with app.app_context():
        try:
            db.create_all()
            print("✅ Base de datos conectada. Tablas verificadas/creadas correctamente.")
        except Exception as e:
            print(f"⚠️ Error al inicializar la base de datos: {e}")

    return app