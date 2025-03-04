const path = require('path')

module.exports = {
    entry: './src/tabsonly.js',
    output: {
        filename: 'tabsWithClickabilityBundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader','css-loader']
            },
            {
                test: /\.(png|jpg)$/,
                type: 'asset/resource'
            },
            {
                test: /\.(woff|otf)$/,
                type: 'asset/resource'
            }
        ]
    }
};
