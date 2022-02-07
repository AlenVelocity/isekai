const withTM = require('next-transpile-modules')(['kalidokit'])
/** @type {import('next').NextConfig} */
module.exports = withTM({
  reactStrictMode: true,
  //  MAKE WEBPACK transpile esmodules
})
