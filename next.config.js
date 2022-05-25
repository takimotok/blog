const path = require('path');

module.exports = {
  optimizeFonts: true,
  sassOptions: {
    includePaths: [path.join(__dirname, 'src', 'styles')],
  },
  eslint: {
    dirs: ['src'],
  },
}
