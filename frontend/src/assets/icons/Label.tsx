import * as React from "react";
import type { SVGProps } from "react";
const SvgLabel = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} {...props}>
    <path
      fill="currentColor"
      d="M6 3a1 1 0 0 0-.707.293l-4 4a1 1 0 0 0 0 1.414l4 4A1 1 0 0 0 6 13h8a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM5 7a1 1 0 0 1 0 2 1 1 0 0 1 0-2"
    />
  </svg>
);
export default SvgLabel;
