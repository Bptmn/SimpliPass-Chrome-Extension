// Minimal React Native shim for web build of the extension

export const NativeModules: Record<string, unknown> = {};

export class NativeEventEmitter {
  addListener() {
    return { remove: () => {} };
  }
  removeAllListeners() {}
}

export const Platform = {
  OS: 'web',
  select: (spec: Record<string, any>) => (spec && (spec as any).web) ?? spec?.default,
};

export default {
  NativeModules,
  NativeEventEmitter,
  Platform,
};


