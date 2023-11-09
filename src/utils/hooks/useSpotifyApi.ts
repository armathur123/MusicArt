'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSpotifyAuthorization } from './useSpotifyAuthorization';
import { SpotifyAuthorizationToken } from '@/apisExternal/spotify';


type HTTPRequestTypes = 'POST' | 'GET' | 'PUT' | 'DELETE'

type BasicApiOptions = {
    method: HTTPRequestTypes;
    params?: Record<string, string>;
}

type SpotifyApiRequestOptions = {
    method: HTTPRequestTypes;
    headers: {
        Authorization: SpotifyAuthorizationToken;
        // 'Content-Type': string;
        // 'Access-Control-Allow-Origin': string;
        // 'Access-Control-Allow-Headers': string;
    };
    body?: URLSearchParams;
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
                const isGet = options.method === 'GET';
                const requestOptions: SpotifyApiRequestOptions = {
                    method: options.method,
                    headers: {
                        Authorization: accessToken
                    }
                };
                if (isGet) {
                    requestOptions.body = requestOptions.body;
                }
                const finalUrl = isGet ? `${url}?${new URLSearchParams(options.params)}` : url;
                const response = await fetch(finalUrl, requestOptions);
                const responseJSON: T = await response.json();
                setData(responseJSON);
            } catch (error) {
                setError('There was an error fetching the data.');
                console.log(error, 'Api fetch error');
            }
            setLoading(false);
        })();
    }, [accessToken]);
    
    return { data, loading, error };
};