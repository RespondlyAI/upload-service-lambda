/**
 * Upload Service Lambda Handler
 * Handles file upload signed URLs and processing
 */

exports.handler = async (event, context) => {
  console.log('Upload Service - Event received:', JSON.stringify(event, null, 2));

  const { httpMethod, path } = event;

  try {
    if (httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          upload_id: `upload_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          status: 'ready',
          message: 'Upload service is working!',
          timestamp: new Date().toISOString(),
          service: 'upload-service-lambda',
          path: path,
          input_received: event,
        }),
      };
    }

    if (httpMethod === 'POST') {
      // Parse request body
      let requestBody = {};
      if (event.body) {
        try {
          requestBody = JSON.parse(event.body);
        } catch (error) {
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
              error: 'Invalid JSON payload',
              message: 'Request body must be valid JSON',
            }),
          };
        }
      }

      // Mock upload processing
      if (path.includes('/uploads/process')) {
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            upload_id: `upload_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            status: 'processed',
            message: 'Upload processing completed!',
            timestamp: new Date().toISOString(),
            request_data: requestBody,
          }),
        };
      }

      // Default POST response
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          upload_id: `upload_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          status: 'queued',
          message: 'Upload service POST request received!',
          timestamp: new Date().toISOString(),
          request_data: requestBody,
        }),
      };
    }

    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Method not allowed',
        message: `HTTP method ${httpMethod} is not supported`,
      }),
    };

  } catch (error) {
    console.error('Upload Service Error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: 'Upload service encountered an error',
        timestamp: new Date().toISOString(),
      }),
    };
  }
};