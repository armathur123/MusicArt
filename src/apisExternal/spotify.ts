import { authorizationConstants, spotifyDataEndpoints } from '@/utils/applicationConstants';

import { base64encode, generateRandomString, sha256 } from '../utils/encoders';


//authorization functions

type AuthorizationParametersType = {
    response_type: string
    client_id: string,
    scope: string,
    code_challenge_method: string,
    code_challenge: string,
    redirect_uri: string;
}

type AccessTokenParametersType = {
    client_id: string
    grant_type: string,
    code: string;
    redirect_uri: string;
    code_verifier: string;
}

type SpotifyEndpointRequestType = {
    accessToken: string;
}

class SpotifyApi {
    // consider seperating these calls into hooks (authFlowHook, getUserProfileDataHook)

    redirectToSpotifyAuthorizationFlow = async () => {
        const codeVerifier  = generateRandomString(64);
        localStorage.setItem('verifier', codeVerifier);
    
        const hashed = await sha256(codeVerifier);
        const codeChallenge = base64encode(hashed);
        
        const authorizationParameters: AuthorizationParametersType =  {
            response_type: 'code',
            client_id: authorizationConstants.clientID,
            scope: authorizationConstants.scope,
            code_challenge_method: 'S256',
            code_challenge: codeChallenge,
            redirect_uri: authorizationConstants.redirectUri
        };
    
        document.location = `https://accounts.spotify.com/authorize?${new URLSearchParams(authorizationParameters).toString()}`;
        // need to set up something for if this login fails
    };
    
    getAccessToken = async (code: string): Promise<string> => {
        const code_verifier = localStorage.getItem('verifier');
        const accessTokenParameters: AccessTokenParametersType = {
            client_id: authorizationConstants.clientID,
            grant_type: 'authorization_code',
            code,
            redirect_uri: authorizationConstants.redirectUri,
            code_verifier: code_verifier!
        };
        const request = await fetch(authorizationConstants.accessTokenAuthorizationLink, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(accessTokenParameters)
        });
    
        const { access_token } = await request.json();
        return access_token;
    };
    
    // GET Spotify User profile data
    
    getSpotifyUserProfile = async ( { accessToken }: SpotifyEndpointRequestType ) => {    
        const request = await fetch(spotifyDataEndpoints.getUserProfileData, {
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}` }
        });
   
        const response = await request.json();
        return response;
    };
    
}

const spotifyApi = new SpotifyApi;

export default spotifyApi;