import * as React from 'react';
import Svg, { G, Path } from 'react-native-svg';

function SvgMapMarker(props) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={512}
      height={512}
      viewBox="0 0 490 490"
      {...props}
    >
      <G xmlns="http://www.w3.org/2000/svg">
        <Path
          d="M0 15.541h490L244.991 474.459 0 15.541z"
          fill="#6ca9ff"
          data-original="#000000"
        />
      </G>
    </Svg>
  );
}

export default SvgMapMarker;
