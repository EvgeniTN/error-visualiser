const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	mode: "production",
	entry: "./src/webview/index.tsx",
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "bundle.js",
	},
	resolve: {
		extensions: [".ts", ".tsx", ".js"],
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: "ts-loader",
				exclude: /node_modules/,
			},
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"],
			},
		],
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: "./src/webview/index.html",
		}),
	],
};
