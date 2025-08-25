import { SongObj } from '.';
import { User } from './user'

export class RoomInfo{
    roomID: string;
    hostID: string;

    isPaused: boolean;
    isParty: boolean;
    pasuedAt : number;
    startedAt : number;
    currentSongIndex: number;
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
        this.isParty = true;
        this.pasuedAt = 0;
        this.startedAt = 0;
        this.currentSongIndex = 0;
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

    public clearQueue() {
        console.log("Clearing queue for room:", this.roomID);
        this.songStream = [];
        console.log("Songs after clearing:", this.songStream.length);
        return this.songStream;
    }

    public reorderQueue(newOrder: SpotifyApi.PlaylistTrackObject[]) {
        console.log("Songs before reordering:", this.songStream.length);
        
        const newSongStream: SongObj[] = newOrder.map((track) => ({
            spotifyData: track,
        }));
        
        this.songStream = newSongStream;
        console.log("Songs after reordering:", this.songStream.length);
        return this.songStream;
    }

    public deleteSong(songIndex: number) {
        console.log("Deleting song from queue:", {
            roomId: this.roomID,
            songIndex,
            songName: this.songStream[songIndex]?.spotifyData.track?.name,
            totalSongsBefore: this.songStream.length
        });
        
        if (songIndex >= 0 && songIndex < this.songStream.length) {
            const deletedSong = this.songStream[songIndex];
            this.songStream.splice(songIndex, 1);
            console.log("Song deleted successfully:", {
                deletedSong: deletedSong?.spotifyData.track?.name,
                totalSongsAfter: this.songStream.length
            });
        } else {
            console.error("Invalid song index:", songIndex, "SongStream length:", this.songStream.length);
        }
        
        return this.songStream;
    }

    public removeSongToStream(selectedSong : SpotifyApi.PlaylistTrackObject){
        // TODO
    }

    public getCurrentProgress() {
        const currentTime = this.isPaused ? this.pasuedAt : Date.now() - this.startedAt;
        return {
            isPaused : this.isPaused,
            pasuedAt: this.pasuedAt,
            startedAt : this.startedAt,
            currentTime: Math.max(0, currentTime),
            currentSongIndex: this.currentSongIndex
        }
    }

    public updateCurrentSongIndex(index: number) {
        this.currentSongIndex = index;
    }

    public startSongPlayback() {
        console.log("Starting song playback:", {
            roomId: this.roomID,
            songIndex: this.currentSongIndex,
            songName: this.songStream[this.currentSongIndex]?.spotifyData.track?.name
        });
        this.startedAt = Date.now();
        this.pasuedAt = 0;
        this.isPaused = false;
    }

    public pauseSongPlayback() {
        console.log("Pausing song playback:", {
            roomId: this.roomID,
            songIndex: this.currentSongIndex,
            songName: this.songStream[this.currentSongIndex]?.spotifyData.track?.name
        });
        this.pasuedAt = Date.now() - this.startedAt;
        this.isPaused = true;
    }
}