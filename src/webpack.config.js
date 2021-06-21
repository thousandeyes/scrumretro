const path = require('path');

const ROOT_PATH = path.resolve(__dirname, '..');

module.exports = {
    context: ROOT_PATH,
    mode: 'production',
    devtool: 'source-map',
    target: 'node',
    entry: './src/handler.ts',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [ '.ts', '.js' ],
        modules: ['node_modules', path.resolve(ROOT_PATH, 'src')],
    },
    externals: {
        'nuxt-start': 'commonjs2 nuxt-start',
    },
    output: {
        filename: 'handler.js',
        path: path.resolve(ROOT_PATH, 'dist'),
        library: 'handler',
        libraryTarget: 'commonjs2',
    },
    optimization: {
        minimize: false,
    },
};