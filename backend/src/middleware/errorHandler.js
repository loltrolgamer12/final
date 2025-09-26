module.exports = (err, req, res, next) => {
  console.error('Error:', err);
  // Prisma error
  if (err.code && err.code.startsWith('P')) {
    return res.status(400).json({
      success: false,
      error: {
        code: err.code,
        message: err.message || 'Error de base de datos'
      }
    });
  }
  // Validación
  if (err.name === 'ValidationError') {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message
      }
    });
  }
  // Multer (upload)
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: err.message
      }
    });
  }
  // Error general
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: err.message || 'Error interno del servidor'
    }
  });
};
