import spotifyApi, { SpotifyAuthorizationToken } from '@/apisExternal/spotify';
import { local } from 'd3';
import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';


// return Authorization Token
export const useSpotifyAuthorization = () => {

    const [accessToken, setAccessToken] = useState<SpotifyAuthorizationToken>();
    const [accessTokenLoading, setAccessTokenLoading] = useState<boolean>(false);
    const [refresh, setRefresh] = useState();
    const [error, setError] = useState('');

    const tokenHandler = (code: string, isRefreshToken: boolean) => {
        (async () => {
            setAccessTokenLoading(true);
            try {
                const { access_token, expires_in, refresh_token } = await spotifyApi.getAccessToken(code, isRefreshToken);
                const requestTime = DateTime.now();

                if (access_token && refresh_token) {
                    localStorage.setItem('access_token_spotify', access_token);
                    localStorage.setItem('request_time_spotify', requestTime.toString());
                    localStorage.setItem('refresh_token_spotify', refresh_token);    
                    setAccessToken(`Bearer ${access_token}`);
                }
            }
            catch (error) {
                // add more here later 
                setError('There was an error.');
                console.log(error);
            }
            setAccessTokenLoading(false);
        })();
    };

    // Find an alternative to localstorage if possible (right now need to clear storage after token expires :\)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');
            const access_token_from_storage = localStorage.getItem('access_token_spotify');
            const request_time_from_storage = localStorage.getItem('request_time_spotify');
            const refresh_token_from_storage = localStorage.getItem('refresh_token_spotify');

            if (!access_token_from_storage && !code) {
                return;
            }

            if (access_token_from_storage && refresh_token_from_storage && request_time_from_storage) {
                // ** Theres a better way to do this - if an API request returns with unauthorized (401), use the refresh token. This will require some refactoring tho
                const currentTime = DateTime.now();
                const requestTimeFormatted = DateTime.fromISO(request_time_from_storage);
                // Check if its been an hour
                var differenceInSeconds = currentTime.diff(requestTimeFormatted, 'second').toObject().seconds;

                // Check if its been an hour since the request time, if so, refresh token
                if (differenceInSeconds && differenceInSeconds >= 3600) {
                    tokenHandler(refresh_token_from_storage, true);
                }
                else {
                    setAccessToken(`Bearer ${access_token_from_storage}`);
                }
            } else {
                if (!code) {
                    return;
                }
                tokenHandler(code, false);

                // Remove code from URL
                var url= document.location.href;
                window.history.pushState({}, '', url.split('?')[0]);
            }
        }
    }, []);
    
    return { accessToken, accessTokenLoading, error };
};