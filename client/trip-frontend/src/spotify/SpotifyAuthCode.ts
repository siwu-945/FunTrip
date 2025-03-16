import { useState, useEffect } from "react";
import axios from "axios";

const serverURL = import.meta.env.VITE_SERVER_URL;

interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export const useSpotifyAuth = (code: string) => {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [expiresIn, setExpiresIn] = useState<number | null>(null);

    // 首次获取 accessToken、refreshToken 和 expiresIn
    useEffect(() => {
        if (!code) {
            console.warn('No code provided');
            return;
        }

        const loginUrl = `${serverURL}/api/spotify/login`;
        axios
            .post<AuthResponse>(loginUrl, { code })
            .then((response) => {
                console.log('Access token received:', response.data.accessToken);
                setAccessToken(response.data.accessToken);
                setRefreshToken(response.data.refreshToken);
                setExpiresIn(response.data.expiresIn);
            })
            .catch((error) => {
                console.error('Error during login:', error.response?.data || error.message);
                if (error.response?.data?.error === "invalid_grant") {
                    window.location.href = "/"; // 重定向到首页
                }
            });
    }, [code]);

    // 定时刷新 accessToken
    useEffect(() => {
        if (!refreshToken || !expiresIn) return;

        const refreshTokenInterval = setInterval(() => {
            const refreshUrl = `${serverURL}/api/spotify/refresh`;
            axios
                .post<AuthResponse>(refreshUrl, { refreshToken })
                .then((response) => {
                    console.log('Access token refreshed:', response.data.accessToken);
                    setAccessToken(response.data.accessToken);
                    setExpiresIn(response.data.expiresIn);
                })
                .catch((error) => {
                    console.error('Error during token refresh:', error.response?.data || error.message);
                    if (error.response?.data?.error === "invalid_grant") {
                        window.location.href = "/"; // 重定向到首页
                    }
                });
        }, (expiresIn - 60) * 1000); // 提前 60 秒刷新 token

        return () => clearInterval(refreshTokenInterval); // 清除旧的定时器
    }, [refreshToken, expiresIn]);

    return accessToken;
};