const path = require('path');

module.exports = {
  optimizeFonts: true,
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
}
