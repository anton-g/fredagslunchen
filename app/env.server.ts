function getEnv() {
  return {
    NODE_ENV: process.env.NODE_ENV,
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
