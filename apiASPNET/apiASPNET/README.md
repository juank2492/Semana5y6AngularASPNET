# API ASP.NET Core – Guía de Ejecución

Esta guía describe, paso a paso, cómo configurar y ejecutar la API, gestionar las migraciones de base de datos y probar los endpoints.

## Prerrequisitos

- .NET SDK 9.0 instalado (`dotnet --version`).
- SQL Server accesible (local o remoto). Ejemplo de credenciales: `sa / 123456`.
- Postman (o herramienta HTTP similar).
- Si no tienes la herramienta EF Core, debes:
  - Instalar: `dotnet tool install --global dotnet-ef`

## Estructura del proyecto

- Proyecto API: `apiASPNET/apiASPNET`
- Modelos y DbContext: `Models/`
- Controladores: `Controllers/`

## 1) Configurar variables de entorno (.env)

La API carga variables desde un archivo `.env` (no se versiona) y desde el entorno del sistema.

1. Copiar el archivo de ejemplo:
   
   ```bash
   # En PowerShell desde la raíz del repo
   Copy-Item apiASPNET/apiASPNET/.env.example apiASPNET/apiASPNET/.env
   ```

2. Editar `apiASPNET/apiASPNET/.env` con tus valores reales. Ejemplo:
   
   ```env
   # Cadena de conexión a SQL Server
   ConnectionStrings__DefaultConnection=Server=localhost;Database=bdTesting;User Id=sa;Password=123456;TrustServerCertificate=True;

   # JWT
   Jwt__Key=REEMPLAZAR_CON_UNA_LLAVE_SECRETA_LARGA_Y_ALEATORIA
   Jwt__Issuer=apiASPNET
   Jwt__Audience=angular-client
   Jwt__ExpiresMinutes=60
   ```

Notas:
- No se deben guardar secretos en `appsettings.json` (están en blanco a propósito).
- `.env` y `.env.*` ya están ignorados por Git.

## 2) Restaurar y compilar

```bash
cd apiASPNET/apiASPNET
dotnet restore
dotnet build
```

## 3) Migraciones de base de datos

La aplicación aplica automáticamente las migraciones al iniciar (`Database.Migrate()`),

  ```bash
  dotnet ef database update
  ```

Si usas la Consola del Administrador de Paquetes (PMC) en Visual Studio: `Add-Migration <Nombre>` y luego `Update-Database` (asegúrate de seleccionar el proyecto de inicio correcto).

## 4) Ejecutar la API

```bash
dotnet run
```

Puertos por defecto:
- HTTP: `http://localhost:5137`
- HTTPS: `https://localhost:7122`

La API redirige a HTTPS. Si tienes advertencias de certificado en desarrollo, confía el certificado de desarrollo:

```bash
dotnet dev-certs https --trust
```

## 5) Usuario semilla

Al iniciar la API, si no hay usuarios en la base de datos, se crea automáticamente:

- Usuario: `admin`
- Contraseña: `123456`

## 6) Probar endpoints en Postman

Autenticación vía JWT (portador). Primero obtén un token y úsalo en el encabezado `Authorization` como `Bearer <token>`.

### 6.1 Login

- Método: `POST`
- URL: `https://localhost:7122/api/auth/login`
- Body (JSON):

```json
{
  "username": "admin",
  "password": "123456"
}
```

- Respuesta 200 OK (ejemplo):

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Copia el valor de `token`.

### 6.2 Listar Customers

- Método: `GET`
- URL: `https://localhost:7122/api/customers`
- Headers:
  - `Authorization: Bearer <token>`

Respuesta 200 OK (ejemplo):

```json
[
  {
    "id": 1,
    "name": "ACME Corp",
    "email": "contacto@acme.com",
    "createdAt": "2025-01-01T12:00:00Z",
    "createdBy": 1,
    "createdByUser": null
  }
]
```

### 6.3 Crear Customer

- Método: `POST`
- URL: `https://localhost:7122/api/customers`
- Headers:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- Body (JSON):

```json
{
  "name": "ACME Corp",
  "email": "contacto@acme.com"
}
```

Respuesta 201 Created (ejemplo):

```json
{
  "id": 1,
  "name": "ACME Corp",
  "email": "contacto@acme.com",
  "createdAt": "2025-01-01T12:00:00Z",
  "createdBy": 1,
  "createdByUser": null
}
```

### 6.4 Actualizar Customer

- Método: `PUT`
- URL: `https://localhost:7122/api/customers/1`
- Headers: `Authorization: Bearer <token>`
- Body (JSON):

```json
{
  "id": 1,
  "name": "ACME Corp Actualizado",
  "email": "ventas@acme.com"
}
```

Respuesta 204 No Content.

### 6.5 Eliminar Customer

- Método: `DELETE`
- URL: `https://localhost:7122/api/customers/1`
- Headers: `Authorization: Bearer <token>`

Respuesta 204 No Content.

## 7) CORS

La API permite orígenes desde Angular en `http://localhost:4200`. Si tu frontend usa otra URL, actualiza la política CORS en `Program.cs`.


