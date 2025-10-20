const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const path = require('path');

const prisma = new PrismaClient();

function excelDateToISO(excelDate) {
  if (!excelDate) return null;
  if (typeof excelDate === 'string') {
    const d = new Date(excelDate);
    if (!isNaN(d.getTime())) return d.toISOString();
    return null;
  }
  if (typeof excelDate === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    const msPerDay = 24 * 60 * 60 * 1000;
    const date = new Date(excelEpoch.getTime() + excelDate * msPerDay);
    if (!isNaN(date.getTime())) return date.toISOString();
  }
  return null;
}

async function compararDatos() {
  const archivoExcel = path.join(__dirname, '../../pruebas/HQ-FO-41 INSPECCIÓN DIARIA DE VEHÍCULOS PESADOS 1.xlsx');
  const workbook = XLSX.readFile(archivoExcel);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  console.log('🔍 COMPARANDO DATOS EXCEL VS BD...\n');
  
  // Tomar primer registro del Excel
  const excelRow = data[0];
  const placa = String(excelRow['PLACA DEL VEHICULO']).replace(/\s+/g, '').toUpperCase();
  const nombreInspector = String(excelRow['NOMBRE DE QUIEN REALIZA LA INSPECCIÓN']).trim();
  const fecha = excelDateToISO(excelRow['Marca temporal']);
  
  console.log('=== PRIMER REGISTRO DEL EXCEL ===');
  console.log(`Placa: "${placa}"`);
  console.log(`Inspector: "${nombreInspector}"`);
  console.log(`Fecha: ${fecha}`);
  console.log(`Fecha object: ${new Date(fecha)}`);
  console.log('');
  
  // Buscar en BD con diferentes criterios
  console.log('=== BÚSQUEDA EN BD POR PLACA ===');
  const porPlaca = await prisma.inspeccionPesado.findMany({
    where: { placa_vehiculo: placa },
    take: 3,
    select: {
      id: true,
      placa_vehiculo: true,
      nombre_inspector: true,
      marca_temporal: true
    }
  });
  
  porPlaca.forEach((r, idx) => {
    console.log(`Registro ${idx + 1}:`);
    console.log(`  Placa: "${r.placa_vehiculo}"`);
    console.log(`  Inspector: "${r.nombre_inspector}"`);
    console.log(`  Marca temporal: ${r.marca_temporal}`);
    console.log(`  ¿Inspector coincide?: ${r.nombre_inspector === nombreInspector}`);
    console.log(`  ¿Fecha coincide?: ${r.marca_temporal.toISOString() === fecha}`);
    console.log('');
  });
  
  await prisma.$disconnect();
}

compararDatos().catch(console.error);
