# 🏗️ SISTEMA MONOLÍTICO - GUÍA DE USO

## 📋 EXPLICACIÓN

Este sistema está configurado como **MONOLÍTICO** pero puede ejecutarse en dos modos:

---

## 🔧 MODO 1: DESARROLLO (2 Puertos)

**Cuándo usar:** Durante el desarrollo activo con hot-reload

### Frontend (React Dev Server)
- Puerto: `3000`
- Hot reload automático
- Proxy a backend en puerto 4000

### Backend (Express)
- Puerto: `4000`
- API endpoints

### Ejecutar en modo desarrollo:

```bash
# Terminal 1 - Backend
cd /workspaces/final/monolitico
npm run dev

# Terminal 2 - Frontend
cd /workspaces/final/monolitico
npm run dev:frontend

# O ambos simultáneamente (si tienes concurrently instalado)
npm run dev:both
```

**Acceder:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api

---

## 🚀 MODO 2: PRODUCCIÓN MONOLÍTICA (1 Puerto)

**Cuándo usar:** Deploy final, producción, testing completo

### Todo en puerto 4000:
- Frontend (archivos estáticos)
- Backend (API)
- Una sola aplicación

### Ejecutar en modo monolítico:

```bash
cd /workspaces/final/monolitico

# 1. Hacer build del frontend e iniciar servidor
npm run build:monolitico

# O en pasos separados:
# 1. Build del frontend
npm run build

# 2. Iniciar servidor (sirve frontend + backend)
npm start
```

**Acceder:**
- Todo: http://localhost:4000

---

## 📂 ESTRUCTURA DE ARCHIVOS

```
monolitico/
├── api/                          # Backend Express
│   ├── server.js                # Punto de entrada
│   ├── src/
│   │   ├── config/app.js        # ⭐ Sirve archivos estáticos del frontend
│   │   ├── routes/              # API endpoints
│   │   └── controllers/
│   └── public/
│       └── build/               # ⭐ Frontend compilado (se copia aquí)
│
├── src/                          # Frontend React (código fuente)
│   ├── src/
│   │   ├── services/api.js      # ⭐ baseURL: '/api' (relativo)
│   │   └── pages/
│   └── package.json             # ⭐ "proxy": "http://localhost:4000"
│
└── package.json                 # Scripts principales
```

---

## 🔍 CÓMO FUNCIONA EN PRODUCCIÓN

### 1. Build del Frontend
```bash
npm run build
```
Esto ejecuta:
1. `cd src && npm install` - Instala dependencias del frontend
2. `npm run build` - Crea build optimizado en `src/build/`
3. `rm -rf ../api/public/build` - Limpia build anterior
4. `cp -r build ../api/public/build` - Copia build a carpeta pública del backend

### 2. Express Sirve Todo (api/src/config/app.js)

```javascript
// Línea 34: Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../../public/build')));

// Líneas 38-50: Rutas API
app.use('/api/upload', uploadRoutes);
app.use('/api/dashboard', dashboardRoutes);
// ... etc

// Línea 54-56: Todas las demás rutas van al index.html del frontend
app.get(/^((?!\/api).)*$/, (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/build/index.html'));
});
```

### 3. Frontend hace peticiones relativas

```javascript
// src/src/services/api.js - Línea 4
const api = axios.create({
  baseURL: '/api',  // ⭐ Relativo, funciona en cualquier puerto
  timeout: 10 * 60 * 1000
});
```

---

## ✅ VALIDAR QUE TODO FUNCIONE

### Checklist Monolítico:

```bash
# 1. Build del frontend
cd /workspaces/final/monolitico
npm run build

# 2. Verificar que se copió el build
ls -la api/public/build/
# Debe mostrar: index.html, static/, asset-manifest.json

# 3. Iniciar servidor
npm start
# Debe decir: "Servidor HQ-FO-40 escuchando en puerto 4000"

# 4. Abrir navegador
# http://localhost:4000
# Debe cargar la aplicación completa

# 5. Verificar API
curl http://localhost:4000/api/dashboard/vehiculos
# Debe responder con datos JSON
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### "404 Not Found" al cargar la app en puerto 4000
```bash
# El build del frontend no está en su lugar
cd /workspaces/final/monolitico
npm run build
```

### "Cannot GET /api/..."
```bash
# El backend no está ejecutándose
cd /workspaces/final/monolitico
npm start
```

### Frontend carga pero no se conecta al backend
```bash
# Verifica que api.js use baseURL relativa
cat src/src/services/api.js | grep baseURL
# Debe mostrar: baseURL: '/api',
```

---

## 🎯 RECOMENDACIÓN

**DESARROLLO:** Usa 2 puertos (`npm run dev:both`) para hot-reload  
**PRODUCCIÓN/DEPLOY:** Usa 1 puerto (`npm run build:monolitico`)

---

## 📦 DEPLOY

### Fly.io / Render / Railway:
```bash
npm run build:monolitico
```

### Dockerfile ya configurado:
```dockerfile
# Ya hace el build y copia archivos correctamente
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

---

## ✨ VENTAJAS DEL MONOLITO

✅ **Un solo proceso** - Menos recursos  
✅ **Un solo puerto** - Fácil deploy  
✅ **Sin CORS** - Frontend y backend en mismo origen  
✅ **Deployment simple** - Una sola imagen Docker  
✅ **Desarrollo rápido** - Todo en un repositorio

---

**Última actualización:** 13 de octubre de 2025
