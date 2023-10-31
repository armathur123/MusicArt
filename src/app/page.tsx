'use client';

import Image from 'next/image';
import styles from './page.module.css';
import { Button } from '@mui/material';
import spotifyApi from '../apisExternal/spotify';
import { useEffect, useState } from 'react';

const Home = () => {

    const [authorizationCode, setAuthorizationCode] = useState<string>();
    const [accessToken, setAccessToken] = useState<string>();
    const [userProfileData, setUserProfileData] = useState<Object>();

    //put all these useeffects into one hook
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
        if (!authorizationCode) {
            return;
        }
        else {
            (async () => {
                console.log(authorizationCode);
                const accessToken = await spotifyApi.getAccessToken(authorizationCode);
                setAccessToken(accessToken);
            })();
        }
    }, [authorizationCode]);

    useEffect(() => {
        console.log(accessToken, 'accessmfger');
        if (!accessToken) {
            return;
        }
        else {
            (async () => {
                const userProfileData = await spotifyApi.getSpotifyUserProfile({ accessToken });
                setUserProfileData(userProfileData);    
            })();
        }
    }, [accessToken]);

    useEffect(() => {
        if (!userProfileData) {
            return;
        }
        else {
            console.log(userProfileData, 'check');
        }
    }, [userProfileData]);

    return (
        <div>
            <h1>Musicart</h1>
            <h2> Welcome to music art! {authorizationCode ? 'Is this you?' : 'Login in below to get started.'}</h2>
            {!authorizationCode && <Button variant="contained" onClick={() => {
                console.log('login button pressed');
                spotifyApi.redirectToSpotifyAuthorizationFlow();
            }}>Login to Spotify</Button>}
        </div>
    );
};

export default Home;