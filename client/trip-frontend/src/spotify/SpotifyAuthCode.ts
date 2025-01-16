import axios from "axios";
import {useEffect, useState} from "react";
const serverURL = import.meta.env.VITE_SERVER_URL;

interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export const SpotifyAuthCode = async (code: string) => {

    const loginUrl = `${serverURL}/api/spotify/login`;
    const refreshUrl = `${serverURL}/api/spotify/refresh`;

    try {
        const response = await axios.post<AuthResponse>(loginUrl, { code });
        return {
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
            expiresIn: response.data.expiresIn,
        };
    } catch (err) {
        console.error("Error getting access token", err);
        throw new Error("Error getting access token");
    }
};