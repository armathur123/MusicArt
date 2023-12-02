import * as d3 from 'd3';
import { useEffect, useRef } from 'react';


interface ICircleProps {
    cx: number;
    cy: number;
    radius: number;
    label?: string;
}

const Circle: React.FC<ICircleProps> = ({ cx, cy, radius, label }: ICircleProps) => {

    const circleSvgRef = useRef<SVGCircleElement>(null);
    // const colors = ['#FF6F26', '#D54C00', '#D54C00', '#AD2800', '#860000', '#630000'];

    return <>
        <circle ref={circleSvgRef} cx={cx} cy={cy} radius={radius} />   
        <text x={cx} y={cy} 
            text-anchor="middle"
            stroke="red"
            stroke-width="1px"
            alignment-baseline="middle"
        > 
            {label}
        </text>
    </>;
};
 
export default Circle;