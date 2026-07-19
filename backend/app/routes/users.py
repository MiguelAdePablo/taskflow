from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User

# Crear el blueprint para rutas de usuarios
users_bp = Blueprint('users', __name__)


# ============================================================
# ENDPOINT 1: BUSCAR USUARIOS
# GET /api/users?q=termino_busqueda
# ============================================================
@users_bp.route('', methods=['GET'])
@jwt_required()  # Requiere autenticación
def search_users():
    """
    Busca usuarios por username, email o nombre completo.
    Útil para invitar miembros a un proyecto.
    
    Query params:
    - q: término de búsqueda (opcional, si no se proporciona devuelve todos)
    
    Response (200):
    {
        "users": [
            {
                "id": 1,
                "username": "miguel",
                "email": "miguel@example.com",
                "full_name": "Miguel Ángel"
            },
            ...
        ]
    }
    """
    try:
        # Obtener el término de búsqueda de los query params
        search_term = request.args.get('q', '').strip().lower()
        
        # Obtener el ID del usuario actual (para no incluirse en los resultados)
        current_user_id = int(get_jwt_identity())
        
        # Construir la consulta
        query = User.query.filter(User.id != current_user_id)
        
        # Si hay término de búsqueda, filtrar
        if search_term:
            query = query.filter(
                db.or_(
                    User.username.ilike(f'%{search_term}%'),
                    User.email.ilike(f'%{search_term}%'),
                    User.full_name.ilike(f'%{search_term}%')
                )
            )
        
        # Ejecutar la consulta (limitar a 20 resultados para no sobrecargar)
        users = query.limit(20).all()
        
        # Convertir a diccionarios
        users_list = [user.to_dict() for user in users]
        
        return jsonify({'users': users_list}), 200
        
    except Exception as e:
        print(f"Error en search_users: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500


# ============================================================
# ENDPOINT 2: VER PERFIL DE USUARIO
# GET /api/users/:id
# ============================================================
@users_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_profile(user_id):
    """
    Obtiene el perfil público de un usuario específico.
    
    Response (200):
    {
        "user": {
            "id": 1,
            "username": "miguel",
            "email": "miguel@example.com",
            "full_name": "Miguel Ángel",
            "avatar_url": null,
            "created_at": "2026-07-06T..."
        }
    }
    """
    try:
        # Buscar el usuario por ID
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        return jsonify({'user': user.to_dict()}), 200
        
    except Exception as e:
        print(f"Error en get_user_profile: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500


# ============================================================
# ENDPOINT 3: ACTUALIZAR MI PERFIL
# PUT /api/users/:id
# ============================================================
@users_bp.route('/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user_profile(user_id):
    """
    Actualiza el perfil del usuario autenticado.
    Solo puede actualizar su propio perfil.
    
    Request body (JSON):
    {
        "full_name": "Miguel Ángel de Pablo",
        "avatar_url": "https://example.com/avatar.jpg"
    }
    
    Response (200):
    {
        "message": "Perfil actualizado exitosamente",
        "user": { ... }
    }
    """
    try:
        # Verificar que el usuario solo puede actualizar su propio perfil
        current_user_id = int(get_jwt_identity())
        
        if current_user_id != user_id:
            return jsonify({
                'error': 'No tienes permiso para actualizar este perfil'
            }), 403  # 403 = Forbidden
        
        # Buscar el usuario
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        # Obtener los datos del request
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No se proporcionaron datos'}), 400
        
        # Actualizar solo los campos permitidos
        if 'full_name' in data:
            user.full_name = data['full_name'].strip() or None
        
        if 'avatar_url' in data:
            user.avatar_url = data['avatar_url'].strip() or None
        
        # Guardar cambios en la base de datos
        db.session.commit()
        
        return jsonify({
            'message': 'Perfil actualizado exitosamente',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error en update_user_profile: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500