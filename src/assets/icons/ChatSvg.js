import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
const ChatSvg = props => (
  <Svg
    width={26}
    height={26}
    viewBox="0 0 26 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M23.4667 18.1345C23.4667 18.7003 23.2419 19.2429 22.8418 19.643C22.4417 20.0431 21.8991 20.2678 21.3333 20.2678H7.2832C6.71745 20.268 6.17492 20.4928 5.77493 20.8929L3.42613 23.2417C3.32022 23.3476 3.18528 23.4197 3.03839 23.4489C2.89149 23.4781 2.73923 23.4631 2.60086 23.4058C2.46249 23.3485 2.34421 23.2515 2.261 23.1269C2.17778 23.0024 2.13335 22.856 2.13333 22.7062V5.33451C2.13333 4.76871 2.35809 4.22609 2.75817 3.82601C3.15825 3.42593 3.70087 3.20117 4.26666 3.20117H21.3333C21.8991 3.20117 22.4417 3.42593 22.8418 3.82601C23.2419 4.22609 23.4667 4.76871 23.4667 5.33451V18.1345Z"
      stroke="#424242"
      strokeWidth={2.13333}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12.8 11.7344H12.8107"
      stroke="#424242"
      strokeWidth={2.13333}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M17.0667 11.7344H17.0773"
      stroke="#424242"
      strokeWidth={2.13333}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8.53333 11.7344H8.544"
      stroke="#424242"
      strokeWidth={2.13333}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default ChatSvg;
