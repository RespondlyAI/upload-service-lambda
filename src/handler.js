const { handler: signedUrl } = require('./api/signed-url');
const { handler: uploadComplete } = require('./api/complete');

module.exports = {
  signedUrl,
  uploadComplete,
};