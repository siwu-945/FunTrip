import { useEffect, useState } from "react";
import { resolvePath, useSearchParams } from "react-router-dom";
import { SpotifyAuthCode } from "./SpotifyAuthCode";

interface SpotifyTokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
}
export const useAuth = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [authCode, setAuthCode] = useState("");
    const [accessToken, setAccessToken] = useState("");

    // set authorization code
    useEffect(() => {
        const savedTokens = localStorage.getItem('spotify_tokens');
        if(savedTokens){
            const tokens : SpotifyTokens = JSON.parse(savedTokens);
            const now = Date.now();

            if(tokens.expiresAt > now + 5 * 60 * 1000){
                setAccessToken(tokens.accessToken);
                return;
            }
        }
        const code = searchParams.get("code");
        if (code) {
            setAuthCode(code);
            setSearchParams(prev => {
                const newParams = new URLSearchParams(prev);
                newParams.delete("code");
                newParams.delete("state");
                return newParams;
            });
        }
    }, []);

    // exchange auth code for access token
    useEffect(() => {
        const fetchAccessToken = async () => {
            try {
                if (authCode && !accessToken) {
                    const response = await SpotifyAuthCode(authCode);
                    setAccessToken(response.accessToken);
                    
                    const tokens: SpotifyTokens = {
                        accessToken : response.accessToken,
                        refreshToken : response.refreshToken,
                        expiresAt : Date.now() + (response.expiresIn * 1000)
                    }

                    localStorage.setItem('spotify_tokens', JSON.stringify(tokens))
                    setAccessToken(response.accessToken);
                    setAuthCode("");
                }
            } catch (error) {
                const errorMessage = (error as Error).message || "Error fetching access token.";
                window.dispatchEvent(
                    new CustomEvent("modalError", {
                        detail: { message: errorMessage },
                    })
                );
            }
        };
        if (authCode) {
            console.log("auth code is: ", authCode)
            fetchAccessToken();
        }
    }, [authCode]);

    return { authCode, accessToken };
};