from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone
from app import db, socketio
from app.models import Project, ProjectMember, User

projects_bp = Blueprint('projects', __name__)

# ============================================================
# PROPÓSITO: Validar acceso y permisos sobre un proyecto.
# CRÍTICO: Centraliza la lógica de autorización para evitar duplicación de código y prevenir fallos de seguridad (IDOR) en múltiples endpoints.
# ============================================================
def check_project_access(project_id, user_id, require_owner=False):
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
# PROPÓSITO: Listar todos los proyectos donde el usuario es miembro.
# CRÍTICO: Se utiliza `Project.id.in_()` para realizar una única consulta eficiente a la base de datos en lugar de múltiples consultas N+1.
# ============================================================
@projects_bp.route('', methods=['GET'])
@jwt_required()
def get_my_projects():
    try:
        current_user_id = int(get_jwt_identity())
        memberships = ProjectMember.query.filter_by(user_id=current_user_id).all()
        project_ids = [m.project_id for m in memberships]
        
        if not project_ids:
            return jsonify({'projects': []}), 200
            
        projects = Project.query.filter(Project.id.in_(project_ids)).all()
        return jsonify({'projects': [p.to_dict() for p in projects]}), 200
        
    except Exception as e:
        return jsonify({'error': 'Error interno del servidor'}), 500

