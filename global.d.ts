declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID: string;
  // add more env variables as needed
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.png' {
  const value: any;
  export default value;
}
