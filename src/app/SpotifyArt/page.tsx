'use client';

import { spotifyDataEndpoints } from '@/utils/applicationConstants';
import { useSpotifyApi } from '@/utils/hooks/useSpotifyApi';
import { MutableRefObject, useEffect, useRef } from 'react';
import styles from './spotifyArt.module.scss';
import HeartSvg from '../../../public/heart.svg';
import * as d3 from 'd3';
import Circle from '../_components/_circle/Circle';


const SpotifyArt = () => {

    // const { data, loading, error } = useSpotifyApi(spotifyDataEndpoints.getUsersTop, {
    //     method: 'GET',
    //     params: {
    //         time_range: 'medium_term'
    //     }
    // });
    const canvas = useRef<any>();
    const circleImageRef = useRef<any>();

    const data: {value: number}[] = [];
    d3.range(5000).forEach((el) => { data.push({ value: el }); });

    const width = 750;
    const height = 400; 
    
    var customBase = document.createElement('custom');
    var custom = d3.select(customBase);


    // Settings for a grid with 10 cells in a row,
    // 100 cells in a block and 1000 cells in a row.
    var groupSpacing = 4;
    var cellSpacing = 2;
    var offsetTop = height / 5;
    var cellSize = Math.floor((width - 11 * groupSpacing) / 100) - cellSpacing;


    const databind = (data: number[]) => {
        // This is your SVG replacement and the parent of all other elements:
        const colourScale = d3.scaleSequential(d3.interpolateSpectral);
        const join = custom.selectAll('custom.rect').data(data);
        var enterSel = join
            .enter()
            .append('custom')
            .attr('class', 'rect')
            .attr('x', (d, i) =>  {
                var x0 = Math.floor(i / 100) % 10, x1 = Math.floor(i % 10);
                return groupSpacing * x0 + (cellSpacing + cellSize) * (x1 + x0 * 10);
            })
            .attr('y', (d, i) => {
                var y0 = Math.floor(i / 1000), y1 = Math.floor(i % 100 / 10);
                return groupSpacing * y0 + (cellSpacing + cellSize) * (y1 + y0 * 10);
            })
            .attr('width', 0)
            .attr('height', 0);
        join
            .merge(enterSel)
            .transition()
            .attr('width', cellSize)
            .attr('height', cellSize)
            .attr('fillStyle', (d) => colourScale(d));
        const exitSel = join
            .exit()
            .transition()
            .attr('width', 0)
            .attr('height', 0)
            .remove();
    };

    const draw = () => {
        const context = canvas.current.getContext('2d');
        context.clearRect(0, 0, width, height);
        // Draw each individual custom element with their properties.
        var elements = custom.selectAll('custom.rect'); // Grab all elements you bound data to in the databind() function.
        elements.each(function (d, i) {
            // For each virtual/custom element...
            var node = d3.select(this); // This is each individual element in the loop.

            // Here you retrieve the colour from the individual in-memory node
            // and set the fillStyle for the canvas paint:
            context.fillStyle = node.attr('fillStyle');

            // Here you retrieve the position of the node and apply it to the
            // fillRect context function which will fill and paint the square:
            context.fillRect(node.attr('x'),
                node.attr('y'),
                node.attr('width'),
                node.attr('height'));
        });
    };
 
    useEffect(() => {
        canvas.current.width = width;
        canvas.current.height = height;

        // Build the custom elements in memory:
        databind(d3.range(1000));

        // Timer running the draw function repeatedly for 300 ms:
        var t = d3.timer((elapsed) => {
            draw();
            if (elapsed > 300) t.stop();
        });

    }, [data]);

    return (
        <div className={styles.spotify_art_container}>
            <div id="container">
                <canvas ref={canvas} />    
            </div>
            {/* <Circle circleCenterX={10} circleCenterY={10} />
            <canvas ref={canvas} className={styles.spotify_art_canvas}></canvas> */}
        </div>
    );

};
 
export default SpotifyArt;