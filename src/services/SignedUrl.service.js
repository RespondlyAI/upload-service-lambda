const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');



const { s3Client } = require('../config/s3');
/**
 * Generate a pre-signed URL for uploading a file directly to S3
 * @param {string} fileName - Original file name
 * @param {string} fileType - MIME type of the file
 * @returns {Promise<Object>} Contains uploadUrl and objectKey
 */
const generateUploadUrl = async (fileName, fileType) => {
    const bucketName = process.env.UPLOAD_BUCKET_NAME;

    if (!bucketName) {
        throw new Error('upload bucket is not configured');
    }

    const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    const objectKey = `uploads/${Date.now()}_${safeFileName}`;

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        ContentType: fileType,
    });
 
    try {
        // Standard presigned URL generation (15 minutes validity)
        const expiresInSeconds = 900;
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });

        console.log('Signed URL generated successfully for objectKey:', objectKey, 'expiresInSeconds:', expiresInSeconds);
        
        return {
            uploadUrl: signedUrl,
            objectKey: objectKey
        };
    } catch (error) {
        console.error('Error generating pre-signed URL in FileStorage Service:', error);
        throw new Error('Failed to generate secure upload url');
    }
};

module.exports = {
    generateUploadUrl
};
