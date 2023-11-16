'use client';

import { spotifyDataEndpoints } from '@/utils/applicationConstants';
import { useSpotifyApi } from '@/utils/hooks/useSpotifyApi';
import { MutableRefObject, useEffect, useRef } from 'react';
import styles from './spotifyArt.module.scss';
import HeartSvg from '../../../public/heart.svg';
import * as d3 from 'd3';
import Circle from '../_components/_circle/Circle';
import Image from 'next/image';


const SpotifyArt = () => {

    // const { data, loading, error } = useSpotifyApi(spotifyDataEndpoints.getUsersTop, {
    //     method: 'GET',
    //     params: {
    //         time_range: 'medium_term'
    //     }
    // });
    const canvas = useRef<any>();
    const circleImageRef = useRef<any>();

    const width = 550;
    const height = 550; 
    
    var customBase = document.createElement('custom');
    var custom = d3.select(customBase);


    // Settings for a grid with 10 cells in a row,
    // 100 cells in a block and 1000 cells in a row.
    var groupSpacing = 4;
    var cellSpacing = 2;
    var offsetTop = height / 5;
    var cellSize = Math.floor((width - 5 * groupSpacing) / 100) - cellSpacing;


    const databind = (data: number[]) => {
        //https://www.datamake.io/blog/d3-canvas-full
        // This is your SVG replacement and the parent of all other elements:
        const colourScale = d3.scaleSequential(d3.extent(data, (d) => d) as [number, number], d3.interpolateSpectral);
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

    const getSvgCanvasPath = (svgPath: string, context: CanvasRenderingContext2D) => {
        // need to figure out how to get these from the svg path...
        const radiusWidth = 32; 
        const radiusHeight = 50;
        const scaleMultiplier = 11;
        let svgToCanvasPath = new Path2D(svgPath); // create canvas path from svg path
        // https://www.w3schools.com/jsref/canvas_transform.asp
        const transformationMatrix = {
            a: scaleMultiplier,                                             // Scales the drawing horizontally	
            b: 0,                                                           // Skew the the drawing horizontally
            c: 0,                                                           // Skew the the drawing vertically
            d: scaleMultiplier,                                             // Scales the drawing vertically
            e: (width / 2) - radiusWidth * scaleMultiplier,                 // Moves the the drawing horizontally
            f: (height / 2) - radiusWidth * scaleMultiplier                 // Moves the the drawing vertically
        };
        const transformedPath = new Path2D();
        transformedPath.addPath(svgToCanvasPath, transformationMatrix);
        // context.strokeStyle = 'rgba(0,0,255, 0)';
        // context.globalCompositeOperation = 'source-over';
        context.stroke(transformedPath);
        return transformedPath;
    };

    const getCoordinatesInSvg = (transformedPath: Path2D, context: CanvasRenderingContext2D) => {
        const coordinatesInSvg: {x: number, y: number}[] = [];
        for (let x = 0; x <= width; x++) {
            for (let y = 0; y <= height; y++) {
                const isInPath = context.isPointInPath(transformedPath, x, y);
                if (isInPath) {
                    coordinatesInSvg.push({ x, y });
                }
            }
        }
        return coordinatesInSvg;
    };

    const draw = (svgPath: string) => {
        const context = canvas.current.getContext('2d');
        const transformedPath = getSvgCanvasPath(svgPath, context);
        const coordinatesInSvg = getCoordinatesInSvg(transformedPath, context);
        console.log(coordinatesInSvg, 'check');


        for (let i = 0; i < coordinatesInSvg.length; i += 200) {
            console.log(coordinatesInSvg[i]);
            context.beginPath();
            context.strokeStyle = '#ADD8E6';
            context.lineWidth = '.5';
            context.arc(coordinatesInSvg[i].x, coordinatesInSvg[i].y, 10, 0, 2 * Math.PI);
            context.stroke();
        }


        // Draw each individual custom element with their properties.
        var elements = custom.selectAll('custom.rect'); // Grab all elements you bound data to in the databind() function.
        elements.each(function (d, i) {
            // For each virtual/custom element...
            var node = d3.select(this); // This is each individual element in the loop.

            // Here you retrieve the colour from the individual in-memory node
            // and set the fillStyle for the canvas paint:
            context.fillStyle = node.attr('fillStyle');

            /*
                Create an array of arrays; index of primary array represents x coordinates, the array it accesses is full of y coordinates
            */
            // if (isIn) {
            //     context.arc(x, y, r, sAngle, eAngle, counterclockwise);
            // }
        });
    };
 
    useEffect(() => {
        canvas.current.width = width;
        canvas.current.height = height;
        

        // Build the custom elements in memory:
        databind(d3.range(5000));

        // Timer running the draw function repeatedly for 300 ms:
        var t = d3.timer((elapsed) => {
            draw('M35.45 15.44 32 19l-3.54-3.53A11.67 11.67 0 0 0 12 31.94l3.54 3.54 8.25 8.25L32 52l8.25-8.25 8.25-8.25 3.5-3.56a11.67 11.67 0 0 0-16.5-16.5z'); // temp hardcoded path
            if (elapsed > 300) t.stop();
        });

    });

    return (
        <div className={styles.spotify_art_container}>
            <div id="container">
                <canvas ref={canvas} />    
            </div>
        </div>
    );

};
 
export default SpotifyArt;