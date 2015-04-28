module.exports = {
  entry: {
    app: ['./public/entry.js']
  },
  output: {
    path: './public/',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      // { test: /\.css$/, loader: "style!css" }
    ]
  },
  devServer: {
    contentBase: './public/',
    
    // Trying to get hotloading to work.  Not quite there yet.
    //hot: true,
    //inline: true
    // also: need to enable special script in index.html
  },
  devtool: '#inline-source-map'
};
