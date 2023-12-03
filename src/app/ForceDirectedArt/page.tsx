'use client';

import { spotifyDataEndpoints } from '@/utils/applicationConstants';
import { useSpotifyApi } from '@/utils/hooks/useSpotifyApi';
import { Artist } from '@spotify/web-api-ts-sdk';
import * as d3 from 'd3';
import { useEffect } from 'react';
import Circle from '../_components/_circle/Circle';

const ForceDirectedArt = () => {
    const { data, loading, error } = useSpotifyApi<{items: Artist[]}>(spotifyDataEndpoints.getUsersTop.artist, {
        method: 'GET',
        params: {
            time_range: 'medium_term',
            limit: '20'
        }
    });
    const width = 700, height = 700;

    useEffect(() => {
        if (!data) {
            return;
        }
        const nodes: (Artist & d3.SimulationNodeDatum)[] = data.items.map((artist, i) => (
            { ...artist, index: i }
        ));
        
        /*
        */

        const update = () => {
            // Add nodes
            // d3.select('svg')
            //     .selectAll('circle')
            //     .data(nodes)
            //     .join('circle')
            //     .attr('r', (d) => {
            //         return d.popularity / 2;
            //     })
            //     .attr('fill', 'orange')
            //     .attr('cx', (d) => {
            //         return d.x ?? width / 2;
            //     })
            //     .attr('cy', (d) => {
            //         return d.y ?? height / 2;
            //     });
            d3.select('svg')
                .selectAll('image')
                .data(nodes)
                .join('image')
                .attr('width', (d) => d.popularity / 2)
                .attr('height', (d) => d.popularity / 2)
                .attr('x', (d) => {
                    return d.x ?? width / 2;
                })
                .attr('y', (d) => {
                    return d.y ?? height / 2;
                })
                .attr('xlink:href', (d) => d.images[0].url);




                
            /*
            nodeEnter.append("svg:image")
                .attr('x', -9)
                .attr('y', -12)
                .attr('width', 20)
                .attr('height', 24)
                .attr("xlink:href", "resources/images/check.png")

            */

            // Add text to each circle node
            d3.select('svg')
                .selectAll('text')
                .data(nodes)
                .join('text')
                .attr('text-anchor', 'middle')
                .attr('stroke', 'white')
                .attr('fill', 'white')
                .attr('stroke-width', '1px')
                .attr('alignment-baseline', 'middle')
                .attr('lengthAdjust', 'spacingAndGlyphs')
                .attr('font-size', (d) => 14)
                .attr('font-weight', '200')
                .attr('x', (d) => d.x!)
                .attr('y', (d) => d.y!)
                .attr('textLength', (d) => d.popularity * .7)
                .text((d) => d.name);

        };

        const simulation = d3.forceSimulation<(Artist & d3.SimulationNodeDatum)>(nodes)
            .force('charge', d3.forceManyBody().strength(-10))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collide', d3.forceCollide<(Artist & d3.SimulationNodeDatum)>().radius((d) => {return d.popularity / 2;}))
            .on('tick', update);

    }, [data]);


    return (
        <div>
            <svg width={width} height={height}/>
        </div>
    );
};
 
export default ForceDirectedArt;