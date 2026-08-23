from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User

users_bp = Blueprint('users', __name__)

# ============================================================
# PROPÓSITO: Buscar usuarios por nombre, email o nombre completo para invitaciones.
# CRÍTICO: Se excluye al usuario actual de los resultados y se limita a 20 registros para evitar sobrecarga de la BD.
# ============================================================
@users_bp.route('', methods=['GET'])
@jwt_required()
def search_users():
    try:
        search_term = request.args.get('q', '').strip().lower()
        current_user_id = int(get_jwt_identity())
        
        query = User.query.filter(User.id != current_user_id)
        
        if search_term:
            query = query.filter(
                db.or_(
                    User.username.ilike(f'%{search_term}%'),
                    User.email.ilike(f'%{search_term}%'),
                    User.full_name.ilike(f'%{search_term}%')
                )
            )
        
        users = query.limit(20).all()
        return jsonify({'users': [user.to_dict() for user in users]}), 200
        
    except Exception as e:
        return jsonify({'error': 'Error interno del servidor'}), 500

# ============================================================
# PROPÓSITO: Obtener el perfil público de un usuario específico.
# CRÍTICO: No requiere validación de membresía, ya que el método to_dict() del modelo ya filtra datos sensibles.
# ============================================================
@users_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_profile(user_id):
    try:
        user = db.session.get(User, user_id)
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        return jsonify({'user': user.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': 'Error interno del servidor'}), 500

# ============================================================
# PROPÓSITO: Actualizar el perfil del usuario autenticado.
# CRÍTICO: Se valida estrictamente que el user_id de la ruta coincida con el identity del JWT para prevenir vulnerabilidades IDOR.
# ============================================================
@users_bp.route('/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user_profile(user_id):
    try:
        current_user_id = int(get_jwt_identity())
        
        if current_user_id != user_id:
            return jsonify({'error': 'No tienes permiso para actualizar este perfil'}), 403
        
        user = db.session.get(User, user_id)
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No se proporcionaron datos'}), 400
        
        if 'full_name' in data:
            user.full_name = data['full_name'].strip() or None
        if 'avatar_url' in data:
            user.avatar_url = data['avatar_url'].strip() or None
        
        db.session.commit()
        return jsonify({'message': 'Perfil actualizado exitosamente', 'user': user.to_dict()}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor'}), 500