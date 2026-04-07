const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');



const s3Client = new S3Client({ region: process.env.AWS_REGION});

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

    // Creating objectKey - using timestamp to avoid unexpected overwriting
    const objectKey = `uploads/${Date.now()}_${fileName.replace(/\s+/g, '-')}`;

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        ContentType: fileType,
    });
 
    try {
        // Standard presigned URL generation (15 minutes validity)
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

        console.log('Signed URL generated successfully:', signedUrl);
        
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
