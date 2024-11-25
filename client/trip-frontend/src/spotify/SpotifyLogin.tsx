import axios from "axios";

const serverURL = import.meta.env.VITE_SERVER_URL;
interface Props {
    code: string | null;
}

export const SpotifyLogin = ({code} : Props ) => {

    const testSpotifyAPI = async () => {
        if (!code) {
            console.log('No code available. Please authenticate first.');
            return;
        }

        try {
            console.log('Testing Spotify API with code:', code);
            const loginUrl = `${serverURL}/api/spotify/login`;
            await axios.post(loginUrl, {
                code
            }).then(res => {
                console.log(res.data);
            })
        } catch (error) {
            console.error('Error testing Spotify API:', error);
        }
    };

    return (
        <div>
            <button onClick={testSpotifyAPI}>
                Test Spotify API
            </button>
        </div>
    );
}