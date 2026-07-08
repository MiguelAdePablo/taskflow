from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Project, ProjectMember, User

# Crear el blueprint para rutas de proyectos
projects_bp = Blueprint('projects', __name__)


# ============================================================
# ENDPOINT 1: LISTAR MIS PROYECTOS
# GET /api/projects
# ============================================================
@projects_bp.route('/', methods=['GET'])
@jwt_required()
def get_my_projects():
    """
    Lista todos los proyectos donde el usuario actual es miembro.
    
    Response (200):
    {
        "projects": [
            {
                "id": 1,
                "name": "Proyecto Web",
                "description": "Desarrollo de sitio web",
                "owner_id": 1,
                "created_at": "2026-07-08T...",
                "member_count": 3
            },
            ...
        ]
    }
    """
    try:
        current_user_id = int(get_jwt_identity())
        
        # Buscar todos los project_members donde el usuario actual participa
        memberships = ProjectMember.query.filter_by(user_id=current_user_id).all()
        
        # Obtener los IDs de los proyectos
        project_ids = [m.project_id for m in memberships]
        
        # Buscar los proyectos
        projects = Project.query.filter(Project.id.in_(project_ids)).all()
        
        # Convertir a diccionarios
        projects_list = [project.to_dict() for project in projects]
        
        return jsonify({'projects': projects_list}), 200
        
    except Exception as e:
        print(f"Error en get_my_projects: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500


# ============================================================
# ENDPOINT 2: CREAR PROYECTO
# POST /api/projects
# ============================================================
@projects_bp.route('/', methods=['POST'])
@jwt_required()
def create_project():
    """
    Crea un nuevo proyecto. El usuario actual se convierte en el owner.
    
    Request body (JSON):
    {
        "name": "Proyecto Web",
        "description": "Desarrollo de sitio web corporativo"
    }
    
    Response (201):
    {
        "message": "Proyecto creado exitosamente",
        "project": { ... }
    }
    """
    try:
        current_user_id = int(get_jwt_identity())
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No se proporcionaron datos'}), 400
        
        name = data.get('name', '').strip()
        description = data.get('description', '').strip()
        
        if not name:
            return jsonify({'error': 'El nombre del proyecto es obligatorio'}), 400
        
        # Crear el proyecto
        new_project = Project(
            name=name,
            description=description or None,
            owner_id=current_user_id
        )
        
        db.session.add(new_project)
        db.session.flush()  # Para obtener el ID del proyecto
        
        # Añadir al owner como miembro con rol 'owner'
        owner_membership = ProjectMember(
            project_id=new_project.id,
            user_id=current_user_id,
            role='owner'
        )
        
        db.session.add(owner_membership)
        db.session.commit()
        
        return jsonify({
            'message': 'Proyecto creado exitosamente',
            'project': new_project.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error en create_project: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500


# ============================================================
# ENDPOINT 3: VER DETALLE DE PROYECTO
# GET /api/projects/:id
# ============================================================
@projects_bp.route('/<int:project_id>', methods=['GET'])
@jwt_required()
def get_project(project_id):
    """
    Obtiene el detalle de un proyecto, incluyendo la lista de miembros.
    Solo accesible si el usuario es miembro del proyecto.
    
    Response (200):
    {
        "project": {
            "id": 1,
            "name": "Proyecto Web",
            "description": "...",
            "owner_id": 1,
            "created_at": "...",
            "member_count": 3,
            "members": [
                {
                    "id": 1,
                    "project_id": 1,
                    "user_id": 1,
                    "role": "owner",
                    "joined_at": "...",
                    "user": { "id": 1, "username": "miguel", ... }
                },
                ...
            ]
        }
    }
    """
    try:
        current_user_id = int(get_jwt_identity())
        
        # Buscar el proyecto
        project = Project.query.get(project_id)
        
        if not project:
            return jsonify({'error': 'Proyecto no encontrado'}), 404
        
        # Verificar que el usuario es miembro del proyecto
        membership = ProjectMember.query.filter_by(
            project_id=project_id,
            user_id=current_user_id
        ).first()
        
        if not membership:
            return jsonify({'error': 'No tienes permiso para ver este proyecto'}), 403
        
        # Convertir a diccionario (incluye miembros gracias al modelo)
        project_dict = project.to_dict()
        
        # Añadir la lista detallada de miembros
        project_dict['members'] = [member.to_dict() for member in project.members]
        
        return jsonify({'project': project_dict}), 200
        
    except Exception as e:
        print(f"Error en get_project: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500


# ============================================================
# ENDPOINT 4: ACTUALIZAR PROYECTO
# PUT /api/projects/:id
# ============================================================
@projects_bp.route('/<int:project_id>', methods=['PUT'])
@jwt_required()
def update_project(project_id):
    """
    Actualiza un proyecto. Solo el owner puede hacerlo.
    
    Request body (JSON):
    {
        "name": "Nuevo nombre",
        "description": "Nueva descripción"
    }
    
    Response (200):
    {
        "message": "Proyecto actualizado exitosamente",
        "project": { ... }
    }
    """
    try:
        current_user_id = int(get_jwt_identity())
        
        # Buscar el proyecto
        project = Project.query.get(project_id)
        
        if not project:
            return jsonify({'error': 'Proyecto no encontrado'}), 404
        
        # Verificar que el usuario es el owner
        if project.owner_id != current_user_id:
            return jsonify({'error': 'Solo el propietario puede editar este proyecto'}), 403
        
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No se proporcionaron datos'}), 400
        
        # Actualizar campos
        if 'name' in data:
            name = data['name'].strip()
            if not name:
                return jsonify({'error': 'El nombre no puede estar vacío'}), 400
            project.name = name
        
        if 'description' in data:
            project.description = data['description'].strip() or None
        
        db.session.commit()
        
        return jsonify({
            'message': 'Proyecto actualizado exitosamente',
            'project': project.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error en update_project: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500


# ============================================================
# ENDPOINT 5: ELIMINAR PROYECTO
# DELETE /api/projects/:id
# ============================================================
@projects_bp.route('/<int:project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    """
    Elimina un proyecto y todas sus tareas/miembros. Solo el owner puede hacerlo.
    
    Response (200):
    {
        "message": "Proyecto eliminado exitosamente"
    }
    """
    try:
        current_user_id = int(get_jwt_identity())
        
        # Buscar el proyecto
        project = Project.query.get(project_id)
        
        if not project:
            return jsonify({'error': 'Proyecto no encontrado'}), 404
        
        # Verificar que el usuario es el owner
        if project.owner_id != current_user_id:
            return jsonify({'error': 'Solo el propietario puede eliminar este proyecto'}), 403
        
        # Eliminar el proyecto (cascade='all, delete-orphan' elimina tareas y miembros)
        db.session.delete(project)
        db.session.commit()
        
        return jsonify({'message': 'Proyecto eliminado exitosamente'}), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error en delete_project: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500


# ============================================================
# ENDPOINT 6: AÑADIR MIEMBRO AL PROYECTO
# POST /api/projects/:id/members
# ============================================================
@projects_bp.route('/<int:project_id>/members', methods=['POST'])
@jwt_required()
def add_member(project_id):
    """
    Añade un miembro al proyecto. Solo el owner puede hacerlo.
    
    Request body (JSON):
    {
        "user_id": 2,
        "role": "member"  (opcional, por defecto es 'member')
    }
    
    Response (201):
    {
        "message": "Miembro añadido exitosamente",
        "member": { ... }
    }
    """
    try:
        current_user_id = int(get_jwt_identity())
        
        # Buscar el proyecto
        project = Project.query.get(project_id)
        
        if not project:
            return jsonify({'error': 'Proyecto no encontrado'}), 404
        
        # Verificar que el usuario es el owner
        if project.owner_id != current_user_id:
            return jsonify({'error': 'Solo el propietario puede añadir miembros'}), 403
        
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No se proporcionaron datos'}), 400
        
        user_id = data.get('user_id')
        role = data.get('role', 'member')
        
        if not user_id:
            return jsonify({'error': 'user_id es obligatorio'}), 400
        
        # Verificar que el usuario existe
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        # Verificar que el usuario no es ya miembro
        existing_membership = ProjectMember.query.filter_by(
            project_id=project_id,
            user_id=user_id
        ).first()
        
        if existing_membership:
            return jsonify({'error': 'El usuario ya es miembro de este proyecto'}), 409
        
        # Crear la membresía
        new_membership = ProjectMember(
            project_id=project_id,
            user_id=user_id,
            role=role
        )
        
        db.session.add(new_membership)
        db.session.commit()
        
        return jsonify({
            'message': 'Miembro añadido exitosamente',
            'member': new_membership.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error en add_member: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500


# ============================================================
# ENDPOINT 7: ELIMINAR MIEMBRO DEL PROYECTO
# DELETE /api/projects/:id/members/:user_id
# ============================================================
@projects_bp.route('/<int:project_id>/members/<int:user_id>', methods=['DELETE'])
@jwt_required()
def remove_member(project_id, user_id):
    """
    Elimina un miembro del proyecto. Solo el owner puede hacerlo.
    El owner no puede eliminarse a sí mismo.
    
    Response (200):
    {
        "message": "Miembro eliminado exitosamente"
    }
    """
    try:
        current_user_id = int(get_jwt_identity())
        
        # Buscar el proyecto
        project = Project.query.get(project_id)
        
        if not project:
            return jsonify({'error': 'Proyecto no encontrado'}), 404
        
        # Verificar que el usuario es el owner
        if project.owner_id != current_user_id:
            return jsonify({'error': 'Solo el propietario puede eliminar miembros'}), 403
        
        # El owner no puede eliminarse a sí mismo
        if user_id == current_user_id:
            return jsonify({'error': 'No puedes eliminarte a ti mismo del proyecto'}), 400
        
        # Buscar la membresía
        membership = ProjectMember.query.filter_by(
            project_id=project_id,
            user_id=user_id
        ).first()
        
        if not membership:
            return jsonify({'error': 'El usuario no es miembro de este proyecto'}), 404
        
        # Eliminar la membresía
        db.session.delete(membership)
        db.session.commit()
        
        return jsonify({'message': 'Miembro eliminado exitosamente'}), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error en remove_member: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500