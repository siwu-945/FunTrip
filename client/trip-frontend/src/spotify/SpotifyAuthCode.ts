import axios from "axios";
const serverURL = import.meta.env.VITE_SERVER_URL;

interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export const SpotifyAuthCode = async (code: string) => {

    const loginUrl = `${serverURL}/api/spotify/login`;
    // Call the server to login with the authorization code
    const response = await axios.post<AuthResponse>(loginUrl, { code });
    return response.data.accessToken;

    // TODO add expires access token
    // useEffect(() => {
    //     console.log("refresh token useEffect")
    //     if(refreshToken) {
    //         const interval = setInterval(() => {
    //             axios.post<AuthResponse>(refresh_domain, {
    //                 refreshToken,
    //             }).then(res => {
    //                     setAccessToken(res.data.accessToken)
    //                     setExpiresIn(res.data.expiresIn)
    //                 }
    //             ).catch((err) => {
    //                 console.log("refresh token err" + err)
    //             })
    //         }, (expiresIn - 60) *1000)
    //         return () => clearInterval(interval)
    //     }}, [refreshToken, expiresIn])
}