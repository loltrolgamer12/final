# ✅ CHECKLIST DE VALIDACIÓN - SISTEMA DE REPORTES

## 🎯 OBJETIVO
Validar que el sistema de reportes funciona correctamente para vehículos **LIGEROS**, **PESADOS** y **TODOS**.

---

## 📋 PRE-REQUISITOS

- [ ] Servidor backend corriendo en puerto 3001
- [ ] Frontend corriendo en puerto 3000
- [ ] Base de datos con inspecciones de vehículos ligeros
- [ ] Base de datos con inspecciones de vehículos pesados
- [ ] Archivos Excel de prueba subidos (HQ-FO-40 y HQ-FO-41)

---

## 🧪 PRUEBAS DE BACKEND (API)

### 1. Endpoint de Filtros
```bash
curl http://localhost:3001/api/filtros/vehiculos
```
**Verificar:**
- [ ] Retorna status 200
- [ ] JSON contiene arrays `contratos` y `campos`
- [ ] Incluye datos de ambas tablas (ligeros y pesados)

### 2. Reportes Visuales - Ligeros
```bash
curl "http://localhost:3001/api/reportes?mes=10&ano=2025&tipo=ligero"
```
**Verificar:**
- [ ] Retorna status 200
- [ ] Solo incluye inspecciones de tabla `Inspeccion`
- [ ] Mensajes de vehículos corresponden a ligeros

### 3. Reportes Visuales - Pesados
```bash
curl "http://localhost:3001/api/reportes?mes=10&ano=2025&tipo=pesado"
```
**Verificar:**
- [ ] Retorna status 200
- [ ] Solo incluye inspecciones de tabla `InspeccionPesado`
- [ ] Mensajes de vehículos corresponden a pesados

### 4. Reportes Visuales - Todos
```bash
curl "http://localhost:3001/api/reportes?mes=10&ano=2025&tipo=todos"
```
**Verificar:**
- [ ] Retorna status 200
- [ ] Incluye inspecciones de AMBAS tablas
- [ ] Total de inspecciones = ligeros + pesados

### 5. Filtro por Contrato
```bash
curl "http://localhost:3001/api/reportes?mes=10&ano=2025&tipo=todos&contrato=HOCOL"
```
**Verificar:**
- [ ] Solo retorna inspecciones del contrato especificado
- [ ] Funciona para ambos tipos de vehículos

### 6. Filtro por Campo
```bash
curl "http://localhost:3001/api/reportes?mes=10&ano=2025&tipo=todos&campo=CENTRO"
```
**Verificar:**
- [ ] Solo retorna inspecciones del campo especificado
- [ ] Funciona para ambos tipos de vehículos

---

## 📊 PRUEBAS DE FRONTEND (Navegador)

### 1. Página de Reportes - Carga Inicial
**URL:** `http://localhost:3000/reportes`

**Verificar:**
- [ ] Página carga sin errores
- [ ] Selector "Tipo" tiene opciones: Selecciona tipo..., Todos, Ligero, Pesado
- [ ] Selector "Contrato" carga opciones de la BD
- [ ] Selector "Campo/Coordinación" carga opciones de la BD
- [ ] Selector "Mes" tiene 12 opciones
- [ ] Selector "Año" tiene varios años

### 2. Generar Reporte - Ligeros
**Pasos:**
1. Seleccionar Tipo: **Ligero**
2. Seleccionar Mes: **Octubre**
3. Seleccionar Año: **2025**
4. Click en **Generar Reporte**

**Verificar:**
- [ ] Aparece mensaje de carga
- [ ] Se muestran tarjetas de resumen
- [ ] Tabla de inspecciones muestra solo ligeros
- [ ] No hay errores en consola del navegador

### 3. Generar Reporte - Pesados
**Pasos:**
1. Seleccionar Tipo: **Pesado**
2. Seleccionar Mes: **Octubre**
3. Seleccionar Año: **2025**
4. Click en **Generar Reporte**

**Verificar:**
- [ ] Aparece mensaje de carga
- [ ] Se muestran tarjetas de resumen
- [ ] Tabla de inspecciones muestra solo pesados
- [ ] No hay errores en consola del navegador

### 4. Generar Reporte - Todos
**Pasos:**
1. Seleccionar Tipo: **Todos**
2. Seleccionar Mes: **Octubre**
3. Seleccionar Año: **2025**
4. Click en **Generar Reporte**

