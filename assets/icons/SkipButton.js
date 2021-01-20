import * as React from 'react';
import Svg, { Circle, Path, G } from 'react-native-svg';

function SvgSkipButton(props) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 487.622 487.622"
      {...props}
    >
      <Circle cx={243.811} cy={243.811} r={243.811} fill="#7cc5db" />
      <Circle cx={243.811} cy={243.811} r={243.811} fill="#7cc5db" />
      <Path
        d="M475.131 321.02l-87.407-77.209-139.921 4.932-42.822-72.153-88.975 113.324 182.562 191.53c83.055-19.061 149.913-80.545 176.563-160.424z"
        opacity={0.37}
        fill="#7cc5db"
      />
      <G fill="#fff">
        <Path d="M387.724 243.811l-139.76-84.379V328.19z" />
        <Circle cx={173.931} cy={243.811} r={74.033} />
      </G>
    </Svg>
  );
}

export default SvgSkipButton;
