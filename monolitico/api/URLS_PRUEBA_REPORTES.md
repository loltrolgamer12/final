# 🔗 URLs DE PRUEBA DIRECTA - SISTEMA DE REPORTES

**Fecha:** 13 de octubre de 2025  
**Puerto Backend:** 3001  
**Puerto Frontend:** 3000

---

## 📊 REPORTES VISUALES (JSON)

### Ligeros
```
http://localhost:3001/api/reportes?mes=10&ano=2025&tipo=ligero
```

### Pesados
```
http://localhost:3001/api/reportes?mes=10&ano=2025&tipo=pesado
```

### Todos
```
http://localhost:3001/api/reportes?mes=10&ano=2025&tipo=todos
```

### Con filtro de contrato
```
http://localhost:3001/api/reportes?mes=10&ano=2025&tipo=todos&contrato=HOCOL
```

### Con filtro de campo
```
http://localhost:3001/api/reportes?mes=10&ano=2025&tipo=todos&campo=CENTRO
```

### Con todos los filtros
```
http://localhost:3001/api/reportes?mes=10&ano=2025&tipo=todos&contrato=HOCOL&campo=CENTRO
```

---

## 📄 DESCARGAS EXCEL

### Ligeros
```
http://localhost:3001/api/reportes/excel?mes=10&ano=2025&tipo=ligero
```

### Pesados
```
http://localhost:3001/api/reportes/excel?mes=10&ano=2025&tipo=pesado
```

### Todos
```
http://localhost:3001/api/reportes/excel?mes=10&ano=2025&tipo=todos
```

### Con filtro de contrato
```
http://localhost:3001/api/reportes/excel?mes=10&ano=2025&tipo=todos&contrato=HOCOL
```

### Con filtro de campo
```
http://localhost:3001/api/reportes/excel?mes=10&ano=2025&tipo=todos&campo=CENTRO
```

### Con rango de días específico
```
http://localhost:3001/api/reportes/excel?mes=10&ano=2025&tipo=todos&diaInicio=1&diaFin=15
```

---

## 📕 DESCARGAS PDF

### Ligeros
```
http://localhost:3001/api/reportes/pdf?mes=10&ano=2025&tipo=ligero
```

### Pesados
```
http://localhost:3001/api/reportes/pdf?mes=10&ano=2025&tipo=pesado
```

### Todos
```
http://localhost:3001/api/reportes/pdf?mes=10&ano=2025&tipo=todos
```

### Con filtro de contrato
```
http://localhost:3001/api/reportes/pdf?mes=10&ano=2025&tipo=todos&contrato=HOCOL
```

### Con filtro de campo
```
http://localhost:3001/api/reportes/pdf?mes=10&ano=2025&tipo=todos&campo=CENTRO
```

---

## 🔧 ENDPOINTS DE FILTROS

### Obtener opciones de contrato y campo
```
http://localhost:3001/api/filtros/vehiculos
```

**Respuesta esperada:**
```json
{
  "status": "success",
  "data": {
    "contratos": ["HOCOL", "ECOPETROL", ...],
    "campos": ["CENTRO", "NORTE", ...]
  }
}
```

---

## 🌐 FRONTEND (Interfaz Web)

### Página de Reportes
```
http://localhost:3000/reportes
```

**Pasos para probar:**
1. Seleccionar **Tipo**: Ligero / Pesado / Todos
2. Seleccionar **Mes**: 1-12
3. Seleccionar **Año**: 2020-2025
4. (Opcional) Seleccionar **Contrato**
5. (Opcional) Seleccionar **Campo**
6. (Opcional) Seleccionar **Día Inicio** y **Día Fin**
7. Click en **Generar Reporte**
8. Click en **Descargar Excel** o **Descargar PDF**

---

## 🧪 EJEMPLOS DE CURL (Terminal)

### Reporte JSON - Ligeros
```bash
curl -X GET "http://localhost:3001/api/reportes?mes=10&ano=2025&tipo=ligero"
```

