# ![](./Images/GitHub.png) &nbsp;&nbsp;  TaskFlow API Documentation



**Base URL:** `http://localhost:5000/api` (Desarrollo) / `https://taskflow-production-1742.up.railway.app` (Producción)

---

## 🔑 Flujo de Autenticación

### 1. Obtener el Token
Para acceder a las rutas protegidas, primero debes obtener un token JWT iniciando sesión:

**Comando:** `POST /api/auth/login`

**Body:**
```json
{
  "email": "miguel@example.com",
  "password": "miPassword123"
}
```

**Respuesta (200):**
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY5MDAwMDAwMCwianRpIjoiYWJjZGVmZyIsInR5cGUiOiJhY2Nlc3MiLCJzdWIiOiIxIiwibmJmIjoxNjkwMDAwMDAwLCJjc3JmIjoiYWJjZGVmZyIsImV4cCI6MTY5MDA4NjQwMH0.xYz123...",
  "user": {
    "id": 1,
    "username": "miguel",
    "email": "miguel@example.com",
    "full_name": "Miguel Ángel",
    "avatar_url": null,
    "created_at": "2026-07-06T10:30:00"
  }
}
```

⚠️ **Importante:** Guarda el valor del campo `"token"` en el `localStorage` del navegador o en tu cliente HTTP. Este token tiene una validez de **24 horas**.

---

### 2. Usar el Token en las Peticiones
Una vez obtenido el token, debes incluirlo en el header `Authorization` de **todas** las peticiones a rutas protegidas:

**Header requerido:**
```
Authorization: Bearer <tu_token_jwt>
```

**Ejemplo completo de petición:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Ejemplo en JavaScript (fetch):**
```javascript
const token = localStorage.getItem('token')

