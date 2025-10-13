# 🚗 HQ-FO-40 - SISTEMA DE INSPECCIONES VEHICULARES MONOLÍTICO

Sistema completo de gestión de inspecciones para vehículos ligeros y pesados, con reportes en PDF y Excel.

---

## 📋 ÍNDICE

1. [Arquitectura](#-arquitectura)
2. [Modo Desarrollo vs Producción](#-modo-desarrollo-vs-producción)
3. [Instalación](#-instalación)
4. [Uso Rápido](#-uso-rápido)
5. [Funcionalidades](#-funcionalidades)
6. [API Endpoints](#-api-endpoints)
7. [Deploy](#-deploy)

---

## 🏗️ ARQUITECTURA

### **Sistema Monolítico**
```
┌─────────────────────────────────────────┐
│        PUERTO 4000 (Producción)        │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐ │
│  │   FRONTEND (React SPA)            │ │
│  │   - Dashboard                     │ │
│  │   - Reportes                      │ │
│  │   - Upload                        │ │
│  │   Servido como archivos estáticos │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │   BACKEND (Express API)           │ │
│  │   - /api/upload                   │ │
│  │   - /api/dashboard                │ │
│  │   - /api/reportes                 │ │
│  │   - /api/inspecciones             │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │   DATABASE (PostgreSQL + Prisma)  │ │
│  │   - Inspeccion (Ligeros)          │ │
│  │   - InspeccionPesado (Pesados)    │ │
│  └───────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔧 MODO DESARROLLO vs PRODUCCIÓN

### **DESARROLLO (Hot Reload)**
```bash
# Terminal 1 - Backend (puerto 4000)
npm run dev

# Terminal 2 - Frontend (puerto 3000)
npm run dev:frontend
```
- Frontend: `http://localhost:3000` con hot reload
- Backend: `http://localhost:4000`
- Proxy automático de `/api/*` → puerto 4000

### **PRODUCCIÓN (Monolítico)**
```bash
# Build + Start en un solo comando
npm run build:monolitico
```
- Todo en: `http://localhost:4000`
- Frontend compilado servido como estático
- Backend API bajo `/api/*`

**📖 Ver guía completa:** [MODO_MONOLITICO.md](MODO_MONOLITICO.md)

---

## 📦 INSTALACIÓN

### Prerrequisitos
- Node.js 18+
- PostgreSQL 15+
- npm o yarn

### Pasos

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd final/monolitico

# 2. Instalar dependencias backend
npm install

# 3. Instalar dependencias frontend
cd src
npm install
cd ..

# 4. Configurar base de datos
cp api/.env.example api/.env
# Editar api/.env con tu DATABASE_URL

# 5. Ejecutar migraciones
npm run prisma:migrate

# 6. Generar cliente Prisma
npm run prisma:generate
```

---

## 🚀 USO RÁPIDO

### Opción 1: Script Automatizado (Recomendado)
```bash
./iniciar_monolitico.sh
```
Este script:
- ✅ Instala dependencias
- ✅ Compila frontend
- ✅ Copia build al backend
- ✅ Inicia servidor en puerto 4000

### Opción 2: Comando Manual
```bash
npm run build:monolitico
```

### Opción 3: Desarrollo con Hot Reload
```bash
# Terminal 1
npm run dev

# Terminal 2
npm run dev:frontend
```

---

## ✨ FUNCIONALIDADES

### 📊 Dashboard
- **Vehículos**: Vista filtrada por ligeros/pesados/todos
- **Conductores**: Alertas de fatiga, medicamentos, días sin inspección
- **KPIs**: Cumplimiento, alertas críticas, riesgo por nivel

### 📄 Reportes
- **PDF Detallado**: Inspecciones con todos los campos fallidos
- **Excel Completo**: KPIs, rechazos, alertas de vehículos/conductores
- **Filtros**: Por tipo (ligero/pesado), mes, día, rango, contrato, campo

### 📤 Carga de Datos
- **Excel de Google Forms**: HQ-FO-40 (Ligero), HQ-FO-41 (Pesado)
- **Validación automática**: Duplicados, campos obligatorios
- **Registro de archivos**: Previene duplicación

### 🔍 Búsqueda
- **Por placa**: Historial completo del vehículo
- **Por conductor**: Todas las inspecciones del conductor
- **Filtros avanzados**: Por fecha, riesgo, alertas críticas

---

## 📡 API ENDPOINTS

### Upload
```
POST /api/upload
- Multipart form-data con archivo Excel
- Procesa inspecciones ligeras o pesadas automáticamente
```

### Dashboard
```
GET /api/dashboard/vehiculos?tipo=ligero|pesado|todos
GET /api/dashboard/conductores?tipo=ligero|pesado|todos
GET /api/dashboard/kpis?tipo=ligero|pesado|todos
```

### Reportes
```
GET /api/reportes?tipo=ligero|pesado|todos&campo=placa_vehiculo&valor=ABC123
GET /api/reportes/pdf?mes=10&ano=2025&tipo=ligero
GET /api/reportes/excel?mes=10&ano=2025&tipo=pesado
```

### Inspecciones
```
GET /api/inspecciones/:id
GET /api/inspecciones/vehiculo/:placa
GET /api/inspecciones/conductor/:nombre
```

### Filtros
```
GET /api/filtros/vehiculos?tipo=ligero|pesado|todos
GET /api/filtros/contratos?tipo=ligero|pesado|todos
GET /api/filtros/campos?tipo=ligero|pesado
```

**📖 Ver documentación completa:** [URLS_PRUEBA_REPORTES.md](api/URLS_PRUEBA_REPORTES.md)

---

## 🐳 DEPLOY

### Docker
```bash
docker build -t hqfo40 .
docker run -p 4000:4000 --env-file api/.env hqfo40
```

### Fly.io
```bash
fly deploy
```

### Render / Railway
```bash
# Build Command:
npm run build

# Start Command:
npm start
```

### Variables de Entorno Requeridas
```
PORT=4000
DATABASE_URL=postgresql://...
NODE_ENV=production
```

---

## 📁 ESTRUCTURA DEL PROYECTO

```
monolitico/
├── api/                          # Backend Express
│   ├── server.js                # Punto de entrada
│   ├── src/
│   │   ├── config/
│   │   │   ├── app.js           # ⭐ Configuración Express + serve estáticos
│   │   │   └── database.js      # Prisma client
│   │   ├── controllers/         # Lógica de negocio
│   │   │   ├── excelController.js    # ✅ ACTUALIZADO - Soporte ligeros/pesados
│   │   │   ├── pdfController.js      # ✅ ACTUALIZADO - Soporte ligeros/pesados
│   │   │   └── reportesController.js # ✅ ACTUALIZADO - Tipo 'todos'
│   │   ├── routes/              # Endpoints API
│   │   ├── services/            # Servicios auxiliares
│   │   └── utils/
│   │       └── responseUtils.js # ✅ ACTUALIZADO - Funciones ligeros/pesados
│   ├── prisma/
│   │   └── schema.prisma        # Esquema de DB
│   └── public/
│       └── build/               # ⭐ Frontend compilado (se copia aquí)
│
├── src/                          # Frontend React
│   ├── src/
│   │   ├── pages/
│   │   │   └── Reportes.js      # ✅ ACTUALIZADO - Envía parámetro 'tipo'
│   │   └── services/
│   │       └── api.js           # ⭐ baseURL: '/api' (relativo)
│   └── package.json             # ⭐ "proxy": "http://localhost:4000"
│
├── MODO_MONOLITICO.md           # ⭐ Guía de uso monolítico
├── iniciar_monolitico.sh        # ⭐ Script de inicio automatizado
├── package.json                 # ⭐ Scripts principales
└── README.md                    # Este archivo
```

---

## ✅ CAMBIOS RECIENTES (2025-10-13)

### ✨ Reportes de Vehículos Pesados
- ✅ Excel ahora soporta ligeros, pesados y ambos
- ✅ PDF ahora soporta ligeros, pesados y filtros avanzados
- ✅ Reportes visuales soportan `tipo=todos`

### 🔧 Filtros Completos
- ✅ Excel revisa TODOS los 39 campos de ligeros (antes solo 13)
- ✅ Excel revisa TODOS los 45+ campos de pesados
- ✅ `getMotivoCriticoDetalladoPesado()` muestra todas las fallas

### 📚 Documentación
- ✅ `MODO_MONOLITICO.md` - Guía completa desarrollo vs producción
- ✅ `iniciar_monolitico.sh` - Script de inicio automatizado
- ✅ `URLS_PRUEBA_REPORTES.md` - URLs de prueba para todos los endpoints
- ✅ `RESUMEN_CAMBIOS_REPORTES.md` - Checklist de validación

---

## 🆘 SOPORTE

### Problemas Comunes

**Frontend no carga en puerto 4000:**
```bash
npm run build
```

**API no responde:**
```bash
# Verificar que el servidor esté corriendo
npm start
```

**Error de base de datos:**
```bash
npm run prisma:generate
npm run prisma:migrate
```

---

## 📝 LICENCIA

Propietario - Todos los derechos reservados

---

**Última actualización:** 13 de octubre de 2025  
**Versión:** 1.0.0
