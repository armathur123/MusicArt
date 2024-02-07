'use client';

import { spotifyDataEndpoints } from '@/utils/applicationConstants';
import { useSpotifyApi } from '@/utils/hooks/useSpotifyApi';
import { Artist } from '@spotify/web-api-ts-sdk';
import ForceDirectedGraph from '../_components/_forceDirectedGraph/ForceDirectedGraph';
import styles from './ArtistAnalytics.module.scss';
import { Autocomplete, TextField } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useEffect, useState } from 'react';

const ArtistAnalytics = () => {
    const { data, loading, error } = useSpotifyApi<{items: Artist[]}>(spotifyDataEndpoints.getUsersTop.artist, {
        method: 'GET',
        params: {
            time_range: 'medium_term',
            limit: '20'
        }
    });

    const artists = data?.items ?? [];    
    const [selectedArtist, setSelectedArtist] = useState<Artist | undefined>(undefined);
    const [inputValue, setInputValue] = useState('');
    
    const handleArtistSelection = (selection: Artist) => {
        setSelectedArtist(selection);
        setInputValue(selection.name);
    };

    return (
        <div className={styles.artist_analytics_container}>
            <h1>Explore Top Artists</h1>
            <Autocomplete
                disablePortal
                id="artist-search-bar"              
                options={artists}
                renderInput={(params) => <TextField {...params} label="Search Artists" />}
                value={selectedArtist}
                inputValue={inputValue}
                className={styles.artist_analytics_search_field}
                // popupIcon={<ArrowDropDownIcon  style={{ color: 'white' }}/>}
                // renderOption={(props: object, option: any, state: object) => {
                //     return <div>
                //         {option.name}
                //     </div>;
                // }}
                getOptionLabel={(option) => option.name}
                renderOption={(props, option) => {
                    return (
                        <li {...props} key={option.id}>
                            {option.name}
                        </li>
                    );
                }}      
                onChange={(event, value) => setSelectedArtist(value ?? undefined)}
                onInputChange={(_, newInputValue) => {
                    setInputValue(newInputValue);
                }}
                isOptionEqualToValue={(option, value) => option.id === option.id}
            />
            <div className={styles.artist_analytics_force_directed_graph_container}> 
                <ForceDirectedGraph data={data?.items ?? []} selectedData={selectedArtist} setSelectedData={handleArtistSelection}/>
            </div>
        </div>
    );
};

export default ArtistAnalytics;