**Verificar:**
- [ ] Aparece mensaje de carga
- [ ] Se muestran tarjetas de resumen
- [ ] Tabla de inspecciones muestra ligeros Y pesados
- [ ] Total = suma de ambos tipos
- [ ] No hay errores en consola del navegador

### 5. Filtros Combinados
**Pasos:**
1. Seleccionar Tipo: **Todos**
2. Seleccionar Contrato: (alguno disponible)
3. Seleccionar Campo: (alguno disponible)
4. Seleccionar Mes y Año
5. Click en **Generar Reporte**

**Verificar:**
- [ ] Solo muestra inspecciones que cumplen TODOS los filtros
- [ ] No hay errores en consola

---

## 📄 PRUEBAS DE DESCARGA - EXCEL

### 1. Excel - Ligeros
**Pasos:**
1. Configurar: Tipo=Ligero, Mes=Octubre, Año=2025
2. Click en **Descargar Excel**

**Verificar Archivo:**
- [ ] Archivo se descarga: `reporte_ligeros_Octubre_2025.xlsx`
- [ ] Hoja **Leyenda** existe y tiene explicaciones
- [ ] Hoja **Resumen** existe:
  - [ ] Fila "Tipo de vehículos" = "Ligeros"
  - [ ] Fila "Total inspecciones" tiene número correcto
  - [ ] Fila "Inspecciones ligeros" = Total
  - [ ] Fila "Inspecciones pesados" = 0
- [ ] Hoja **Inspecciones** existe:
  - [ ] Columna "Tipo" existe
  - [ ] Todas las filas tienen Tipo = "Ligero"
- [ ] Hoja **Vehículos** existe:
  - [ ] Columna "Tipo" existe
  - [ ] Todas las filas tienen Tipo = "Ligero"
  - [ ] Columna "Motivo" muestra **TODOS** los componentes fallados
  - [ ] Motivo NO solo dice "crítico", sino que lista cada falla
- [ ] Hoja **Fatiga** existe:
  - [ ] Columna "tipo" existe
  - [ ] Tipo = "Ligero"

### 2. Excel - Pesados
**Pasos:**
1. Configurar: Tipo=Pesado, Mes=Octubre, Año=2025
2. Click en **Descargar Excel**

**Verificar Archivo:**
- [ ] Archivo se descarga: `reporte_pesados_Octubre_2025.xlsx`
- [ ] Hoja **Resumen**:
  - [ ] Fila "Tipo de vehículos" = "Pesados"
  - [ ] Fila "Inspecciones ligeros" = 0
  - [ ] Fila "Inspecciones pesados" = Total
- [ ] Hoja **Inspecciones**:
  - [ ] Todas las filas tienen Tipo = "Pesado"
- [ ] Hoja **Vehículos**:
  - [ ] Todas las filas tienen Tipo = "Pesado"
  - [ ] Columna "Motivo" incluye sistema de aire (compresor, mangueras, tanque, secador) si aplica
  - [ ] Motivo muestra llantas con labrado < 3mm (no 2mm)

### 3. Excel - Todos
**Pasos:**
1. Configurar: Tipo=Todos, Mes=Octubre, Año=2025
2. Click en **Descargar Excel**

**Verificar Archivo:**
- [ ] Archivo se descarga: `reporte_todos_Octubre_2025.xlsx`
- [ ] Hoja **Resumen**:
  - [ ] Fila "Tipo de vehículos" = "Ligeros y Pesados"
  - [ ] Fila "Total inspecciones" = suma de ligeros + pesados
  - [ ] Fila "Inspecciones ligeros" > 0
  - [ ] Fila "Inspecciones pesados" > 0
- [ ] Hoja **Inspecciones**:
  - [ ] Hay filas con Tipo = "Ligero"
  - [ ] Hay filas con Tipo = "Pesado"
- [ ] Hoja **Vehículos**:
  - [ ] Hay filas con Tipo = "Ligero"
  - [ ] Hay filas con Tipo = "Pesado"
  - [ ] Motivo diferente según tipo (labrado 2mm vs 3mm, aire en pesados)

### 4. Excel - Con Filtros
**Pasos:**
1. Configurar: Tipo=Todos, Contrato=HOCOL, Campo=CENTRO
2. Click en **Descargar Excel**

