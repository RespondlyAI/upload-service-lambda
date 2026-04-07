const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3Client } = require('../config/s3');

const createPresignedUploadUrl = async (objectKey, contentType) => {
  const bucketName = process.env.UPLOAD_BUCKET_NAME;

  if (!bucketName) {
    throw new Error('Upload bucket is not configured');
  }

  if (!objectKey || !contentType) {
    throw new Error('objectKey and contentType are required');
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
    ContentType: contentType,
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 300, 
    });

    return signedUrl;
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    throw new Error('Failed to generate secure upload URL');
  }
};

module.exports = {
  createPresignedUploadUrl,
};