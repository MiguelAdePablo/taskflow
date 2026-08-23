from flask import request
from flask_jwt_extended import decode_token
from flask_socketio import join_room, leave_room, emit
from app import socketio

# ============================================================
# PROPÓSITO: Gestionar la conexión inicial y autenticación del cliente WebSocket.
# CRÍTICO: Se retorna None silenciosamente en caso de error para evitar el bug "write() before start_response" de Werkzeug, sin cerrar abruptamente la conexión a nivel de protocolo.
# ============================================================
@socketio.on('connect')
def handle_connect():
    try:
        token = request.args.get('token')
        if not token:
            return None
        
        decoded = decode_token(token)
        user_id = str(decoded['sub'])
        
        join_room(f'user_{user_id}')
        emit('connection_success', {'message': 'Conectado exitosamente', 'user_id': user_id})
        
    except Exception:
        return None

# ============================================================
# PROPÓSITO: Unir al cliente a la sala de un proyecto específico.
# CRÍTICO: Se valida y convierte explícitamente project_id a entero para prevenir inyección de cadenas maliciosas como nombres de sala y errores de tipo no manejados.
# ============================================================
@socketio.on('join_project')
def handle_join_project(data):
    try:
        project_id = data.get('project_id')
        if project_id is not None:
            project_id = int(project_id)
            join_room(f'project_{project_id}')
    except (ValueError, TypeError):
        pass

# ============================================================
# PROPÓSITO: Sacar al cliente de la sala de un proyecto específico.
# CRÍTICO: Misma validación de tipo estricta que en join_project para mantener la integridad de las salas.
# ============================================================
@socketio.on('leave_project')
def handle_leave_project(data):
    try:
        project_id = data.get('project_id')
        if project_id is not None:
            project_id = int(project_id)
            leave_room(f'project_{project_id}')
    except (ValueError, TypeError):
        pass

@socketio.on('disconnect')
def handle_disconnect():
    pass