'use client';

import { spotifyDataEndpoints } from '@/utils/applicationConstants';
import { useSpotifyApi } from '@/utils/hooks/useSpotifyApi';
import { useEffect } from 'react';


const SpotifyArt = () => {

    // const { data, loading, error } = useSpotifyApi(spotifyDataEndpoints.getUsersTop, {
    //     method: 'GET',
    //     body: new URLSearchParams({
    //         type: 'tracks'
    //     })
    // });

    // useEffect(() => {
    //     console.log(data, 'top track data');
    // }, [data]);

    return (
        <div>
            <p>hi</p>
        </div> 
    );
};
 
export default SpotifyArt;