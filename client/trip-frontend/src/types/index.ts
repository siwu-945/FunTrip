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
    isOpen : boolean;
    onClose : () => void;
    roomId : string;
    saveCurrentUserSession : ()=> void;
}

export interface RoomComponentProps {
    socket: Socket;
    roomId: string;
    setUserJoined: React.Dispatch<React.SetStateAction<boolean>>;
    currentUser: string;
    avatarIdx: number;
}

export type SongObj = {
    spotifyData: SpotifyApi.PlaylistTrackObject,
    audioUrl? : string
}

export type DownloadResponse = {
    audiolink: string;
}

export type AudioUrlResponse = {
    audioUrl: string;
    cached: boolean;
}

export type AudioPlayerProps = {
    songs: SongObj[], 
    audioPaused: boolean,
    socket: Socket,
    roomId : string,
    partyMode:boolean;
    onCurrentSongChange?: (index: number) => void;
}

export type ToggleProps = {
    isParty: boolean;
    isHost: boolean;
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


export interface RoomHeaderProps {
  roomId: string;
  isParty: boolean;
  isHost: boolean;
  setIsParty: (isParty: boolean) => void;
  onExitRoom: () => void;
}

export interface UserSession{
    roomId: string;
    username: string;
}

export interface UserProfilProps{
    username: string;
    pfpIndex: number;
}

export interface FormattedMessage {
    type: 'date' | 'message';
    content: string;
}

export interface JoinedUsersProps {
    roomName: string;
    socket: Socket;
    setUserJoined: React.Dispatch<React.SetStateAction<boolean>>;
    messages: FormattedMessage[];
    currentUser: string;
    avatarIdx: number;
}

export interface User {
    socketId : string;
    username : string;
    isHost : boolean;
    avatarIdx : number;
}