const XLSX = require('xlsx');
const path = require('path');

console.log('🔍 VERIFICANDO SI EXISTEN ARCHIVOS EXCEL MÁS RECIENTES CON CAMPOS DE FATIGA...\n');

// Lista de posibles archivos Excel más nuevos
const posiblesArchivos = [
  '../../pruebas/HQ-FO-41 INSPECCIÓN DIARIA DE VEHÍCULOS PESADOS (respuestas) (12).xlsx',
  '../../pruebas/HQ-FO-41 INSPECCIÓN DIARIA DE VEHÍCULOS PESADOS 1.xlsx',
  '../../pruebas/HQ-FO-41 INSPECCIÓN DIARIA DE VEHÍCULOS PESADOS.xlsx',
  '../../pruebas/HQ-FO-41 INSPECCIÓN DIARIA DE VEHÍCULOS PESADOS (actualizado).xlsx',
  '../../pruebas/HQ-FO-41 INSPECCIÓN DIARIA DE VEHÍCULOS PESADOS (nuevo).xlsx'
];

const fs = require('fs');

// Buscar archivos que existan
const archivosExistentes = [];
posiblesArchivos.forEach(archivo => {
  const rutaCompleta = path.join(__dirname, archivo);
  if (fs.existsSync(rutaCompleta)) {
    const stats = fs.statSync(rutaCompleta);
    archivosExistentes.push({
      archivo: archivo,
      ruta: rutaCompleta,
      fecha: stats.mtime,
      tamaño: stats.size
    });
  }
});

console.log('📁 ARCHIVOS EXCEL ENCONTRADOS:\n');
archivosExistentes.forEach((info, idx) => {
  console.log(`${idx + 1}. ${info.archivo}`);
  console.log(`   📅 Fecha modificación: ${info.fecha.toLocaleString()}`);
  console.log(`   📊 Tamaño: ${Math.round(info.tamaño / 1024)} KB\n`);
});

// Analizar cada archivo para campos de fatiga
const camposFatigaBuscados = [
  '¿Ha dormido al menos 7 horas en las últimas 24 horas?',
  '¿Se encuentra libre de síntomas de fatiga (Somnolencia, dolor de cabeza, irritabilidad)?',
  '¿Se siente en condiciones físicas y mentales para conducir?',
  '¿Ha consumido medicamentos o sustancias que afecten su estado de alerta?'
];

console.log('🔍 ANÁLISIS DE CAMPOS DE FATIGA POR ARCHIVO:\n');

archivosExistentes.forEach((info, idx) => {
  console.log(`=== ARCHIVO ${idx + 1}: ${path.basename(info.archivo)} ===`);
  
  try {
    const workbook = XLSX.readFile(info.ruta);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);
    
    if (data.length > 0) {
      const columnas = Object.keys(data[0]);
      console.log(`📊 Registros: ${data.length}, Columnas: ${columnas.length}`);
      
      // Buscar campos de fatiga
      let camposEncontrados = 0;
      camposFatigaBuscados.forEach(campo => {
        const encontrado = columnas.find(col => 
          col.includes('dormido') && campo.includes('dormido') ||
          col.includes('fatiga') && campo.includes('fatiga') ||
          col.includes('condiciones físicas') && campo.includes('condiciones') ||
          col.includes('medicamentos') && campo.includes('medicamentos')
        );
        
        if (encontrado) {
          console.log(`   ✅ "${encontrado}"`);
          camposEncontrados++;
        }
      });
      
      if (camposEncontrados === 0) {
        console.log(`   ❌ NO tiene campos de fatiga`);
        
        // Mostrar columnas que podrían ser de fatiga
        const posiblesFatiga = columnas.filter(col => 
          col.toLowerCase().includes('fatiga') ||
          col.toLowerCase().includes('sueño') ||
          col.toLowerCase().includes('dormido') ||
          col.toLowerCase().includes('medicamento') ||
          col.toLowerCase().includes('condiciones') ||
          col.toLowerCase().includes('físicas') ||
          col.toLowerCase().includes('mentales') ||
          col.toLowerCase().includes('horas')
        );
        
        if (posiblesFatiga.length > 0) {
          console.log('   🔍 Posibles campos relacionados:');
          posiblesFatiga.forEach(col => console.log(`     - "${col}"`));
        }
      } else {
        console.log(`   🎉 ENCONTRADOS ${camposEncontrados} campos de fatiga`);
      }
    }
    
  } catch (error) {
    console.log(`   ❌ Error leyendo archivo: ${error.message}`);
  }
  
  console.log('');
});

console.log('💡 CONCLUSIÓN:');
console.log('Si algún archivo tiene campos de fatiga, debemos usar ese para las pruebas.');
console.log('Si ninguno los tiene, necesitamos que proporciones un Excel más reciente con esos campos.');