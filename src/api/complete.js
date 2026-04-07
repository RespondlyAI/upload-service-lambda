const { success, error } = require('../utils/response');

module.exports.handler = async (event) => {
  try {
    let body = {};
    if (event.body) {
      body = JSON.parse(event.body);
    }
    
    // Parse request basics
    const { uploadId } = body;
    
    if (!uploadId) {
      return error('Missing uploadId in request body', 400);
    }

    return success({
      uploadId,
      status: 'completed',
      message: 'Upload processing completed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error completing upload:', err);
    return error('Internal Server Error', 500);
  }
};
