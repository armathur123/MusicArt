'use client';

import Image from 'next/image';
import styles from './page.module.css';
import { Button } from '@mui/material';
import { redirectToSpotifyAuthorizationFlow, getAccessToken } from './apisExternal/authorizeSpotify';
import { useEffect, useState } from 'react';

const Home = () => {

    const [authorizationCode, setAuthorizationCode] = useState<string>();
    const [accessToken, setAccessToken] = useState<string>();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        if (!code) {
            return;
        }
        else {
            var url= document.location.href;
            window.history.pushState({}, '', url.split('?')[0]);
            setAuthorizationCode(code);         
        }
    });

    useEffect(() => {
        console.log(authorizationCode);
        if (!authorizationCode) {
            return;
        }
        else {
            async () => {
                const accessToken = await getAccessToken(authorizationCode);
                setAccessToken(accessToken);
            };
        }
    }, [authorizationCode]);

    return (
        <div>
            <h1>Musicart</h1>
            {!authorizationCode && <Button variant="contained" onClick={() => {
                console.log('login button pressed');
                redirectToSpotifyAuthorizationFlow();
            }}>Login to Spotify</Button>}
        </div>
    );
};

export default Home;