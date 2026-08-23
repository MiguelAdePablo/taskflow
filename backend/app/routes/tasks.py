from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone
from app import db, socketio
from app.models import Task, Project, ProjectMember

tasks_bp = Blueprint('tasks', __name__)

# ============================================================
# PROPÓSITO: Validar permisos de acceso a un proyecto desde el contexto de tareas.
# CRÍTICO: Reutiliza la lógica de autorización para garantizar que solo miembros del proyecto puedan interactuar con sus tareas.
# ============================================================
def check_project_permission(project_id, user_id, require_owner=False):
    project = db.session.get(Project, project_id)
    if not project:
        return None, None, (jsonify({'error': 'Proyecto no encontrado'}), 404)
    
    membership = ProjectMember.query.filter_by(project_id=project_id, user_id=user_id).first()
    if not membership:
        return None, None, (jsonify({'error': 'No tienes permiso para acceder a este proyecto'}), 403)
    
    if require_owner and project.owner_id != user_id:
        return None, None, (jsonify({'error': 'Solo el propietario puede realizar esta acción'}), 403)
    
    return project, membership, None

# ============================================================
# PROPÓSITO: Listar tareas de un proyecto con filtros opcionales.
# CRÍTICO: Se implementa un casting seguro de parámetros de consulta para prevenir errores 500 por inyección de tipos no enteros en 'assigned_to' o 'created_by'.
# ============================================================
@tasks_bp.route('/projects/<int:project_id>/tasks', methods=['GET'])
@jwt_required()
def get_project_tasks(project_id):
    try:
        current_user_id = int(get_jwt_identity())
        project, _, error = check_project_permission(project_id, current_user_id)
        if error:
            return error
        
        query = Task.query.filter_by(project_id=project_id)
        
        for param in ['status', 'priority', 'assigned_to', 'created_by']:
            val = request.args.get(param)
            if val:
                if param in ['assigned_to', 'created_by']:
                    try:
                        val = int(val)
                    except ValueError:
                        return jsonify({'error': f'El valor de {param} debe ser un número entero'}), 400
                query = query.filter_by(**{param: val})
        
        tasks = query.order_by(Task.created_at.desc()).all()
        return jsonify({'tasks': [task.to_dict() for task in tasks], 'total': len(tasks)}), 200
    except Exception as e:
        return jsonify({'error': 'Error interno del servidor'}), 500

