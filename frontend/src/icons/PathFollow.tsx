import * as React from "react";
import type { SVGProps } from "react";
const SvgPathFollow = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} {...props}>
    <path
      fill="currentColor"
      d="m13 0-3 4h1.947c-.138 1.32-.558 1.907-1.084 2.275-.644.451-1.713.606-2.963.73s-2.681.221-3.912 1.083c-.892.625-1.532 1.652-1.818 3.096a2 2 0 1 0 1.98.183c.193-.885.553-1.337.987-1.64.644-.451 1.713-.606 2.963-.73s2.681-.221 3.912-1.083c1.053-.737 1.755-2.032 1.937-3.914H16z"
    />
  </svg>
);
export default SvgPathFollow;
