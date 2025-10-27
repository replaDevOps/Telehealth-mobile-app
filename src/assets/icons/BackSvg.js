import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
const BackSvg = props => (
  <Svg
    width={12}
    height={15}
    viewBox="0 0 7 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M5.62518 10.6283L0.625 5.62816L5.62818 0.625"
      stroke="#2A2A2A"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default BackSvg;
