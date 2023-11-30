'use client';

import { useEffect, useRef } from 'react';
import styles from './particleArt.module.scss';
import { Effect } from '@/utils/canvasConstructors';
import { useSpotifyApi } from '@/utils/hooks/useSpotifyApi';
import { spotifyDataEndpoints } from '@/utils/applicationConstants';

const ParticleArt = () => {
    const canvas = useRef<HTMLCanvasElement>(null);
    const width = 550;
    const height = 550; 

    const { data, loading, error } = useSpotifyApi<{items: {genres: string[]}[]}>(spotifyDataEndpoints.getUsersTop.artist, {
        method: 'GET',
        params: {
            time_range: 'medium_term'
        }
    });


    useEffect(() => {
        if (!canvas.current || !data) {
            return;
        }
        const genres = data.items.map((artist) => {
            return artist.genres;
        });
        console.log(genres, 'hji');
        const context = canvas.current.getContext('2d')!;

        const effect = new Effect(width, height);

        const animate = () => {
            context.clearRect(0, 0, width, height);
            effect.render(context);
            requestAnimationFrame(animate);
        };
        animate();

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