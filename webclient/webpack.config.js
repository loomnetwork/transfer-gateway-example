const { readFileSync } = require('fs')
const webpack = require('webpack')
const gatewayAddress = readFileSync('../gateway_address', 'utf-8')
const cryptoCardsAddress = readFileSync('../crypto_cards_address', 'utf-8')
const cryptoCardsJSON = require('../truffle-ethereum/build/contracts/CryptoCards.json')
const dcCryptoCardsJSON = require('../truffle-dappchain/build/contracts/CryptoCardsDappChain.json')

module.exports = {
  context: __dirname + '/src',
  entry: ['regenerator-runtime/runtime', './index'],
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js'
  },
  devServer: {
    historyApiFallback: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      GATEWAY_ADDRESS: JSON.stringify(gatewayAddress),
      CRYPTO_CARDS_ADDRESS: JSON.stringify(cryptoCardsAddress),
      CRYPTO_CARDS_JSON: JSON.stringify(cryptoCardsJSON),
      DC_CRYPTO_CARDS_JSON: JSON.stringify(dcCryptoCardsJSON)
    })
  ],
  optimization: {
    minimizer: []
  }
}
