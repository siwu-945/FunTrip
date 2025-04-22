import { SongObj } from '.';
import { User } from './user'

export class RoomInfo{
    roomID: string;
    hostID: string;
    requiresPassword : boolean;
    private users: Map<string, User>;
    private songStream: SongObj[];

    public constructor(roomID:string){
        this.roomID = roomID;
        this.hostID = "";
        this.users = new Map<string, User>;
        this.requiresPassword = false;
        this.songStream = [];
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
        this.songStream.forEach((x) =>{
            console.log(x.spotifyData.track?.name)
        })
    }

    public get getSongStream() : SongObj[]{
        return this.songStream;
    }

    public removeSongToStream(selectedSong : SpotifyApi.PlaylistTrackObject){
        // TODO
    }

}