const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const GENERIC_STUB = path.resolve(__dirname, 'src/web-stubs/generic-module.js');

const WEB_STUBS = {
  'react-native/Libraries/ReactPrivate/ReactNativePrivateInterface': path.resolve(
    __dirname,
    'src/web-stubs/ReactNativePrivateInterface.js',
  ),
  'react-native/Libraries/BatchedBridge/BatchedBridge': GENERIC_STUB,
  'react-native/Libraries/BatchedBridge/NativeModules': GENERIC_STUB,
  'react-native/Libraries/EventEmitter/RCTEventEmitter': GENERIC_STUB,
  'react-native/Libraries/Core/ExceptionsManager': GENERIC_STUB,
  'react-native/Libraries/TurboModule/TurboModuleRegistry': path.resolve(
    __dirname,
    'src/web-stubs/TurboModuleRegistry.js',
  ),
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    // Explicit stubs
    const stub = WEB_STUBS[moduleName];
    if (stub) return { type: 'sourceFile', filePath: stub };

    // Redirect top-level react-native → react-native-web
    if (moduleName === 'react-native') {
      return context.resolveRequest(context, 'react-native-web', platform);
    }

    // Redirect react-native/* named imports → react-native-web/*
    if (moduleName.startsWith('react-native/')) {
      try {
        const rnwName = moduleName.replace(/^react-native\//, 'react-native-web/');
        return context.resolveRequest(context, rnwName, platform);
      } catch {
        // not in react-native-web, fall through
      }
    }

    // Catch-all: if the import originates from inside react-native/Libraries
    // and can't be resolved, return a generic stub instead of crashing.
    const origin = context.originModulePath.replace(/\\/g, '/');
    if (origin.includes('node_modules/react-native/Libraries')) {
      try {
        return context.resolveRequest(context, moduleName, platform);
      } catch {
        return { type: 'sourceFile', filePath: GENERIC_STUB };
      }
    }
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
