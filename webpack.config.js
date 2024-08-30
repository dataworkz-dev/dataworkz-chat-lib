const path = require('path');

module.exports = {
  mode: 'production', // Set mode to 'production' or 'development' as needed
  entry: './src/index.js', // Entry point for your library
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    library: 'DwReactLib1', // Name of the library
    libraryTarget: 'umd',
    globalObject: 'this',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.svg$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'assets/',
            publicPath: 'assets/'
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js']
  },
  externals: {
    react: 'react',
    'react-dom': 'react-dom'
  }
};
