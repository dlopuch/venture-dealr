var APP_ROOT = __dirname + '/public/js';

module.exports = {
  context: APP_ROOT,
  entry: './main',
  output: {
    path: './public/',
    filename: 'bundle.js'
  },
  module: {
    preLoaders: [
      { loader: 'jshint-loader',
        test: /\.js$/,
        exclude: /node_modules/
      }
    ],
    loaders: [
      { test: /\.js$/  , loader: 'babel-loader', exclude: /node_modules/},
      { test: /\.jsx$/ , loader: 'jsx-loader?harmony', exclude: /node_modules/},
      { test: /\.less$/, loader: "style!css!less" },
      { test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000' }
    ]
  },
  resolve: {
    root: APP_ROOT
  },
  devServer: {
    contentBase: './public/',

    // Trying to get hotloading to work.  Not quite there yet.
    //hot: true,
    //inline: true
    // also: need to enable special script in index.html
  },
  jshint: {
    // any jshint option http://www.jshint.com/docs/options/
    // i. e.
    camelcase: true,

    // jshint errors are displayed by default as warnings
    // set emitErrors to true to display them as errors
    emitErrors: true,

    // jshint to not interrupt the compilation
    // if you want any file with jshint errors to fail
    // set failOnHint to true
    failOnHint: true,
  },
  devtool: '#inline-source-map'
};
