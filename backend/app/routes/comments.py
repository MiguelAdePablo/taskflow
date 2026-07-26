from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db, socketio
from app.models import Comment, Task, ProjectMember
from datetime import datetime

comments_bp = Blueprint('comments', __name__)

def check_task_permission(task_id, user_id):
    task = Task.query.get(task_id)
    if not task:
        return None, (jsonify({'error': 'Tarea no encontrada'}), 404)
    
    membership = ProjectMember.query.filter_by(project_id=task.project_id, user_id=user_id).first()
    if not membership:
        return None, (jsonify({'error': 'No tienes permiso para acceder a esta tarea'}), 403)
    
    return task, None

@comments_bp.route('/tasks/<int:task_id>/comments', methods=['GET'])
@jwt_required()
def get_task_comments(task_id):
    try:
        current_user_id = int(get_jwt_identity())
        task, error = check_task_permission(task_id, current_user_id)
        if error: return error
        
        comments = Comment.query.filter_by(task_id=task_id).order_by(Comment.created_at.asc()).all()
        return jsonify({'comments': [c.to_dict() for c in comments], 'total': len(comments)}), 200
    except Exception as e:
        print(f"❌ Error en get_task_comments: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@comments_bp.route('/tasks/<int:task_id>/comments', methods=['POST'])
@jwt_required()
def create_comment(task_id):
    try:
        current_user_id = int(get_jwt_identity())
        task, error = check_task_permission(task_id, current_user_id)
        if error: return error
        
        data = request.get_json()
        if not data: return jsonify({'error': 'No se proporcionaron datos'}), 400
        
        content = data.get('content', '').strip()
        if not content: return jsonify({'error': 'El contenido es obligatorio'}), 400
        if len(content) > 1000: return jsonify({'error': 'Máximo 1000 caracteres'}), 400
        
        new_comment = Comment(task_id=task_id, user_id=current_user_id, content=content)
        db.session.add(new_comment)
        db.session.commit()
        
        # 🔔 EMISIÓN DE EVENTO EN TIEMPO REAL
        print(f"📢 [BACKEND] EMITIENDO: 'task:commented' a project_{task.project_id}")
        try:
            socketio.emit(
                'task:commented',
                {
                    'comment': new_comment.to_dict(),
                    'task_id': new_comment.task_id,
                    'project_id': task.project_id, # Usamos el objeto 'task' ya en memoria
                    'timestamp': datetime.utcnow().isoformat()
                },
                room=f'project_{task.project_id}'
            )
            print(f"✅ [BACKEND] EMISIÓN EXITOSA")
        except Exception as ws_error:
            print(f"⚠️ [BACKEND] ERROR WEBSOCKET: {ws_error}")
        
        return jsonify({'message': 'Comentario creado', 'comment': new_comment.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error en create_comment: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@comments_bp.route('/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    try:
        current_user_id = int(get_jwt_identity())
        comment = Comment.query.get(comment_id)
        if not comment: return jsonify({'error': 'Comentario no encontrado'}), 404
        if comment.user_id != current_user_id:
            return jsonify({'error': 'Solo puedes eliminar tus propios comentarios'}), 403
        
        db.session.delete(comment)
        db.session.commit()
        return jsonify({'message': 'Comentario eliminado'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error en delete_comment: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500