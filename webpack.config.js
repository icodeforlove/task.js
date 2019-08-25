module.exports = [
    {
        mode: 'production',

        target: 'web',

        entry: `${__dirname}/src/client/index.js`,

        output: {
            path: `${__dirname}/dist/client`,
            filename: 'task.js',
            library: 'Task'
        },

        module: {
            rules: [
                {
                    test: /\.js$/,
                    use: {
                        loader: 'babel-loader',
                        options: {}
                    }
                }
            ]
        },

        devtool: 'source-map'
    },

    {
        mode: 'development',

        target: 'web',

        entry: `${__dirname}/spec/client/index.js`,

        output: {
            path: `${__dirname}/spec/client`,
            filename: '.index.bundle.js'
        },

        module: {
            rules: [
                {
                    test: /\.js$/,
                    use: {
                        loader: 'babel-loader',
                        options: {}
                    }
                }
            ]
        },

        devtool: 'source-map'
    }
];