**Verificar:**
- [ ] Solo incluye inspecciones del contrato especificado
- [ ] Solo incluye inspecciones del campo especificado

---

## 📕 PRUEBAS DE DESCARGA - PDF

### 1. PDF - Ligeros
**Pasos:**
1. Configurar: Tipo=Ligero, Mes=Octubre, Año=2025
2. Click en **Descargar PDF**

**Verificar Archivo:**
- [ ] Archivo se descarga: `reporte_ligeros_Octubre_2025.pdf`
- [ ] **Portada**:
  - [ ] Título: "Reporte HQ-FO-40/41"
  - [ ] Subtítulo: "Octubre 2025"
  - [ ] Línea "Tipo de vehículos: Ligeros"
- [ ] **Resumen General**:
  - [ ] Fila "Tipo de vehículos" = "Ligeros"
  - [ ] Total de inspecciones correcto

### 2. PDF - Pesados
**Pasos:**
1. Configurar: Tipo=Pesado, Mes=Octubre, Año=2025
2. Click en **Descargar PDF**

**Verificar Archivo:**
- [ ] Archivo se descarga: `reporte_pesados_Octubre_2025.pdf`
- [ ] **Portada**: "Tipo de vehículos: Pesados"
- [ ] **Resumen**: Tipo = "Pesados"

### 3. PDF - Todos
**Pasos:**
1. Configurar: Tipo=Todos, Mes=Octubre, Año=2025
2. Click en **Descargar PDF**

**Verificar Archivo:**
- [ ] Archivo se descarga: `reporte_todos_Octubre_2025.pdf`
- [ ] **Portada**: "Tipo de vehículos: Ligeros y Pesados"
- [ ] **Resumen**: Tipo = "Ligeros y Pesados"

---

## 🔍 VALIDACIÓN DE COMPONENTES FALLADOS

### Vehículo LIGERO con Fallas
**Buscar en Excel - Hoja "Vehículos":**
- [ ] Motivo lista **CADA** componente fallado
- [ ] Incluye categorías:
  - [ ] Luces (altas/bajas, direccionales, parqueo, freno, reversa)
  - [ ] Espejos y vidrios
  - [ ] Condiciones generales
  - [ ] Frenos y cinturones
  - [ ] Carrocería
  - [ ] Niveles de fluidos
  - [ ] Motor y electricidad
  - [ ] Llantas (labrado < 2mm)
  - [ ] Suspensión y dirección
  - [ ] Otros

### Vehículo PESADO con Fallas
**Buscar en Excel - Hoja "Vehículos":**
- [ ] Motivo lista **CADA** componente fallado
- [ ] Incluye TODOS los componentes de ligeros
- [ ] ADEMÁS incluye:
  - [ ] Sistema de aire: Compresor
  - [ ] Sistema de aire: Mangueras
  - [ ] Sistema de aire: Tanque
  - [ ] Sistema de aire: Secador de aire
- [ ] Llantas: labrado < 3mm (no 2mm)

---

## 🐛 REGISTRO DE PROBLEMAS

Si encuentras algún problema, regístralo aquí:

### Problema 1:
- **Descripción:**
- **Pasos para reproducir:**
- **Resultado esperado:**
- **Resultado obtenido:**
- **Prioridad:** [ ] Alta  [ ] Media  [ ] Baja

### Problema 2:
- **Descripción:**
- **Pasos para reproducir:**
- **Resultado esperado:**
- **Resultado obtenido:**
- **Prioridad:** [ ] Alta  [ ] Media  [ ] Baja

---

## ✅ RESUMEN DE VALIDACIÓN

**Fecha de validación:** _______________

**Validador:** _______________

**Resultados:**
- Pruebas de Backend: _____ / _____ pasadas
- Pruebas de Frontend: _____ / _____ pasadas
- Pruebas de Excel: _____ / _____ pasadas
- Pruebas de PDF: _____ / _____ pasadas
- Validación de Componentes: _____ / _____ pasadas

**Estado general:** [ ] ✅ APROBADO  [ ] ⚠️ CON OBSERVACIONES  [ ] ❌ RECHAZADO

**Observaciones:**
_______________________________________________________________________________
_______________________________________________________________________________
_______________________________________________________________________________
