/**
 * Web stub for react-native/Libraries/ReactPrivate/ReactNativePrivateInterface
 * React Native 0.74 removed Platform.js and several other files that Metro
 * needs when bundling for web. This stub provides web-safe replacements.
 */
import Platform from 'react-native-web/dist/cjs/exports/Platform/index.js';

const noop = () => {};
const noopObj = {};

const EventEmitter = {
  addListener: noop,
  removeListener: noop,
  emit: noop,
  removeAllListeners: noop,
};

module.exports = {
  get Platform() { return Platform; },
  get BatchedBridge() { return { enqueueNativeCall: noop, registerCallableModule: noop }; },
  get ExceptionsManager() { return { reportException: noop, reportFatalException: noop, updateExceptionMessage: noop }; },
  get RCTEventEmitter() { return { register: noop }; },
  get ReactNativeViewConfigRegistry() { return { register: noop, get: () => noopObj, customBubblingEventTypes: {}, customDirectEventTypes: {} }; },
  get TextInputState() { return { focusTextInput: noop, blurTextInput: noop, currentlyFocusedInput: () => null }; },
  get UIManager() {
    try { return require('react-native-web/dist/cjs/exports/UIManager/index.js'); }
    catch { return { updateView: noop, measure: noop, dispatchViewManagerCommand: noop }; }
  },
  get deepDiffer() {
    try { return require('react-native/Libraries/Utilities/differ/deepDiffer'); }
    catch { return (a, b) => a !== b; }
  },
  get deepFreezeAndThrowOnMutationInDev() {
    try { return require('react-native/Libraries/Utilities/deepFreezeAndThrowOnMutationInDev'); }
    catch { return (x) => x; }
  },
  get flattenStyle() {
    try { return require('react-native-web/dist/cjs/exports/StyleSheet/index.js').flatten; }
    catch { return (x) => x; }
  },
  get ReactFiberErrorDialog() { return { showErrorDialog: () => false }; },
  get legacySendAccessibilityEvent() { return noop; },
  get RawEventEmitter() { return EventEmitter; },
  get CustomEvent() { return typeof CustomEvent !== 'undefined' ? CustomEvent : class CustomEvent extends Event {}; },
  get createAttributePayload() { return () => noopObj; },
  get diffAttributePayloads() { return () => noopObj; },
  get createPublicInstance() { return (inst) => inst; },
  get createPublicTextInstance() { return (inst) => inst; },
  get getNativeTagFromPublicInstance() { return () => null; },
  get getNodeFromPublicInstance() { return () => null; },
  get getInternalInstanceHandleFromPublicInstance() { return () => null; },
};