const response = await fetch('http://localhost:5000/api/auth/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})

const data = await response.json()
console.log(data.user)
```

---

### 3. Token Expirado o Inválido (401)
Si el token ha expirado (después de 24 horas) o es inválido, la API responderá con:

**Status:** `401 Unauthorized`

**Respuesta:**
```json
{
  "msg": "Token has expired"
}
```

**Acción requerida:** El cliente debe eliminar el token del `localStorage` y redirigir al usuario a la página de login (`/login`) para obtener un nuevo token.

---

## 🔐 1. Autenticación (`/api/auth`)

### Registro de Usuario
- **Comando:** `POST /api/auth/register`
- **Auth:** No requerida
- **Body:**
  ```json
  {
    "username": "miguel",
    "email": "miguel@example.com",
    "password": "miPassword123",
    "full_name": "Miguel Ángel"
  }
  ```
- **Respuesta (201):**
  ```json
  {
    "message": "Usuario registrado exitosamente",
    "user": { "id": 1, "username": "miguel", "email": "miguel@example.com", ... }
  }
  ```

### Inicio de Sesión
- **Comando:** `POST /api/auth/login`
- **Auth:** No requerida
- **Body:**
  ```json
  {
    "email": "miguel@example.com",
    "password": "miPassword123"
  }
  ```
- **Respuesta (200):**
  ```json
  {
    "message": "Login exitoso",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { "id": 1, "username": "miguel", ... }
  }
  ```

### Obtener Usuario Actual
- **Comando:** `GET /api/auth/me`
- **Auth:** Requerida
- **Respuesta (200):**
  ```json
  {
    "user": { "id": 1, "username": "miguel", "email": "...", "full_name": "...", "avatar_url": "..." }
  }
  ```

### Cerrar Sesión
- **Comando:** `POST /api/auth/logout`
- **Auth:** Requerida
- **Respuesta (200):**
  ```json
  { "message": "Logout exitoso" }
  ```

---

## 📁 2. Proyectos (`/api/projects`)

### Listar Mis Proyectos
- **Comando:** `GET /api/projects`
- **Auth:** Requerida
- **Respuesta (200):**
  ```json
  {
    "projects": [
      { "id": 1, "name": "Proyecto Web", "description": "...", "owner_id": 1, "member_count": 3, "created_at": "..." }
    ]
  }
  ```

### Crear Proyecto
- **Comando:** `POST /api/projects`
- **Auth:** Requerida
- **Body:**
  ```json
  {
    "name": "Nuevo Proyecto",
    "description": "Descripción opcional"
  }
  ```
- **Respuesta (201):**
  ```json
  {
    "message": "Proyecto creado exitosamente",
    "project": { "id": 2, "name": "Nuevo Proyecto", ... }
  }
  ```

### Ver Detalle de Proyecto
- **Comando:** `GET /api/projects/<project_id>`
- **Auth:** Requerida (Debe ser miembro)
- **Respuesta (200):**
  ```json
  {
    "project": {
      "id": 1, "name": "...", "description": "...", "owner_id": 1, "member_count": 2,
      "members": [
        { "id": 1, "project_id": 1, "user_id": 1, "role": "owner", "user": { "id": 1, "username": "..." } }
      ]
    }
  }
  ```

### Actualizar Proyecto
- **Comando:** `PUT /api/projects/<project_id>`
- **Auth:** Requerida (Solo Owner)
- **Body:**
  ```json
  {
    "name": "Nombre actualizado",
    "description": "Nueva descripción"
  }
  ```
- **Respuesta (200):**
  ```json
  {
    "message": "Proyecto actualizado exitosamente",
    "project": { ... }
  }
  ```

### Eliminar Proyecto
- **Comando:** `DELETE /api/projects/<project_id>`
- **Auth:** Requerida (Solo Owner)
- **Respuesta (200):**
  ```json
  { "message": "Proyecto eliminado exitosamente" }
  ```

### Añadir Miembro
- **Comando:** `POST /api/projects/<project_id>/members`
- **Auth:** Requerida (Solo Owner)
- **Body:**
  ```json
  {
    "user_id": 2,
    "role": "member" 
  }
  ```
- **Respuesta (201):**
  ```json
  {
    "message": "Miembro añadido exitosamente",
    "member": { "id": 3, "project_id": 1, "user_id": 2, "role": "member", ... }
  }
  ```

### Eliminar Miembro
- **Comando:** `DELETE /api/projects/<project_id>/members/<user_id>`
- **Auth:** Requerida (Solo Owner)
- **Respuesta (200):**
  ```json
  { "message": "Miembro eliminado exitosamente" }
  ```

---

## ✅ 3. Tareas (`/api/projects/.../tasks` y `/api/tasks`)

### Listar Tareas de un Proyecto (con filtros)
- **Comando:** `GET /api/projects/<project_id>/tasks`
- **Auth:** Requerida (Debe ser miembro)
- **Query Params (Opcionales):** `?status=pending&priority=high&assigned_to=2&created_by=1`
- **Respuesta (200):**
  ```json
  {
    "tasks": [
      { "id": 1, "project_id": 1, "title": "Diseñar UI", "status": "pending", "priority": "high", ... }
    ],
    "total": 1
  }
  ```

### Crear Tarea
- **Comando:** `POST /api/projects/<project_id>/tasks`
- **Auth:** Requerida (Debe ser miembro)
- **Body:**
  ```json
  {
    "title": "Nueva tarea",
    "description": "Detalles de la tarea",
    "priority": "medium", 
    "due_date": "2026-08-24T00:00:00",
    "assigned_to": 2 
  }
  ```
- **Respuesta (201):**
  ```json
  {
    "message": "Tarea creada exitosamente",
    "task": { "id": 2, "title": "Nueva tarea", ... }
  }
  ```

### Ver Detalle de Tarea
- **Comando:** `GET /api/tasks/<task_id>`
- **Auth:** Requerida (Debe ser miembro del proyecto)
- **Respuesta (200):**
  ```json
  {
    "task": {
      "id": 1, "title": "...", "description": "...", "status": "pending", "priority": "medium",
      "assigned_user": { "id": 2, "username": "..." },
      "creator": { "id": 1, "username": "..." },
      "project": { "id": 1, "name": "..." }
    }
  }
  ```

### Actualizar Tarea
- **Comando:** `PUT /api/tasks/<task_id>`
- **Auth:** Requerida (Creador, Asignado o Owner)
- **Body:** (Todos los campos son opcionales, solo envía los que quieras cambiar)
  ```json
  {
    "title": "Título actualizado",
    "status": "in_progress",
    "priority": "high",
    "assigned_to": 3,
    "due_date": "2026-09-01T00:00:00"
  }
  ```
- **Respuesta (200):**
  ```json
  {
    "message": "Tarea actualizada exitosamente",
    "task": { ... }
  }
  ```

### Eliminar Tarea
- **Comando:** `DELETE /api/tasks/<task_id>`
- **Auth:** Requerida (Creador o Owner)
- **Respuesta (200):**
  ```json
  { "message": "Tarea eliminada exitosamente" }
  ```

---

## 👤 4. Usuarios (`/api/users`)

### Buscar Usuarios
- **Comando:** `GET /api/users`
- **Auth:** Requerida
- **Query Params:** `?q=termino_busqueda` (Busca en username, email y full_name)
- **Respuesta (200):**
  ```json
  {
    "users": [
      { "id": 2, "username": "juan", "email": "juan@example.com", "full_name": "Juan Pérez" }
    ]
  }
  ```

### Ver Perfil de Usuario
- **Comando:** `GET /api/users/<user_id>`
- **Auth:** Requerida
- **Respuesta (200):**
  ```json
  {
    "user": { "id": 2, "username": "juan", "email": "...", "full_name": "...", "avatar_url": "..." }
  }
  ```

### Actualizar Mi Perfil
- **Comando:** `PUT /api/users/<user_id>`
- **Auth:** Requerida (Solo puedes actualizar tu propio perfil)
- **Body:**
  ```json
  {
    "full_name": "Nuevo nombre",
    "avatar_url": "https://example.com/avatar.jpg"
  }
  ```
- **Respuesta (200):**
  ```json
  {
    "message": "Perfil actualizado exitosamente",
    "user": { ... }
  }
  ```

---

## 💬 5. Comentarios (`/api/tasks/.../comments` y `/api/comments`)

### Listar Comentarios de una Tarea
- **Comando:** `GET /api/tasks/<task_id>/comments`
- **Auth:** Requerida (Debe ser miembro del proyecto)
- **Respuesta (200):**
  ```json
  {
    "comments": [
      { "id": 1, "task_id": 1, "user_id": 1, "content": "Gran trabajo!", "created_at": "...", "author": { "id": 1, "username": "..." } }
    ],
    "total": 1
  }
  ```

### Crear Comentario
- **Comando:** `POST /api/tasks/<task_id>/comments`
- **Auth:** Requerida (Debe ser miembro del proyecto)
- **Body:**
  ```json
  {
    "content": "Este es un nuevo comentario"
  }
  ```
- **Respuesta (201):**
  ```json
  {
    "message": "Comentario creado",
    "comment": { "id": 2, "task_id": 1, "user_id": 1, "content": "...", ... }
  }
  ```

### Eliminar Comentario
- **Comando:** `DELETE /api/comments/<comment_id>`
- **Auth:** Requerida (Solo el autor puede eliminarlo)
- **Respuesta (200):**
  ```json
  { "message": "Comentario eliminado" }
  ```