const { View } = require('react-native');

const Animated = { View };

module.exports = {
  __esModule: true,
  default: Animated,
  View,
  createAnimatedComponent: (Component) => Component,
  useAnimatedStyle: (factory) => factory(),
  useSharedValue: (value) => ({ value }),
  withDelay: (_delay, value) => value,
  withRepeat: (value) => value,
  withSpring: (value) => value,
  withTiming: (value) => value,
  runOnJS: (callback) => callback,
  Easing: {
    inOut: (easing) => easing,
    quad: (value) => value,
  },
};
