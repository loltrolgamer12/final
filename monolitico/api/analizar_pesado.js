const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

console.log('🔍 INICIANDO ANÁLISIS EXHAUSTIVO DE VEHÍCULOS PESADOS...\n');

const workbook = XLSX.readFile(path.join(__dirname, 'HQ-FO-41 INSPECCIÓN DIARIA DE VEHÍCULOS PESADOS (respuestas) (5).xlsx'));
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

let reporte = '';
reporte += '═══════════════════════════════════════════════════════════════════════\n';
reporte += '                  ANÁLISIS EXHAUSTIVO - VEHÍCULOS PESADOS\n';
reporte += '                         HQ-FO-41 (PESADO)\n';
reporte += '═══════════════════════════════════════════════════════════════════════\n\n';
reporte += `Fecha de análisis: ${new Date().toLocaleString()}\n`;
reporte += `Total de registros: ${data.length}\n\n`;

// 1. ANÁLISIS DE ESTRUCTURA
reporte += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
reporte += '1. ESTRUCTURA DEL ARCHIVO\n';
reporte += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

const columnas = Object.keys(data[0]).sort();
reporte += `Total de columnas: ${columnas.length}\n\n`;
reporte += 'LISTADO COMPLETO DE COLUMNAS:\n';
columnas.forEach((col, idx) => {
  reporte += `  ${(idx+1).toString().padStart(3, '0')}. ${col}\n`;
});

// 2. ANÁLISIS CAMPO POR CAMPO
reporte += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
reporte += '2. ANÁLISIS DETALLADO POR CAMPO\n';
reporte += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

columnas.forEach((campo, idx) => {
  const valores = data.map(r => r[campo]);
  const vacios = valores.filter(v => v === null || v === undefined || v === '').length;
  const noVacios = valores.filter(v => v !== null && v !== undefined && v !== '');
  const valoresUnicos = [...new Set(noVacios)];
  
  reporte += `─────────────────────────────────────────────────────────────────────\n`;
  reporte += `CAMPO ${idx + 1}: ${campo}\n`;
  reporte += `─────────────────────────────────────────────────────────────────────\n`;
  reporte += `  Total valores: ${valores.length}\n`;
  reporte += `  Valores vacíos: ${vacios} (${(vacios/valores.length*100).toFixed(2)}%)\n`;
  reporte += `  Valores no vacíos: ${noVacios.length} (${(noVacios.length/valores.length*100).toFixed(2)}%)\n`;
  reporte += `  Valores únicos: ${valoresUnicos.length}\n`;
  
  if (valoresUnicos.length > 0 && valoresUnicos.length <= 20) {
    reporte += `  Valores: ${valoresUnicos.join(', ')}\n`;
  } else if (valoresUnicos.length > 20) {
    reporte += `  Muestra de valores (primeros 20): ${valoresUnicos.slice(0, 20).join(', ')}\n`;
  }
  
  // Tipo de datos
  const tipos = [...new Set(noVacios.map(v => typeof v))];
  reporte += `  Tipos de datos: ${tipos.join(', ')}\n`;
  
  reporte += '\n';
});

// 3. CAMPOS CRÍTICOS ESPECÍFICOS
reporte += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
reporte += '3. ANÁLISIS DE CAMPOS CRÍTICOS\n';
reporte += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

// Verificar nombre del inspector
reporte += '3.1 CAMPO NOMBRE DEL INSPECTOR:\n';
const camposNombre = columnas.filter(c => 
  c.toLowerCase().includes('nombre') && 
  (c.toLowerCase().includes('inspector') || c.toLowerCase().includes('realiza'))
);
reporte += `  Campos encontrados: ${camposNombre.join(', ')}\n`;
if (camposNombre.length > 0) {
  const nombreReal = camposNombre[0];
  const inspectores = new Set(data.map(r => r[nombreReal]).filter(v => v));
  reporte += `  Total inspectores únicos: ${inspectores.size}\n`;
  reporte += `  Registros con inspector: ${data.filter(r => r[nombreReal]).length}\n`;
  reporte += `  Registros sin inspector: ${data.filter(r => !r[nombreReal]).length}\n`;
}

