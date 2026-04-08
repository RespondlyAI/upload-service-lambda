const { success, error } = require('../utils/response');
const { markUploadCompleted } = require('../services/db.service');
const { checkFileExists, getObjectMetadata } = require('../services/fileStorage.service');

module.exports.handler = async (event) => {
  try {
    // Parse body safely
    let body = {};
    try {
      body = event.body ? JSON.parse(event.body) : {};
    } catch (e) {
      return error('Invalid JSON body', 400);
    }
    
    // Parse completion verification payloads
    const { uploadId, objectKey } = body;
    
    // Validate required fields
    if (!uploadId || !objectKey) {
      return error('Missing required fields: uploadId, objectKey', 400);
    }

    // Verify file actually exists in S3 (Critical Security)
    const exists = await checkFileExists(objectKey);
    if (!exists) {
      return error('File not found in S3. Please upload the file before completing.', 400);
    }

    //  Fetch TRUE ETag straight from S3 (Never trust the client)
    const metadata = await getObjectMetadata(objectKey);
    const etag = metadata.ETag;

    //  Update the DynamoDB record from 'pending' to 'completed'
    //  Security: Passing objectKey to verify ownership/consistency
    const result = await markUploadCompleted(uploadId, objectKey, etag);

    //  Return success to the client
    return success({
      uploadId,
      status: result.status,
      completedAt: result.uploadedAt,
      message: 'Upload status updated to completed successfully'
    });
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      return error('Invalid uploadId, wrong status, or objectKey mismatch', 400);
    }
    console.error('Error in complete handler:', err);
    return error('Internal Server Error', 500);
  }
};
