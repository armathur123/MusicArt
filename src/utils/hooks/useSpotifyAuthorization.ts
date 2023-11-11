import spotifyApi, { SpotifyAuthorizationToken } from '@/apisExternal/spotify';
import { useEffect, useState } from 'react';


// return Authorization Token
export const useSpotifyAuthorization = () => {

    const [authorizationCode, setAuthorizationCode] = useState<string>();    const [accessToken, setAccessToken] = useState<SpotifyAuthorizationToken>();
    const [accessTokenLoading, setAccessTokenLoading] = useState<boolean>(false);
    const [error, setError] = useState('');

    // need to implement refresh token here. also find an alternative to localstorage if possible (right now need to clear storage after token expires :\)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');
            const access_token = localStorage.getItem('access_token_spotify');

            if (!access_token && !code) {
                return;
            }
            if (access_token) {
                setAccessToken(`Bearer ${access_token}`);
            } else {
                if (!code) {
                    return;
                }
                setAuthorizationCode(code);
                var url= document.location.href;
                window.history.pushState({}, '', url.split('?')[0]);
            }
        };
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
                    localStorage.setItem('access_token_spotify', accessToken);
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