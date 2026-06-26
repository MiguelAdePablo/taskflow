from flask import Blueprint, jsonify, request

# Crear el blueprint para rutas de tareas
tasks_bp = Blueprint('tasks', __name__)

# Más adelante agregaremos endpoints CRUD para tareas