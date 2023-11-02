import spotifyApi, { SpotifyAuthorizationToken } from '@/apisExternal/spotify';
import { useEffect, useState } from 'react';


// return Authorization Token
export const useSpotifyAuthorization = () => {

    const [authorizationCode, setAuthorizationCode] = useState<string>();
    const [accessToken, setAccessToken] = useState<SpotifyAuthorizationToken>();
    const [accessTokenLoading, setAccessTokenLoading] = useState<boolean>(false);
    const [error, setError] = useState('');
    const params = new URLSearchParams(window.location.search);

    useEffect(() => {
        const code = params.get('code');
        if (!code) {
            return;
        }
        setAuthorizationCode(code);         
    });

    useEffect(() => {
        if (!authorizationCode) {
            return;
        }
        else {
            (async () => {
                setAccessTokenLoading(true);
                try {
                    const accessToken = await spotifyApi.getAccessToken(authorizationCode);
                    setAccessToken(`Bearer ${accessToken}`);
                }
                catch (error) {
                    // add more here later
                    setError('There was an error.');
                    console.log(error);
                }
                setAccessTokenLoading(false);
            })();    
        }
    }, [authorizationCode]);

    return { accessToken, accessTokenLoading, error };
};