import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SpotifyAuthCode } from "./SpotifyAuthCode";

export const useAuth = () => {
    const [searchParams] = useSearchParams();
    const [authCode, setAuthCode] = useState("");
    const [accessToken, setAccessToken] = useState("");

    // set authorization code
    useEffect(() => {
        const code = searchParams.get("code");
        if (code) {
            setAuthCode(code);
        }
    }, [searchParams]);

    // exchange auth code for access token
    useEffect(() => {
        const fetchAccessToken = async () => {
            try {
                if (authCode) {
                    const token = await SpotifyAuthCode(authCode);
                    setAccessToken(token);
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
            fetchAccessToken();
        }
    }, [authCode]);

    return { authCode, accessToken };
};