import * as React from "react";
import type { SVGProps } from "react";
const SvgNodeUi = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} {...props}>
    <circle
      cx={8}
      cy={8}
      r={5}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    />
  </svg>
);
export default SvgNodeUi;
