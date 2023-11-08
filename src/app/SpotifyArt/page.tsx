'use client';

import { spotifyDataEndpoints } from '@/utils/applicationConstants';
import { useSpotifyApi } from '@/utils/hooks/useSpotifyApi';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';


const SpotifyArt = () => {

    const { data, loading, error } = useSpotifyApi(spotifyDataEndpoints.getUsersTop, {
        method: 'GET',
        params: {
            time_range: 'medium_term'
        }
    });

    useEffect(() => {
        console.log(data, loading, error, 'check it son');
    }, [data]);

    const svgRef = useRef(null);

    useEffect(() => {
        const data = [8, 4, 6, 6, 4, 12];

        const svg = d3.select(svgRef.current)
            .append('svg')
            .attr('width', 600)
            .attr('height', 400);

        svg.selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
            .attr('x', (d, i) => i * 70)
            .attr('y', (d, i) => 300 - 10 * d)
            .attr('width', 65)
            .attr('height', (d, i) => d * 10)
            .attr('fill', 'blue');

        // Clean up function
        return () => {
            svg.selectAll('rect').remove();
        };
    }, []);

    return <div ref={svgRef}></div>;

};
 
export default SpotifyArt;