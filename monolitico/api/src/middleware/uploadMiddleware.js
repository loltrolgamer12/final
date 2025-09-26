const multer = require('multer');
const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  const ext = file.originalname.split('.').pop().toLowerCase();
  if (!['xlsx', 'xls'].includes(ext)) {
    return cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls)'));
  }
  if (file.size > 50 * 1024 * 1024) {
    return cb(new Error('El archivo excede el tamaño máximo permitido (50MB)'));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter
});

// Middleware para manejar errores de multer
function uploadErrorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError || err) {
    return res.status(400).json({ success: false, error: { code: 'UPLOAD_VALIDATION', message: err.message } });
  }
  next();
}

module.exports = upload;
module.exports.uploadErrorHandler = uploadErrorHandler;
