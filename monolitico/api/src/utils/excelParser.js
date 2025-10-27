// Utilidad para parsear archivos Excel
const XLSX = require('xlsx');

module.exports = {
  parseExcel(buffer) {
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Primero obtener todos los encabezados de la primera fila
    const headerRow = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1, 
      range: 0 
    })[0];
    
    // Limpiar encabezados (remover espacios extra, valores vacíos)
    const cleanHeaders = headerRow.map(header => {
      if (!header || header.toString().trim() === '') return null;
      return header.toString().trim();
    }).filter(header => header !== null);
    
    console.log(`📊 Excel Parser: ${headerRow.length} encabezados raw → ${cleanHeaders.length} válidos`);
    
    // Detectar campos de fatiga esperados
    const camposFatigaEsperados = [
      '¿Ha dormido al menos 7 horas en las últimas 24 horas?',
      '¿Se encuentra libre de síntomas de fatiga (Somnolencia, dolor de cabeza, irritabilidad)?',
      '¿Se siente en condiciones físicas y mentales para conducir?',
      '¿Ha consumido medicamentos o sustancias que afecten su estado de alerta?'
    ];
    
    // Mejorar detección de campos de fatiga
    const palabrasClaveMatches = cleanHeaders.filter(header => 
      header.includes('dormido') || 
      header.includes('fatiga') || 
      header.includes('condiciones') || 
      header.includes('medicamentos')
    );
    
    console.log(`🔍 Headers que contienen palabras de fatiga: ${palabrasClaveMatches.length}`, palabrasClaveMatches);
    
    const tieneCamposFatiga = palabrasClaveMatches.length >= 2; // Al menos 2 campos de fatiga
    
    console.log(`🔍 Excel tiene campos de fatiga: ${tieneCamposFatiga ? '✅' : '❌'}`);
    
    // Usar encabezados originales para mantener compatibilidad
    const data = XLSX.utils.sheet_to_json(worksheet, {
      header: headerRow,
      defval: '', // Valor por defecto para columnas vacías
      raw: false,
      dateNF: 'yyyy-mm-dd',
      range: 1 // Empezar desde la fila 2 (después de headers)
    });
    
    console.log(`📊 Excel Parser: ${data.length} filas procesadas`);
    
    // Filtrar filas completamente vacías
    const validData = data.filter(row => {
      // Una fila es válida si tiene al menos campos básicos
      const placa = row['PLACA DEL VEHICULO'] || row['PLACA DEL VEHÍCULO']; // VEHICULO sin É primero
      const fecha = row['Marca temporal'];
      // Para inspector, probar ambas variantes (con y sin espacio final)
      const inspector = row['NOMBRE DE QUIEN REALIZA LA INSPECCIÓN '] || row['NOMBRE DE QUIEN REALIZA LA INSPECCIÓN']; // Con espacio primero
      
      return placa && fecha && inspector;
    });
    
    // Agregar metadata al inicio del array
    if (validData.length > 0) {
      validData.unshift({
        _meta: {
          tieneCamposFatiga: tieneCamposFatiga,
          headerCount: cleanHeaders.length
        }
      });
    }
    
    console.log(`📊 Excel Parser: ${validData.length} filas válidas (con placa, fecha, inspector)`);
    
    return validData;
  }
};