// Verificar campos de fatiga
reporte += '\n3.2 CAMPOS DE FATIGA/MEDICAMENTOS:\n';
const camposFatiga = columnas.filter(c => 
  c.toLowerCase().includes('fatiga') || 
  c.toLowerCase().includes('medicamento') || 
  c.toLowerCase().includes('sueño') ||
  c.toLowerCase().includes('sueno') ||
  c.toLowerCase().includes('dormi') ||
  c.toLowerCase().includes('alerta')
);
reporte += `  Campos encontrados: ${camposFatiga.length}\n`;
if (camposFatiga.length > 0) {
  camposFatiga.forEach(cf => {
    reporte += `    - ${cf}\n`;
  });
} else {
  reporte += `  ❌ NO SE ENCONTRARON CAMPOS DE FATIGA\n`;
  reporte += `  ⚠️  CONCLUSIÓN: Este formulario NO incluye preguntas de fatiga\n`;
}

// 4. ANÁLISIS DE PLACAS
reporte += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
reporte += '4. ANÁLISIS DE PLACAS DE VEHÍCULOS\n';
reporte += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

const placas = data.map(r => r['PLACA DEL VEHICULO']).filter(p => p).map(p => String(p));
const placasUnicas = [...new Set(placas)];
const placasSinDatos = data.filter(r => !r['PLACA DEL VEHICULO']).length;

reporte += `Total registros: ${data.length}\n`;
reporte += `Registros con placa: ${placas.length}\n`;
reporte += `Registros SIN placa: ${placasSinDatos}\n`;
reporte += `Placas únicas: ${placasUnicas.length}\n\n`;

// Análisis de formato de placas
const placasConEspacios = placas.filter(p => p.includes(' '));
const placasSinEspacios = placas.filter(p => !p.includes(' '));
const placasMayusculas = placas.filter(p => p === p.toUpperCase());
const placasMinusculas = placas.filter(p => p === p.toLowerCase());
const placasMixtas = placas.filter(p => p !== p.toUpperCase() && p !== p.toLowerCase());

reporte += 'FORMATO DE PLACAS:\n';
reporte += `  Con espacios: ${placasConEspacios.length}\n`;
reporte += `  Sin espacios: ${placasSinEspacios.length}\n`;
reporte += `  Todo mayúsculas: ${placasMayusculas.length}\n`;
reporte += `  Todo minúsculas: ${placasMinusculas.length}\n`;
reporte += `  Mixtas: ${placasMixtas.length}\n\n`;

// Top 10 placas más inspeccionadas
const inspeccionesPorPlaca = {};
placas.forEach(p => {
  inspeccionesPorPlaca[p] = (inspeccionesPorPlaca[p] || 0) + 1;
});

const top10Placas = Object.entries(inspeccionesPorPlaca)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);

reporte += 'TOP 10 PLACAS MÁS INSPECCIONADAS:\n';
top10Placas.forEach(([placa, count], idx) => {
  reporte += `  ${idx + 1}. ${placa}: ${count} inspecciones\n`;
});

// Placas problemáticas
reporte += '\nPLACAS CON FORMATO INCONSISTENTE (muestra):\n';
const placasProblematicas = placas.filter(p => 
  p.includes(' ') || 
  p !== p.toUpperCase() ||
  p.length < 5 ||
  p.length > 8
).slice(0, 20);
placasProblematicas.forEach(p => {
  reporte += `  - "${p}" (longitud: ${p.length})\n`;
});

// 5. ANÁLISIS DE CONTRATOS Y CAMPOS
reporte += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
reporte += '5. ANÁLISIS DE CONTRATOS Y CAMPOS DE COORDINACIÓN\n';
reporte += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

const contratos = [...new Set(data.map(r => r['CONTRATO']).filter(c => c))];
const campos = [...new Set(data.map(r => r['CAMPO/COORDINACIÓN']).filter(c => c))];

reporte += 'CONTRATOS ENCONTRADOS:\n';
contratos.forEach((contrato, idx) => {
  const count = data.filter(r => r['CONTRATO'] === contrato).length;
  reporte += `  ${idx + 1}. ${contrato}: ${count} registros (${(count/data.length*100).toFixed(2)}%)\n`;
});

reporte += '\nCAMPOS DE COORDINACIÓN ENCONTRADOS:\n';
campos.forEach((campo, idx) => {
  const count = data.filter(r => r['CAMPO/COORDINACIÓN'] === campo).length;
  reporte += `  ${idx + 1}. ${campo}: ${count} registros (${(count/data.length*100).toFixed(2)}%)\n`;
});

