import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath, Rect } from 'react-native-svg';
/* SVGR has dropped some elements not supported by react-native-svg: filter */
const FHomeSvg = ({ fill, ...props }) => (
  <Svg
    width={28}
    height={28}
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <G clipPath="url(#clip0_1382_28183)" filter="url(#filter0_d_1382_28183)">
      <G filter="url(#filter1_d_1382_28183)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4.33537 9.87495C3.79491 11.0023 3.98463 12.3208 4.36407 14.9579L4.64284 16.8952C5.13025 20.2827 5.37396 21.9764 6.54903 22.9882C7.72409 24 9.44737 24 12.8939 24H15.1061C18.5526 24 20.2759 24 21.451 22.9882C22.626 21.9764 22.8697 20.2827 23.3572 16.8952L23.6359 14.9579C24.0154 12.3208 24.2051 11.0023 23.6646 9.87495C23.1242 8.7476 21.9738 8.06234 19.6731 6.69181L18.2882 5.86687C16.199 4.62229 15.1543 4 14 4C12.8457 4 11.801 4.62229 9.71175 5.86687L8.32691 6.69181C6.02619 8.06234 4.87583 8.7476 4.33537 9.87495ZM10.2501 19.9998C10.2501 19.5856 10.5859 19.2498 11.0001 19.2498H17.0001C17.4143 19.2498 17.7501 19.5856 17.7501 19.9998C17.7501 20.414 17.4143 20.7498 17.0001 20.7498H11.0001C10.5859 20.7498 10.2501 20.414 10.2501 19.9998Z"
          fill="#7625D7"
        />
      </G>
    </G>
    <Defs>
      <ClipPath id="clip0_1382_28183">
        <Rect width={24} height={24} fill="white" transform="translate(4 2)" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default FHomeSvg;