# ============================================================
# PROPÓSITO: Crear una nueva tarea en un proyecto.
# CRÍTICO: Se valida que el usuario asignado sea miembro del proyecto antes de la creación para evitar asignaciones huérfanas o inválidas.
# ============================================================
@tasks_bp.route('/projects/<int:project_id>/tasks', methods=['POST'])
@jwt_required()
def create_task(project_id):
    try:
        current_user_id = int(get_jwt_identity())
        project, _, error = check_project_permission(project_id, current_user_id)
        if error:
            return error
        
        data = request.get_json() or {}
        title = data.get('title', '').strip()
        if not title:
            return jsonify({'error': 'El título es obligatorio'}), 400
        
        priority = data.get('priority', 'medium')
        if priority not in ['low', 'medium', 'high']:
            return jsonify({'error': 'La prioridad debe ser: low, medium o high'}), 400
        
        assigned_to = data.get('assigned_to')
        if assigned_to:
            if not ProjectMember.query.filter_by(project_id=project_id, user_id=assigned_to).first():
                return jsonify({'error': 'El usuario asignado no es miembro del proyecto'}), 400
        
        due_date = None
        if data.get('due_date'):
            try:
                due_date = datetime.fromisoformat(data['due_date'])
            except ValueError:
                return jsonify({'error': 'Formato de fecha inválido'}), 400
        
        new_task = Task(
            project_id=project_id,
            title=title,
            description=data.get('description', '').strip() or None,
            priority=priority,
            status='pending',
            due_date=due_date,
            assigned_to=assigned_to,
            created_by=current_user_id
        )
        
        db.session.add(new_task)
        db.session.commit()

        try:
            socketio.emit(
                'task:created',
                {
                    'task': new_task.to_dict(),
                    'project_id': project_id,
                    'created_by': current_user_id,
                    'timestamp': datetime.now(timezone.utc).isoformat()
                },
                room=f'project_{project_id}'
            )
            
            if assigned_to and assigned_to != current_user_id:
                socketio.emit(
                    'task:assigned',
                    {
                        'task': new_task.to_dict(),
                        'project_id': project_id,
                        'message': f'Se te ha asignado: {new_task.title}',
                        'timestamp': datetime.now(timezone.utc).isoformat()
                    },
                    room=f'user_{assigned_to}'
                )
        except Exception:
            pass
        
        return jsonify({'message': 'Tarea creada exitosamente', 'task': new_task.to_dict()}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor'}), 500

# ============================================================
# PROPÓSITO: Obtener el detalle completo de una tarea específica.
# CRÍTICO: Se verifica el permiso a nivel de proyecto antes de exponer los detalles de la tarea, incluyendo la información del proyecto padre.
# ============================================================
@tasks_bp.route('/tasks/<int:task_id>', methods=['GET'])
@jwt_required()
def get_task(task_id):
    try:
        current_user_id = int(get_jwt_identity())
        task = db.session.get(Task, task_id)
        if not task:
            return jsonify({'error': 'Tarea no encontrada'}), 404
        
        _, _, error = check_project_permission(task.project_id, current_user_id)
        if error:
            return error
        
        task_dict = task.to_dict()
        task_dict['project'] = task.project.to_dict()
        return jsonify({'task': task_dict}), 200
    except Exception as e:
        return jsonify({'error': 'Error interno del servidor'}), 500

# ============================================================
# PROPÓSITO: Actualizar el estado, prioridad o asignación de una tarea.
# CRÍTICO: Permite edición al creador, asignado o propietario. Se detecta el campo modificado para enviar notificaciones WebSocket granulares y evitar spam de actualizaciones.
# ============================================================
@tasks_bp.route('/tasks/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    try:
        current_user_id = int(get_jwt_identity())
        task = db.session.get(Task, task_id)
        if not task:
            return jsonify({'error': 'Tarea no encontrada'}), 404
        
        project = task.project
        can_edit = (task.created_by == current_user_id or 
                    task.assigned_to == current_user_id or 
                    project.owner_id == current_user_id)
        if not can_edit:
            return jsonify({'error': 'No tienes permiso para editar esta tarea'}), 403
        
        data = request.get_json() or {}
        if 'title' in data:
            if not data['title'].strip():
                return jsonify({'error': 'El título no puede estar vacío'}), 400
            task.title = data['title'].strip()
            
        if 'description' in data:
            task.description = data['description'].strip() or None
            
        if 'status' in data and data['status'] in ['pending', 'in_progress', 'completed']:
            task.status = data['status']
            
        if 'priority' in data and data['priority'] in ['low', 'medium', 'high']:
            task.priority = data['priority']
            
        if 'due_date' in data:
            task.due_date = datetime.fromisoformat(data['due_date']) if data['due_date'] else None
            
        if 'assigned_to' in data:
            assigned_to = data['assigned_to']
            if assigned_to is None:
                task.assigned_to = None
            elif ProjectMember.query.filter_by(project_id=task.project_id, user_id=assigned_to).first():
                task.assigned_to = assigned_to
            else:
                return jsonify({'error': 'El usuario asignado no es miembro del proyecto'}), 400
        
        db.session.commit()
        
        updated_field = None
        new_value = None
        if 'status' in data:
            updated_field = 'status'
            new_value = data['status']
        elif 'priority' in data:
            updated_field = 'priority'
            new_value = data['priority']
        
        try:
            socketio.emit(
                'task:updated',
                {
                    'task': task.to_dict(),
                    'project_id': task.project_id,
                    'updated_by': current_user_id,
                    'updated_field': updated_field,
                    'new_value': new_value,
                    'timestamp': datetime.now(timezone.utc).isoformat()
                },
                room=f'project_{task.project_id}'
            )
        except Exception:
            pass
            
        return jsonify({'message': 'Tarea actualizada exitosamente', 'task': task.to_dict()}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor'}), 500

# ============================================================
# PROPÓSITO: Eliminar una tarea del sistema.
# CRÍTICO: Restringe la eliminación exclusivamente al creador de la tarea o al propietario del proyecto, protegiendo contra eliminaciones maliciosas por parte de otros miembros.
# ============================================================
@tasks_bp.route('/tasks/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    try:
        current_user_id = int(get_jwt_identity())
        task = db.session.get(Task, task_id)
        if not task:
            return jsonify({'error': 'Tarea no encontrada'}), 404
        
        project = task.project
        if task.created_by != current_user_id and project.owner_id != current_user_id:
            return jsonify({'error': 'No tienes permiso para eliminar esta tarea'}), 403
        
        db.session.delete(task)
        db.session.commit()
        return jsonify({'message': 'Tarea eliminada exitosamente'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor'}), 500