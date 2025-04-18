import { Socket } from 'socket.io-client';

export interface Song {
    id: string;
    name: string;
    requestedBy: string;
    timestamp: Date;
}

export interface User {
    id: string;
    username: string;
}

export interface PlaylistProps {
    handleAddToQueue: (tracks: SpotifyApi.PlaylistTrackObject[]) => void; // Function that takes an array of strings and returns nothing (void)
}

export interface RoomProps {
    socket: Socket;
    roomId: string;
    setUserJoined: React.Dispatch<React.SetStateAction<boolean>>;
    currentUser: string;
}

export type SongObj = {
    spotifyData: SpotifyApi.PlaylistTrackObject,
    audioUrl? : string
}

export type DownloadResponse = {
    audiolink: string;
}