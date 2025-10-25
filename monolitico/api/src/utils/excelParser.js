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
    
    const tieneCamposFatiga = camposFatigaEsperados.some(campo => 
      cleanHeaders.some(header => header.includes('dormido') || header.includes('fatiga') || header.includes('condiciones') || header.includes('medicamentos'))
    );
    
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
    
    // Filtrar filas completamente vacías y agregar metadata
    const validData = data.filter(row => {
      // Una fila es válida si tiene al menos campos básicos
      const placa = row['PLACA DEL VEHICULO'];
      const fecha = row['Marca temporal'];
      const inspector = row['NOMBRE DE QUIEN REALIZA LA INSPECCIÓN'];
      
      return placa && fecha && inspector;
    }).map(row => {
      // Agregar metadata para el procesador
      row._meta = {
        tieneCamposFatiga: tieneCamposFatiga,
        headerCount: cleanHeaders.length
      };
      return row;
    });
    
    console.log(`📊 Excel Parser: ${validData.length} filas válidas (con placa, fecha, inspector)`);
    
    return validData;
  }
};
