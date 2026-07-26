"""
Manejador central de eventos WebSocket.
"""
from flask import request
from flask_jwt_extended import decode_token
from flask_socketio import join_room, leave_room, emit
from app import socketio


@socketio.on('connect')
def handle_connect():
    """
    Se ejecuta cuando un cliente se conecta.
    Si el token es inválido, retornamos None silenciosamente para evitar 
    el bug de Werkzeug "write() before start_response".
    """
    try:
        token = request.args.get('token')
        
        if not token:
            print("⚠️ Conexión descartada: Token no encontrado")
            return None  # ← CLAVE: No retornar False, no llamar a disconnect()
        
        decoded = decode_token(token)
        user_id = decoded['sub']
        
        join_room(f'user_{user_id}')
        print(f"✅ Usuario {user_id} conectado correctamente vía WebSocket")
        
        emit('connection_success', {
            'message': 'Conectado exitosamente',
            'user_id': user_id
        })
        
    except Exception as e:
        # Si el token es inválido o expiró, simplemente dejamos que la conexión caiga
        print(f"⚠️ Conexión descartada por token inválido/expirado: {str(e)}")
        return None  # ← CLAVE: Retorno silencioso


@socketio.on('join_project')
def handle_join_project(data):
    try:
        project_id = data.get('project_id')
        if project_id:
            join_room(f'project_{project_id}')
            print(f"👤 Usuario unido a la sala project_{project_id}")
    except Exception as e:
        print(f"❌ Error al unirse al proyecto: {str(e)}")


@socketio.on('leave_project')
def handle_leave_project(data):
    try:
        project_id = data.get('project_id')
        if project_id:
            leave_room(f'project_{project_id}')
            print(f"👤 Usuario salió de la sala project_{project_id}")
    except Exception as e:
        print(f"❌ Error al salir del proyecto: {str(e)}")


@socketio.on('disconnect')
def handle_disconnect():
    print("🔌 Cliente desconectado limpiamente")