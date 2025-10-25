require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const path = require('path');

const prisma = new PrismaClient();

async function investigarRegistrosPerdidos() {
  console.log('🔍 INVESTIGANDO REGISTROS PERDIDOS - EXCEL VS BASE DE DATOS\n');

  try {
    // 1. Leer datos del Excel
    const archivoExcel = path.join(__dirname, '../../pruebas/HQ-FO-41 INSPECCIÓN DIARIA DE VEHÍCULOS PESADOS (respuestas) (12).xlsx');
    const workbook = XLSX.readFile(archivoExcel);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const excelData = XLSX.utils.sheet_to_json(sheet);
    
    console.log(`📊 EXCEL: ${excelData.length} registros totales\n`);
    
    // 2. Obtener datos de la base de datos
    const dbData = await prisma.inspeccionPesado.findMany({
      select: {
        id: true,
        placa_vehiculo: true,
        fecha: true,
        nombre_inspector: true,
        marca_temporal: true
      },
      orderBy: { fecha: 'desc' }
    });
    
    console.log(`🗄️ BASE DE DATOS: ${dbData.length} registros totales\n`);
    
    // 3. Función para parsear fechas de Excel
    function parseExcelDate(excelDate) {
      if (!excelDate) return null;
      
      if (typeof excelDate === 'string') {
        const d = new Date(excelDate);
        return isNaN(d.getTime()) ? null : d;
      }
      
      if (typeof excelDate === 'number') {
        const excelEpoch = new Date(1899, 11, 30);
        const msPerDay = 24 * 60 * 60 * 1000;
        const date = new Date(excelEpoch.getTime() + excelDate * msPerDay);
        return isNaN(date.getTime()) ? null : date;
      }
      
      return null;
    }
    
    // 4. Analizar registros más recientes (ejemplo: últimos 50 del Excel)
    const registrosRecientes = excelData.slice(-50);
    console.log(`🔍 ANALIZANDO ÚLTIMOS ${registrosRecientes.length} REGISTROS DEL EXCEL:\n`);
    
    // 5. Mapear registros del Excel
    const excelMapeado = registrosRecientes.map((row, idx) => {
      const fecha = parseExcelDate(row['Marca temporal']);
      const placa = row['PLACA DEL VEHICULO'] ? row['PLACA DEL VEHICULO'].toString().replace(/\s+/g, '').toUpperCase() : '';
      const inspector = row['NOMBRE DE QUIEN REALIZA LA INSPECCIÓN'] || '';
      
      return {
        indiceExcel: excelData.length - registrosRecientes.length + idx,
        marcaTemporal: row['Marca temporal'],
        fecha: fecha,
        fechaISO: fecha ? fecha.toISOString() : null,
        placa: placa,
        inspector: inspector,
        contrato: row['CONTRATO'] || '',
        campo: row['CAMPO/COORDINACIÓN'] || ''
      };
    }).filter(r => r.fecha !== null); // Solo registros con fecha válida
    
    console.log(`📋 Registros del Excel con fecha válida: ${excelMapeado.length}\n`);
    
    // 6. Buscar cada registro del Excel en la base de datos
    console.log('🔍 VERIFICANDO PRESENCIA EN BASE DE DATOS:\n');
    
    let encontrados = 0;
    let noEncontrados = 0;
    let duplicados = 0;
    
    for (let i = 0; i < excelMapeado.length; i++) {
      const regExcel = excelMapeado[i];
      
      // Buscar en BD por placa, fecha e inspector (criterio usado en el backend)
      const matches = dbData.filter(regBD => {
        if (!regBD.fecha || !regExcel.fecha) return false;
        
        const fechaBD = new Date(regBD.fecha);
        const fechaExcel = new Date(regExcel.fecha);
        
        // Comparar por día (no por hora exacta)
        const mismaFecha = fechaBD.toDateString() === fechaExcel.toDateString();
        const mismaPlaca = regBD.placa_vehiculo === regExcel.placa;
        const mismoInspector = regBD.nombre_inspector === regExcel.inspector;
        
        return mismaFecha && mismaPlaca && mismoInspector;
      });
      
      if (matches.length === 0) {
        console.log(`❌ NO ENCONTRADO - Excel #${regExcel.indiceExcel}`);
        console.log(`   Placa: ${regExcel.placa}`);
        console.log(`   Fecha: ${regExcel.fecha.toISOString().split('T')[0]}`);
        console.log(`   Inspector: ${regExcel.inspector}`);
        console.log(`   Contrato: ${regExcel.contrato}`);
        console.log('');
        noEncontrados++;
      } else if (matches.length === 1) {
        encontrados++;
      } else {
        console.log(`⚠️ DUPLICADO - Excel #${regExcel.indiceExcel} tiene ${matches.length} matches en BD`);
        duplicados++;
      }
    }
    
    console.log(`📊 RESULTADOS DE LA VERIFICACIÓN:`);
    console.log(`   ✅ Encontrados en BD: ${encontrados}`);
    console.log(`   ❌ No encontrados en BD: ${noEncontrados}`);
    console.log(`   ⚠️ Duplicados en BD: ${duplicados}`);
    console.log(`   📊 Total analizado: ${excelMapeado.length}\n`);
    
    // 7. Analizar registros problemáticos específicos
    if (noEncontrados > 0) {
      console.log('🔍 ANÁLISIS DE REGISTROS PROBLEMÁTICOS:\n');
      
      console.log('Posibles causas de registros perdidos:');
      console.log('1. 📅 Problemas de formato/parsing de fechas');
      console.log('2. 🏷️ Diferencias en nombres de placas (espacios, mayúsculas)');
      console.log('3. 👤 Diferencias en nombres de inspectores');
      console.log('4. ❌ Registros que fallan validación en el backend');
      console.log('5. 🔄 Registros considerados duplicados y rechazados');
      console.log('6. 📝 Campos obligatorios faltantes\n');
      
      // Buscar registros con fechas más flexibles
      console.log('🔍 BÚSQUEDA CON CRITERIOS MÁS FLEXIBLES:\n');
      
      const registrosProblema = excelMapeado.filter(regExcel => {
        const matches = dbData.filter(regBD => {
          const fechaBD = new Date(regBD.fecha);
          const fechaExcel = new Date(regExcel.fecha);
          const mismaFecha = fechaBD.toDateString() === fechaExcel.toDateString();
          const mismaPlaca = regBD.placa_vehiculo === regExcel.placa;
          const mismoInspector = regBD.nombre_inspector === regExcel.inspector;
          return mismaFecha && mismaPlaca && mismoInspector;
        });
        return matches.length === 0;
      });
      
      // Para cada registro problema, buscar matches parciales
      registrosProblema.slice(0, 5).forEach(regExcel => {
        console.log(`🔍 Analizando: ${regExcel.placa} - ${regExcel.fecha.toISOString().split('T')[0]}`);
        
        // Buscar por solo placa
        const matchesPlaca = dbData.filter(regBD => regBD.placa_vehiculo === regExcel.placa);
        console.log(`   Matches por placa: ${matchesPlaca.length}`);
        
        // Buscar por solo fecha (mismo día)
        const matchesFecha = dbData.filter(regBD => {
          if (!regBD.fecha) return false;
          const fechaBD = new Date(regBD.fecha);
          const fechaExcel = new Date(regExcel.fecha);
          return fechaBD.toDateString() === fechaExcel.toDateString();
        });
        console.log(`   Matches por fecha: ${matchesFecha.length}`);
        
        // Buscar por inspector
        const matchesInspector = dbData.filter(regBD => regBD.nombre_inspector === regExcel.inspector);
        console.log(`   Matches por inspector: ${matchesInspector.length}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

investigarRegistrosPerdidos();