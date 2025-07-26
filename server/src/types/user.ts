export class User{
    socketId : string;
    username : string;
    isHost : boolean;

    constructor(socketId : string, username : string, isHost: boolean = false){
        this.socketId = socketId;
        this.username = username;
        this.isHost = isHost;
    }
}