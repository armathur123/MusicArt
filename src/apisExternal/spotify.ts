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

type AccessTokenParameters = {
    client_id: string;
    grant_type: string;
}

type AccessTokenFromCodeType = {
    client_id: string
    code: string;
    redirect_uri: string;
    code_verifier: string;
} & AccessTokenParameters

type AccessTokenFromRefreshTokenType = {
    refresh_token: string,
} & AccessTokenParameters

export type TokenResponseType = {access_token: string, expires_in: number, refresh_token: string}

export type SpotifyAuthorizationToken = `Bearer ${string}`

//Spotify Return Types

type SpotifyImages = {
    height: number;
    width: number;
    url: string;
}

export type SpotifyProfileReturnType = {
    email: `${string}@${string}`;
    display_name: string;
    product: string;
    images: SpotifyImages[];
}

class SpotifyApi {
    // consider seperating these calls into hooks (authFlowHook, getUserProfileDataHook)

    redirectToSpotifyAuthorizationFlow: () => void = async () => {
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
    
    getAccessToken = async (code: string, isRefreshToken: boolean): Promise<TokenResponseType> => {

        let accessTokenParameters: AccessTokenFromCodeType | AccessTokenFromRefreshTokenType;
        const code_verifier = localStorage.getItem('verifier');
        if (isRefreshToken){
            console.log('this is a refresh');
            accessTokenParameters = {
                client_id: authorizationConstants.clientID,
                grant_type: 'refresh_token',
                refresh_token: code
            };
        }
        else {
            accessTokenParameters = {
                client_id: authorizationConstants.clientID,
                grant_type: 'authorization_code',
                code,
                redirect_uri: authorizationConstants.redirectUri,
                code_verifier: code_verifier!
            };
        }
        // const authorization = base64encode(`${authorizationConstants.clientID}:${authorizationConstants.}`)
        const request = await fetch(authorizationConstants.accessTokenAuthorizationLink, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
                // 'Authorization': isRefreshToken ?  : ''
            },
            body: new URLSearchParams(accessTokenParameters)
        });
    
        const { access_token, expires_in, refresh_token } = await request.json();

        return { access_token, expires_in, refresh_token };
    };

    swapAccessToken = async (code: string): Promise<string> => {
        const accessTokenParameters: {code: string} = {
            code
        };
        const request = await fetch(authorizationConstants.accessTokenSwapLink, {
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
    getSpotifyUserProfile = async ( accessToken: SpotifyAuthorizationToken ) => {    
        const request = await fetch(spotifyDataEndpoints.getUserProfileData, {
            method: 'GET',
            headers: { Authorization: accessToken }
        });
   
        const response = await request.json();
        return response;
    };
    
}

const spotifyApi = new SpotifyApi;

export default spotifyApi;