// Utilidad para parsear archivos Excel
const XLSX = require('xlsx');

module.exports = {
  parseExcel(buffer) {
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet, {
      defval: '',
      raw: false,
      dateNF: 'yyyy-mm-dd'
    });
    
    // Filtrar filas completamente vacías
    return data.filter(row => {
      // Una fila es válida si tiene al menos un campo con valor no vacío
      return Object.values(row).some(value => 
        value !== null && value !== '' && value !== undefined
      );
    });
  }
};
