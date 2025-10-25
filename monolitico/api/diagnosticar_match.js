require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const path = require('path');

const prisma = new PrismaClient();

async function diagnosticarProblema() {
  console.log('🔍 DIAGNOSTICANDO PROBLEMA DE COINCIDENCIAS...\n');
  
  // Leer Excel
  const archivoExcel = path.join(__dirname, '../../pruebas/HQ-FO-41 INSPECCIÓN DIARIA DE VEHÍCULOS PESADOS (respuestas) (12).xlsx');
  const workbook = XLSX.readFile(archivoExcel);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  console.log('=== TODAS LAS COLUMNAS DEL EXCEL ===\n');
  const columnas = Object.keys(data[0]);
  console.log(`Total de columnas: ${columnas.length}`);
  columnas.forEach((col, i) => {
    if (col.toLowerCase().includes('llanta') || col.toLowerCase().includes('labrado')) {
      console.log(`${i + 1}. "${col}" (longitud: ${col.length})`);
    }
  });
  
  console.log('\n=== PRIMEROS 3 REGISTROS DEL EXCEL ===\n');
  data.slice(0, 3).forEach((row, idx) => {
    console.log(`Registro ${idx + 1}:`);
    console.log(`  Marca temporal: ${row['Marca temporal']} (tipo: ${typeof row['Marca temporal']})`);
    console.log(`  Placa: ${row['PLACA DEL VEHICULO']}`);
    console.log(`  Inspector: ${row['NOMBRE DE QUIEN REALIZA LA INSPECCIÓN']}`);
    
    // Buscar la columna de labrado
    const labradoKeys = columnas.filter(col => col.includes('Llantas') && col.includes('Labrado'));
    if (labradoKeys.length > 0) {
      console.log(`  Labrado (${labradoKeys[0]}): ${row[labradoKeys[0]]}`);
    } else {
      console.log(`  Labrado: NO ENCONTRADO`);
    }
    console.log('');
  });
  
  // Leer BD
  const inspecciones = await prisma.inspeccionPesado.findMany({
    take: 3,
    select: {
      id: true,
      placa_vehiculo: true,
      marca_temporal: true,
      nombre_inspector: true,
      llantas_labrado: true
    }
  });
  
  console.log('\n=== PRIMEROS 3 REGISTROS DE LA BD ===\n');
  inspecciones.forEach((insp, idx) => {
    console.log(`Registro ${idx + 1} (ID: ${insp.id}):`);
    console.log(`  Marca temporal: ${insp.marca_temporal} (tipo: ${typeof insp.marca_temporal})`);
    console.log(`  Placa: ${insp.placa_vehiculo}`);
    console.log(`  Inspector: ${insp.nombre_inspector}`);
    console.log(`  Labrado actual: ${insp.llantas_labrado}`);
    console.log('');
  });
  
  await prisma.$disconnect();
}

diagnosticarProblema().catch(console.error);
