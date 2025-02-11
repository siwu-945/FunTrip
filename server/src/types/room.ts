import { User } from './user'

export class RoomInfo{
    roomID: string;
    hostID: string;
    requiresPassword : boolean;
    private users: Map<string, User>;

    public constructor(roomID:string){
        this.roomID = roomID;
        this.hostID = "";
        this.users = new Map<string, User>;
        this.requiresPassword = false;
    }

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

}