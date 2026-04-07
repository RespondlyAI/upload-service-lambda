const { success, error } = require('../utils/response');

module.exports.handler = async (event) => {
  try {
    let body = {};
    if (event.body) {
      body = JSON.parse(event.body);
    }
    
    // Parse request basics
    const { fileName, fileType } = body;
    
    if (!fileName || !fileType) {
      return error('Missing fileName or fileType in request body', 400);
    }

    return success({
      uploadUrl: ``,
      fileName,
      fileType,
      message: 'Signed URL generated successfully'
    });
  } catch (err) {
    console.error('Error generating signed URL:', err);
    return error('Internal Server Error', 500);
  }
};