# ============================================================
# PROPÓSITO: Crear un nuevo proyecto y asignar al creador como propietario.
# CRÍTICO: Se usa `db.session.flush()` para obtener el ID del proyecto antes del commit final, garantizando la integridad referencial al crear la membresía inmediatamente.
# ============================================================
@projects_bp.route('', methods=['POST'])
@jwt_required()
def create_project():
    try:
        current_user_id = int(get_jwt_identity())
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No se proporcionaron datos'}), 400
        
        name = (data.get('name') or '').strip()
        description = (data.get('description') or '').strip() or None
        
        if not name:
            return jsonify({'error': 'El nombre del proyecto es obligatorio'}), 400
        
        new_project = Project(name=name, description=description, owner_id=current_user_id)
        db.session.add(new_project)
        db.session.flush()
        
        owner_membership = ProjectMember(project_id=new_project.id, user_id=current_user_id, role='owner')
        db.session.add(owner_membership)
        db.session.commit()
        
        try:
            socketio.emit(
                'project:created',
                {
                    'project': new_project.to_dict(),
                    'timestamp': datetime.now(timezone.utc).isoformat()
                },
                room=f'user_{current_user_id}'
            )
        except Exception:
            pass
        
        return jsonify({'message': 'Proyecto creado exitosamente', 'project': new_project.to_dict()}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor'}), 500

# ============================================================
# PROPÓSITO: Obtener el detalle completo de un proyecto, incluyendo miembros.
# CRÍTICO: La validación de acceso se ejecuta antes de serializar los datos para evitar fugas de información de proyectos privados.
# ============================================================
@projects_bp.route('/<int:project_id>', methods=['GET'])
@jwt_required()
def get_project(project_id):
    try:
        current_user_id = int(get_jwt_identity())
        project, _, error = check_project_access(project_id, current_user_id)
        if error:
            return error
        
        project_dict = project.to_dict()
        project_dict['members'] = [member.to_dict() for member in project.members]
        
        return jsonify({'project': project_dict}), 200
    except Exception as e:
        return jsonify({'error': 'Error interno del servidor'}), 500

# ============================================================
# PROPÓSITO: Actualizar los datos básicos de un proyecto.
# CRÍTICO: Se exige el rol de 'owner' (require_owner=True) para prevenir que miembros normales modifiquen el nombre o descripción del proyecto.
# ============================================================
@projects_bp.route('/<int:project_id>', methods=['PUT'])
@jwt_required()
def update_project(project_id):
    try:
        current_user_id = int(get_jwt_identity())
        project, _, error = check_project_access(project_id, current_user_id, require_owner=True)
        if error:
            return error
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No se proporcionaron datos'}), 400
        
        if 'name' in data:
            name = data['name'].strip()
            if not name:
                return jsonify({'error': 'El nombre no puede estar vacío'}), 400
            project.name = name
        
        if 'description' in data:
            project.description = data['description'].strip() or None
        
        db.session.commit()
        return jsonify({'message': 'Proyecto actualizado exitosamente', 'project': project.to_dict(include_members=True)}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor'}), 500

# ============================================================
# PROPÓSITO: Eliminar un proyecto y sus relaciones en cascada.
# CRÍTICO: Solo el propietario puede ejecutar esta acción. La eliminación en cascada está configurada en el modelo SQLAlchemy, pero se valida el permiso primero.
# ============================================================
@projects_bp.route('/<int:project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    try:
        current_user_id = int(get_jwt_identity())
        project, _, error = check_project_access(project_id, current_user_id, require_owner=True)
        if error:
            return error
        
        db.session.delete(project)
        db.session.commit()
        return jsonify({'message': 'Proyecto eliminado exitosamente'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor'}), 500

# ============================================================
# PROPÓSITO: Añadir un nuevo miembro a un proyecto.
# CRÍTICO: Se valida que el usuario exista y no sea ya miembro. Se emiten eventos WebSocket diferenciados: uno privado al invitado y otro público a la sala del proyecto.
# ============================================================
@projects_bp.route('/<int:project_id>/members', methods=['POST'])
@jwt_required()
def add_member(project_id):
    try:
        current_user_id = int(get_jwt_identity())
        project, _, error = check_project_access(project_id, current_user_id, require_owner=True)
        if error:
            return error
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No se proporcionaron datos'}), 400
        
        user_id = data.get('user_id')
        role = data.get('role', 'member')
        
        if not user_id:
            return jsonify({'error': 'user_id es obligatorio'}), 400
        
        user = db.session.get(User, user_id)
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        if ProjectMember.query.filter_by(project_id=project_id, user_id=user_id).first():
            return jsonify({'error': 'El usuario ya es miembro de este proyecto'}), 409
        
        new_membership = ProjectMember(project_id=project_id, user_id=user_id, role=role)
        db.session.add(new_membership)
        db.session.commit()

        try:
            socketio.emit(
                'project:member_added',
                {
                    'project': project.to_dict(),
                    'member': new_membership.to_dict(),
                    'invited_by': current_user_id,
                    'message': f'Has sido añadido al proyecto "{project.name}"',
                    'timestamp': datetime.now(timezone.utc).isoformat()
                },
                room=f'user_{user_id}'
            )
            socketio.emit(
                'project:member_joined',
                {
                    'project_id': project_id,
                    'new_member': new_membership.to_dict(),
                    'timestamp': datetime.now(timezone.utc).isoformat()
                },
                room=f'project_{project_id}'
            )
        except Exception:
            pass
        
        return jsonify({'message': 'Miembro añadido exitosamente', 'member': new_membership.to_dict()}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor'}), 500

# ============================================================
# PROPÓSITO: Eliminar un miembro de un proyecto.
# CRÍTICO: Se bloquea explícitamente que el propietario se elimine a sí mismo para evitar proyectos huérfanos sin dueño.
# ============================================================
@projects_bp.route('/<int:project_id>/members/<int:user_id>', methods=['DELETE'])
@jwt_required()
def remove_member(project_id, user_id):
    try:
        current_user_id = int(get_jwt_identity())
        project, _, error = check_project_access(project_id, current_user_id, require_owner=True)
        if error:
            return error
        
        if user_id == current_user_id:
            return jsonify({'error': 'No puedes eliminarte a ti mismo del proyecto'}), 400
        
        membership = ProjectMember.query.filter_by(project_id=project_id, user_id=user_id).first()
        if not membership:
            return jsonify({'error': 'El usuario no es miembro de este proyecto'}), 404
        
        db.session.delete(membership)
        db.session.commit()

        try:
            socketio.emit(
                'project:member_removed',
                {
                    'project_id': project_id,
                    'message': f'Has sido eliminado del proyecto "{project.name}"',
                    'timestamp': datetime.now(timezone.utc).isoformat()
                },
                room=f'user_{user_id}'
            )
            socketio.emit(
                'project:member_left',
                {
                    'project_id': project_id,
                    'user_id': user_id,
                    'timestamp': datetime.now(timezone.utc).isoformat()
                },
                room=f'project_{project_id}'
            )
        except Exception:
            pass

        return jsonify({'message': 'Miembro eliminado exitosamente'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor'}), 500