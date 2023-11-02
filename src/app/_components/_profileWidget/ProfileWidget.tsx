'use client';

import { SpotifyProfileReturnType } from '@/apisExternal/spotify';
import styles from './profileWidget.module.scss';
import Image from 'next/image';
import { profile } from 'console';
import { useEffect } from 'react';
import helperFunctions from '@/utils/helperFunctions';
import { IconButton } from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface IProfileWidgetProps {
    profileData: SpotifyProfileReturnType;
}

const ProfileWidget: React.FC<IProfileWidgetProps> = ({ profileData }) => {
    const router = useRouter();

    useEffect(() => {
        console.log(profileData);
    }, [profileData]);

    return ( 
        <div className={styles.profile_widget_parent}>
            <div className={styles.profile_widget_container}>
                <div className={styles.profile_widget_image_parent}>
                    <Image
                        fill
                        src={profileData.images[1].url}
                        alt="Profile Image"
                        style={{
                            borderRadius: '15px'
                        }}
                    />
                </div>
                <div className={styles.profile_widget_info_container}>
                    <h1>{profileData.display_name}</h1>
                    <div>
                        <h2>{profileData.email}</h2>
                        <h2>{helperFunctions.capitalizeFirstLetter(profileData.product)}</h2>
                    </div>
                </div>
            </div>
            <div className={styles.profile_widget_bottom_button_container}>
                <IconButton color='error' size='large'>
                    <HighlightOffIcon />
                </IconButton>
                <Link href="/SpotifyArt">
                    <CheckCircleIcon color='success' />
                </Link>
            </div>

        </div>
    );
};
 
export default ProfileWidget;