import * as React from 'react';
import Svg, { Circle, G, Path } from 'react-native-svg';

function SvgStopButton(props) {
  return (
    <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58" {...props}>
      <Circle cx={29} cy={29} r={29} fill="#f57563" />
      <G fill="#fff">
        <Path d="M16 16h26v26H16z" />
        <Path d="M43 43H15V15h28v28zm-26-2h24V17H17v24z" />
      </G>
    </Svg>
  );
}

export default SvgStopButton;
