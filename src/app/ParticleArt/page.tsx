'use client';

import { useEffect, useRef } from 'react';
import styles from './particleArt.module.scss';
import { ParticleEffect } from '@/utils/canvasConstructors';
import { useSpotifyApi } from '@/utils/hooks/useSpotifyApi';
import { spotifyDataEndpoints } from '@/utils/applicationConstants';
import { Artist } from '@spotify/web-api-ts-sdk';

const ParticleArt = () => {
    const canvas = useRef<HTMLCanvasElement>(null);
    const width = 650;
    const height = 650; 

    const { data, loading, error } = useSpotifyApi<{items: Artist[]}>(spotifyDataEndpoints.getUsersTop.artist, {
        method: 'GET',
        params: {
            time_range: 'medium_term',
            limit: '4'
        }
    });


    useEffect(() => {
        if (!canvas.current || !data) {
            return;
        }
        console.log(data, 'hji');
        const context = canvas.current.getContext('2d')!;

        const effect = new ParticleEffect(width, height, data.items);

        const animate = () => {
            context.clearRect(0, 0, width, height);
            effect.render(context);
            requestAnimationFrame(animate);
        };
        // animate();
        effect.render(context);

    }, [data]);

    return (
        <div className={styles.spotify_art_container}>
            <div id="container">
                <canvas width={width} height={height} ref={canvas} />    
            </div>
        </div>
    );
};
 
export default ParticleArt;