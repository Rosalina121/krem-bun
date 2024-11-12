import * as React from "react";
import type { SVGProps } from "react";
const SvgAudioStreamPlayer = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    width={16}
    height={16}
    viewBox="0 0 2.4 2.4"
    {...props}
  >
    <path
      fill="#e0e0e0"
      d="M1.252.15a.1.1 0 0 0-.082.03L.6.75H.318C.225.75.15.817.15.9v.6c0 .083.075.15.168.15H.6l.57.57c.066.067.18.02.18-.074V.256A.106.106 0 0 0 1.252.15"
      paintOrder="markers stroke fill"
    />
    <path
      fill="none"
      stroke="#e0e0e0"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={0.165}
      d="M1.575.675c.45.525 0 1.05 0 1.05m.3-1.35c.675.825 0 1.65 0 1.65"
      paintOrder="markers stroke fill"
    />
  </svg>
);
export default SvgAudioStreamPlayer;
