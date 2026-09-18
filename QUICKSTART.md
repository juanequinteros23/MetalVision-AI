# 🚀 MetalVision AI - Guía de Inicio Rápido

## 📋 Prerrequisitos

- Python 3.10 o superior
- Node.js 18 o superior
- Docker Desktop (para MySQL y Redis)
- Git

## ⚡ Inicio Rápido (5 Pasos)

### 1️⃣ Instalar Docker Desktop

**Windows:**
1. Descargar desde: https://www.docker.com/products/docker-desktop/
2. Instalar y reiniciar el computador
3. Abrir Docker Desktop y esperar a que inicie

**Verificar instalación:**
```powershell
docker --version
docker compose version
```

### 2️⃣ Iniciar Servicios de Base de Datos

Desde la raíz del proyecto:

```powershell
# Iniciar MySQL y Redis con Docker Compose
docker compose up -d

# Verificar que estén corriendo
docker compose ps

# Deberías ver:
# NAME                    STATUS
# metalvision_mysql       running
# metalvision_redis       running
```

### 3️⃣ Configurar y Ejecutar el Backend

```powershell
# Navegar al directorio del backend
cd backend

# Crear entorno virtual de Python
python -m venv venv

# Activar entorno virtual
.\venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# El archivo .env ya está creado, ejecutar la aplicación
python app.py
```

**Salida esperada:**
```
🔧 Initializing database...
✓ Database configured: localhost:3306/metalvision_db
🔧 Creando tablas de base de datos...
✓ Tablas creadas exitosamente
👤 Creando usuario administrador por defecto...
✓ Usuario admin creado:
  Username: admin
  Password: admin123
✓ JWT configured
✓ Blueprints registered:
  - /api/auth (Authentication)

======================================================================
🚀 MetalVision AI API
======================================================================
🌐 Server: http://0.0.0.0:5000
📚 API Docs: http://0.0.0.0:5000/api/docs (coming soon)
💚 Health Check: http://0.0.0.0:5000/api/health
🔐 Auth Endpoints: http://0.0.0.0:5000/api/auth/*
======================================================================
⚙️  Environment: development
🐛 Debug Mode: True
======================================================================
```

### 4️⃣ Probar la API

**Abrir en navegador:**
- http://localhost:5000/ - Información de la API
- http://localhost:5000/api/health - Health check

**Con PowerShell:**
```powershell
# Health check
Invoke-RestMethod -Uri http://localhost:5000/api/health

# Registrar usuario
$body = @{
    username = "testuser"
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:5000/api/auth/register -Method Post -Body $body -ContentType "application/json"

# Login
$loginBody = @{
    username = "testuser"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri http://localhost:5000/api/auth/login -Method Post -Body $loginBody -ContentType "application/json"
$token = $response.access_token

echo $token  # Guardar este token
```

### 5️⃣ Configurar y Ejecutar el Frontend

**En otra terminal:**

```powershell
# Navegar al directorio del cliente
cd client

# Instalar dependencias
npm install

# Crear archivo .env (copiar del ejemplo)
Copy-Item .env.example .env

# Iniciar servidor de desarrollo
npm run dev
```

**Acceder en navegador:**
- http://localhost:5173

---

## 🧪 Probar Endpoints con Extensión REST Client

Si usas VS Code, instala la extensión "REST Client" y crea un archivo `test_api.http`:

```http
### Variables
@baseUrl = http://localhost:5000/api
@token = tu_token_aqui

### Health Check
GET {{baseUrl}}/../api/health

### Register User
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepass123"
}

### Login
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "securepass123"
}

### Get Current User
GET {{baseUrl}}/auth/me
Authorization: Bearer {{token}}

### Logout
POST {{baseUrl}}/auth/logout
Authorization: Bearer {{token}}
```

---

## 📝 Credenciales por Defecto

**Usuario Administrador:**
- Username: `admin`
- Password: `admin123`
- Role: `admin`

⚠️ **IMPORTANTE:** Cambiar la contraseña después del primer login.

---

## 🐛 Solución de Problemas

### Error: "docker: command not found"
- Instalar Docker Desktop desde https://www.docker.com/products/docker-desktop/

### Error: "No module named 'flask'"
- Asegúrate de haber activado el entorno virtual: `.\venv\Scripts\activate`
- Reinstala dependencias: `pip install -r requirements.txt`

### Error: "Can't connect to MySQL server"
- Verifica que Docker esté corriendo: `docker compose ps`
- Reinicia los contenedores: `docker compose restart`
- Verifica logs: `docker compose logs mysql`

### Error: "Port 5000 is already in use"
- Cambia el puerto en `.env`: `PORT=5001`
- O mata el proceso que usa el puerto 5000

### Frontend no se conecta al backend
- Verifica que la URL en `client/.env` sea correcta: `VITE_API_URL=http://localhost:5000`
- Verifica que CORS esté habilitado en el backend (ya está configurado)

---

## 🔄 Comandos Útiles

### Backend
```powershell
# Activar entorno virtual
cd backend
.\venv\Scripts\activate

# Ejecutar servidor
python app.py

# Reinstalar dependencias
pip install -r requirements.txt --upgrade

# Salir del entorno virtual
deactivate
```

### Frontend
```powershell
cd client

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build

# Preview de build
npm run preview
```

### Docker
```powershell
# Iniciar servicios
docker compose up -d

# Ver logs
docker compose logs -f

# Detener servicios
docker compose down

# Reiniciar servicios
docker compose restart

# Ver servicios corriendo
docker compose ps

# Eliminar volúmenes (⚠️ borra datos)
docker compose down -v
```

---

## 📚 Próximos Pasos

1. **Descargar Dataset NEU** (ver `notebooks/README.md`)
2. **Ejecutar notebook de preparación** (`notebooks/01_dataset_preparation.ipynb`)
3. **Entrenar modelos ML** (notebooks 03, 04, 05)
4. **Implementar endpoints de predicción** (Task 10-12)
5. **Desarrollar frontend completo** (Task 16-23)

Ver `IMPLEMENTATION_STATUS.md` para el plan completo.

---

## 📞 Soporte

- **Problemas con el código**: Revisar logs en la terminal
- **Documentación**: Ver `README.md` y `IMPLEMENTATION_STATUS.md`
- **Dataset**: Ver `notebooks/README.md`

---

**¡Listo para comenzar a desarrollar! 🎉**
