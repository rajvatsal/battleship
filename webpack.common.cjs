const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	entry: {
		app: "./src/index.js",
	},
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "[name].bundle.js",
		clean: true,
		assetModuleFilename: "[name].asset.[ext]",
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: "./src/template.html",
			inject: "body",
			title: "Todo list - Complete your goals",
			filename: "index.html",
			scriptLoading: "defer",
			favicon: "./src/assets/icon.svg",
		}),
	],
	module: {
		rules: [
			{
				test: /\.css$/i,
				use: ["style-loader", "css-loader"],
			},
			{
				test: /\.(png|svg|jpg|jpeg|gif)$/i,
				type: "asset/resource",
			},
			{
				test: /\.(woff|woff2|otf|ttf|eot)$/i,
				type: "asset/resource" /* This is called a MIME/media type/content type */,
			},
		],
	},
};
