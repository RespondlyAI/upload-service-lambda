# Upload Service Lambda

Upload processing service for RespondlyAI platform. Part of the microservices architecture using a shared API Gateway.

## Architecture

- **Service**: Upload processing and file management
- **Runtime**: Node.js 22.x on AWS Lambda
- **API Gateway**: Shared with email-service-lambda
- **Endpoints**: `/uploads/process` (GET, POST)
- **Deployment**: Serverless Framework

## API Endpoints

### POST /uploads/process
Process file uploads and return upload metadata.

### GET /uploads/process
Health check and service status.

## Shared API Gateway

This service uses the same API Gateway as `email-service-lambda`:
- **Gateway ID**: Imported from CloudFormation exports
- **Email Service**: `/emails/send`
- **Upload Service**: `/uploads/process`
- **Base URL**: `https://y47joumyc5.execute-api.ap-south-1.amazonaws.com/dev`

## Development

```bash
# Install dependencies
npm install

# Deploy to AWS
npm run deploy

# View logs
npm run logs

# Remove service
npm run remove
```

## Configuration

The service imports the following CloudFormation exports from email-service-lambda:
- `dev-RespondlyAI-RestApiId`: API Gateway REST API ID
- `dev-RespondlyAI-RootResourceId`: API Gateway Root Resource ID

## Testing

```bash
# Test health endpoint
curl -X GET "https://y47joumyc5.execute-api.ap-south-1.amazonaws.com/dev/uploads/process"

# Test upload processing
curl -X POST "https://y47joumyc5.execute-api.ap-south-1.amazonaws.com/dev/uploads/process" \
  -H "Content-Type: application/json" \
  -d '{"file": "test.pdf", "size": 1024}'
```

## Environment Variables

- `NODE_ENV`: Current environment (dev/prod)
- `STAGE`: Deployment stage

## Dependencies

- `aws-sdk`: AWS service interactions
- `serverless`: Deployment framework
- `serverless-offline`: Local development server