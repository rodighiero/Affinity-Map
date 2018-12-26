// const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
	entry: {
		public: './src/public.js',
		private: './src/private.js',
	},

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
				test: /\.(png|jpg|gif|svg|eot|ttf|md)$/,
				loader: 'url-loader',
			},
		],
	},

	plugins: [
		// new CleanWebpackPlugin(['../build/dist']),
		new HtmlWebpackPlugin({
			title: 'Boot App',
			chunks: ['public'],
			template: path.join(__dirname, 'assets/public.html'),
			filename: path.join(__dirname, '../build/dist', 'index.html'),
		}),
		new HtmlWebpackPlugin({
			title: 'Boot App',
			chunks: ['private'],
			template: path.join(__dirname, 'assets/private.html'),
			filename: path.join(__dirname, '../build/dist', 'private.html'),
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