function getEnv() {
  return {
    NODE_ENV: process.env.NODE_ENV,
    ENABLE_MAPS: process.env.ENABLE_MAPS === "true",
  };
}

type ENV = ReturnType<typeof getEnv>;

declare global {
  var ENV: ENV;
  interface Window {
    ENV: ENV;
  }
}

export { getEnv };