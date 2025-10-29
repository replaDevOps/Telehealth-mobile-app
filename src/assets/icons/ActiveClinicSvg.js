import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
const FClinicSvg = ({ fill, ...props }) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M2.35105 13.214C1.99805 10.916 1.82105 9.768 2.25605 8.749C2.69005 7.731 3.65405 7.034 5.58105 5.641L7.02105 4.6C9.41805 2.867 10.6171 2 12.0001 2C13.3831 2 14.5821 2.867 16.9791 4.6L18.4191 5.641C20.3461 7.034 21.3091 7.731 21.7441 8.749C22.1781 9.768 22.0021 10.916 21.6491 13.213L21.3481 15.173C20.8481 18.429 20.5971 20.057 19.4291 21.029C18.2611 22.001 16.5541 22 13.1391 22H10.8601C7.44505 22 5.73805 22 4.57005 21.029C3.40205 20.057 3.15205 18.429 2.65105 15.172L2.35105 13.214Z"
      fill="#7625D7"
    />
    <Path
      d="M12 10V16M9 13H15"
      stroke="white"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);
export default FClinicSvg;
