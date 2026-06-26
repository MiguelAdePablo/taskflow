from app import create_app, socketio

# Crear la aplicación Flask
app = create_app()

if __name__ == '__main__':
    # Ejecutar el servidor con SocketIO para soportar WebSockets
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)