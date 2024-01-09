'use client';

import { spotifyDataEndpoints } from '@/utils/applicationConstants';
import { useSpotifyApi } from '@/utils/hooks/useSpotifyApi';
import { Artist } from '@spotify/web-api-ts-sdk';
import ForceDirectedGraph from '../_components/_forceDirectedGraph/ForceDirectedGraph';
import styles from './ArtistAnalytics.module.scss';
import { Autocomplete, TextField } from '@mui/material';


const ArtistAnalytics = () => {
    const { data, loading, error } = useSpotifyApi<{items: Artist[]}>(spotifyDataEndpoints.getUsersTop.artist, {
        method: 'GET',
        params: {
            time_range: 'medium_term',
            limit: '20'
        }
    });

    const artists = data?.items.map((artist) => artist.name) ?? [];

    return (
        <div className={styles.artist_analytics_container}>
            <h1>Explore Top Artists</h1>
            <Autocomplete
                disablePortal
                placeholder='Search Artists..'
                // id="artist-search-bar"
                options={artists}
                renderInput={(params) => <TextField {...params} label="Search Artists.." style={{ color: 'white' }} color='secondary' />}
                className={styles.artist_analytics_search_field}
            />
            <div className={styles.artist_analytics_force_directed_graph_container}> 
                <ForceDirectedGraph data={data?.items ?? []} />
            </div>
        </div>
    );
};

export default ArtistAnalytics;