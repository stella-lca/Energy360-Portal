const webpack = require("webpack");
const WebpackShellPlugin = require("webpack-shell-plugin");

const dotenv = require("dotenv");
const env = dotenv.config().parsed;

// reduce it to a nice object, the same as before
const envKeys = Object.keys(env).reduce((prev, next) => {
	prev[`process.env.${next}`] = JSON.stringify(env[next]);
	return prev;
}, {});

module.exports = {
	mode: "development",
	devtool: "inline-source-map",
	module: {
		rules: [
			{
				test: /\.html$/,
				use: [
					{
						loader: "html-loader",
						options: { minimize: false }
					}
				]
			}
		]
	},
	watch: true,
	watchOptions: {
		aggregateTimeout: 600,
		poll: 1000
	},
	plugins: [
		new webpack.DefinePlugin(envKeys),
		new WebpackShellPlugin({
			onBuildEnd: ["npm run server"]
		})
	]
};
