const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const path = require('path');

const prisma = new PrismaClient();

function normalizeBoolean(value) {
  if (value === true || value === 1) return true;
  if (value === false || value === 0) return false;
  if (value === null || value === undefined) return false;
  if (typeof value !== 'string') return false;
  const v = value.trim().toUpperCase();
  if (["CUMPLE","SI","SÍ","TRUE","OK","X","1","YES","VERDADERO","Y"].includes(v)) return true;
  if (["NO CUMPLE","NO","FALSE","NA","NAN","0","FALSO","N"].includes(v)) return false;
  if (v === "") return false;
  return false;
}

async function corregirLabrado() {
  console.log('🔧 CORRECCIÓN MASIVA DE LABRADO - ESTRATEGIA SIMPLE\n');
  
  const archivoExcel = path.join(__dirname, '../../pruebas/HQ-FO-41 INSPECCIÓN DIARIA DE VEHÍCULOS PESADOS 1.xlsx');
  const workbook = XLSX.readFile(archivoExcel);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  console.log(`📊 Total registros en Excel: ${data.length}\n`);
  
  // ESTRATEGIA: Actualizar TODAS las inspecciones pesadas con el valor correcto del Excel
  // basándonos solo en placa e inspector (sin fecha porque difiere por milisegundos)
  
  let actualizados = 0;
  let errores = 0;
  
  console.log('🔄 Procesando actualizaciones...\n');
  
  for (let i = 0; i < data.length; i++) {
    try {
      const row = data[i];
      
      const placa = row['PLACA DEL VEHICULO'] ? 
        String(row['PLACA DEL VEHICULO']).replace(/\s+/g, '').toUpperCase() : '';
      const nombreInspector = row['NOMBRE DE QUIEN REALIZA LA INSPECCIÓN'] ? 
        String(row['NOMBRE DE QUIEN REALIZA LA INSPECCIÓN']).trim() : '';
      
      // Nombre CORRECTO con TAB al final
      // Detectar automáticamente la columna correcta de labrado
      const columnas = Object.keys(row);
      const columnaLabrado = columnas.find(col => 
        col.includes('Llantas') && col.includes('Labrado') && col.includes('min 3mm')
      );
      const labradoValue = columnaLabrado ? row[columnaLabrado] : null;
      const labradoCorrecto = normalizeBoolean(labradoValue);
      
      if (!placa) continue;
      
      // Actualizar en BD - buscar por placa e inspector solamente
      // (ya que son las inspecciones subidas desde este mismo Excel)
      const resultado = await prisma.inspeccionPesado.updateMany({
        where: {
          placa_vehiculo: placa,
          nombre_inspector: nombreInspector
        },
        data: {
          llantas_labrado: labradoCorrecto
        }
      });
      
      if (resultado.count > 0) {
        actualizados += resultado.count;
        
        if (actualizados <= 10 || (actualizados % 100 === 0)) {
          console.log(`  ✓ [${i + 1}/${data.length}] ${placa} / ${nombreInspector} -> ${labradoCorrecto} (${resultado.count} registros)`);
        }
      }
    } catch (error) {
      errores++;
      if (errores <= 3) {
        console.log(`  ✗ Error: ${error.message}`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('RESUMEN');
  console.log('='.repeat(60));
  console.log(`Registros procesados del Excel: ${data.length}`);
  console.log(`✅ Actualizaciones en BD: ${actualizados}`);
  console.log(`❌ Errores: ${errores}`);
  
  // Verificación final
  const stats = await prisma.inspeccionPesado.groupBy({
    by: ['llantas_labrado'],
    _count: true
  });
  
  console.log('\n📊 DISTRIBUCIÓN FINAL:');
  stats.forEach(s => {
    const porcentaje = (s._count / 1319 * 100).toFixed(1);
    console.log(`  llantas_labrado = ${s.llantas_labrado}: ${s._count} (${porcentaje}%)`);
  });
  
  await prisma.$disconnect();
  console.log('\n✅ Proceso completado!');
}

corregirLabrado().catch(console.error);
