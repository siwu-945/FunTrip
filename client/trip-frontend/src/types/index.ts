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
    socketId: string;
    username: string;
    isHost: boolean;
}

export interface PlaylistProps {
    handleAddToQueue: (tracks: SpotifyApi.PlaylistTrackObject[]) => void; // Function that takes an array of strings and returns nothing (void)
}

export interface RoomComponentProps {
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

export type AudioPlayerProps = {
    songs: SongObj[], 
    audioPaused: boolean,
    socket: Socket,
    roomId : string,
    partyMode:boolean;
}

export type ToggleProps = {
    isParty: boolean;
    setIsParty: (val: boolean) => void;
}

export interface SearchResult {
    id: string;
    title: string;
    duration: number;
    uploader: string;
    view_count: number;
    webpage_url: string;
    thumbnail?: string;
}

export interface SearchResponse {
    results: SearchResult[];
}

export interface PasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPasswordChoice: (wantsPassword:boolean) => void;
    showPasswordInput: boolean;
    password: string;
    setPassword: (password: string) => void;
    onSubmitPassword: (password: string) => void;
}