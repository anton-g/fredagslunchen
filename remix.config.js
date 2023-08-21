/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  cacheDirectory: "./node_modules/.cache/remix",
  ignoredRouteFiles: ["**/.*", "**/*.css", "**/*.test.{js,jsx,ts,tsx}"],
  serverDependenciesToBundle: ["nanoid", "mapbox-gl"],
  serverModuleFormat: "cjs",
  future: {
    v2_errorBoundary: true,
    v2_normalizeFormMethod: true,
    v2_headers: true,
    v2_routeConvention: true,
  },
}
