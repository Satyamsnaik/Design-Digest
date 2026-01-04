
// Augment the existing NodeJS.ProcessEnv to include API_KEY.
// We avoid declaring 'process' as a var/const here because it might already be declared
// (e.g. by @types/node) causing "Cannot redeclare" errors. 
// If it is NOT declared (frontend only), user usage of process.env might rely on build-time replacement 
// or may need `declare var process: any` if strict checks are on, but simple augmentation is safer 
// to avoid breaking config files.

declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    [key: string]: string | undefined;
  }
}
