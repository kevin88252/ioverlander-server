require('dotenv').config()
const config = require('config')

const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const extractSass = new ExtractTextPlugin({
    filename: "style.css",
    allChunks: true
});

/* TODO: incorporate useful stuff from below (https://stackoverflow.com/questions/35054082/webpack-how-to-build-production-code-and-how-to-use-it)
plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        // This has effect on the react lib size
        'NODE_ENV': JSON.stringify('production'),
      }
    }),
    new ExtractTextPlugin("bundle.css", {allChunks: false}),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      mangle: true,
      compress: {
        warnings: false, // Suppress uglification warnings
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        screw_ie8: true
      },
      output: {
        comments: false,
      },
      exclude: [/\.min\.js$/gi] // skip pre-minified libs
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, [/moment$/]), //https://stackoverflow.com/questions/25384360/how-to-prevent-moment-js-from-loading-locales-with-webpack
    new CompressionPlugin({
      asset: "[path].gz[query]",
      algorithm: "gzip",
      test: /\.js$|\.css$|\.html$/,
      threshold: 10240,
      minRatio: 0
    })
  ],
*/


let configObj = {
  entry: [
    './src/client.js',
  ],
  output: {
    path: config.get('assets.outputPath'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      config: path.resolve(__dirname, '../src/client_config.shim')
    },
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            query: {
              presets: ['es2015', 'react']
            }
          }
        ],
      },
      {
        test: /\.json$/,
        use: ['json-loader'],
      },
      {
        test: /\.md$/,
        use: ['raw-loader'],
      }
    ]
  },

  plugins: [
    new CopyWebpackPlugin([{
        from: path.resolve(__dirname, '../src/assets/icons'),
        to:'icons/',
    }])
  ]
}

if (config.get('assets.compileAssets')) {
  configObj.plugins.push(extractSass)
  configObj.module.loaders.push({
    test: /\.scss$/,
    use: ExtractTextPlugin.extract({
      use: [
        { loader: "css-loader" },
        { loader: "sass-loader" }
      ],
    })
  })
  configObj.module.loaders.push({
    test: /\.css$/,
     use: ExtractTextPlugin.extract({
      use: [
        { loader: "css-loader" },
      ],
    }),
  })
} else {
  configObj.module.loaders.push({
    test: /\.scss$/,
    use: [ "style-loader", "css-loader", "sass-loader"],
  })
  configObj.module.loaders.push({
    test: /\.css$/,
    use: ["style-loader", "css-loader"],
  })
  configObj.plugins.push(new webpack.DefinePlugin({
    'process.env.BROWSER': JSON.stringify(true)
  }))
}

module.exports = configObj
