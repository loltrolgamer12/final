const XLSX = require('xlsx');
const path = require('path');

console.log('🔍 COMPARACIÓN: EXCEL LIGERO vs CÓDIGO\n');
console.log('='.repeat(80));

// Leer Excel
const archivoExcel = path.join(__dirname, '../../pruebas/HQ-FO-40 INSPECCIÓN DIARIA DE VEHÍCULO LIVIANO. 8-10-2025.xlsx');
const workbook = XLSX.readFile(archivoExcel);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);
const columnasExcel = Object.keys(data[0]);

// Nombres de columnas usadas en el código (según excelService.js línea 220-284)
const columnasEnCodigo = {
  'Marca temporal': 'Marca temporal',
  'NOMBRE DE QUIEN REALIZA LA INSPECCIÓN ': 'NOMBRE DE QUIEN REALIZA LA INSPECCIÓN ',
  'CONTRATO': 'CONTRATO',
  'CAMPO/COORDINACIÓN': 'CAMPO/COORDINACIÓN',
  'PLACA DEL VEHICULO': 'PLACA DEL VEHICULO',
  'KILOMETRAJE': 'KILOMETRAJE',
  'TURNO': 'TURNO',
  '** ALTAS Y BAJAS': '** ALTAS Y BAJAS',
  'DIRECCIONALES DERECHA E IZQUIERDA': 'DIRECCIONALES DERECHA E IZQUIERDA',
  '**DE PARQUEO': '**DE PARQUEO',
  '**DE FRENO': '**DE FRENO',
  '**DE REVERSA Y ALARMA DE RETROCESO': '**DE REVERSA Y ALARMA DE RETROCESO',
  '**ESPEJO CENTRAL Y ESPEJOS LATERALES': '**ESPEJO CENTRAL Y ESPEJOS LATERALES',
  '**VIDRIO FRONTAL': '**VIDRIO FRONTAL',
  'VIDRIOS EN BUEN ESTADO': 'VIDRIOS EN BUEN ESTADO',
  'PRESENTACIÓN DE ORDEN Y ASEO': 'PRESENTACIÓN DE ORDEN Y ASEO',
  'PITO': 'PITO',
  'SISTEMA DE MONITOREO GPS ': 'SISTEMA DE MONITOREO GPS ',
  '**FRENOS': '**FRENOS',
  '**FRENOS DE EMERGENCIA O DE MANO': '**FRENOS DE EMERGENCIA O DE MANO',
  '**CINTURONES DE SEGURIDAD': '**CINTURONES DE SEGURIDAD',
  'PUERTAS EN BUEN ESTADO': 'PUERTAS EN BUEN ESTADO',
  '**LIMPIA BRISAS': '**LIMPIA BRISAS',
  'EXTINTOR VIGENTE': 'EXTINTOR VIGENTE',
  'BOTIQUÍN': 'BOTIQUÍN',
  'ESTADO GENERAL DE TAPICERÍA': 'ESTADO GENERAL DE TAPICERÍA',
  'Indicadores (nivel de combustible, temperatura, velocímetro y aceite)': 'Indicadores (nivel de combustible, temperatura, velocímetro y aceite)',
  '**Verificar la ausencia de objetos sueltos en la cabina que puedan distraer al conductor': '**Verificar la ausencia de objetos sueltos en la cabina que puedan distraer al conductor',
  '**NIVELES DE FLUIDOS ACEITE MOTOR': '**NIVELES DE FLUIDOS ACEITE MOTOR',
  '**NIVELES DE FLUIDO DE FRENOS': '**NIVELES DE FLUIDO DE FRENOS',
  '**NIVELES DE FLUIDO DE DIRECCIÓN HIDRAÚLICA': '**NIVELES DE FLUIDO DE DIRECCIÓN HIDRAÚLICA',
  '**NIVELES DE FLUIDO REFRIGERANTE': '**NIVELES DE FLUIDO REFRIGERANTE',
  'NIVELES DE FLUIDO LIMPIA PARABRISAS': 'NIVELES DE FLUIDO LIMPIA PARABRISAS',
  'ESTADO DE CORREAS': 'ESTADO DE CORREAS',
  'ESTADO DE BATERÍAS, CABLES, CONEXIONES': 'ESTADO DE BATERÍAS, CABLES, CONEXIONES',
  '**LLANTAS - LABRADO (min 2mm DE LABRADO)': '**LLANTAS - LABRADO (min 2mm DE LABRADO)',
  '**LLANTAS - SIN CORTADURAS Y SIN ABULTAMIENTOS': '**LLANTAS - SIN CORTADURAS Y SIN ABULTAMIENTOS',
  'LLANTA DE REPUESTO': 'LLANTA DE REPUESTO',
  '**COPAS O PERNOS DE SUJECIÓN DE LAS LLANTAS': '**COPAS O PERNOS DE SUJECIÓN DE LAS LLANTAS',
  '**SUSPENSIÓN (TERMINALES)': '**SUSPENSIÓN (TERMINALES)',
  '**DIRECCIÓN (TERMINALES)': '**DIRECCIÓN (TERMINALES)',
  'Tapa de tanque de combustible en buen estado': 'Tapa de tanque de combustible en buen estado',
  'Equipo de carretera: gato, llave de pernos, herramienta básica, triángulos o conos, bloques, chaleco, señal pare-siga': 'Equipo de carretera: gato, llave de pernos, herramienta básica, triángulos o conos, bloques, chaleco, señal pare-siga',
  'Kit ambiental': 'Kit ambiental',
  'Documentación: tecnomecánica y de gases, tarjeta de propiedad, SOAT, licencia de conducción y permiso para conducir interno': 'Documentación: tecnomecánica y de gases, tarjeta de propiedad, SOAT, licencia de conducción y permiso para conducir interno',
  'OBSERVACIONES': 'OBSERVACIONES',
  '¿Ha dormido al menos 7 horas en las últimas 24 horas?': '¿Ha dormido al menos 7 horas en las últimas 24 horas?',
  '¿Se encuentra libre de síntomas de fatiga (Somnolencia, dolor de cabeza, irritabilidad)?': '¿Se encuentra libre de síntomas de fatiga (Somnolencia, dolor de cabeza, irritabilidad)?',
  '¿Se siente en condiciones físicas y mentales para conducir? ': '¿Se siente en condiciones físicas y mentales para conducir? ',
  '¿Ha consumido medicamentos o sustancias que afecten su estado de alerta?*': '¿Ha consumido medicamentos o sustancias que afecten su estado de alerta?*'
};

