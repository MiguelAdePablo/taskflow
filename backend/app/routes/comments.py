from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Comment, Task, ProjectMember
from app import socketio
from datetime import datetime

# Crear el blueprint para rutas de comentarios
comments_bp = Blueprint('comments', __name__)


# ============================================================
# FUNCIÓN AUXILIAR: Verificar permisos en una tarea
# ============================================================
def check_task_permission(task_id, user_id):
    """
    Verifica que el usuario tenga permisos para acceder a una tarea.
    El usuario debe ser miembro del proyecto al que pertenece la tarea.
    
    Returns:
        (task, error_response)
        Si hay error, error_response contiene la respuesta HTTP de error
    """
    # Buscar la tarea
    task = Task.query.get(task_id)
    if not task:
        return None, (jsonify({'error': 'Tarea no encontrada'}), 404)
    
    # Verificar que el usuario es miembro del proyecto
    membership = ProjectMember.query.filter_by(
        project_id=task.project_id,
        user_id=user_id
    ).first()
    
    if not membership:
        return None, (jsonify({
            'error': 'No tienes permiso para acceder a esta tarea'
        }), 403)
    
    return task, None


# ============================================================
# ENDPOINT 1: LISTAR COMENTARIOS DE UNA TAREA
# GET /api/tasks/:task_id/comments
# ============================================================
@comments_bp.route('/tasks/<int:task_id>/comments', methods=['GET'])
@jwt_required()
def get_task_comments(task_id):
    """
    Lista todos los comentarios de una tarea, ordenados por fecha (más antiguos primero).
    Solo accesible para miembros del proyecto.
    
    Response (200):
    {
        "comments": [
            {
                "id": 1,
                "task_id": 5,
                "user_id": 2,
                "content": "¿Podemos revisar esto juntos?",
                "created_at": "2026-07-09T...",
                "author": {
                    "id": 2,
                    "username": "ana",
                    "full_name": "Ana García",
                    "avatar_url": null
                }
            },
            ...
        ],
        "total": 3
    }
    """
    try:
        current_user_id = int(get_jwt_identity())
        
        # Verificar permisos
        task, error = check_task_permission(task_id, current_user_id)
        if error:
            return error
        
        # Obtener comentarios ordenados por fecha (más antiguos primero)
        comments = Comment.query.filter_by(task_id=task_id)\
            .order_by(Comment.created_at.asc())\
            .all()
        
        # Convertir a diccionarios
        comments_list = [comment.to_dict() for comment in comments]
        
        return jsonify({
            'comments': comments_list,
            'total': len(comments_list)
        }), 200
        
    except Exception as e:
        print(f"Error en get_task_comments: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500


# ============================================================
# ENDPOINT 2: CREAR COMENTARIO
# POST /api/tasks/:task_id/comments
# ============================================================
@comments_bp.route('/tasks/<int:task_id>/comments', methods=['POST'])
@jwt_required()
def create_comment(task_id):
    """
    Crea un nuevo comentario en una tarea.
    Solo miembros del proyecto pueden comentar.
    
    Request body (JSON):
    {
        "content": "Este diseño me parece excelente"
    }
    
    Response (201):
    {
        "message": "Comentario creado exitosamente",
        "comment": { ... }
    }
    """
    try:
        current_user_id = int(get_jwt_identity())
        
        # Verificar permisos
        task, error = check_task_permission(task_id, current_user_id)
        if error:
            return error
        
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No se proporcionaron datos'}), 400
        
        content = data.get('content', '').strip()
        
        # Validar que el contenido no esté vacío
        if not content:
            return jsonify({
                'error': 'El contenido del comentario es obligatorio'
            }), 400
        
        # Validar longitud máxima (opcional, pero buena práctica)
        if len(content) > 1000:
            return jsonify({
                'error': 'El comentario no puede tener más de 1000 caracteres'
            }), 400
        
        # Crear el comentario
        new_comment = Comment(
            task_id=task_id,
            user_id=current_user_id,
            content=content
        )
        
        db.session.add(new_comment)
        db.session.commit()
        
        # 🔔 EMITIR EVENTO a la sala del proyecto
        try:
            socketio.emit(
                'task:commented',
                {
                    'comment': new_comment.to_dict(),
                    'task_id': task_id,
                    'project_id': task.project_id,
                    'commented_by': current_user_id,
                    'timestamp': datetime.utcnow().isoformat()
                },
                room=f'project_{task.project_id}'
            )
        except Exception as ws_error:
            print(f"⚠️ No se pudo emitir evento WebSocket: {ws_error}")
        
        return jsonify({
            'message': 'Comentario creado exitosamente',
            'comment': new_comment.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error en create_comment: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500


# ============================================================
# ENDPOINT 3: ELIMINAR COMENTARIO
# DELETE /api/comments/:id
# ============================================================
@comments_bp.route('/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    """
    Elimina un comentario.
    Solo el autor del comentario puede eliminarlo.
    
    Response (200):
    {
        "message": "Comentario eliminado exitosamente"
    }
    """
    try:
        current_user_id = int(get_jwt_identity())
        
        # Buscar el comentario
        comment = Comment.query.get(comment_id)
        
        if not comment:
            return jsonify({'error': 'Comentario no encontrado'}), 404
        
        # Verificar que el usuario es el autor del comentario
        if comment.user_id != current_user_id:
            return jsonify({
                'error': 'Solo puedes eliminar tus propios comentarios'
            }), 403
        
        # Eliminar el comentario
        db.session.delete(comment)
        db.session.commit()
        
        return jsonify({
            'message': 'Comentario eliminado exitosamente'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error en delete_comment: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500