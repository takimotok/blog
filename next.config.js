import path from 'path'

module.exports = {
  reactStrictMode: true,
  optimizeFonts: true,
  sassOptions: {
    includePaths: [path.join(__dirname, 'src', 'styles')],
  },
  eslint: {
    dirs: ['src'],
  },
}
