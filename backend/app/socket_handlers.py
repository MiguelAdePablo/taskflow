"""
Manejador central de eventos WebSocket.
Aquí definimos qué pasa cuando un cliente se conecta, 
se desconecta, o se une a una sala.
"""
from flask import request
from flask_jwt_extended import decode_token
from flask_socketio import join_room, leave_room, emit
from app import socketio


# ============================================================
# EVENTO: Cuando un cliente se conecta
# ============================================================
@socketio.on('connect')
def handle_connect():
    """
    Se ejecuta cuando un cliente (navegador) se conecta al servidor.
    Aquí recibimos el token JWT y unimos al usuario a su "sala personal".
    """
    try:
        # El frontend debe enviar el token al conectarse
        token = request.args.get('token')
        
        if not token:
            print("⚠️ Conexión rechazada: no se proporcionó token")
            return False  # Rechaza la conexión
        
        # Decodificar el token para obtener el user_id
        decoded = decode_token(token)
        user_id = decoded['sub']  # 'sub' contiene el identity que pusimos en el login
        
        # Unir al usuario a su sala personal (para notificaciones individuales)
        join_room(f'user_{user_id}')
        
        print(f"✅ Usuario {user_id} conectado y unido a la sala user_{user_id}")
        
        # Confirmar al cliente que la conexión fue exitosa
        emit('connection_success', {
            'message': 'Conectado exitosamente',
            'user_id': user_id
        })
        
    except Exception as e:
        print(f"❌ Error en conexión WebSocket: {str(e)}")
        return False  # Rechaza la conexión


# ============================================================
# EVENTO: Cuando un cliente se une a un proyecto
# ============================================================
@socketio.on('join_project')
def handle_join_project(data):
    """
    El cliente pide unirse a la sala de un proyecto específico.
    Esto permite recibir notificaciones solo de ese proyecto.
    
    data: { "project_id": 1 }
    """
    try:
        project_id = data.get('project_id')
        if not project_id:
            return
        
        room_name = f'project_{project_id}'
        join_room(room_name)
        print(f"👤 Usuario unido a la sala {room_name}")
        
    except Exception as e:
        print(f"❌ Error al unirse al proyecto: {str(e)}")


# ============================================================
# EVENTO: Cuando un cliente sale de un proyecto
# ============================================================
@socketio.on('leave_project')
def handle_leave_project(data):
    """
    El cliente pide salir de la sala de un proyecto.
    
    data: { "project_id": 1 }
    """
    try:
        project_id = data.get('project_id')
        if not project_id:
            return
        
        room_name = f'project_{project_id}'
        leave_room(room_name)
        print(f"👤 Usuario salió de la sala {room_name}")
        
    except Exception as e:
        print(f"❌ Error al salir del proyecto: {str(e)}")


# ============================================================
# EVENTO: Cuando un cliente se desconecta
# ============================================================
@socketio.on('disconnect')
def handle_disconnect():
    """
    Se ejecuta cuando un cliente cierra la conexión.
    Socket.io automáticamente lo saca de todas las rooms.
    """
    print("🔌 Cliente desconectado")