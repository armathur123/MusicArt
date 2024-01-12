type AuthorizationConstantsType = {
    clientID: string;
    redirectUri: string;
    scope: string;
    userAuthorizationLink:string;
    accessTokenAuthorizationLink: string;
    accessTokenSwapLink: string;
}

const scopes = ['user-read-private', 'user-read-email', 'user-top-read'];

const authorizationConstants: AuthorizationConstantsType = {
    clientID: 'f1dcef1720f4432b9dcd4138b84d08fa',
    redirectUri: 'http://localhost:3000',
    scope:  scopes.join(' '),
    userAuthorizationLink: 'https://accounts.spotify.com/authorize',
    accessTokenAuthorizationLink: 'https://accounts.spotify.com/api/token',
    accessTokenSwapLink: 'https://api.spotify.com/v1/swap'
};

const spotifyDataEndpoints = {
    getUserProfileData: 'https://api.spotify.com/v1/me',
    getUsersTop: {
        track: 'https://api.spotify.com/v1/me/top/tracks',
        artist: 'https://api.spotify.com/v1/me/top/artists'
    } 
};

export { authorizationConstants, spotifyDataEndpoints };