const path = require('path');

module.exports = {
    entry: './web/index.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
        module: true,              // ✅ Output as ES module
        library: {
            type: 'module',          // ✅ Mark bundle as module
        },
    },
    experiments: {
        outputModule: true,        // ✅ Required for ES module output
    },
    mode: 'development',         // or 'production'
};
