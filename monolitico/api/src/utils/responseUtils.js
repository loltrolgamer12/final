module.exports = {
  successResponse(res, data) {
    return res.status(200).json({ success: true, data });
  },
  errorResponse(res, code, message) {
    return res.status(400).json({ success: false, error: { code, message } });
  }
};