### Reporte JSON - Pesados
```bash
curl -X GET "http://localhost:3001/api/reportes?mes=10&ano=2025&tipo=pesado"
```

### Descarga Excel - Todos
```bash
curl -X GET "http://localhost:3001/api/reportes/excel?mes=10&ano=2025&tipo=todos" \
  -o reporte_todos.xlsx
```

### Descarga PDF - Ligeros
```bash
curl -X GET "http://localhost:3001/api/reportes/pdf?mes=10&ano=2025&tipo=ligero" \
  -o reporte_ligeros.pdf
```

### Filtros disponibles
```bash
curl -X GET "http://localhost:3001/api/filtros/vehiculos"
```

---

## 📝 PARÁMETROS DISPONIBLES

| Parámetro | Tipo | Valores | Requerido | Descripción |
|-----------|------|---------|-----------|-------------|
| `mes` | number | 1-12 | ✅ Sí | Mes del reporte |
| `ano` | number | 2020-2025 | ✅ Sí | Año del reporte |
| `tipo` | string | `ligero`, `pesado`, `todos` | ⚠️ Por defecto: `ligero` | Tipo de vehículo |
| `contrato` | string | - | ❌ No | Filtrar por contrato específico |
| `campo` | string | - | ❌ No | Filtrar por campo/coordinación |
| `diaInicio` | number | 1-31 | ❌ No | Día de inicio del rango |
| `diaFin` | number | 1-31 | ❌ No | Día de fin del rango |

---

## 🎯 CASOS DE PRUEBA RECOMENDADOS

### Caso 1: Reporte Básico
```
GET /api/reportes?mes=10&ano=2025&tipo=ligero
```
**Resultado esperado:** JSON con inspecciones de vehículos ligeros de octubre 2025

### Caso 2: Reporte Combinado
```
GET /api/reportes?mes=10&ano=2025&tipo=todos
```
**Resultado esperado:** JSON con inspecciones de ambos tipos de vehículos

### Caso 3: Filtro por Contrato
```
GET /api/reportes?mes=10&ano=2025&tipo=todos&contrato=HOCOL
```
**Resultado esperado:** Solo inspecciones del contrato HOCOL

### Caso 4: Rango de Días
```
GET /api/reportes/excel?mes=10&ano=2025&tipo=todos&diaInicio=1&diaFin=15
```
**Resultado esperado:** Excel con inspecciones del 1 al 15 de octubre

### Caso 5: Sin Datos
```
GET /api/reportes?mes=1&ano=2020&tipo=pesado
```
**Resultado esperado:** Error 404 "No hay datos para ese rango"

---

## ✅ VERIFICACIÓN RÁPIDA

**Copiar y pegar en el navegador (con servidor corriendo):**

1. **Filtros disponibles:**
   ```
   http://localhost:3001/api/filtros/vehiculos
   ```

2. **Reporte ligeros:**
   ```
   http://localhost:3001/api/reportes?mes=10&ano=2025&tipo=ligero
   ```

3. **Excel todos:**
   ```
   http://localhost:3001/api/reportes/excel?mes=10&ano=2025&tipo=todos
   ```

4. **PDF pesados:**
   ```
   http://localhost:3001/api/reportes/pdf?mes=10&ano=2025&tipo=pesado
   ```

---

## 🚨 ERRORES COMUNES

### Error: "Mes y año requeridos"
**Causa:** No se enviaron los parámetros `mes` y `ano`  
**Solución:** Agregar `?mes=10&ano=2025` a la URL

### Error: "No hay datos para ese rango"
**Causa:** No hay inspecciones en la base de datos para esa fecha/tipo  
**Solución:** 
- Verificar que existan inspecciones en la BD
- Cambiar el mes/año a uno con datos
- Subir archivos Excel de prueba

### Error 500
**Causa:** Error en el servidor (probablemente base de datos)  
**Solución:** Revisar logs del servidor en la terminal

---

**Última actualización:** 13 de octubre de 2025
