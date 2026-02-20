// Web stub for react-native TurboModuleRegistry.
// On web there are no native modules; return safe no-op stubs instead of throwing.
const noop = () => {};

const moduleStub = new Proxy(
  {},
  {
    get(_, prop) {
      if (prop === '__esModule') return false;
      if (prop === 'then') return undefined; // not a Promise
      return noop;
    },
  },
);

module.exports = {
  get: () => null,
  getEnforcing: () => moduleStub,   // was throwing — now returns stub
  getEnforcingIfExists: () => null,
  requireModule: () => moduleStub,
  requireModuleIfExists: () => null,
};