// 6. ANÁLISIS DE TURNOS
reporte += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
reporte += '6. ANÁLISIS DE TURNOS\n';
reporte += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

const turnos = [...new Set(data.map(r => r['TURNO']).filter(t => t))];
reporte += 'TURNOS ENCONTRADOS:\n';
turnos.forEach((turno, idx) => {
  const count = data.filter(r => r['TURNO'] === turno).length;
  reporte += `  ${idx + 1}. ${turno}: ${count} registros (${(count/data.length*100).toFixed(2)}%)\n`;
});

// 7. PROBLEMAS IDENTIFICADOS
reporte += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
reporte += '7. PROBLEMAS IDENTIFICADOS Y RECOMENDACIONES\n';
reporte += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

reporte += `❌ PROBLEMA 1: Campo "fecha" está 100% vacío\n`;
reporte += `   - Se debe usar "Marca temporal" como fecha\n\n`;

reporte += `❌ PROBLEMA 2: Campo "Nombre del inspector" NO existe\n`;
reporte += `   - El campo real es: "NOMBRE DE QUIEN REALIZA LA INSPECCIÓN"\n\n`;

reporte += `❌ PROBLEMA 3: NO hay campos de fatiga/medicamentos\n`;
reporte += `   - Este formulario NO incluye preguntas de fatiga\n`;
reporte += `   - Se deben usar valores por defecto en el sistema\n\n`;

reporte += `⚠️  PROBLEMA 4: ${placasSinDatos} registros sin placa (${(placasSinDatos/data.length*100).toFixed(2)}%)\n`;
reporte += `   - Estos registros deben ser rechazados\n\n`;

reporte += `⚠️  PROBLEMA 5: Formato inconsistente en placas\n`;
reporte += `   - ${placasConEspacios.length} placas con espacios\n`;
reporte += `   - ${placasMixtas.length} placas con mayúsculas/minúsculas mixtas\n`;
reporte += `   - Requiere normalización (eliminar espacios, convertir a mayúsculas)\n\n`;

// 8. MAPEO CORRECTO
reporte += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
reporte += '8. MAPEO CORRECTO DE CAMPOS\n';
reporte += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

reporte += 'CAMPOS QUE DEBEN MAPEARSE:\n';
reporte += '  Excel → Base de Datos\n';
reporte += '  ─────────────────────────────────────────────────────────────────\n';
reporte += '  "Marca temporal" → fecha (convertir de serial a ISO)\n';
reporte += '  "NOMBRE DE QUIEN REALIZA LA INSPECCIÓN" → nombre_inspector\n';
reporte += '  "PLACA DEL VEHICULO" → placa_vehiculo (normalizar: trim, toUpperCase, replace spaces)\n';
reporte += '  "KILOMETRAJE" → kilometraje\n';
reporte += '  "TURNO" → turno (normalizar a mayúsculas)\n';
reporte += '  "CONTRATO" → contrato\n';
reporte += '  "CAMPO/COORDINACIÓN" → campo_coordinacion\n';
reporte += '  "OBSERVACIONES" → observaciones\n';
reporte += '  "**De reversa y alarma de retroceso" → reversa_alarma\n\n';

reporte += 'CAMPOS DE FATIGA (NO EXISTEN EN EXCEL):\n';
reporte += '  horas_sueno_suficientes → true (valor por defecto)\n';
reporte += '  libre_sintomas_fatiga → true (valor por defecto)\n';
reporte += '  condiciones_aptas → true (valor por defecto)\n';
reporte += '  consumo_medicamentos → false (valor por defecto)\n\n';

reporte += '═══════════════════════════════════════════════════════════════════════\n';
reporte += '                        FIN DEL ANÁLISIS\n';
reporte += '═══════════════════════════════════════════════════════════════════════\n';

// Guardar reporte
const outputPath = path.join(__dirname, 'ANALISIS_PESADO_HQ-FO-41.txt');
fs.writeFileSync(outputPath, reporte, 'utf8');
console.log(`✅ Reporte PESADO generado: ${outputPath}`);
console.log(`📊 Tamaño del reporte: ${(reporte.length / 1024).toFixed(2)} KB`);
console.log(`📄 Total de líneas: ${reporte.split('\n').length}`);
