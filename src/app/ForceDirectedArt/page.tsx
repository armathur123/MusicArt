'use client';

import { spotifyDataEndpoints } from '@/utils/applicationConstants';
import { useSpotifyApi } from '@/utils/hooks/useSpotifyApi';
import { Artist } from '@spotify/web-api-ts-sdk';
import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';
import Circle from '../_components/_circle/Circle';
import styles from './forceDirectArt.module.scss';

type ArtistNodeType = Artist & d3.SimulationNodeDatum & {radius: number}
type GenreLinksType = d3.SimulationLinkDatum<ArtistNodeType> & {commonGenres: string[]};
type D3ForceGraphElement<T> = d3.Selection<d3.BaseType | SVGTextElement, T, d3.BaseType, unknown>
type ConnectionCacheType = ( {[key: string]: string[] | undefined;})

const ForceDirectedArt = () => {
    const { data, loading, error } = useSpotifyApi<{items: Artist[]}>(spotifyDataEndpoints.getUsersTop.artist, {
        method: 'GET',
        params: {
            time_range: 'medium_term',
            limit: '20'
        }
    });

    const svgContainer = useRef<any>();
    const svg = d3.select('svg');

    const [width, setWidth] = useState<number>(0);
    const [height, setHeight] = useState<number>(0);

    const [nodeData, setNodeData] = useState<ArtistNodeType[]>();
    const [connectionCache, setConnectionCache] = useState<ConnectionCacheType>();
    const [simulation, setSimulation] = useState<d3.Simulation<ArtistNodeType, GenreLinksType>>();
    const [nodes, setNodes] = useState<D3ForceGraphElement<ArtistNodeType>>();
    const [nodeLabels, setNodeLabels] = useState<D3ForceGraphElement<ArtistNodeType>>();
    const [links, setLinks] = useState<D3ForceGraphElement<GenreLinksType>>();
    const [selectedArtist, setSelectedArtist] = useState<ArtistNodeType>();

    // This function calculates width and height of the container
    const getSvgContainerSize = () => {
        const newWidth = svgContainer.current.clientWidth;
        setWidth(newWidth);

        const newHeight = svgContainer.current.clientHeight;
        setHeight(newHeight);
    };

    const connectionCacheBuilder = (artists: Artist[]) => {
        const allLinks: GenreLinksType[] = [];
        // Could create a hashmap to track 'sourcetargets: commonGenres' that have already been compared; 
        // if they've been compared, just grab their common genre, flip source and target and add it in
        const connectionCache: ConnectionCacheType = {};
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

    // Custom force that keeps nodes within height / width constraints
    const checkBoundsForce = (width: number, height: number) =>  {
        let nodes: ArtistNodeType[] = [];
    
        const force: d3.Force<ArtistNodeType, d3.SimulationLinkDatum<ArtistNodeType>> = (alpha: number) => {
            const k = alpha * 1.5;
            for (let i = 0, n = nodes.length; i < n; ++i) {
                const node = nodes[i];
                const xPos = Math.floor(node.x!);
                const yPos = Math.floor(node.y!);
                if (node.x && node.vx && (xPos - (node.radius) < 0 || xPos + (node.radius) > width)) {
                    node.vx *= -1;
                    node.x += (node.vx + node.vx > 0 ? node.radius * -1 : node.radius) * k;
                }
                if (node.y && node.vy && (yPos - (node.radius) < 0 || yPos + (node.radius) > height)) {
                    node.vy *= -1;
                    node.y += (node.vy + node.vy > 0 ? node.radius * -1 : node.radius) * k;
                }
            }
        };
    
        force.initialize = (_nodes) => {
            nodes = _nodes;
        };
        
        return force;
    };

    const showTextOnNode = (show: boolean, id: string) => {
        const transition = d3.transition()
            .duration(500)
            .ease(d3.easeLinear);

        const labelID = `#label_${id}`;
        const nodeID = `#node_${id}`;

        if (show) {
            d3.select(labelID)
                .transition(transition)
                .style('opacity', '1');
            d3.select(nodeID)
                .transition(transition)
                .style('filter', 'brightness(70%)');
        }
        else {
            d3.select(labelID)
                .transition(transition)
                .style('opacity', '0');
            
            d3.select(nodeID)
                .transition(transition)
                .style('filter', 'brightness(100%)');
        }
    };

    // Runs on every tick of simulation animation; update nodes / links position
    const update = (artistNodes: D3ForceGraphElement<ArtistNodeType>, textNodes: D3ForceGraphElement<ArtistNodeType>, linkNodes?: D3ForceGraphElement<GenreLinksType>) => {

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
    

    const generateNodeLinksByGenre = (d: ArtistNodeType, simulation: d3.Simulation<ArtistNodeType, GenreLinksType>, connectionCache: ConnectionCacheType) => {
        console.log('clicked', selectedArtist?.id, d.id);

        //this doesn't work, not tracking state changes for some reason. I think that its catching an old reference to the state? idk
        if (!selectedArtist || selectedArtist.id !== d.id) { 
            // console.log(selectedArtistID, d.id);
            // console.log('wut', selectedArtistID !== d.id);
            const linkData: GenreLinksType[] = [];
            simulation.stop();
            setSelectedArtist(() => d);

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
                    return enter
                        .append('line')
                        .attr('id', (d: GenreLinksType) => `${d.source}_${d.target}`)
                        // .transition()
                        // .duration(950)
                        .style('stroke', 'white ')
                        .style('stroke-opacity', 0.6);

                },
                (update) => {
                    return update;
                },
                (exit) => {
                    return exit.remove();
                });                         

            // Update and restart simulation
            (simulation.force('link') as d3.ForceLink<ArtistNodeType, GenreLinksType>).links(linkData);

            const nodes: d3.Selection<d3.BaseType, ArtistNodeType, d3.BaseType, unknown> = d3.select('#nodes').selectAll('image');
            const text: d3.Selection<d3.BaseType, ArtistNodeType, d3.BaseType, unknown> = d3.select('#nodeLabels').selectAll('text');        

            // Maybe add a force that centers selected node?
            simulation
                .on('tick', () => update(nodes, text, linkNodesJoined))
                .alpha(.05)
                .restart();
        }
    };

    // Scales (Domain is the scale of values to pass in; range is the scale of values that will be output)
    const getScaledDimensionValue = (value: number, domain: number[], dimensionScale: number): number => {
        const scale = d3.scaleLinear().domain(domain).range([0, Math.min(width * dimensionScale, height * dimensionScale)]);
        return scale(value);
    };
    
    // Resize logic
    useEffect(() => {
        getSvgContainerSize();
        // listen for resize changes, and detect dimensions again when they change
        window.addEventListener('resize', getSvgContainerSize);
        return () => window.removeEventListener('resize', getSvgContainerSize);
    }, []);

    useEffect(() => {
        if (!data || !height || !width) {
            return;
        }
        // Remove all elements in svg before redrawing
        d3.selectAll('svg > *').remove();

        // Add group element for text, nodes, links; order determines what shows first
        svg.append('g')
            .attr('id', 'links');
        svg.append('g')
            .attr('id', 'nodes');
        svg.append('g')
            .attr('id', 'nodeLabels');

        const artists = data.items;
        const nodeDataInit: ArtistNodeType[] = artists.map((artist, i) => (
            { ...artist, index: i, radius: getScaledDimensionValue(artist.popularity, [0, 100], .2) }
        ));

        const { connectionCache, allLinks } = connectionCacheBuilder(artists);


        // Set up simulation forces
        const simulationInit: d3.Simulation<ArtistNodeType, GenreLinksType> = d3.forceSimulation<ArtistNodeType>(nodeDataInit)
            .force('charge', d3.forceManyBody().strength(30))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collide', d3.forceCollide<ArtistNodeType>().radius((d) => {return d.radius / 2;}))
            .force('link', d3.forceLink<ArtistNodeType, d3.SimulationLinkDatum<ArtistNodeType>>().id((d) => d.id).strength(.5))
            .force('bounds', checkBoundsForce(width, height))
            .force('x', d3.forceX(width / 2).strength(.1))
            .force('y', d3.forceY(height / 2).strength(.1))
            .on('tick', () => update(artistNodesInit, artistNodeLabels));


        const artistNodesInit = svg
            .select('#nodes')
            .selectAll('image')
            .data(nodeDataInit)
            .join('image')
            .attr('id', d => `node_${d.id}`)
            .attr('width', (d) => d.radius)
            .attr('height', (d) => d.radius)
            .attr('xlink:href', (d) => d.images[0].url)
            .attr('style', 'clip-path: circle(40%);')
            .attr('transform', (d) => `translate(-${d.radius / 2}, -${d.radius / 2})`)
            .on('mouseover', (event, d) => {
                // how to select 'this' with anonymous arrow function :)
                // d3.select(event.target).transition()
                //     .duration(50)
                //     .attr('opacity', ''); 

                showTextOnNode(true, d.id);
            })
            .on('mouseout', (event, d) => {
                showTextOnNode(false, d.id);
            });

            
        const artistNodeLabels = svg
            .select('#nodeLabels')
            .selectAll('text')
            .data(nodeDataInit)
            .join('text')
            .attr('id', d => `label_${d.id}`)
            .attr('text-anchor', 'middle')
            .attr('stroke', 'white')
            .attr('fill', 'white')
            // .attr('stroke-width', '1px')
            .attr('alignment-baseline', 'middle')
            .attr('lengthAdjust', 'spacingAndGlyphs')
            // .attr('font-weight', (d) => getScaledDimensionValue(d.radius, [0, 100], .02))
            .style('letter-spacing', 1.3)
            .style('opacity', '0')
            .style('font-size', (d) =>  getScaledDimensionValue(d.popularity, [0, 100], .03))
            .style('textLength', (d) => d.popularity)
            .text((d) => d.name)

            .on('mouseover', (event, d) => {
                showTextOnNode(true, d.id);
            })
            .on('mouseout', (event, d) => {
                showTextOnNode(false, d.id);
            });

        setConnectionCache(connectionCache);
        setNodeData(nodeDataInit);
        setSimulation(simulationInit);
        setNodes(artistNodesInit);
        setNodeLabels(artistNodeLabels);

    }, [data, width, height]);

    useEffect(() => {
        if (!nodeData || !simulation || !connectionCache || !nodes) {
            return;
        }
        
        console.log(selectedArtist, 'changeds');

        nodes
            .on('click', (event, d) => generateNodeLinksByGenre(d, simulation, connectionCache));

    }, [simulation, nodeData, connectionCache, selectedArtist]);


    return (
        <div ref={svgContainer} className={styles.spotify_art_container}>
            <svg width={width} height={height}/>
        </div>
    );
};
 
export default ForceDirectedArt;