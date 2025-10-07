const excelService = require('../services/excelService');
const responseUtils = require('../utils/responseUtils');

module.exports = {
  async uploadExcel(req, res) {
    try {
        console.log('--- INICIO DE CARGA DE EXCEL ---');
      if (!req.file) {
          console.error('No se envió ningún archivo');
        return responseUtils.errorResponse(res, 'NO_FILE', 'No se envió ningún archivo');
      }
      const { buffer, originalname } = req.file;
      let tipo = req.body.tipo;
      // Validación automática por nombre de archivo
      if (!tipo) {
        if (/pesad/i.test(originalname)) {
          tipo = 'pesado';
        } else if (/liger/i.test(originalname)) {
          tipo = 'ligero';
        } else if (/veh[ií]culos? pesad/i.test(originalname)) {
          tipo = 'pesado';
        } else if (/veh[ií]culos? liger/i.test(originalname)) {
          tipo = 'ligero';
        } else {
          tipo = 'ligero'; // Default
        }
      }
      console.log(`Archivo recibido: ${originalname}, tamaño: ${buffer.length} bytes, tipo: ${tipo}`);
      const result = await excelService.processExcelFile(buffer, originalname, { tipo });
        console.log('Resultado del procesamiento:', result);
      if (result.success) {
          console.log('--- FIN DE CARGA EXITOSA ---');
        return responseUtils.successResponse(res, {
          mensaje: 'Archivo procesado correctamente',
          totalRegistros: result.totalRecords,
          registrosInsertados: result.insertados,
          registrosDuplicados: result.duplicates,
          registrosError: result.errors,
          fileHash: result.fileHash,
          advertencias: result.warnings || [],
          muestraErrores: result.errorDetails?.slice(0, 5) || [] // Primeros 5 errores para debug
        });
      } else {
          console.error('Error en procesamiento:', result.error);
          console.log('--- FIN DE CARGA CON ERROR ---');
        return responseUtils.errorResponse(res, 'UPLOAD_ERROR', result.error);
      }
    } catch (error) {
        console.error('Error inesperado en uploadExcel:', error);
      return responseUtils.errorResponse(res, 'UPLOAD_ERROR', error.message);
    }
  }
};
