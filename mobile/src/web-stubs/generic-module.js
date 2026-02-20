// Generic stub for react-native internal modules that are not available on web.
// Returns safe no-op values for any property access.
const noop = () => {};
const noopPromise = () => Promise.resolve();

const stub = new Proxy(
  {
    default: {},
    addListener: noop,
    removeListener: noop,
    emit: noop,
    removeAllListeners: noop,
  },
  {
    get(target, prop) {
      if (prop in target) return target[prop];
      if (prop === '__esModule') return false;
      if (prop === 'default') return stub;
      return noop;
    },
  },
);

module.exports = stub;
