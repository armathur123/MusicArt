'use client';

import { spotifyDataEndpoints } from '@/utils/applicationConstants';
import { useSpotifyApi } from '@/utils/hooks/useSpotifyApi';
import { Artist } from '@spotify/web-api-ts-sdk';
import * as d3 from 'd3';
import { useEffect } from 'react';
import Circle from '../_components/_circle/Circle';

type ArtistNodeType = (Artist & d3.SimulationNodeDatum);

const ForceDirectedArt = () => {
    const { data, loading, error } = useSpotifyApi<{items: Artist[]}>(spotifyDataEndpoints.getUsersTop.artist, {
        method: 'GET',
        params: {
            time_range: 'medium_term',
            limit: '10'
        }
    });
    const width = 900, height = 900;

    useEffect(() => {
        if (!data) {
            return;
        }

        const svg = d3.select('svg');
        const artists = data.items;

        const nodes: (Artist & d3.SimulationNodeDatum)[] = artists.map((artist, i) => (
            { ...artist, index: i }
        ));
        const links: (d3.SimulationLinkDatum<ArtistNodeType> & {commonGenres: string[]})[] = [];
        
        // Could create a hashmap to track 'sourcetargets: commonGenres' that have already been compared; if they've been compared, just grab their common genre, flip source and target and add it in
        const connectionCache: {[key: string]: string[] | undefined;} = {};
        for (let i = 0; i < artists.length; i++) {
            for (let j= 0; j < artists.length; j++) {
                if (i === j) { // No need to compare artists against themselves
                    continue;
                }
                const sortedIDs = [artists[i].id, artists[j].id].sort();
                const connectionCacheKey = `${sortedIDs[0]}_${sortedIDs[1]}`;
                const connectionCacheValue = connectionCache[connectionCacheKey];

                if (connectionCacheValue) { // There is a cached connection, no need to duplicate it
                    continue;
                }
                const commonGenres = artists[i].genres.filter((genre) => artists[j].genres.includes(genre));
                const isCommonGenresEmpty = commonGenres.length === 0;
                connectionCache[connectionCacheKey] = isCommonGenresEmpty ? undefined : commonGenres;
                if (!isCommonGenresEmpty) {
                    links.push({ source: artists[i].id, target: artists[j].id, commonGenres: commonGenres });
                }
            }
        }

        const linkNodes = svg
            .selectAll('line')
            .data(links)
            .join('line')
            .attr('stroke', 'white')
            .attr('stroke-opacity', 0.6)      
            .attr('stroke-width', d => (d.commonGenres.length ** 2));

        const showTextOnNode = (show: boolean, id: string) => {
            const transition = d3.transition()
                .duration(500)
                .ease(d3.easeLinear);

            if (show) {
                d3.select('#text' + id)
                    .transition(transition)
                    .style('opacity', '1');
            }
            else {
                d3.select('#text' + id)
                    .transition(transition)
                    .style('opacity', '0');
            }
        };

        const artistNodes = svg
            .selectAll('image')
            .data(nodes)
            .join('image')
            .attr('id', d => 'node' + d.id)
            .attr('width', (d) => d.popularity * 1.4)
            .attr('height', (d) => d.popularity * 1.4)
            .attr('xlink:href', (d) => d.images[0].url)
            .attr('style', 'clip-path: circle(40%);')
            .attr('transform', (d) => `translate(-${d.popularity * 1.4 / 2}, -${d.popularity * 1.4 / 2})`)
            .on('mouseover', (event, d) => {
                // how to select 'this' with anonymous arrow function :)
                // d3.select(event.target).transition()
                //     .duration(50)
                //     .attr('opacity', ''); 

                showTextOnNode(true, d.id);
                // const connectionCacheKeys = Object.keys(connectionCache);
                // for (const connectionCacheKey of connectionCacheKeys) {
                //     const containsID = connectionCacheKey.
                // }
                // show links only on hover || hide other links on hover ?
            })
            .on('mouseout', (event, d) => {
                showTextOnNode(false, d.id);
            });

            
        const textNodes = svg
            .selectAll('text')
            .data(nodes)
            .join('text')
            .attr('id', d => 'text' + d.id)
            .text((d) => d.name)
            .attr('text-anchor', 'middle')
            .attr('stroke', 'white')
            .attr('fill', 'white')
            .attr('stroke-width', '1px')
            .attr('alignment-baseline', 'middle')
            .attr('lengthAdjust', 'spacingAndGlyphs')
            .style('font-size', (d) => 14)
            .style('font-weight', '200')
            .style('textLength', (d) => d.popularity * .7)
            .style('opacity', '0')
            .on('mouseover', (event, d) => {
                showTextOnNode(true, d.id);
            })
            .on('mouseout', (event, d) => {
                showTextOnNode(false, d.id);
            });

            
        const update = () => {
            artistNodes
                .attr('x', (d) => {
                    return d.x ?? width / 2;
                })
                .attr('y', (d) => {
                    return d.y ?? height / 2;
                });

            // Add text to each circle node
            textNodes
                .attr('x', (d) => d.x!)
                .attr('y', (d) => d.y!);

            linkNodes
                .attr('x1', (d: any) => d.source.x!)
                .attr('y1', (d: any) => d.source.y!)
                .attr('x2', (d: any) => d.target.x!)
                .attr('y2', (d: any) => d.target.y!);
    

        };

        const simulation = d3.forceSimulation<ArtistNodeType>(nodes)
            .force('link', d3.forceLink<ArtistNodeType, d3.SimulationLinkDatum<ArtistNodeType>>(links).id((d) => d.id))
            .force('center', d3.forceCenter(width / 2, height / 2))
            // .force('charge', d3.forceManyBody().strength(-5))
            .force('collide', d3.forceCollide<(Artist & d3.SimulationNodeDatum)>().radius((d) => {return d.popularity * .8;}))
            //custom force to keep stuff within the boundaries (not sure if this is necessary, look into it)
            .on('tick', update);

    }, [data]);


    return (
        <div>
            <svg width={width} height={height}/>
        </div>
    );
};
 
export default ForceDirectedArt;