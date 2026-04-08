const crypto = require('crypto');
const { success, error } = require('../utils/response');

const { createPresignedUploadUrl } = require('../services/presignedUrl.service');
const { createUploadRecord } = require('../services/db.service');

module.exports.handler = async (event) => {
  try {
    //  Parse body safely
    let body = {};
    try {
      body = event.body ? JSON.parse(event.body) : {};
    } catch (e) {
      return error('Invalid JSON body', 400);
    }

    const { fileName, contentType, organizationId, knowledgeBaseId } = body;

    //  Required fields validation
    if (!fileName || !contentType || !organizationId || !knowledgeBaseId) {
      return error('Missing required fields', 400);
    }

    //  Strict ID validation (Alphanumeric, hyphens, underscores)
    const idRegex = /^[a-zA-Z0-9\-_]+$/;
    if (!idRegex.test(organizationId) || !idRegex.test(knowledgeBaseId)) {
      return error('Invalid organizationId or knowledgeBaseId format', 400);
    }

    //  Sanitize filename
    const safeFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const lowerFileName = safeFileName.toLowerCase();

    //  Extension and MIME type validation
    const allowedTypes = {
      'pdf': 'application/pdf',
      'json': 'application/json'
    };
    
    const extension = lowerFileName.split('.').pop();
    
    if (!Object.keys(allowedTypes).includes(extension)) {
      return error('Invalid file extension. Only .pdf and .json are allowed.', 400);
    }

    if (allowedTypes[extension] !== contentType) {
      return error('File extension and content type mismatch', 400);
    }

    //  Generate uploadId
    const uploadId = crypto.randomUUID();

    //  Generate objectKey
    const objectKey = `uploads/${organizationId}/${knowledgeBaseId}/${uploadId}-${safeFileName}`;

    //  Generate signed URL (S3 service)
    const uploadUrl = await createPresignedUploadUrl(objectKey, contentType);

    //  Store metadata in DynamoDB
    await createUploadRecord({
      uploadId,
      organizationId,
      knowledgeBaseId,
      objectKey,
      fileName: safeFileName,
      contentType,
    });

    //  Success response
    return success({
      uploadId,
      uploadUrl,
      objectKey,
      message: 'Signed URL generated successfully'
    });

  } catch (err) {
    console.error('Error in signed-url handler:', err);
    return error('Internal Server Error', 500);
  }
};