import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
const ShopingCartSvg = props => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M8.92883 16.25C8.92883 16.9403 8.35325 17.5 7.64313 17.5C6.93305 17.5 6.35742 16.9403 6.35742 16.25"
      stroke="#2A2A2A"
      strokeWidth={1.25}
      strokeLinecap="round"
    />
    <Path
      d="M14.0721 16.25C14.0721 16.9403 13.4965 17.5 12.7864 17.5C12.0763 17.5 11.5007 16.9403 11.5007 16.25"
      stroke="#2A2A2A"
      strokeWidth={1.25}
      strokeLinecap="round"
    />
    <Path
      d="M2.92858 5L4.13428 11.4462C4.37766 12.7473 4.49934 13.3979 4.96229 13.7823C5.42524 14.1667 6.08709 14.1667 7.4108 14.1667H13.0182C14.3419 14.1667 15.0038 14.1667 15.4668 13.7823C15.9298 13.3978 16.0514 12.7473 16.2947 11.446L16.7622 8.946C17.104 7.11793 17.2749 6.20391 16.7751 5.60195C16.2752 5 15.3453 5 13.4856 5H2.92858ZM2.92858 5L2.5 2.5"
      stroke="#2A2A2A"
      strokeWidth={1.25}
      strokeLinecap="round"
    />
  </Svg>
);
export default ShopingCartSvg;
