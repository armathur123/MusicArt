'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSpotifyAuthorization } from './useSpotifyAuthorization';
import { SpotifyAuthorizationToken } from '@/apisExternal/spotify';


type HTTPRequestTypes = 'POST' | 'GET' | 'PUT' | 'DELETE'

type BasicApiOptions = {
    method: HTTPRequestTypes;
    body?: URLSearchParams;
}

type SpotifyApiRequestOptions = BasicApiOptions & {
    headers: {
        Authorization: SpotifyAuthorizationToken;
        'Content-Type': string;
    };
}

export const useSpotifyApi = <T>(url: string, options: BasicApiOptions) => {
    const { accessToken, accessTokenLoading } = useSpotifyAuthorization();
    const [data, setData] = useState<T | undefined>();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>();

    
    useEffect(() => {
        if (accessTokenLoading) {
            setLoading(accessTokenLoading);
        }
    },[accessTokenLoading]);

    useEffect(() => {
        if (!accessToken) {
            return;
        }
        (async () => {
            setLoading(true);
            try {
                const requestOptions: SpotifyApiRequestOptions = {
                    headers: {
                        Authorization: accessToken,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    ...options
                };
                const response = await fetch(url, requestOptions);
                const responseJSON: T = await response.json();
                setData(responseJSON);
            } catch (error) {
                setError('There was an error fetching the data.');
            }
            setLoading(false);
        })();
    }, [accessToken]);
    
    return { data, loading, error };
};