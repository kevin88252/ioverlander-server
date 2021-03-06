const config = require('config')

// Takes our server side config and generates an object with client side config options.
function makeClientConfig() {
  let clientConfig = {
    apiEndpoint: config.get('publicApiEndpoint'),
    browser: true,
    assets: {
        urlPrefix: config.get('assets.urlPrefix'),
    }
  }
  return clientConfig
}
export default makeClientConfig
