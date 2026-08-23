from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta
from app import db
from app.models import User

auth_bp = Blueprint('auth', __name__)

# ============================================================
# PROPÓSITO: Registrar un nuevo usuario en el sistema.
# CRÍTICO: Se valida la unicidad de email/username y se hashea la contraseña antes de persistir para evitar fugas de datos.
# ============================================================
@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No se proporcionaron datos'}), 400
        
        username = data.get('username', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        full_name = data.get('full_name', '').strip() or None
        
        if not all([username, email, password]):
            return jsonify({'error': 'Username, email y password son obligatorios'}), 400
        
        if len(password) < 6:
            return jsonify({'error': 'La contraseña debe tener al menos 6 caracteres'}), 400
        
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Este email ya está registrado'}), 409
            
        if User.query.filter_by(username=username).first():
            return jsonify({'error': 'Este username ya está en uso'}), 409
        
        new_user = User(username=username, email=email, full_name=full_name)
        new_user.set_password(password)
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            'message': 'Usuario registrado exitosamente',
            'user': new_user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor'}), 500

# ============================================================
# PROPÓSITO: Autenticar usuario y generar token JWT.
# CRÍTICO: Se devuelve un mensaje de error genérico para prevenir la enumeración de usuarios (ataque de reconocimiento).
# ============================================================
@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No se proporcionaron datos'}), 400
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'error': 'Email y password son obligatorios'}), 400
        
        user = User.query.filter_by(email=email).first()
        
        if not user or not user.check_password(password):
            return jsonify({'error': 'Credenciales inválidas'}), 401
        
        access_token = create_access_token(
            identity=str(user.id),
            expires_delta=timedelta(hours=24)
        )
        
        return jsonify({
            'message': 'Login exitoso',
            'token': access_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Error interno del servidor'}), 500

# ============================================================
# PROPÓSITO: Obtener datos del usuario actualmente autenticado.
# CRÍTICO: Se utiliza db.session.get() en lugar de query.get() para garantizar compatibilidad con SQLAlchemy 2.0.
# ============================================================
@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        current_user_id = int(get_jwt_identity())
        user = db.session.get(User, current_user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        return jsonify({'user': user.to_dict()}), 200
        
    except (ValueError, TypeError):
        return jsonify({'error': 'Token de identidad inválido'}), 401
    except Exception as e:
        return jsonify({'error': 'Error interno del servidor'}), 500

# ============================================================
# PROPÓSITO: Invalidar sesión (lógica simbólica).
# CRÍTICO: En arquitecturas JWT stateless, el logout real ocurre en el cliente eliminando el token del almacenamiento local.
# ============================================================
@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({'message': 'Logout exitoso'}), 200