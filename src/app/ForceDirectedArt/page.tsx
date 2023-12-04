'use client';

import { spotifyDataEndpoints } from '@/utils/applicationConstants';
import { useSpotifyApi } from '@/utils/hooks/useSpotifyApi';
import { Artist } from '@spotify/web-api-ts-sdk';
import * as d3 from 'd3';
import { useEffect } from 'react';
import Circle from '../_components/_circle/Circle';

type ArtistLinkType = (Artist & d3.SimulationNodeDatum);

type ArtistNodeType = (Artist & d3.SimulationNodeDatum);

const ForceDirectedArt = () => {
    const { data, loading, error } = useSpotifyApi<{items: Artist[]}>(spotifyDataEndpoints.getUsersTop.artist, {
        method: 'GET',
        params: {
            time_range: 'medium_term',
            limit: '20'
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

        const artistNodes = svg
            .selectAll('image')
            .data(nodes)
            .join('image')
            .attr('width', (d) => d.popularity * 1.4)
            .attr('height', (d) => d.popularity * 1.4)
            .attr('xlink:href', (d) => d.images[0].url)
            .attr('style', 'clip-path: circle(40%);')
            .attr('transform', (d) => `translate(-${d.popularity * 1.4 / 2}, -${d.popularity * 1.4 / 2})`)
            .on('mouseover', function (event, d) {
                d3.select(this).transition()
                    .duration(50)
                    .attr('opacity', '.5');
            });

            
        const textNodes = svg
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
            .attr('textLength', (d) => d.popularity * .7)
            .text((d) => d.name);


        console.log(links);
            
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
                .attr('x1', d => d.source.x!)
                .attr('y1', d => d.source.y!)
                .attr('x2', d => d.target.x!)
                .attr('y2', d => d.target.y!);
    

        };

        const simulation = d3.forceSimulation<(Artist & d3.SimulationNodeDatum)>(nodes)
            .force('link', d3.forceLink<(Artist & d3.SimulationNodeDatum), {source: string, target: string}>(links).id((d) => d.id))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('charge', d3.forceManyBody().strength(-20))
            .force('collide', d3.forceCollide<(Artist & d3.SimulationNodeDatum)>().radius((d) => {return d.popularity * .8;}))
            .on('tick', update);

    }, [data]);


    return (
        <div>
            <svg width={width} height={height}/>
        </div>
    );
};
 
export default ForceDirectedArt;