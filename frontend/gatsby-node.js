exports.onCreateWebpackConfig = ({
                                     actions,
                                 }) => {
    const {
        setWebpackConfig
    } = actions;
    setWebpackConfig({
        externals: {
            jquery: 'jQuery', // important: 'Q' capitalized
        },
        resolve: {
            mainFields: ['browser', 'module', 'main'],
            extensions: ['ts', 'js'],
            fallback: {
                http: require.resolve('stream-http'),
                url: require.resolve('url'),
                zlib: require.resolve('browserify-zlib'),
                tty: require.resolve('tty-browserify'),
                util: require.resolve('util'),
                https: require.resolve('https-browserify'),
                stream: require.resolve('stream-browserify'),
                assert: require.resolve('assert'),
                path: require.resolve('path-browserify'),
                os: require.resolve('os-browserify/browser')
            }
        },
        node: {
            fs: 'empty'
        }
    })
};