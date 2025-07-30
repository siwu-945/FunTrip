import { SongObj } from '.';
import { User } from './user'

export class RoomInfo{
    roomID: string;
    hostID: string;

    isPaused: boolean;
    pasuedAt : number;
    startedAt : number;
    requiresPassword : boolean;
    password? : string;

    private users: Map<string, User>;
    private songStream: SongObj[];

    public constructor(roomID:string, password?:string){
        this.roomID = roomID;
        this.hostID = "";
        this.users = new Map<string, User>;
        // converts non-empty string or non-zero numbers to true
        this.requiresPassword = !!password;
        this.songStream = [];
        this.password = password || "";

        this.isPaused = false;
        this.pasuedAt = 0;
        this.startedAt = 0;
    }

    /**
     * User management
     */
    public userExist(username : string) : boolean {
        return this.users.has(username);
    }

    public addUserToRoom(userObj : User){
        this.users.set(userObj.username, userObj);
    }

    public get getUsers(): Map<string, User> {
        return this.users;
    }

    public removeUser(userName : string){
        this.users.delete(userName);
    }

    /**
     * Song management
     */

    public addSongToStream(selectedTracks: SpotifyApi.PlaylistTrackObject[]){
        const songObjs : SongObj[] = selectedTracks.map((track) => ({
            spotifyData : track,
        }));
        this.songStream.push(...songObjs);
        return songObjs;
    }

    public get getSongStream() : SongObj[]{
        return this.songStream;
    }

    public removeSongToStream(selectedSong : SpotifyApi.PlaylistTrackObject){
        // TODO
    }

    public getCurrentProgress() {
        return {
            isPaused : this.isPaused,
            pasuedAt: this.pasuedAt,
            startedAt : this.startedAt
        }
    }

}