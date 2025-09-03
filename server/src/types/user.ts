export class User{
    socketId : string;
    username : string;
    isHost : boolean;
    avatarIdx : number;

    constructor(socketId : string, username : string, avatarIdx: number, isHost: boolean = false){
        this.socketId = socketId;
        this.username = username;
        this.isHost = isHost;
        this.avatarIdx = avatarIdx
    }
}