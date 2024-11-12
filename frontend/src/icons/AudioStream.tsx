import * as React from "react";
import type { SVGProps } from "react";
const SvgAudioStream = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} {...props}>
        <linearGradient
            id="a"
            x2="0"
            y1="1"
            y2="15"
            gradientUnits="userSpaceOnUse"
        >
            <stop offset="0" stopColor="#ff5f5f" />
            <stop offset=".5" stopColor="#e1da5b" />
            <stop offset="1" stopColor="#5fff97" />
        </linearGradient>
        <path
            fill="url(#a)"
            d="m12 2a-1 1 0 0 1 0 2a 8 8 0 0 0-8 8a-1 1 0 0 1-2 0a10 10 0 0 1 10-10zm0 4A-1 1 0 0 1 12 8a 4 4 0 0 0-4 4A-1 1 0 0 1 6 12a6 6 0 0 1 6-6zm0 4A-2 2 0 0 1 12 14A-2 2 0 0 1 12 10z"
        />
    </svg>
);
export default SvgAudioStream;
