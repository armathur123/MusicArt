import * as d3 from 'd3';
import { useEffect, useRef } from 'react';


interface ICircleProps {
    circleCenterX: number;
    circleCenterY: number;
}

const Circle: React.FC<ICircleProps> = ({ circleCenterX, circleCenterY }: ICircleProps) => {

    const circleSvgRef = useRef(null);
    const colors = ['#FF6F26', '#D54C00', '#D54C00', '#AD2800', '#860000', '#630000'];
    
    useEffect(() => {

        const svg = d3.select(circleSvgRef.current)
            .attr('width', 200)
            .attr('height', 200);

        svg
            .append('circle')
            .attr('cx', `${circleCenterX}`) // circle center x
            .attr('cy', `${circleCenterY}`) // circle center y
            .attr('r', 30)
            .style('fill', 'green');

        // Clean up function
        return () => {
            svg.selectAll('circle').remove();
        };
        
    }, []);

    return <svg ref={circleSvgRef}></svg>
    ;
};
 
export default Circle;