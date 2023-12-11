'use client';

import { spotifyDataEndpoints } from '@/utils/applicationConstants';
import { useSpotifyApi } from '@/utils/hooks/useSpotifyApi';
import { Artist } from '@spotify/web-api-ts-sdk';
import * as d3 from 'd3';
import { useEffect } from 'react';
import Circle from '../_components/_circle/Circle';

type ArtistNodeType = (Artist & d3.SimulationNodeDatum);
type GenreLinksType = (d3.SimulationLinkDatum<ArtistNodeType> & {commonGenres: string[]});

const ForceDirectedArt = () => {
    const { data, loading, error } = useSpotifyApi<{items: Artist[]}>(spotifyDataEndpoints.getUsersTop.artist, {
        method: 'GET',
        params: {
            time_range: 'medium_term',
            limit: '10'
        }
    });
    const width = 900, height = 900;

    const connectionCacheBuilder = (artists: Artist[]) => {
        const allLinks: GenreLinksType[] = [];
        // Could create a hashmap to track 'sourcetargets: commonGenres' that have already been compared; 
        // if they've been compared, just grab their common genre, flip source and target and add it in
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
                    allLinks.push({ source: artists[i].id, target: artists[j].id, commonGenres: commonGenres });
                }
            }
        }
        return { connectionCache, allLinks };
    };

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


    useEffect(() => {
        if (!data) {
            return;
        }

        const svg = d3.select('svg');
        // Add group element for text, nodes, links; order determines what shows first
        svg.append('g').attr('id', 'links');
        svg.append('g').attr('id', 'nodes');
        svg.append('g').attr('id', 'nodeLabels');

        const artists = data.items;
        const nodeData: (Artist & d3.SimulationNodeDatum)[] = artists.map((artist, i) => (
            { ...artist, index: i }
        ));

        const { connectionCache, allLinks } = connectionCacheBuilder(artists);

        // Runs on every tick of simulation animation; update nodes / links position
        const update = (linkNodes?: d3.Selection<d3.BaseType, GenreLinksType, d3.BaseType, unknown>) => {
            console.log('update');
            artistNodes
                .attr('x', (d) => {
                    return d.x ?? width / 2;
                })
                .attr('y', (d) => {
                    return d.y ?? height / 2;
                });

            textNodes
                .attr('x', (d) => d.x!)
                .attr('y', (d) => d.y!);

            if (linkNodes) {
                linkNodes
                    .attr('x1', (d) => (d.source as ArtistNodeType).x!)
                    .attr('y1', (d) => (d.source as ArtistNodeType).y!)
                    .attr('x2', (d) => (d.target as ArtistNodeType).x!)
                    .attr('y2', (d) => (d.target as ArtistNodeType).y!);
            }
        };

        const simulation = d3.forceSimulation<ArtistNodeType>(nodeData)
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('charge', d3.forceManyBody().strength(30))
            .force('collide', d3.forceCollide<(Artist & d3.SimulationNodeDatum)>().radius((d) => {return d.popularity * .8;}))
            .force('link', d3.forceLink<ArtistNodeType, d3.SimulationLinkDatum<ArtistNodeType>>().id((d) => d.id))
            //TODO: Add a custom force to keep stuff within the boundaries
            .on('tick', update);


        const artistNodes = svg
            .select('#nodes')
            .selectAll('image')
            .data(nodeData)
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
            })
            .on('mouseout', (event, d) => {
                showTextOnNode(false, d.id);
            })
            .on('click', (event, d) => {
                const linkData: GenreLinksType[] = [];
                simulation.stop();

                const connectionCacheKeys: string[] = Object.keys(connectionCache);
                for (const connectionCacheKey of connectionCacheKeys) {
                    const containsID = connectionCacheKey.includes(d.id);
                    const commonGenres = connectionCache[connectionCacheKey];
                    if (containsID && commonGenres) {
                        const targetID = connectionCacheKey.split('_').find((value) => value !== d.id);
                        linkData.push({ source: d.id, target: targetID!, commonGenres: commonGenres });
                    }
                }

                const linkNodesWithData = svg
                    .select('#links')
                    .selectAll('line')
                    .data<GenreLinksType>(linkData);
                    
                const linkNodesJoined = linkNodesWithData
                    .join((enter) => {
                        console.log(enter, 'enter');
                        return enter
                            .append('line')
                            .attr('id', d => `${d.source}_${d.target}`)
                            .attr('stroke', 'white ')
                            .attr('stroke-opacity', 0.6);
                    },
                    (update) => {
                        console.log(update, 'update');
                        return update;
                    },
                    (exit) => {
                        console.log(exit, 'exit');
                        return exit.remove();
                    });

                // Update and restart simulation
                (simulation.force('link') as d3.ForceLink<ArtistNodeType, GenreLinksType>).links(linkData);
                simulation
                    .on('tick', () => update(linkNodesJoined))
                    .alpha(.3)
                    .restart();
    
            });

            
        const textNodes = svg
            .select('#nodeLabels')
            .selectAll('text')
            .data(nodeData)
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
        
    }, [data]);


    return (
        <div>
            <svg width={width} height={height}/>
        </div>
    );
};
 
export default ForceDirectedArt;