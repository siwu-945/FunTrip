import axios from "axios";
import {useEffect, useState} from "react";
const serverURL = import.meta.env.VITE_SERVER_URL;

interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export const SpotifyAuthCode = (code: string) => {
    const [accessToken, setAccessToken] = useState<string>("");
    const [refreshToken, setRefreshToken] = useState<string>("");
    const [expiresIn, setExpiresIn] = useState<number>(0);
    const [errorMsg, setError] = useState<string | null>(null);

    const loginUrl = `${serverURL}/api/spotify/login`;
    const refreshUrl = `${serverURL}/api/spotify/refresh`;

    useEffect(() => {
        if (!code) return;

        const fetchTokens = async () => {
            try {
                const response = await axios.post<AuthResponse>(loginUrl, { code });
                setAccessToken(response.data.accessToken);
                setRefreshToken(response.data.refreshToken);
                setExpiresIn(response.data.expiresIn);
            } catch (err) {
                setError("Error getting access token");
                window.dispatchEvent(new CustomEvent("modalError", {
                    detail: { message: "Error getting access token" }
                }));
            }
        };

        fetchTokens();
    }, [code]);

    useEffect(() => {
        if (!refreshToken || !expiresIn) return;

        const interval = setInterval(async () => {
            try {
                const response = await axios.post<AuthResponse>(refreshUrl, { refreshToken });
                setAccessToken(response.data.accessToken);
                setExpiresIn(response.data.expiresIn);
            } catch (err) {
                setError("Error refreshing access token");
                window.dispatchEvent(new CustomEvent("modalError", {
                    detail: { message: "Error refreshing access token" }
                }));
            }
        }, (expiresIn - 60) * 1000); // Refresh 1 minute before expiration

        return () => clearInterval(interval);
    }, [refreshToken, expiresIn]);

    return { accessToken, refreshToken, expiresIn, errorMsg };
};