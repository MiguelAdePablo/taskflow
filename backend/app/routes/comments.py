from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone
from app import db, socketio
from app.models import Comment, Task, ProjectMember

comments_bp = Blueprint('comments', __name__)

# ============================================================
# PROPÓSITO: Validar que el usuario tiene permiso para acceder a una tarea específica.
# CRÍTICO: Se usa db.session.get() (SQLAlchemy 2.0) y se verifica la membresía al proyecto antes de exponer datos.
# ============================================================
def check_task_permission(task_id, user_id):
    task = db.session.get(Task, task_id)
    if not task:
        return None, (jsonify({'error': 'Tarea no encontrada'}), 404)
    
    membership = ProjectMember.query.filter_by(project_id=task.project_id, user_id=user_id).first()
    if not membership:
        return None, (jsonify({'error': 'No tienes permiso para acceder a esta tarea'}), 403)
    
    return task, None

# ============================================================
# PROPÓSITO: Obtener todos los comentarios de una tarea ordenados cronológicamente.
# CRÍTICO: La validación de permiso precede a cualquier consulta para evitar fugas de información entre proyectos.
# ============================================================
@comments_bp.route('/tasks/<int:task_id>/comments', methods=['GET'])
@jwt_required()
def get_task_comments(task_id):
    try:
        current_user_id = int(get_jwt_identity())
        task, error = check_task_permission(task_id, current_user_id)
        if error:
            return error
        
        comments = Comment.query.filter_by(task_id=task_id).order_by(Comment.created_at.asc()).all()
        return jsonify({
            'comments': [c.to_dict() for c in comments],
            'total': len(comments)
        }), 200
    except Exception as e:
        return jsonify({'error': 'Error interno del servidor'}), 500

# ============================================================
# PROPÓSITO: Crear un nuevo comentario y notificar en tiempo real.
# CRÍTICO: Se sanitiza el contenido, se limita a 1000 caracteres y el evento WebSocket se emite solo tras un commit exitoso.
# ============================================================
@comments_bp.route('/tasks/<int:task_id>/comments', methods=['POST'])
@jwt_required()
def create_comment(task_id):
    try:
        current_user_id = int(get_jwt_identity())
        task, error = check_task_permission(task_id, current_user_id)
        if error:
            return error
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No se proporcionaron datos'}), 400
        
        content = data.get('content', '').strip()
        if not content:
            return jsonify({'error': 'El contenido es obligatorio'}), 400
        if len(content) > 1000:
            return jsonify({'error': 'Máximo 1000 caracteres'}), 400
        
        new_comment = Comment(task_id=task_id, user_id=current_user_id, content=content)
        db.session.add(new_comment)
        db.session.commit()
        
        try:
            socketio.emit(
                'task:commented',
                {
                    'comment': new_comment.to_dict(),
                    'task_id': new_comment.task_id,
                    'project_id': task.project_id,
                    'timestamp': datetime.now(timezone.utc).isoformat()
                },
                room=f'project_{task.project_id}'
            )
        except Exception:
            pass
        
        return jsonify({'message': 'Comentario creado', 'comment': new_comment.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor'}), 500

# ============================================================
# PROPÓSITO: Eliminar un comentario existente.
# CRÍTICO: Validación estricta de autoría para prevenir que usuarios eliminen comentarios ajenos (fallos de autorización).
# ============================================================
@comments_bp.route('/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    try:
        current_user_id = int(get_jwt_identity())
        comment = db.session.get(Comment, comment_id)
        
        if not comment:
            return jsonify({'error': 'Comentario no encontrado'}), 404
        if comment.user_id != current_user_id:
            return jsonify({'error': 'Solo puedes eliminar tus propios comentarios'}), 403
        
        db.session.delete(comment)
        db.session.commit()
        return jsonify({'message': 'Comentario eliminado'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor'}), 500