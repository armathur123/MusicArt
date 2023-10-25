import Image from 'next/image'
import styles from './page.module.css'
import { Button } from '@mui/material';

const Home = () => {
    return (
        <div>
            <h1>Musicart</h1>
            <Button variant="contained">Login to Spotify</Button>
        </div>
    )
}

export default Home;