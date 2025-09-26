// Utilidad para parsear archivos Excel
const XLSX = require('xlsx');

module.exports = {
  parseExcel(buffer) {
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(worksheet, {
      defval: '',
      raw: false,
      dateNF: 'yyyy-mm-dd'
    });
  }
};
