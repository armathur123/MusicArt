'use client';

import { spotifyDataEndpoints } from '@/utils/applicationConstants';
import { useSpotifyApi } from '@/utils/hooks/useSpotifyApi';
import { Artist } from '@spotify/web-api-ts-sdk';
import ForceDirectedGraph from '../_components/_forceDirectedGraph/ForceDirectedGraph';
import styles from './ArtistAnalytics.module.scss';


const ArtistAnalytics = () => {
    const { data, loading, error } = useSpotifyApi<{items: Artist[]}>(spotifyDataEndpoints.getUsersTop.artist, {
        method: 'GET',
        params: {
            time_range: 'medium_term',
            limit: '20'
        }
    });

    return (
        <div className={styles.artist_analytics_force_directed_graph_container}> 
            <ForceDirectedGraph data={data?.items ?? []} />
        </div>
    );
};

export default ArtistAnalytics;