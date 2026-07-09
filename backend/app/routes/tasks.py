from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app import db
from app.models import Task, Project, ProjectMember, User
from app import socketio  
from datetime import datetime

# Crear el blueprint para rutas de tareas
tasks_bp = Blueprint('tasks', __name__)


# ============================================================
# FUNCIÓN AUXILIAR: Verificar permisos en un proyecto
# ============================================================
def check_project_permission(project_id, user_id, require_owner=False):
    """
    Verifica que el usuario tenga permisos en el proyecto.
    """
    project = Project.query.get(project_id)
    if not project:
        return None, None, (jsonify({'error': 'Proyecto no encontrado'}), 404)
    
    membership = ProjectMember.query.filter_by(
        project_id=project_id,
        user_id=user_id
    ).first()
    
    if not membership:
        return None, None, (jsonify({
            'error': 'No tienes permiso para acceder a este proyecto'
        }), 403)
    
    if require_owner and project.owner_id != user_id:
        return None, None, (jsonify({
            'error': 'Solo el propietario puede realizar esta acción'
        }), 403)
    
    return project, membership, None


# ============================================================
# ENDPOINT 1: LISTAR TAREAS DE UN PROYECTO (con filtros)
# GET /api/projects/:project_id/tasks
# ============================================================
@tasks_bp.route('/projects/<int:project_id>/tasks', methods=['GET'])
@jwt_required()
def get_project_tasks(project_id):
    """
    Lista todas las tareas de un proyecto con filtros opcionales.
    """
    try:
        current_user_id = int(get_jwt_identity())
        
        project, membership, error = check_project_permission(project_id, current_user_id)
        if error:
            return error
        
        query = Task.query.filter_by(project_id=project_id)
        
        status = request.args.get('status')
        if status:
            query = query.filter_by(status=status)
        
        priority = request.args.get('priority')
        if priority:
            query = query.filter_by(priority=priority)
        
        assigned_to = request.args.get('assigned_to')
        if assigned_to:
            query = query.filter_by(assigned_to=int(assigned_to))
        
        created_by = request.args.get('created_by')
        if created_by:
            query = query.filter_by(created_by=int(created_by))
        
        tasks = query.order_by(Task.created_at.desc()).all()
        tasks_list = [task.to_dict() for task in tasks]
        
        return jsonify({
            'tasks': tasks_list,
            'total': len(tasks_list)
        }), 200
        
    except Exception as e:
        print(f"Error en get_project_tasks: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500


# ============================================================
# ENDPOINT 2: CREAR TAREA
# POST /api/projects/:project_id/tasks
# ============================================================
@tasks_bp.route('/projects/<int:project_id>/tasks', methods=['POST'])
@jwt_required()
def create_task(project_id):
    """
    Crea una nueva tarea en un proyecto.
    """
    try:
        current_user_id = int(get_jwt_identity())
        
        project, membership, error = check_project_permission(project_id, current_user_id)
        if error:
            return error
        
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No se proporcionaron datos'}), 400
        
        title = data.get('title', '').strip()
        if not title:
            return jsonify({'error': 'El título es obligatorio'}), 400
        
        priority = data.get('priority', 'medium')
        if priority not in ['low', 'medium', 'high']:
            return jsonify({
                'error': 'La prioridad debe ser: low, medium o high'
            }), 400
        
        assigned_to = data.get('assigned_to')
        if assigned_to:
            assigned_member = ProjectMember.query.filter_by(
                project_id=project_id,
                user_id=assigned_to
            ).first()
            
            if not assigned_member:
                return jsonify({
                    'error': 'El usuario asignado no es miembro del proyecto'
                }), 400
        
        due_date = None
        if data.get('due_date'):
            try:
                due_date = datetime.fromisoformat(data['due_date'])
            except ValueError:
                return jsonify({
                    'error': 'Formato de fecha inválido. Usa ISO 8601 (YYYY-MM-DDTHH:MM:SS)'
                }), 400
        
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

        # 🔔 EMITIR EVENTO: Nueva tarea creada
# 🔔 EMITIR EVENTO a la sala del proyecto (solo miembros lo reciben)
        try:
            socketio.emit(
                'task:created',
                {
                    'task': new_task.to_dict(),
                    'project_id': project_id,
                    'created_by': current_user_id,  # Para que el frontend filtre al emisor
                    'timestamp': datetime.utcnow().isoformat()
                },
                room=f'project_{project_id}'  # ← Solo miembros del proyecto
            )
            
            # Notificación individual al usuario asignado (si es diferente al creador)
            if assigned_to and assigned_to != current_user_id:
                socketio.emit(
                    'task:assigned',
                    {
                        'task': new_task.to_dict(),
                        'project_id': project_id,
                        'message': f'Se te ha asignado una nueva tarea: {new_task.title}',
                        'timestamp': datetime.utcnow().isoformat()
                    },
                    room=f'user_{assigned_to}'  # ← Solo el usuario asignado
                )
        except Exception as ws_error:
            print(f"⚠️ No se pudo emitir evento WebSocket: {ws_error}")
        
        return jsonify({
            'message': 'Tarea creada exitosamente',
            'task': new_task.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error en create_task: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500


# ============================================================
# ENDPOINT 3: VER DETALLE DE TAREA
# GET /api/tasks/:id
# ============================================================
@tasks_bp.route('/tasks/<int:task_id>', methods=['GET'])
@jwt_required()
def get_task(task_id):
    """
    Obtiene el detalle de una tarea específica.
    """
    try:
        current_user_id = int(get_jwt_identity())
        
        task = Task.query.get(task_id)
        if not task:
            return jsonify({'error': 'Tarea no encontrada'}), 404
        
        _, _, error = check_project_permission(task.project_id, current_user_id)
        if error:
            return error
        
        task_dict = task.to_dict()
        task_dict['project'] = task.project.to_dict()
        
        return jsonify({'task': task_dict}), 200
        
    except Exception as e:
        print(f"Error en get_task: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500


# ============================================================
# ENDPOINT 4: ACTUALIZAR TAREA
# PUT /api/tasks/:id
# ============================================================
@tasks_bp.route('/tasks/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    """
    Actualiza una tarea existente.
    """
    try:
        current_user_id = int(get_jwt_identity())
        
        task = Task.query.get(task_id)
        if not task:
            return jsonify({'error': 'Tarea no encontrada'}), 404
        
        project = task.project
        can_edit = (
            task.created_by == current_user_id or
            task.assigned_to == current_user_id or
            project.owner_id == current_user_id
        )
        
        if not can_edit:
            return jsonify({
                'error': 'No tienes permiso para editar esta tarea'
            }), 403
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No se proporcionaron datos'}), 400
        
        if 'title' in data:
            title = data['title'].strip()
            if not title:
                return jsonify({'error': 'El título no puede estar vacío'}), 400
            task.title = title
        
        if 'description' in data:
            task.description = data['description'].strip() or None
        
        if 'status' in data:
            status = data['status']
            if status not in ['pending', 'in_progress', 'completed']:
                return jsonify({
                    'error': 'El estado debe ser: pending, in_progress o completed'
                }), 400
            task.status = status
        
        if 'priority' in data:
            priority = data['priority']
            if priority not in ['low', 'medium', 'high']:
                return jsonify({
                    'error': 'La prioridad debe ser: low, medium o high'
                }), 400
            task.priority = priority
        
        if 'due_date' in data:
            if data['due_date'] is None:
                task.due_date = None
            else:
                try:
                    task.due_date = datetime.fromisoformat(data['due_date'])
                except ValueError:
                    return jsonify({
                        'error': 'Formato de fecha inválido'
                    }), 400
        
        if 'assigned_to' in data:
            assigned_to = data['assigned_to']
            
            if assigned_to is None:
                task.assigned_to = None
            else:
                assigned_member = ProjectMember.query.filter_by(
                    project_id=task.project_id,
                    user_id=assigned_to
                ).first()
                
                if not assigned_member:
                    return jsonify({
                        'error': 'El usuario asignado no es miembro del proyecto'
                    }), 400
                
                task.assigned_to = assigned_to
        
        db.session.commit()
        # 🔔 EMITIR EVENTO a la sala del proyecto
        try:
            socketio.emit(
                'task:updated',
                {
                    'task': task.to_dict(),
                    'project_id': task.project_id,
                    'updated_by': current_user_id,
                    'timestamp': datetime.utcnow().isoformat()
                },
                room=f'project_{task.project_id}'
            )
        except Exception as ws_error:
            print(f"⚠️ No se pudo emitir evento WebSocket: {ws_error}")
        
        return jsonify({
            'message': 'Tarea actualizada exitosamente',
            'task': task.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error en update_task: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500


# ============================================================
# ENDPOINT 5: ELIMINAR TAREA
# DELETE /api/tasks/:id
# ============================================================
@tasks_bp.route('/tasks/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    """
    Elimina una tarea.
    """
    try:
        current_user_id = int(get_jwt_identity())
        
        task = Task.query.get(task_id)
        if not task:
            return jsonify({'error': 'Tarea no encontrada'}), 404
        
        project = task.project
        can_delete = (
            task.created_by == current_user_id or
            project.owner_id == current_user_id
        )
        
        if not can_delete:
            return jsonify({
                'error': 'No tienes permiso para eliminar esta tarea'
            }), 403
        
        db.session.delete(task)
        db.session.commit()
        
        return jsonify({'message': 'Tarea eliminada exitosamente'}), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error en delete_task: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500