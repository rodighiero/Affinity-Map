// const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
	entry: './src/index.js',

	output: {
		path: path.join(__dirname, '../build/dist'),
		filename: '[name]-[hash].bundle.js',
	},

	resolve: {
		modules: [path.join(__dirname, 'src'), 'node_modules'],
		extensions: ['.js'],
		mainFields: ['browser', 'module', 'main'],
		symlinks: false,
	},

	module: {
		rules: [
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader'],
			},
			{
				test: /\.(png|jpg|gif|svg)$/,
				loader: 'url-loader',
			},
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: ['babel-loader']
			},
		],
	},

	plugins: [
		new HtmlWebpackPlugin({
			title: 'Boot App',
			template: path.join(__dirname, 'assets/index.html'),
			filename: path.join(__dirname, '../build/dist', 'index.html'),
		}),
	],

	devServer: {
		contentBase: path.join(__dirname, '../build/dist'),
		compress: true,
		port: 3000,
		proxy: {
			'/api/*': {
				target: 'http://localhost:8080/',
				changeOrigin: true,
				pathRewrite: url => url.replace(/^\/api/, ''),
			},
		},
	},
}