console.log('📊 VALIDACIÓN DE COINCIDENCIAS:\n');

let coincidencias = 0;
let noCoinciden = 0;
const problemas = [];

for (const [nombreCodigo, _] of Object.entries(columnasEnCodigo)) {
  const existeEnExcel = columnasExcel.includes(nombreCodigo);
  
  if (existeEnExcel) {
    coincidencias++;
  } else {
    noCoinciden++;
    
    // Buscar similar en Excel
    const similar = columnasExcel.find(col => 
      col.toLowerCase().includes(nombreCodigo.toLowerCase().substring(0, 20)) ||
      nombreCodigo.toLowerCase().includes(col.toLowerCase().substring(0, 20))
    );
    
    problemas.push({
      codigo: nombreCodigo,
      similar: similar || 'No encontrado',
      exacto: false
    });
  }
}

console.log(`✅ Columnas que coinciden: ${coincidencias}/${Object.keys(columnasEnCodigo).length}`);
console.log(`❌ Columnas que NO coinciden: ${noCoinciden}/${Object.keys(columnasEnCodigo).length}\n`);

if (problemas.length > 0) {
  console.log('⚠️  PROBLEMAS ENCONTRADOS:\n');
  console.log('='.repeat(80));
  
  problemas.forEach((p, idx) => {
    console.log(`\n${idx + 1}. CÓDIGO USA:`);
    console.log(`   "${p.codigo}"`);
    console.log(`   Longitud: ${p.codigo.length}`);
    console.log(`\n   EXCEL TIENE:`);
    console.log(`   "${p.similar}"`);
    if (p.similar !== 'No encontrado') {
      console.log(`   Longitud: ${p.similar.length}`);
      
      // Comparar caracter por caracter para los primeros caracteres
      const maxLen = Math.min(p.codigo.length, p.similar.length);
      let primeraDiferencia = -1;
      for (let i = 0; i < maxLen; i++) {
        if (p.codigo[i] !== p.similar[i]) {
          primeraDiferencia = i;
          break;
        }
      }
      
      if (primeraDiferencia >= 0) {
        console.log(`\n   Primera diferencia en posición ${primeraDiferencia}:`);
        console.log(`   Código: "${p.codigo[primeraDiferencia]}" (ASCII ${p.codigo.charCodeAt(primeraDiferencia)})`);
        console.log(`   Excel:  "${p.similar[primeraDiferencia]}" (ASCII ${p.similar.charCodeAt(primeraDiferencia)})`);
      }
    }
    console.log('   ' + '-'.repeat(76));
  });
} else {
  console.log('\n✅ ¡TODAS LAS COLUMNAS COINCIDEN PERFECTAMENTE!\n');
}

console.log('\n' + '='.repeat(80));
console.log('RESUMEN');
console.log('='.repeat(80));
console.log(`Total columnas en Excel: ${columnasExcel.length}`);
console.log(`Total columnas en código: ${Object.keys(columnasEnCodigo).length}`);
console.log(`Coincidencias exactas: ${coincidencias}`);
console.log(`Requieren corrección: ${noCoinciden}`);
