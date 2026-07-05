from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import (
    create_access_token, 
    jwt_required, 
    get_jwt_identity
)
from datetime import timedelta
from app import db
from app.models import User

# Crear el blueprint para rutas de autenticación
auth_bp = Blueprint('auth', __name__)


# ============================================================
# ENDPOINT 1: REGISTRO DE USUARIO
# POST /api/auth/register
# ============================================================
@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Registra un nuevo usuario en el sistema.
    
    Request body (JSON):
    {
        "username": "miguel",
        "email": "miguel@example.com",
        "password": "miPassword123",
        "full_name": "Miguel Ángel"  (opcional)
    }
    
    Response (201):
    {
        "message": "Usuario registrado exitosamente",
        "user": { "id": 1, "username": "miguel", "email": "..." }
    }
    """
    try:
        # 1. Obtener los datos del request JSON
        data = request.get_json()
        
        # 2. Validar que vengan los campos obligatorios
        if not data:
            return jsonify({'error': 'No se proporcionaron datos'}), 400
        
        username = data.get('username', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        full_name = data.get('full_name', '').strip()
        
        # Validaciones básicas
        if not username or not email or not password:
            return jsonify({
                'error': 'Username, email y password son obligatorios'
            }), 400
        
        if len(password) < 6:
            return jsonify({
                'error': 'La contraseña debe tener al menos 6 caracteres'
            }), 400
        
        # 3. Verificar que el email y username no estén ya registrados
        if User.query.filter_by(email=email).first():
            return jsonify({
                'error': 'Este email ya está registrado'
            }), 409  # 409 = Conflict
        
        if User.query.filter_by(username=username).first():
            return jsonify({
                'error': 'Este username ya está en uso'
            }), 409
        
        # 4. Crear el nuevo usuario
        new_user = User(
            username=username,
            email=email,
            full_name=full_name or None
        )
        # ⚠️ IMPORTANTE: Usamos el método set_password para hashear
        new_user.set_password(password)
        
        # 5. Guardar en la base de datos
        db.session.add(new_user)
        db.session.commit()
        
        # 6. Responder con éxito
        return jsonify({
            'message': 'Usuario registrado exitosamente',
            'user': new_user.to_dict()
        }), 201  # 201 = Created
        
    except Exception as e:
        # Si algo falla, hacer rollback para no dejar la BD inconsistente
        db.session.rollback()
        print(f"Error en register: {str(e)}")  # Para depuración
        return jsonify({
            'error': 'Error interno del servidor'
        }), 500


# ============================================================
# ENDPOINT 2: INICIO DE SESIÓN
# POST /api/auth/login
# ============================================================
@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Inicia sesión y devuelve un token JWT.
    
    Request body (JSON):
    {
        "email": "miguel@example.com",
        "password": "miPassword123"
    }
    
    Response (200):
    {
        "message": "Login exitoso",
        "token": "eyJhbGciOiJIUzI1NiIs...",
        "user": { "id": 1, "username": "miguel", ... }
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No se proporcionaron datos'}), 400
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({
                'error': 'Email y password son obligatorios'
            }), 400
        
        # Buscar el usuario por email
        user = User.query.filter_by(email=email).first()
        
        # ⚠️ SEGURIDAD: Mensaje genérico para no revelar si el email existe
        if not user or not user.check_password(password):
            return jsonify({
                'error': 'Credenciales inválidas'
            }), 401  # 401 = Unauthorized
        
        # Crear el token JWT (válido por 24 horas)
        access_token = create_access_token(
            identity=str(user.id),  # El "identity" es el ID del usuario
            expires_delta=timedelta(hours=24)
        )
        
        return jsonify({
            'message': 'Login exitoso',
            'token': access_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        print(f"Error en login: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500


# ============================================================
# ENDPOINT 3: OBTENER USUARIO ACTUAL
# GET /api/auth/me
# ============================================================
@auth_bp.route('/me', methods=['GET'])
@jwt_required()  # ⚠️ Este decorador PROTEGE la ruta - requiere token válido
def get_current_user():
    """
    Devuelve los datos del usuario actualmente autenticado.
    Requiere enviar el token JWT en el header:
    Authorization: Bearer <token>
    """
    try:
        # get_jwt_identity() devuelve el "identity" que pusimos en el token (el user.id)
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        return jsonify({'user': user.to_dict()}), 200
        
    except Exception as e:
        print(f"Error en get_current_user: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500


# ============================================================
# ENDPOINT 4: CERRAR SESIÓN (opcional con JWT)
# POST /api/auth/logout
# ============================================================
@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    Con JWT, el "logout" realmente lo hace el frontend (borrando el token).
    Este endpoint es más simbólico, pero útil para logs/auditoría.
    """
    return jsonify({'message': 'Logout exitoso'}), 200