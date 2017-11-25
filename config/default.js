let domain = "localhost"
let baseUrl = "http://"+domain+":3000"

module.exports = {
  domain: domain,
  baseUrl: baseUrl,
  apiEndpoint: baseUrl+"/api",

  assets: {
      // Toggle between serving assets locally with webpack and static assets from cloudfront/s3
      compileAssets: true,
      outputPath: process.env.ASSETS_OUTPUT_PATH,
      host: 'staging-bucket.s3.aws',
      urlPrefix: 'https://ioverlander-asset-test-21.s3.aws',
      s3Bucket: 'ioverlander-asset-test-21',
      s3AccessKey: process.env.ASSETS_S3_KEY,
      s3AccessToken: process.env.ASSETS_S3_TOKEN
  },

  db: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOSTNAME,
    database: "ioverlander",
    dialect: "postgres",
    storage: null,
    define: { // TODO: verify this works
      underscored: true
    }
  },
  sessionSettings: {
    secure: false,
    secret: process.env.SESSION_SECRET,
  },
  sessionDb:{
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: "ioverlander_node_sessions",
    host: process.env.DB_HOSTNAME,
    dialect: "postgres",
    storage: null,
    underscored: true,
    logging: false,
    pool: {
      max: 5,
      min: 0,
      idle: 10000
    }
  },
  email: {
    address: 'iOverlander.com@gmail.com',
    from: "iOverlander <iOverlander.com@gmail.com>",
    transport: {
      service: "gmail",
      pool: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    }
  }
}

