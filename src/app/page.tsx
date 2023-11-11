'use client';

import { Button } from '@mui/material';
import spotifyApi, { SpotifyProfileReturnType } from '../apisExternal/spotify';
import { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { useSpotifyApi } from '@/utils/hooks/useSpotifyApi';
import { spotifyDataEndpoints } from '@/utils/applicationConstants';
import styles from './global.module.scss';
import ProfileWidget from './_components/_profileWidget/ProfileWidget';

const Home = () => {
    const { data, loading, error } = useSpotifyApi<SpotifyProfileReturnType>(spotifyDataEndpoints.getUserProfileData, {
        method: 'GET' 
    });

    // useEffect(() => {
    //     if (!data) {
    //         return;
    //     }
    //     else {
    //         console.log(data, 'check');
    //     }
    // }, [data]);

    return (
        <div className={styles.layout_login_block}>
            <h1>Musicart</h1>
            <h2> Leveraging your music data to create personalized art. {data && 'Is this you?'}</h2>
            {loading && <CircularProgress />}
            {!data && !loading && <Button variant="outlined" onClick={() => {
                console.log('button click!');
                spotifyApi.redirectToSpotifyAuthorizationFlow();
            }}>Get started</Button>}
            {data && <ProfileWidget profileData={data} />}
        </div>
    );
};

export default Home;