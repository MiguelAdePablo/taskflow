# ![](./Images/GitHub.png) &nbsp;&nbsp;  TaskFlow API Documentation



**Base URL:** `http://localhost:5000/api` (Development) / `https://taskflow-production-1742.up.railway.app` (Production)

---

## 🔑Authentication Flow

### 1. Obtain the Token
To access protected routes, you must first obtain a JWT token by logging in:

**Request:** `POST /api/auth/login`

**Body:**
```json
{
  "email": "miguel@example.com",
  "password": "miPassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
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

⚠️ **Important:** Save the value of the "token" field in the browser's localStorage or in your HTTP client. This token is valid for 24 hours.

---

### 2.  Use the Token in Requests
Once the token is obtained, you must include it in the `Authorization` header of all requests to protected routes:

**Required Header:**
```
Authorization: Bearer <your_jwt_token>
```

**Complete request example:**
```
bash

curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**JavaScript example (fetch):**

```
javascript

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

### 3. Expired or Invalid Token (401)
If the token has expired (after 24 hours) or is invalid, the API will respond with:

**Status:** `401 Unauthorized`

**Response:**
```
json
{
  "msg": "Token has expired"
}
```

**Required action:** The client must remove the token from `localStorage` and redirect the user to the login page (`/login`) to obtain a new token.

---

## 🔐 1. Authentication (`/api/auth`)

### Registro de Usuario
- **Request:** `POST /api/auth/register`
- **Auth:** Not required
- **Body:**
  ```json
  {
    "username": "miguel",
    "email": "miguel@example.com",
    "password": "miPassword123",
    "full_name": "Miguel Ángel"
  }
  ```
- **Response (201):**
  ```
  json

  {
    "message": "Usuario registrado exitosamente",
    "user": { "id": 1, "username": "miguel", "email": "miguel@example.com", ... }
  }
  ```

### Login
- **Request:** `POST /api/auth/login`
- **Auth:** Not required
- **Body:**
  ```json
  {
    "email": "miguel@example.com",
    "password": "miPassword123"
  }
  ```
- **Response (200):**
  ```json
  {
    "message": "Login exitoso",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { "id": 1, "username": "miguel", ... }
  }
  ```

### Get Current User
- **Request:** `GET /api/auth/me`
- **Auth:** Required
- **Response (200):**
  ```json
  {
    "user": { "id": 1, "username": "miguel", "email": "...", "full_name": "...", "avatar_url": "..." }
  }
  ```

### Logout
- **Request:** `POST /api/auth/logout`
- **Auth:** Required
- **Response (200):**
  ```json
  { "message": "Logout exitoso" }
  ```

---

## 📁 2. Proyects (`/api/projects`)

### List My Proyects
- **Request:** `GET /api/projects`
- **Auth:** Required
- **Response (200):**
  ```json
  {
    "projects": [
      { "id": 1, "name": "Project Web", "description": "...", "owner_id": 1, "member_count": 3, "created_at": "..." }
    ]
  }
  ```

### Create Proyect
- **Request:** `POST /api/projects`
- **Auth:** Required
- **Body:**
  ```json
  {
    "name": "New Project",
    "description": "Optional description"
  }
  ```
- **Response (201):**
  ```json
  {
    "message": "Project created successfully",
    "project": { "id": 2, "name": "New Project", ... }
  }
  ```

### View Project Detail
- **Request:** `GET /api/projects/<project_id>`
- **Auth:** Required  (Must be a member)
- **Response (200):**
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

### Update Project
- **Request:** `PUT /api/projects/<project_id>`
- **Auth:** Required (Solo Owner)
- **Body:**
  ```json
  {
    "name": "Updated name",
    "description": "New description"
  }
  ```
- **Response (200):**
  ```json
  {
    "message": "Project updated successfully",
    "project": { ... }
  }
  ```

### Delete Project
- **Request:** `DELETE /api/projects/<project_id>`
- **Auth:** Required (Solo Owner)
- **Response (200):**
  ```json
  { "message": "Project deleted successfully" }
  ```

### AñadAddir Member
- **Request:** `POST /api/projects/<project_id>/members`
- **Auth:** Required (Solo Owner)
- **Body:**
  ```json
  {
    "user_id": 2,
    "role": "member" 
  }
  ```
- **Response (201):**
  ```json
  {
    "message": "Member añadido exitosamente",
    "member": { "id": 3, "project_id": 1, "user_id": 2, "role": "member", ... }
  }
  ```

### Remove Member
- **Request:** `DELETE /api/projects/<project_id>/members/<user_id>`
- **Auth:** Required (Solo Owner)
- **Response (200):**
  ```json
  { "message": "Member eliminado exitosamente" }
  ```

---

## ✅ 3. Tasks (`/api/projects/.../tasks` y `/api/tasks`)

### List Project Tasks (with filters)
- **Request:** `GET /api/projects/<project_id>/tasks`
- **Auth:** Required  (Must be a member)
- **Query Params (Opcionales):** `?status=pending&priority=high&assigned_to=2&created_by=1`
- **Response (200):**
  ```json
  {
    "tasks": [
      { "id": 1, "project_id": 1, "title": "Diseñar UI", "status": "pending", "priority": "high", ... }
    ],
    "total": 1
  }
  ```

### Create Task
- **Request:** `POST /api/projects/<project_id>/tasks`
- **Auth:** Required  (Must be a member)
- **Body:**
  ```json
  {
    "title": "Nueva Task",
    "description": "Detalles de la Task",
    "priority": "medium", 
    "due_date": "2026-08-24T00:00:00",
    "assigned_to": 2 
  }
  ```
- **Response (201):**
  ```json
  {
    "message": "Task creada exitosamente",
    "task": { "id": 2, "title": "Nueva Task", ... }
  }
  ```

### View task Details
- **Request:** `GET /api/tasks/<task_id>`
- **Auth:** Required (Debe ser Member del Project)
- **Response (200):**
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

### Update Task
- **Request:** `PUT /api/tasks/<task_id>`
- **Auth:** Required (Creador, Asignado o Owner)
- **Body:** (All fields are optional, only send the ones you want to change)
  ```json
  {
    "title": "Título actualizado",
    "status": "in_progress",
    "priority": "high",
    "assigned_to": 3,
    "due_date": "2026-09-01T00:00:00"
  }
  ```
- **Response (200):**
  ```json
  {
    "message": "Task actualizada exitosamente",
    "task": { ... }
  }
  ```

### Delete Task
- **Request:** `DELETE /api/tasks/<task_id>`
- **Auth:** Required (Creador o Owner)
- **Response (200):**
  ```json
  { "message": "Task eliminada exitosamente" }
  ```

---

## 👤 4. Users (`/api/users`)

### Buscar Usuarios
- **Request:** `GET /api/users`
- **Auth:** Required
- **Query Params:** `?q=termino_busqueda`  (Searches in username, email, and full_name)
- **Response (200):**
  ```json
  {
    "users": [
      { "id": 2, "username": "juan", "email": "juan@example.com", "full_name": "Juan Pérez" }
    ]
  }
  ```

### View User Profile
- **Request:** `GET /api/users/<user_id>`
- **Auth:** Required
- **Response (200):**
  ```json
  {
    "user": { "id": 2, "username": "juan", "email": "...", "full_name": "...", "avatar_url": "..." }
  }
  ```

### Update My Profile
- **Request:** `PUT /api/users/<user_id>`
- **Auth:** Required (Solo puedes actualizar tu propio perfil)
- **Body:**
  ```json
  {
    "full_name": "Nuevo nombre",
    "avatar_url": "https://example.com/avatar.jpg"
  }
  ```
- **Response (200):**
  ```json
  {
    "message": "Perfil actualizado exitosamente",
    "user": { ... }
  }
  ```

---

## 💬 5. Comments  (`/api/tasks/.../comments` y `/api/comments`)

### List Task Comments
- **Request:** `GET /api/tasks/<task_id>/comments`
- **Auth:** Required (Debe ser Member del Project)
- **Response (200):**
  ```json
  {
    "comments": [
      { "id": 1, "task_id": 1, "user_id": 1, "content": "Gran trabajo!", "created_at": "...", "author": { "id": 1, "username": "..." } }
    ],
    "total": 1
  }
  ```

### Create Comment
- **Request:** `POST /api/tasks/<task_id>/comments`
- **Auth:** Required (Debe ser Member del Project)
- **Body:**
  ```json
  {
    "content": "Este es un nuevo Comment"
  }
  ```
- **Response (201):**
  ```json
  {
    "message": "Commentario creado",
    "comment": { "id": 2, "task_id": 1, "user_id": 1, "content": "...", ... }
  }
  ```

### Delete Comment
- **Request:** `DELETE /api/comments/<comment_id>`
- **Auth:** Required (Solo el autor puede eliminarlo)
- **Response (200):**
  ```json
  { "message": "Commentario eliminado" }
  ```