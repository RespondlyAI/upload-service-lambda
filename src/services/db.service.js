const { PutCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { dynamoClient } = require('../config/dynamodb');
const { UploadStatus } = require('../utils/constants');

const tableName = process.env.UPLOAD_TABLE_NAME;

if (!tableName || !tableName.trim()) {
  throw new Error('Missing required environment variable: UPLOAD_TABLE_NAME');
}

/**
 * Creates an initial upload record in DynamoDB (Status: pending)
 * @param {Object} data 
 */
const createUploadRecord = async (data) => {
  const command = new PutCommand({
    TableName: tableName,
    Item: {
      uploadId: data.uploadId,
      organizationId: data.organizationId,
      knowledgeBaseId: data.knowledgeBaseId,
      objectKey: data.objectKey,
      fileName: data.fileName,
      contentType: data.contentType,
      status: UploadStatus.PENDING,
      createdAt: new Date().toISOString(),
    },
    ConditionExpression: 'attribute_not_exists(uploadId)'
  });

  try {
    await dynamoClient.send(command);
    return data.uploadId;
  } catch (error) {
    console.error('DynamoDB createUploadRecord Error:', error);
    throw new Error('Could not create initial upload metadata record');
  }
};

/**
 * Updates the existing upload record to mark as completed
 * @param {string} uploadId 
 * @param {string} etag - The ETag returned by S3 upon completion
 */
const markUploadCompleted = async (uploadId, etag) => {
  const command = new UpdateCommand({
    TableName: tableName,
    Key: { uploadId },
    UpdateExpression: 'set #s = :status, uploadedAt = :uploadedAt, etag = :etag',
    ExpressionAttributeNames: {
      '#s': 'status'
    },
    ExpressionAttributeValues: {
      ':status': UploadStatus.COMPLETED,
      ':uploadedAt': new Date().toISOString(),
      ':etag': etag || 'unknown',
    },
    ConditionExpression: 'attribute_exists(uploadId)',
    ReturnValues: 'ALL_NEW'
  });

  try {
    const result = await dynamoClient.send(command);
    return result.Attributes;
  } catch (error) {
    console.error('DynamoDB markUploadCompleted Error:', error);
    throw new Error('Could not update upload record status to completed');
  }
};

module.exports = {
  createUploadRecord,
  markUploadCompleted
};
