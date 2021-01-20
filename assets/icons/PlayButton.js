import * as React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

function SvgPlayButton(props) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 487.622 487.622"
      {...props}
    >
      <Circle cx={243.811} cy={243.811} r={243.811} fill="#86af8c" />
      <Path
        d="M463.269 350.135L385.217 243.81l-228.67-83.98-3.145 47.647 68.068 109.309-68.068 60.864 91.947 109.952c95.879-.594 178.63-56.522 217.92-137.467z"
        opacity={0.37}
        fill="#86af8c"
      />
      <Path
        fill="#fff"
        d="M153.403 109.972v97.505h41.396v-25.803l107.624 62.136-107.624 62.137v-25.574h-41.396v97.277l231.814-133.84z"
      />
    </Svg>
  );
}

export default SvgPlayButton;
