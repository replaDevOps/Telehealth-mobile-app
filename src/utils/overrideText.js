// src/utils/overrideText.js
import { Text } from 'react-native';

// This must run at the very beginning of your app
export function setGlobalFont() {
  const defaultFontFamily = 'HelveticaNeue-Bold';

  const oldRender = Text.render;
  Text.render = function (...args) {
    const origin = oldRender.call(this, ...args);
    return React.cloneElement(origin, {
      style: [{ fontFamily: defaultFontFamily }, origin.props.style],
    });
  };
}
