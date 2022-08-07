declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      HTTP_PORT: string;
      STRIPE_SECRET_KEY: string;
      STRIPE_WEBHOOK_ENDPOINT_SECRET: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
