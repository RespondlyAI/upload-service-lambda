const { HeadObjectCommand } = require('@aws-sdk/client-s3');
const { s3Client } = require('../config/s3');

/**
 * Checks if a file exists in S3
 * @param {string} objectKey 
 */
const checkFileExists = async (objectKey) => {
  const bucketName = process.env.UPLOAD_BUCKET_NAME;

  if (!bucketName) {
    throw new Error('UPLOAD_BUCKET_NAME environment variable is missing');
  }
  if (!objectKey) {
    throw new Error('objectKey is required for existence check');
  }

  try {
    const command = new HeadObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    });
    
    await s3Client.send(command);
    return true;
  } catch (error) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return false;
    }
    console.error('Error checking S3 file existence:', error);
    throw new Error('S3 verification error');
  }
};

/**
 * Gets verified metadata from S3
 * @param {string} objectKey 
 */
const getObjectMetadata = async (objectKey) => {
  const bucketName = process.env.UPLOAD_BUCKET_NAME;

  if (!bucketName) {
    throw new Error('UPLOAD_BUCKET_NAME environment variable is missing');
  }
  if (!objectKey) {
    throw new Error('objectKey is required to fetch metadata');
  }

  try {
    const command = new HeadObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    });
    
    const data = await s3Client.send(command);
    return data;
  } catch (error) {
    console.error('Error fetching S3 object metadata:', error);
    throw new Error('Could not fetch object metadata');
  }
};

module.exports = {
  checkFileExists,
  getObjectMetadata
};
