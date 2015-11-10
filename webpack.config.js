var webpack = require('webpack');

var APP_ROOT = __dirname + '/public/js';

module.exports = {
  context: APP_ROOT,
  entry: {
    'main': './main',
    'demo-reel': './main-demo-reel'
  },
  output: {
    path: './dist/',
    filename: 'bundle.[name].js'
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
  plugins: [
    new webpack.BannerPlugin(`
    Venture Dealr - https://github.com/dlopuch/venture-dealr
    Copyright (C) 2015 Daniel Lopuch

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.

    ------------------

    Check out https://github.com/dlopuch/venture-dealr for full unminified source released under the GPL.
    `)
  ],

  devtool: '#source-map'
};
