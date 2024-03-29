function getEnv() {
  return {
    NODE_ENV: process.env.NODE_ENV,
    ENABLE_GOOGLE_LOGIN: process.env.ENABLE_GOOGLE_LOGIN === "true",
    ENABLE_MAPS: process.env.ENABLE_MAPS === "true",
    ENABLE_PREMIUM: process.env.ENABLE_PREMIUM === "true",
    FATHOM_SITE_ID: process.env.FATHOM_SITE_ID,
    MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY,
    LOCATIONIQ_API_KEY: process.env.LOCATIONIQ_API_KEY,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  }
}

type ENV = ReturnType<typeof getEnv>

declare global {
  var ENV: ENV
  interface Window {
    ENV: ENV
  }
}

export { getEnv }
