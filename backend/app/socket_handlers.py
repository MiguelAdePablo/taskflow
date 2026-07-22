"""
Manejador central de eventos WebSocket.
"""
from flask import request
from flask_jwt_extended import decode_token
from flask_socketio import join_room, leave_room, emit
from app import socketio


@socketio.on('connect')
@socketio.on('connect')
def handle_connect():
    """
    Se ejecuta cuando un cliente se conecta.
    Extrae el token del parámetro de URL 'token'.
    """
    try:
        from flask import request
        
        # Obtener el token directamente de los parámetros de la URL
        token = request.args.get('token')
        
        if not token:
            print("⚠️ Conexión rechazada: No se recibió token en la URL")
            return False
            
        # Decodificar el token JWT (ya viene puro, sin Bearer)
        decoded = decode_token(token)
        user_id = decoded['sub']
        
        # Unir a la sala personal
        join_room(f'user_{user_id}')
        
        print(f"✅ Usuario {user_id} conectado correctamente vía WebSocket")
        
        emit('connection_success', {
            'message': 'Conectado exitosamente',
            'user_id': user_id
        })
        
    except Exception as e:
        print(f"❌ Error crítico en conexión WebSocket: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


@socketio.on('join_project')
def handle_join_project(data):
    """El cliente pide unirse a la sala de un proyecto específico."""
    try:
        project_id = data.get('project_id')
        if not project_id:
            return
        room_name = f'project_{project_id}'
        join_room(room_name)
        print(f"👤 Usuario unido a la sala {room_name}")
    except Exception as e:
        print(f"❌ Error al unirse al proyecto: {str(e)}")


@socketio.on('leave_project')
def handle_leave_project(data):
    """El cliente pide salir de la sala de un proyecto."""
    try:
        project_id = data.get('project_id')
        if not project_id:
            return
        room_name = f'project_{project_id}'
        leave_room(room_name)
        print(f"👤 Usuario salió de la sala {room_name}")
    except Exception as e:
        print(f"❌ Error al salir del proyecto: {str(e)}")


@socketio.on('disconnect')
def handle_disconnect():
    """Se ejecuta cuando un cliente cierra la conexión."""
    print("🔌 Cliente desconectado")