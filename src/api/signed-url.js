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

    //  Sanitize filename
    const safeFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const lowerFileName = safeFileName.toLowerCase();

    //  Allowed MIME types
    const allowedTypes = ['application/pdf', 'application/json'];
    if (!allowedTypes.includes(contentType)) {
      return error('Invalid file type. Only PDF and JSON allowed.', 400);
    }

    // Extension validation (PDF + JSON)
    if (
      (lowerFileName.endsWith('.pdf') && contentType !== 'application/pdf') ||
      (lowerFileName.endsWith('.json') && contentType !== 'application/json')
    ) {
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