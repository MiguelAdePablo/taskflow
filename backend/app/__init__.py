from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO
from .config import Config

# Inicializar extensiones (se conectan con la app más abajo)
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
socketio = SocketIO()

def create_app(config_class=Config):
    """
    Función fábrica que crea y configura la aplicación Flask.
    Esto es una buena práctica porque permite tener diferentes
    configuraciones para desarrollo, producción y testing.
    """
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Inicializar extensiones con la app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Configurar CORS para permitir peticiones desde React
    # En desarrollo, permitimos el puerto 5173 de Vite
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Inicializar SocketIO con CORS
    socketio.init_app(app, cors_allowed_origins="http://localhost:5173")
    
    # Registrar los blueprints (rutas de la API)
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
    
    # Ruta de prueba para verificar que el servidor funciona
    @app.route('/api/health')
    def health_check():
        return {'status': 'ok', 'message': 'TaskFlow API is running!'}
    
    # Importar los handlers de WebSocket (DEBE IR AQUÍ, después de registrar blueprints)
    from . import socket_handlers  
    
    return app