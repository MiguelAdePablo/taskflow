5: Probar el endpoint de login
------------------------------

1. Nueva petición
2. Método: **POST**
3. URL: `http://localhost:5000/api/auth/login`
4. Body JSON:

json


### Respuesta esperada (200 OK):

json

{
    "message": "Login exitoso",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": 1,
        "username": "miguel",
        "email": "miguel@example.com",
        "full_name": "Miguel Ángel",
        "avatar_url": null,
        "created_at": "2026-06-27T12:34:56.789012"
    }
}

⚠️ **IMPORTANTE:** Copia el valor del `token` (la cadena larga que empieza con `eyJ...`). Lo necesitarás para el
