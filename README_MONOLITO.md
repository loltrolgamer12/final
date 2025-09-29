# Proyecto Monolítico: HQ-FO-40

## Estructura
- Todo el frontend (React) se sirve desde el backend (Express).
- El backend expone las APIs y sirve los archivos estáticos del frontend.

## Desarrollo local
1. Instala dependencias:
   ```bash
   cd backend
   npm install
   ```
2. Crea un archivo `.env` en `backend` con tu cadena de conexión:
   ```
   DATABASE_URL=postgresql://<usuario>:<password>@<host>/<db>?sslmode=require
   ```
3. Construye el frontend y copia el build:
   ```bash
   cd ../frontend
   npm install
   npm run build
   cp -r build ../backend/public/build
   ```
4. Inicia el backend:
   ```bash
   cd ../backend
   npm start
   ```
5. Abre `http://localhost:4000` para ver la app.

## Despliegue
- Solo necesitas desplegar el backend (por ejemplo, en Fly.io, Render, Railway, etc.).
- El frontend se servirá automáticamente desde el backend.

## Variables de entorno
- Solo necesitas `DATABASE_URL` en el backend.
- El frontend ya no requiere variables de entorno para la API.

---

Cualquier cambio en el frontend debe ser reconstruido y copiado a `backend/public/build`.
