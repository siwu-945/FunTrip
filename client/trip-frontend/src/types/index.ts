import { Socket } from 'socket.io-client';

export interface Message {
    sender: string;
    content: string;
    timestamp: number; // Unix timestamp in milliseconds
}

export interface FormattedMessage {
    type: 'date' | 'message';
    content: string;
}

export interface TextInputProps {
    onSendMessage: (message: string) => void;
}

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

export interface RoomComponentProps {
    socket: Socket;
    roomId: string;
    setUserJoined: React.Dispatch<React.SetStateAction<boolean>>;
    currentUser: string;
    partyMode:boolean;
}

export type SongObj = {
    spotifyData: SpotifyApi.PlaylistTrackObject,
    audioUrl? : string
}

export type DownloadResponse = {
    audiolink: string;
}

export type AudioPlayerProps = {
    songs: SongObj[], 
    audioPaused: boolean,
    socket: Socket,
    roomId : string,
    partyMode:boolean;
}